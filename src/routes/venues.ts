import { FastifyInstance } from 'fastify'
import { Venue, IVenue } from '../models/venue.model'
import {
  createVenueSchema,
  updateVenueSchema,
  getVenueSchema,
  getVenuesSchema,
  bulkUpsertSchema
} from '../schemas/venue.schema'

/**
 * Venue Routes
 */
export default async function venueRoutes(fastify: FastifyInstance) {
  /**
   * POST /venues
   * Create a new venue
   */
  fastify.post(
    '/',
    { schema: createVenueSchema },
    async (request, reply) => {
      try {
        const venueData = request.body as Partial<IVenue>

        // Create location field from latitude/longitude
        if (venueData.latitude && venueData.longitude) {
          venueData.location = {
            type: 'Point',
            coordinates: [venueData.longitude, venueData.latitude]
          }
        }

        // Set last synced timestamp
        venueData.lastSyncedOverpass = new Date()

        const venue = new Venue(venueData)
        await venue.save()

        return reply.code(201).send({
          success: true,
          data: venue
        })
      } catch (error: any) {
        if (error.code === 11000) {
          return reply.code(409).send({
            success: false,
            error: 'Venue with this ID already exists'
          })
        }

        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to create venue'
        })
      }
    }
  )

  /**
   * PUT /venues/:venueId
   * Update an existing venue
   */
  fastify.put(
    '/:venueId',
    { schema: updateVenueSchema },
    async (request, reply) => {
      try {
        const { venueId } = request.params as { venueId: string }
        const updateData = request.body as Partial<IVenue>

        // Update location field if latitude/longitude changed
        if (updateData.latitude && updateData.longitude) {
          updateData.location = {
            type: 'Point',
            coordinates: [updateData.longitude, updateData.latitude]
          }
        }

        // Update last synced timestamp
        updateData.lastSyncedOverpass = new Date()

        const venue = await Venue.findOneAndUpdate(
          { venueId },
          { $set: updateData },
          { new: true, runValidators: true }
        )

        if (!venue) {
          return reply.code(404).send({
            success: false,
            error: 'Venue not found'
          })
        }

        return reply.send({
          success: true,
          data: venue
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to update venue'
        })
      }
    }
  )

  /**
   * GET /venues/:venueId
   * Get a single venue by ID
   */
  fastify.get(
    '/:venueId',
    { schema: getVenueSchema },
    async (request, reply) => {
      try {
        const { venueId } = request.params as { venueId: string }
        const venue = await Venue.findOne({ venueId })

        if (!venue) {
          return reply.code(404).send({
            success: false,
            error: 'Venue not found'
          })
        }

        return reply.send({
          success: true,
          data: venue
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch venue'
        })
      }
    }
  )

  /**
   * GET /venues
   * Get venues with optional filtering
   */
  fastify.get(
    '/',
    { schema: getVenuesSchema },
    async (request, reply) => {
      try {
        const {
          south,
          west,
          north,
          east,
          onlyOutdoorSeating,
          maxAgeDays = 7,
          limit = 100,
          skip = 0
        } = request.query as {
          south?: number
          west?: number
          north?: number
          east?: number
          onlyOutdoorSeating?: boolean
          maxAgeDays?: number
          limit?: number
          skip?: number
        }

        const query: any = {}

        // Bounding box filter
        if (south !== undefined && west !== undefined && north !== undefined && east !== undefined) {
          query.location = {
            $geoWithin: {
              $box: [
                [west, south], // Bottom-left
                [east, north]  // Top-right
              ]
            }
          }
        }

        // Outdoor seating filter
        if (onlyOutdoorSeating) {
          query.outdoorSeating = true
        }

        // Age filter
        if (maxAgeDays) {
          const cutoffDate = new Date()
          cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)
          query.lastSyncedOverpass = { $gte: cutoffDate }
        }

        const venues = await Venue.find(query)
          .skip(skip)
          .limit(limit)
          .lean()

        const total = await Venue.countDocuments(query)

        return reply.send({
          success: true,
          data: venues,
          meta: {
            total,
            limit,
            skip,
            count: venues.length
          }
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch venues'
        })
      }
    }
  )

  /**
   * POST /venues/bulk-upsert
   * Bulk upsert venues from Overpass
   */
  fastify.post(
    '/bulk-upsert',
    { schema: bulkUpsertSchema },
    async (request, reply) => {
      try {
        const { venues } = request.body as { venues: Partial<IVenue>[] }

        const operations = venues.map((venueData) => {
          // Create location field
          if (venueData.latitude && venueData.longitude) {
            venueData.location = {
              type: 'Point',
              coordinates: [venueData.longitude, venueData.latitude]
            }
          }

          venueData.lastSyncedOverpass = new Date()

          return {
            updateOne: {
              filter: { venueId: venueData.venueId },
              update: { $set: venueData },
              upsert: true
            }
          }
        })

        const result = await Venue.bulkWrite(operations)

        return reply.send({
          success: true,
          data: {
            inserted: result.upsertedCount,
            updated: result.modifiedCount,
            total: venues.length
          }
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to bulk upsert venues'
        })
      }
    }
  )

  /**
   * DELETE /venues/:venueId
   * Delete a venue
   */
  fastify.delete(
    '/:venueId',
    { schema: getVenueSchema },
    async (request, reply) => {
      try {
        const { venueId } = request.params as { venueId: string }
        const venue = await Venue.findOneAndDelete({ venueId })

        if (!venue) {
          return reply.code(404).send({
            success: false,
            error: 'Venue not found'
          })
        }

        return reply.send({
          success: true,
          message: 'Venue deleted successfully'
        })
      } catch (error) {
        fastify.log.error(error)
        return reply.code(500).send({
          success: false,
          error: 'Failed to delete venue'
        })
      }
    }
  )
}
