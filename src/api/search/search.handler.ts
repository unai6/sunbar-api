import { FastifyReply, FastifyRequest } from 'fastify'
import { NominatimGateway } from './gateways/nominatim.gateway'

export type SearchQuery = {
  q: string
  limit?: number
  lang?: string
}

export type ReverseGeocodeQuery = {
  lat: number
  lon: number
  lang?: string
}

type ApiError = { statusCode?: number, message?: string }

const nominatimGateway = new NominatimGateway()

export async function handleSearch(
  request: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply
) {
  const { q, limit = 5, lang = 'es,en,ca' } = request.query

  try {
    const results = await nominatimGateway.search(q, limit, lang)

    return {
      results: results.map((r) => ({
        id: r.place_id,
        name: r.display_name,
        latitude: Number.parseFloat(r.lat),
        longitude: Number.parseFloat(r.lon),
        bounds: {
          south: Number.parseFloat(r.boundingbox[0]),
          north: Number.parseFloat(r.boundingbox[1]),
          west: Number.parseFloat(r.boundingbox[2]),
          east: Number.parseFloat(r.boundingbox[3])
        },
        type: r.type,
        address: r.address
      })),
      count: results.length
    }
  } catch (err: unknown) {
    const e = err as ApiError
    request.server.log.error(err)
    return reply.code(e.statusCode || 500).send({
      statusCode: e.statusCode || 500,
      statusMessage: e.message || 'Search failed'
    })
  }
}

export async function handleReverseGeocode(
  request: FastifyRequest<{ Querystring: ReverseGeocodeQuery }>,
  reply: FastifyReply
) {
  const { lat, lon, lang = 'es,en' } = request.query

  try {
    const result = await nominatimGateway.reverse(lat, lon, lang)
    if (!result) return { address: null, found: false }

    return {
      address: result.display_name,
      latitude: Number.parseFloat(result.lat),
      longitude: Number.parseFloat(result.lon),
      found: true
    }
  } catch (err: unknown) {
    const e = err as ApiError
    request.server.log.error(err)
    return reply.code(e.statusCode || 500).send({
      statusCode: e.statusCode || 500,
      statusMessage: e.message || 'Reverse geocoding failed'
    })
  }
}
