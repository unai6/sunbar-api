import { FastifyInstance } from 'fastify'
import { handleVenues, type VenuesQuery } from './venues.handler'
import { venuesSchema } from './venues.schema'

export default async function venueRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: VenuesQuery }>(
    '/',
    { schema: venuesSchema },
    handleVenues
  )
}
