import type { EarthSatellite } from '../types/satellite';

export interface SatelliteLiveTrack {
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKmh: number;
  isDaylight: boolean;
  groundTrackSpeedKms: number;
  totalOrbitsCompleted: number;
}

/**
 * Propagates instantaneous sub-satellite geographic coordinates (lat, lon)
 * and orbital telemetry based on orbital inclination, period, altitude, and elapsed time.
 */
export function calculateSatelliteLiveTrack(
  sat: EarthSatellite,
  simDate: Date = new Date()
): SatelliteLiveTrack {
  const epochMs = simDate.getTime();
  const periodMs = sat.orbit.periodMinutes * 60 * 1000;
  
  // Hash seed from noradId to give each satellite unique initial anomaly
  const seed = (sat.origin.noradId * 137.5) % 360;
  const phase = (epochMs / periodMs) * 2 * Math.PI + (seed * Math.PI) / 180;

  const incRad = (sat.orbit.inclinationDeg * Math.PI) / 180;

  // Instantaneous geocentric latitude (-90 to +90)
  const sinLat = Math.sin(incRad) * Math.sin(phase);
  const lat = (Math.asin(sinLat) * 180) / Math.PI;

  // Instantaneous orbital longitude in inertial frame
  const xOrb = Math.cos(phase);
  const yOrb = Math.sin(phase) * Math.cos(incRad);
  const inertialLon = (Math.atan2(yOrb, xOrb) * 180) / Math.PI;

  // Earth rotation rate: 360 degrees per sidereal day (86164 seconds)
  const earthRotRateDegPerSec = 360 / 86164;
  const simSeconds = epochMs / 1000;
  const earthRotAngle = (simSeconds * earthRotRateDegPerSec) % 360;

  // Geographic longitude (-180 to +180)
  let lon = (inertialLon - earthRotAngle + seed) % 360;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  // Ground speed
  const earthRadiusKm = 6371;
  const groundTrackSpeedKms = (sat.orbit.velocityKmh * earthRadiusKm) / (earthRadiusKm + sat.orbit.altitudeKm) / 3600;

  // Total revolutions completed since launch
  const launchTime = new Date(sat.origin.launchDate).getTime();
  const validLaunch = !isNaN(launchTime) && launchTime < epochMs ? launchTime : epochMs - 365 * 86400000;
  const totalOrbitsCompleted = Math.floor((epochMs - validLaunch) / periodMs);

  // Approximate daylight vs umbra (sun is at lon ~ based on UTC hour)
  const utcHours = simDate.getUTCHours() + simDate.getUTCMinutes() / 60;
  const subSolarLon = (12 - utcHours) * 15;
  const sunDiffLon = Math.abs(lon - subSolarLon);
  const isDaylight = sunDiffLon < 90 || sunDiffLon > 270;

  return {
    latitude: parseFloat(lat.toFixed(4)),
    longitude: parseFloat(lon.toFixed(4)),
    altitudeKm: sat.orbit.altitudeKm,
    velocityKmh: sat.orbit.velocityKmh,
    isDaylight,
    groundTrackSpeedKms: parseFloat(groundTrackSpeedKms.toFixed(2)),
    totalOrbitsCompleted,
  };
}
