import * as Astronomy from 'astronomy-engine';
import type { CelestialBody, ScaleMode, Vector3D } from '../types/solar';

export const AU_IN_KM = 149597870.7;
export const SPEED_OF_LIGHT_KMS = 299792.458;

// Mapping of our IDs to Astronomy.Body
const ASTRONOMY_BODY_MAP: Record<string, Astronomy.Body> = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  earth: Astronomy.Body.Earth,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
  moon: Astronomy.Body.Moon,
};

/**
 * Solve Kepler's equation M = E - e * sin(E) for Eccentric Anomaly E
 */
function solveKepler(meanAnomalyRad: number, rawEccentricity: number): number {
  const eccentricity = Math.min(Math.max(rawEccentricity || 0, 0), 0.95);
  let E = meanAnomalyRad;
  for (let i = 0; i < 15; i++) {
    const denom = 1 - eccentricity * Math.cos(E);
    if (Math.abs(denom) < 1e-5) break;
    const delta = (E - eccentricity * Math.sin(E) - meanAnomalyRad) / denom;
    E -= delta;
    if (Math.abs(delta) < 1e-7 || isNaN(E)) break;
  }
  return isNaN(E) || !isFinite(E) ? 0 : E;
}

/**
 * Compute 3D Heliocentric coordinates (in AU) for a body at a specific Date
 */
export function getHeliocentricPositionAU(body: CelestialBody, date: Date): Vector3D {
  if (body.type === 'star') {
    return { x: 0, y: 0, z: 0 };
  }

  // If supported directly by Astronomy engine
  if (ASTRONOMY_BODY_MAP[body.id]) {
    try {
      if (body.id === 'moon') {
        // Moon is geocentric in astronomy-engine
        const earthPos = Astronomy.HelioVector(Astronomy.Body.Earth, date);
        const moonGeo = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
        const res = {
          x: earthPos.x + moonGeo.x,
          y: earthPos.y + moonGeo.y,
          z: earthPos.z + moonGeo.z,
        };
        if (!isNaN(res.x) && !isNaN(res.y) && !isNaN(res.z)) return res;
      }

      const vec = Astronomy.HelioVector(ASTRONOMY_BODY_MAP[body.id], date);
      if (!isNaN(vec.x) && !isNaN(vec.y) && !isNaN(vec.z)) {
        return { x: vec.x, y: vec.y, z: vec.z };
      }
    } catch {
      // Fallback to Keplerian approximation below
    }
  }

  // General Keplerian propagation for asteroids, comets, dwarf planets, spacecraft
  return getKeplerianPositionAU(body, date);
}

/**
 * Compute parent-relative coordinates (in AU) for moons / satellites at a specific Date
 */
export function getParentRelativePositionAU(body: CelestialBody, date: Date): Vector3D {
  if (body.id === 'moon') {
    try {
      const geo = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
      if (!isNaN(geo.x) && !isNaN(geo.y) && !isNaN(geo.z)) {
        return { x: geo.x, y: geo.y, z: geo.z };
      }
    } catch {
      // fallback
    }
  }
  return getKeplerianPositionAU(body, date);
}

/**
 * Approximate Keplerian propagation from orbital elements
 */
function getKeplerianPositionAU(body: CelestialBody, date: Date): Vector3D {
  const { semiMajorAxisAU: a, eccentricity: rawE, inclinationDeg: inc, orbitalPeriodDays: T } = body.orbit;
  if (!a || !T || T <= 0) return { x: 0, y: 0, z: 0 };

  const e = Math.min(Math.max(rawE || 0, 0), 0.95);

  // Days since J2000 epoch (Jan 1, 2000 12:00 UTC)
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const daysSinceJ2000 = (date.getTime() - J2000) / (1000 * 60 * 60 * 24);

  // Mean anomaly M (radians)
  const n = (2 * Math.PI) / T;
  const phaseOffset = hashStringToNumber(body.id) * 2 * Math.PI;
  const M = (n * daysSinceJ2000 + phaseOffset) % (2 * Math.PI);

  // Eccentric anomaly E
  const E = solveKepler(M, e);

  // True anomaly radius
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);

  const incRad = ((inc || 0) * Math.PI) / 180;
  const nodeRad = (hashStringToNumber(body.id + '_node') * 360 * Math.PI) / 180;

  const x = xOrb * Math.cos(nodeRad) - yOrb * Math.cos(incRad) * Math.sin(nodeRad);
  const y = (xOrb * Math.sin(nodeRad) + yOrb * Math.cos(incRad) * Math.cos(nodeRad)) * 0.95;
  const z = yOrb * Math.sin(incRad);

  return {
    x: isNaN(x) || !isFinite(x) ? 0 : x,
    y: isNaN(y) || !isFinite(y) ? 0 : y,
    z: isNaN(z) || !isFinite(z) ? 0 : z,
  };
}

function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs((hash % 1000) / 1000);
}

/**
 * Generate points along an elliptical orbit for drawing visual orbit lines
 */
export function generateOrbitPoints(body: CelestialBody, numPoints = 120): Vector3D[] {
  const points: Vector3D[] = [];
  const { semiMajorAxisAU: a, eccentricity: rawE, inclinationDeg: inc } = body.orbit;
  if (!a || a <= 0 || body.type === 'spacecraft') return points;

  // Clamp eccentricity for visual ellipse
  const e = Math.min(Math.max(rawE || 0, 0), 0.92);
  const incRad = ((inc || 0) * Math.PI) / 180;
  const nodeRad = (hashStringToNumber(body.id + '_node') * 360 * Math.PI) / 180;

  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI;
    const denom = 1 + e * Math.cos(theta);
    if (Math.abs(denom) < 1e-4) continue;
    const r = (a * (1 - e * e)) / denom;
    if (isNaN(r) || !isFinite(r)) continue;

    const xOrb = r * Math.cos(theta);
    const yOrb = r * Math.sin(theta);

    const x = xOrb * Math.cos(nodeRad) - yOrb * Math.cos(incRad) * Math.sin(nodeRad);
    const y = xOrb * Math.sin(nodeRad) + yOrb * Math.cos(incRad) * Math.cos(nodeRad);
    const z = yOrb * Math.sin(incRad);

    if (!isNaN(x) && !isNaN(y) && !isNaN(z) && isFinite(x) && isFinite(y) && isFinite(z)) {
      points.push({ x, y, z });
    }
  }

  return points;
}

/**
 * Transform Helocentric AU coordinates to Three.js world scene coordinates based on ScaleMode
 */
export function toSceneCoordinates(posAU: Vector3D, scaleMode: ScaleMode): Vector3D {
  const px = isNaN(posAU.x) || !isFinite(posAU.x) ? 0 : posAU.x;
  const py = isNaN(posAU.y) || !isFinite(posAU.y) ? 0 : posAU.y;
  const pz = isNaN(posAU.z) || !isFinite(posAU.z) ? 0 : posAU.z;

  if (scaleMode === 'realistic') {
    const scale = 60;
    return {
      x: px * scale,
      y: pz * scale,
      z: py * scale,
    };
  } else {
    const r = Math.sqrt(px * px + py * py + pz * pz);
    if (r < 0.0001 || isNaN(r)) return { x: 0, y: 0, z: 0 };

    const compressedR = Math.log10(1 + r * 15) * 32 + Math.sqrt(r) * 8;
    const factor = compressedR / r;

    return {
      x: px * factor,
      y: pz * factor * 0.4,
      z: py * factor,
    };
  }
}

/**
 * Get body display radius for Three.js geometry based on ScaleMode
 */
export function getDisplayRadius(body: CelestialBody, scaleMode: ScaleMode): number {
  if (body.type === 'star') {
    return scaleMode === 'explorer' ? 7.5 : 4.0;
  }

  if (scaleMode === 'realistic') {
    // Earth radius = 6371 km -> 0.08 units
    const base = (body.physical.meanRadiusKm / 6371.0) * 0.08;
    return Math.max(0.02, Math.min(base, 2.5));
  } else {
    // Explorer mode: exaggerated radii so planets are clearly visible and clickable
    const r = body.physical.meanRadiusKm;
    if (body.type === 'spacecraft') return 0.45;
    if (body.type === 'asteroid' || body.type === 'comet') return 0.35;
    if (body.type === 'moon') return 0.55;
    if (body.type === 'dwarf_planet') return 0.7;

    // Planets: range from 1.0 (Mercury) to 3.8 (Jupiter)
    const normalized = Math.log10(r) - 3; // ~0.4 for Mercury to ~1.8 for Jupiter
    return Math.max(0.7, 0.9 + normalized * 1.6);
  }
}

/**
 * Calculate distance, light-travel time, and instantaneous speed
 */
export function calculateTelemetry(body: CelestialBody, helioPos: Vector3D, earthHelioPos: Vector3D) {
  const distSunAU = Math.sqrt(helioPos.x ** 2 + helioPos.y ** 2 + helioPos.z ** 2);
  const distSunKm = distSunAU * AU_IN_KM;

  const dx = helioPos.x - earthHelioPos.x;
  const dy = helioPos.y - earthHelioPos.y;
  const dz = helioPos.z - earthHelioPos.z;
  const distEarthAU = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  const distEarthKm = distEarthAU * AU_IN_KM;

  const lightTravelSeconds = distEarthKm / SPEED_OF_LIGHT_KMS;

  // Format light travel time into readable string
  let lightTimeFormatted = '';
  if (lightTravelSeconds < 60) {
    lightTimeFormatted = `${lightTravelSeconds.toFixed(1)}s`;
  } else if (lightTravelSeconds < 3600) {
    const mins = Math.floor(lightTravelSeconds / 60);
    const secs = Math.floor(lightTravelSeconds % 60);
    lightTimeFormatted = `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(lightTravelSeconds / 3600);
    const mins = Math.floor((lightTravelSeconds % 3600) / 60);
    lightTimeFormatted = `${hours}h ${mins}m`;
  }

  // Vis-viva equation for orbital speed approximation: v = sqrt(GM * (2/r - 1/a))
  let speedKms = body.orbit.orbitalSpeedKms;
  if (body.orbit.semiMajorAxisAU > 0 && distSunAU > 0) {
    const mu = 132712440018; // km^3 / s^2 (Standard gravitational parameter of the Sun)
    const rKm = distSunKm;
    const aKm = body.orbit.semiMajorAxisAU * AU_IN_KM;
    const v2 = mu * (2 / rKm - 1 / aKm);
    if (v2 > 0) {
      speedKms = Math.sqrt(v2);
    }
  }

  return {
    distSunAU,
    distSunKm,
    distEarthAU,
    distEarthKm,
    lightTravelSeconds,
    lightTimeFormatted,
    currentSpeedKms: speedKms,
  };
}
