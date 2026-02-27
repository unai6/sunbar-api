import { FastifyInstance } from 'fastify'
import { handleVenues, type VenuesQuery } from './venues.handler'

export default async function venueRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: VenuesQuery }>(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['south', 'west', 'north', 'east'],
          properties: {
            south: { type: 'number' },
            west: { type: 'number' },
            north: { type: 'number' },
            east: { type: 'number' },
            datetime: { type: 'string' }
          }
        }
      }
    },
    handleVenues
  )
}
