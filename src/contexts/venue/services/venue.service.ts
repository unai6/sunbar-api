import { OverpassCriteria } from '../../overpass/criteria/overpass.criteria'
import { OverpassGateway } from '../../overpass/gateways/overpass.gateway'
import { OverpassMapper, type ParsedVenue } from '../../overpass/mappers/overpass.mapper'
import type { IVenue } from '../../../models/venue.model'
import { VenueRepository } from '../repositories/venue.repository'
import { ShadowService } from './shadow.service'
import { SunService } from './sun.service'

export type BboxParams = {
  south: number
  west: number
  north: number
  east: number
}

export class VenueService {
  constructor(
    private readonly overpassGateway: OverpassGateway,
    private readonly venueRepository: VenueRepository,
    private readonly shadowService: ShadowService
  ) {}

  async getVenuesWithShadow(bbox: BboxParams, date: Date) {
    const query = OverpassCriteria.buildBboxQuery(bbox.south, bbox.west, bbox.north, bbox.east)

    let venues: ParsedVenue[]
    let buildings: ReturnType<typeof OverpassMapper.toBuildings> = []
    let fromCache = false

    try {
      const response = await this.overpassGateway.execute(query)

      const venueElements = response.elements.filter((el) => el.type === 'node' && el.tags?.amenity)
      const buildingElements = response.elements.filter((el) => el.type === 'way' && el.tags?.building)

      venues = OverpassMapper.toVenues(venueElements)
      buildings = OverpassMapper.toBuildings(buildingElements)

      // Write-through: persist to MongoDB without blocking the response
      this.venueRepository.upsertMany(venues).catch((err) =>
        console.error('[VenueService] Write-through upsert failed:', err)
      )
    } catch {
      // Overpass unavailable — serve stale data from MongoDB cache
      console.warn('[VenueService] Overpass failed, falling back to MongoDB cache')
      const cached = await this.venueRepository.findByBbox(bbox.south, bbox.west, bbox.north, bbox.east)
      venues = cached.map((v: IVenue): ParsedVenue => ({
        id: v.venueId,
        name: v.name,
        type: v.venueType,
        latitude: v.latitude,
        longitude: v.longitude,
        address: v.address?.formatted,
        outdoor_seating: v.outdoorSeating,
        phone: v.phone,
        website: v.website,
        openingHours: v.openingHours
      }))
      fromCache = true
    }

    const centerLat = (bbox.south + bbox.north) / 2
    const centerLon = (bbox.west + bbox.east) / 2
    const sunPosition = SunService.getPosition(centerLat, centerLon, date)

    const venuesWithShadow = venues.map((venue) => ({
      ...venue,
      sunlightStatus: this.shadowService.analyze(venue, buildings, sunPosition.azimuthDegrees, sunPosition.altitudeRadians)
    }))

    return {
      venues: venuesWithShadow,
      sunPosition: {
        azimuth: sunPosition.azimuthDegrees,
        altitude: sunPosition.altitudeDegrees,
        isDaytime: sunPosition.altitudeRadians > 0
      },
      meta: {
        timestamp: date.toISOString(),
        buildingsAnalyzed: buildings.length,
        venueCount: venues.length,
        ...(fromCache && { fromCache: true })
      }
    }
  }
}
