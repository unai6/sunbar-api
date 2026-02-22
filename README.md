# SunBar API

Fastify + TypeScript + MongoDB backend for SunBar venue management.

## Features

- ✅ TypeScript for type safety
- ✅ Fastify for high performance
- ✅ MongoDB with Mongoose ODM
- ✅ Geospatial queries for location-based searches
- ✅ Request validation using JSON Schema
- ✅ Structured logging with Pino
- ✅ CORS support
- ✅ Graceful shutdown

## Prerequisites

- Node.js 18+
- MongoDB 5+
- npm or pnpm

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration (see ENV_SETUP.md for details)
nano .env
```

## Environment Variables

See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment configuration.

**Quick reference:**

```env
PORT=3002
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info
MONGODB_URI=mongodb://localhost:27017/sunbar
CORS_ORIGIN=http://localhost:3000
```

> **Note:** Environment variables are loaded automatically using `dotenv` when the server starts.

## Development

```bash
# Run development server with hot reload
npm run dev
```

## Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

### Venues

#### Create Venue

```
POST /api/venues
Content-Type: application/json

{
  "venueId": "node/123456",
  "osmId": "123456",
  "osmType": "node",
  "name": "Bar Sol",
  "venueType": "bar",
  "latitude": 40.4168,
  "longitude": -3.7038,
  "outdoorSeating": true,
  "address": {
    "street": "Calle Mayor 1",
    "city": "Madrid",
    "postalCode": "28001",
    "country": "Spain",
    "formatted": "Calle Mayor 1, Madrid, 28001, Spain"
  },
  "phone": "+34 911 234 567",
  "website": "https://barsol.com",
  "openingHours": "Mo-Su 10:00-22:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "venueId": "node/123456",
    "name": "Bar Sol",
    ...
  }
}
```

#### Update Venue

```
PUT /api/venues/:venueId
Content-Type: application/json

{
  "name": "Bar Sol Updated",
  "outdoorSeating": false,
  "phone": "+34 911 999 999"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "venueId": "node/123456",
    "name": "Bar Sol Updated",
    ...
  }
}
```

#### Get Single Venue

```
GET /api/venues/:venueId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "venueId": "node/123456",
    "name": "Bar Sol",
    ...
  }
}
```

#### Get Venues (with filters)

```
GET /api/venues?south=40.4&west=-3.8&north=40.5&east=-3.6&onlyOutdoorSeating=true&limit=50
```

**Query Parameters:**
- `south`: Southern latitude boundary
- `west`: Western longitude boundary
- `north`: Northern latitude boundary
- `east`: Eastern longitude boundary
- `onlyOutdoorSeating`: Filter for outdoor seating (boolean)
- `maxAgeDays`: Maximum age of last sync in days (default: 7)
- `limit`: Maximum results (default: 100, max: 1000)
- `skip`: Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 50,
    "skip": 0,
    "count": 50
  }
}
```

#### Bulk Upsert Venues

```
POST /api/venues/bulk-upsert
Content-Type: application/json

{
  "venues": [
    {
      "venueId": "node/123456",
      "osmId": "123456",
      "osmType": "node",
      "name": "Bar 1",
      "venueType": "bar",
      "latitude": 40.4168,
      "longitude": -3.7038,
      "outdoorSeating": true
    },
    {
      "venueId": "node/789012",
      "osmId": "789012",
      "osmType": "node",
      "name": "Restaurant 1",
      "venueType": "restaurant",
      "latitude": 40.4200,
      "longitude": -3.7100,
      "outdoorSeating": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inserted": 2,
    "updated": 0,
    "total": 2
  }
}
```

#### Delete Venue

```
DELETE /api/venues/:venueId
```

**Response:**
```json
{
  "success": true,
  "message": "Venue deleted successfully"
}
```

## Data Model

### Venue

```typescript
{
  venueId: string           // Unique identifier (e.g., "node/123456")
  osmId: string             // OpenStreetMap ID
  osmType: string           // 'node' | 'way' | 'relation'
  name: string              // Venue name
  venueType: string         // 'bar' | 'restaurant' | 'cafe' | 'pub' | 'biergarten'
  latitude: number          // Latitude (-90 to 90)
  longitude: number         // Longitude (-180 to 180)
  location: {               // GeoJSON Point (auto-generated)
    type: 'Point'
    coordinates: [number, number]  // [longitude, latitude]
  }
  outdoorSeating?: boolean
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
    formatted?: string
  }
  phone?: string
  website?: string
  openingHours?: string
  lastSyncedOverpass?: Date
  createdAt: Date           // Auto-generated
  updatedAt: Date           // Auto-generated
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

**Status Codes:**
- `201`: Created
- `200`: OK
- `400`: Bad Request (validation error)
- `404`: Not Found
- `409`: Conflict (duplicate venueId)
- `500`: Internal Server Error

## Architecture

```
sunbar-api/
├── src/
│   ├── models/           # Mongoose models
│   │   └── venue.model.ts
│   ├── routes/           # API routes
│   │   └── venues.ts
│   ├── schemas/          # JSON schemas for validation
│   │   └── venue.schema.ts
│   ├── plugins/          # Fastify plugins
│   │   └── mongodb.ts
│   └── server.ts         # Main server file
├── .env.example
├── .eslintrc.js
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
