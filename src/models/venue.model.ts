import mongoose, { Document, Schema } from 'mongoose'

/**
 * Venue Document Interface
 */
export type IVenue = Document & {
  // Unique identifier (hash of OSM ID + type)
  venueId: string

  // Original Overpass/OSM data
  osmId: string
  osmType: 'node' | 'way' | 'relation'

  // Core venue data
  name: string
  venueType: string

  // Geolocation
  latitude: number
  longitude: number
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }

  // Venue attributes
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

  // Metadata
  lastSyncedOverpass?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Venue Schema
 */
const VenueSchema = new Schema<IVenue>(
  {
    venueId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    osmId: {
      type: String,
      required: true,
      index: true
    },
    osmType: {
      type: String,
      required: true,
      enum: ['node', 'way', 'relation']
    },
    name: {
      type: String,
      required: true,
      index: true
    },
    venueType: {
      type: String,
      required: true,
      index: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    outdoorSeating: {
      type: Boolean,
      default: false
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
      formatted: String
    },
    phone: String,
    website: String,
    openingHours: String,
    lastSyncedOverpass: Date
  },
  {
    timestamps: true
  }
)

// Geospatial index for location queries
VenueSchema.index({ location: '2dsphere' })

// Compound index for bbox queries
VenueSchema.index({ latitude: 1, longitude: 1 })

// Index for filtering by sync date
VenueSchema.index({ lastSyncedOverpass: 1 })

export const Venue = mongoose.model<IVenue>('Venue', VenueSchema)
