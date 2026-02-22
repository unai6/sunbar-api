/**
 * JSON Schemas for Venue endpoints
 * Used for request validation and response serialization
 */

export const createVenueSchema = {
  body: {
    type: 'object',
    required: ['venueId', 'osmId', 'osmType', 'name', 'venueType', 'latitude', 'longitude'],
    properties: {
      venueId: { type: 'string' },
      osmId: { type: 'string' },
      osmType: { type: 'string', enum: ['node', 'way', 'relation'] },
      name: { type: 'string' },
      venueType: { type: 'string' },
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      outdoorSeating: { type: 'boolean' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          formatted: { type: 'string' }
        }
      },
      phone: { type: 'string' },
      website: { type: 'string' },
      openingHours: { type: 'string' }
    }
  }
}

export const updateVenueSchema = {
  params: {
    type: 'object',
    required: ['venueId'],
    properties: {
      venueId: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      venueType: { type: 'string' },
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      outdoorSeating: { type: 'boolean' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          formatted: { type: 'string' }
        }
      },
      phone: { type: 'string' },
      website: { type: 'string' },
      openingHours: { type: 'string' }
    }
  }
}

export const getVenueSchema = {
  params: {
    type: 'object',
    required: ['venueId'],
    properties: {
      venueId: { type: 'string' }
    }
  }
}

export const getVenuesSchema = {
  querystring: {
    type: 'object',
    properties: {
      south: { type: 'number' },
      west: { type: 'number' },
      north: { type: 'number' },
      east: { type: 'number' },
      onlyOutdoorSeating: { type: 'boolean' },
      maxAgeDays: { type: 'number' },
      limit: { type: 'number', minimum: 1, maximum: 1000 },
      skip: { type: 'number', minimum: 0 }
    }
  }
}

export const bulkUpsertSchema = {
  body: {
    type: 'object',
    required: ['venues'],
    properties: {
      venues: {
        type: 'array',
        items: {
          type: 'object',
          required: ['venueId', 'osmId', 'osmType', 'name', 'venueType', 'latitude', 'longitude'],
          properties: {
            venueId: { type: 'string' },
            osmId: { type: 'string' },
            osmType: { type: 'string', enum: ['node', 'way', 'relation'] },
            name: { type: 'string' },
            venueType: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            outdoorSeating: { type: 'boolean' },
            phone: { type: 'string' },
            website: { type: 'string' },
            openingHours: { type: 'string' }
          }
        }
      }
    }
  }
}
