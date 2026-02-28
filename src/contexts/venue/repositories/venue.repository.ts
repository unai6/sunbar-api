import { IVenue, Venue } from '../../../models/venue.model'
import type { ParsedVenue } from '../../overpass/mappers/overpass.mapper'

export class VenueRepository {
  async findByBbox(south: number, west: number, north: number, east: number): Promise<IVenue[]> {
    return Venue.find({
      latitude: { $gte: south, $lte: north },
      longitude: { $gte: west, $lte: east }
    }).lean() as unknown as IVenue[]
  }

  async upsertMany(venues: ParsedVenue[]): Promise<void> {
    if (venues.length === 0) return

    const ops = venues.map((v) => ({
      updateOne: {
        filter: { venueId: v.id },
        update: {
          $set: {
            venueId: v.id,
            osmId: v.id.split('/')[1] || v.id,
            osmType: 'node' as IVenue['osmType'],
            name: v.name,
            venueType: v.type,
            latitude: v.latitude,
            longitude: v.longitude,
            location: { type: 'Point' as const, coordinates: [v.longitude, v.latitude] as [number, number] },
            outdoorSeating: v.outdoor_seating === true,
            ...(v.address && { address: { formatted: v.address } }),
            phone: v.phone,
            website: v.website,
            openingHours: v.openingHours,
            lastSyncedOverpass: new Date()
          }
        },
        upsert: true
      }
    }))

    await Venue.bulkWrite(ops)
  }
}
