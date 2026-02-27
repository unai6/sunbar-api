export type NominatimSearchResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  boundingbox: [string, string, string, string]
  type: string
  importance: number
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    postcode?: string
    country?: string
    amenity?: string
    tourism?: string
    leisure?: string
  }
}

export type NominatimReverseResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    postcode?: string
    country?: string
  }
}

const BASE_URL = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'SunBar/1.0'
const TIMEOUT_MS = 8000

export class NominatimGateway {
  async search(query: string, limit = 5, acceptLanguage = 'es,en'): Promise<NominatimSearchResult[]> {
    if (!query || query.trim().length < 3) return []

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const url = new URL(`${BASE_URL}/search`)
      url.searchParams.set('q', query)
      url.searchParams.set('format', 'json')
      url.searchParams.set('addressdetails', '1')
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('accept-language', acceptLanguage)

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal
      })

      if (!response.ok) throw this.makeError(response.status, `Nominatim search failed: ${response.statusText}`)
      return (await response.json()) as NominatimSearchResult[]
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw this.makeError(504, 'Nominatim search timeout')
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async reverse(lat: number, lon: number, acceptLanguage = 'es,en'): Promise<NominatimReverseResult | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const url = new URL(`${BASE_URL}/reverse`)
      url.searchParams.set('lat', lat.toString())
      url.searchParams.set('lon', lon.toString())
      url.searchParams.set('format', 'json')
      url.searchParams.set('accept-language', acceptLanguage)

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal
      })

      if (response.status === 404) return null
      if (!response.ok) throw this.makeError(response.status, `Nominatim reverse geocode failed: ${response.statusText}`)
      return (await response.json()) as NominatimReverseResult
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw this.makeError(504, 'Nominatim reverse geocode timeout')
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private makeError(statusCode: number, message: string): Error {
    return Object.assign(new Error(message), { statusCode })
  }
}
