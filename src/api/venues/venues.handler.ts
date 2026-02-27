import { FastifyReply, FastifyRequest } from 'fastify'
import { OverpassGateway } from '../../contexts/overpass/gateways/overpass.gateway'
import { VenueRepository } from '../../contexts/venue/repositories/venue.repository'
import { ShadowService } from '../../contexts/venue/services/shadow.service'
import { VenueService } from '../../contexts/venue/services/venue.service'

export const MAX_BBOX_DEGREES = 0.05

export type VenuesQuery = {
  south: number
  west: number
  north: number
  east: number
  datetime?: string
}

type ApiError = { statusCode?: number, message?: string }

const venueService = new VenueService(
  new OverpassGateway(),
  new VenueRepository(),
  new ShadowService()
)

export async function handleVenues(
  request: FastifyRequest<{ Querystring: VenuesQuery }>,
  reply: FastifyReply
) {
  const { south, west, north, east, datetime } = request.query

  if (north - south > MAX_BBOX_DEGREES || east - west > MAX_BBOX_DEGREES) {
    return reply.code(400).send({
      statusCode: 400,
      statusMessage: `Bounding box too large. Max ${MAX_BBOX_DEGREES} degrees (~5km)`
    })
  }

  const date = datetime ? new Date(datetime) : new Date()
  if (Number.isNaN(date.getTime())) {
    return reply.code(400).send({ statusCode: 400, statusMessage: 'Invalid datetime format' })
  }

  try {
    return await venueService.getVenuesWithShadow({ south, west, north, east }, date)
  } catch (err: unknown) {
    const e = err as ApiError
    request.server.log.error(err)
    return reply.code(e.statusCode || 503).send({
      statusCode: e.statusCode || 503,
      statusMessage: e.message || 'Overpass API unavailable'
    })
  }
}
