import { FastifyInstance } from 'fastify'
import { handleReverseGeocode, handleSearch, type ReverseGeocodeQuery, type SearchQuery } from './search.handler'
import { reverseGeocodeSchema, searchSchema } from './search.schema'

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: SearchQuery }>(
    '/search',
    { schema: searchSchema },
    handleSearch
  )

  fastify.get<{ Querystring: ReverseGeocodeQuery }>(
    '/reverse-geocode',
    { schema: reverseGeocodeSchema },
    handleReverseGeocode
  )
}
