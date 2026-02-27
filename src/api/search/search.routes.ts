import { FastifyInstance } from 'fastify'
import { handleReverseGeocode, handleSearch, type ReverseGeocodeQuery, type SearchQuery } from './search.handler'

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: SearchQuery }>(
    '/search',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string', minLength: 3 },
            limit: { type: 'number', minimum: 1, maximum: 20 },
            lang: { type: 'string' }
          }
        }
      }
    },
    handleSearch
  )

  fastify.get<{ Querystring: ReverseGeocodeQuery }>(
    '/reverse-geocode',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['lat', 'lon'],
          properties: {
            lat: { type: 'number', minimum: -90,  maximum: 90  },
            lon: { type: 'number', minimum: -180, maximum: 180 },
            lang: { type: 'string' }
          }
        }
      }
    },
    handleReverseGeocode
  )
}
