import { OverpassCriteria } from '../../overpass/criteria/overpass.criteria'
import { OverpassGateway } from '../../overpass/gateways/overpass.gateway'
import { OverpassMapper } from '../../overpass/mappers/overpass.mapper'
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
    const response = await this.overpassGateway.execute(query)

    const venueElements = response.elements.filter((el) => el.type === 'node' && el.tags?.amenity)
    const buildingElements = response.elements.filter((el) => el.type === 'way' && el.tags?.building)

    const venues = OverpassMapper.toVenues(venueElements)
    const buildings = OverpassMapper.toBuildings(buildingElements)

    // Write-through: persist to MongoDB without blocking the response
    this.venueRepository.upsertMany(venues).catch((err) =>
      console.error('[VenueService] Write-through upsert failed:', err)
    )

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
        venueCount: venues.length
      }
    }
  }
}
