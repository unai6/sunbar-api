import SunCalc from 'suncalc'

export type SunPosition = {
  azimuthDegrees: number
  altitudeDegrees: number
  azimuthRadians: number
  altitudeRadians: number
}

export class SunService {
  static getPosition(latitude: number, longitude: number, date: Date): SunPosition {
    const position = SunCalc.getPosition(date, latitude, longitude)

    // SunCalc returns azimuth from south clockwise in radians.
    // Convert to compass degrees (0=N, 90=E, 180=S, 270=W).
    let azimuthDegrees = (position.azimuth * 180) / Math.PI + 180
    if (azimuthDegrees >= 360) azimuthDegrees -= 360

    return {
      azimuthDegrees,
      altitudeDegrees: (position.altitude * 180) / Math.PI,
      azimuthRadians: position.azimuth,
      altitudeRadians: position.altitude
    }
  }
}
