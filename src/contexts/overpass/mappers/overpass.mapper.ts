import type { OverpassElement } from '../gateways/overpass.gateway'

export type Building = {
  id: string
  latitude: number
  longitude: number
  height: number
}

export type ParsedVenue = {
  id: string
  name: string
  type: string
  latitude: number
  longitude: number
  address?: string
  outdoor_seating?: boolean
  phone?: string
  website?: string
  openingHours?: string
}

const DEFAULT_FLOOR_HEIGHT = 3
const DEFAULT_HEIGHT = 10

function parseHeight(tags: Record<string, string>): number | undefined {
  const heightStr = tags.height || tags['building:height']
  if (!heightStr) return undefined
  const match = /^(\d+(?:\.\d+)?)/.exec(heightStr)
  return match ? Number.parseFloat(match[1]) : undefined
}

function parseLevels(tags: Record<string, string>): number | undefined {
  const levelsStr = tags['building:levels'] || tags.levels
  if (!levelsStr) return undefined
  const levels = Number.parseInt(levelsStr, 10)
  return Number.isNaN(levels) ? undefined : levels
}

function buildAddress(tags: Record<string, string>): string | undefined {
  const street = tags['addr:street']
  if (!street) return undefined
  const houseNumber = tags['addr:housenumber']
  return houseNumber ? `${street} ${houseNumber}` : street
}

export class OverpassMapper {
  static toVenues(elements: OverpassElement[]): ParsedVenue[] {
    const validTypes = new Set(['bar', 'restaurant', 'cafe', 'pub', 'biergarten'])
    const parsed: ParsedVenue[] = []

    for (const el of elements) {
      const tags = el.tags || {}
      if (!tags.name || !validTypes.has(tags.amenity || '')) continue

      const lat = el.lat ?? el.center?.lat
      const lon = el.lon ?? el.center?.lon
      if (!lat || !lon) continue

      parsed.push({
        id: `${el.type}/${el.id}`,
        name: tags.name,
        type: tags.amenity || 'bar',
        latitude: lat,
        longitude: lon,
        address: buildAddress(tags),
        outdoor_seating: tags.outdoor_seating === 'yes',
        phone: tags.phone || tags['contact:phone'] || undefined,
        website: tags.website || tags['contact:website'] || undefined,
        openingHours: tags.opening_hours || undefined
      })
    }

    return parsed
  }

  static toBuildings(elements: OverpassElement[]): Building[] {
    return elements
      .map((element) => {
        const tags = element.tags || {}
        const lat = element.lat ?? element.center?.lat
        const lon = element.lon ?? element.center?.lon
        if (!lat || !lon) return null

        let height = parseHeight(tags)
        if (!height) {
          const levels = parseLevels(tags)
          height = levels ? levels * DEFAULT_FLOOR_HEIGHT : DEFAULT_HEIGHT
        }

        return { id: `${element.type}/${element.id}`, latitude: lat, longitude: lon, height }
      })
      .filter((b): b is Building => b !== null)
  }
}
