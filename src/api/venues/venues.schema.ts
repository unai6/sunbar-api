export const venuesSchema = {
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
} as const
