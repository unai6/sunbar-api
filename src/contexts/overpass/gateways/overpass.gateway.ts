export type OverpassElement = {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number, lon: number }
  geometry?: Array<{ lat: number, lon: number }>
  tags?: Record<string, string>
}

export type OverpassResponse = {
  elements: OverpassElement[]
}

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
]

export class OverpassGateway {
  private readonly maxRetries = 3
  private readonly initialDelayMs = 1000
  private readonly timeoutMs = 20000

  async execute(query: string): Promise<OverpassResponse> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const endpoint = ENDPOINTS[attempt % ENDPOINTS.length]
      try {
        const response = await this.request(endpoint, query)

        if (this.isRetryable(response.status)) {
          lastError = new Error(`Server error: ${response.status}`)
          await this.sleep(this.initialDelayMs * (attempt + 1))
          continue
        }

        if (!response.ok) {
          throw Object.assign(new Error(`Overpass API error: ${response.statusText}`), { statusCode: response.status })
        }

        return (await response.json()) as OverpassResponse
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = new Error('timeout')
        } else {
          lastError = err as Error
        }
        await this.sleep(this.initialDelayMs * (attempt + 1))
      }
    }

    console.error('[OverpassGateway] All retries exhausted:', lastError)
    throw Object.assign(new Error('Overpass API temporarily unavailable. Please try again later.'), { statusCode: 503 })
  }

  private async request(endpoint: string, query: string): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      return await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private isRetryable(status: number): boolean {
    return status === 429 || status === 504 || status === 503 || status === 502
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
