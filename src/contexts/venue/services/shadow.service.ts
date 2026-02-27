import type { Building } from '../../overpass/mappers/overpass.mapper'

export class ShadowService {
  analyze(
    venue: { latitude: number, longitude: number },
    buildings: Building[],
    sunAzimuthDegrees: number,
    sunAltitudeRadians: number
  ): 'sunny' | 'shaded' | 'partially_sunny' {
    if (sunAltitudeRadians <= 0) return 'shaded'

    const shadowDirection = this.normalizeAngle(sunAzimuthDegrees + 180)
    const nearbyBuildings = buildings.filter((b) => {
      const d = this.distanceInMeters(venue.latitude, venue.longitude, b.latitude, b.longitude)
      return d < 100 && d > 0
    })

    if (nearbyBuildings.length === 0) return 'sunny'

    const shadowingCount = nearbyBuildings.filter((b) =>
      this.buildingCastsShadow(venue, b, shadowDirection, sunAltitudeRadians)
    ).length

    if (shadowingCount === 0) return 'sunny'
    if (shadowingCount >= 2) return 'shaded'
    return 'partially_sunny'
  }

  private distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  private normalizeAngle(angle: number): number {
    if (angle < 0) return angle + 360
    if (angle >= 360) return angle - 360
    return angle
  }

  private angleDifference(a1: number, a2: number): number {
    const diff = Math.abs(a1 - a2)
    return diff > 180 ? 360 - diff : diff
  }

  private buildingCastsShadow(
    venue: { latitude: number, longitude: number },
    building: Building,
    shadowDirection: number,
    sunAltitudeRadians: number
  ): boolean {
    const shadowLength = building.height / Math.tan(sunAltitudeRadians)
    if (!Number.isFinite(shadowLength)) return false

    const dLat = venue.latitude - building.latitude
    const dLon = venue.longitude - building.longitude
    const angleToVenue = this.normalizeAngle((Math.atan2(dLon, dLat) * 180) / Math.PI)
    const angleDiff = this.angleDifference(angleToVenue, shadowDirection)
    const distance = this.distanceInMeters(venue.latitude, venue.longitude, building.latitude, building.longitude)

    return angleDiff < 45 && distance < shadowLength
  }
}
