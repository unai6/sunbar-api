export const searchSchema = {
  querystring: {
    type: 'object',
    required: ['q'],
    properties: {
      q: { type: 'string', minLength: 2 },
      limit: { type: 'number', minimum: 1, maximum: 20 },
      lang: { type: 'string' }
    }
  }
} as const

export const reverseGeocodeSchema = {
  querystring: {
    type: 'object',
    required: ['lat', 'lon'],
    properties: {
      lat: { type: 'number', minimum: -90, maximum: 90 },
      lon: { type: 'number', minimum: -180, maximum: 180 },
      lang: { type: 'string' }
    }
  }
} as const
