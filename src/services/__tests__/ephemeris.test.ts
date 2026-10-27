import { describe, it, expect } from 'vitest';
import {
  getHeliocentricPositionAU,
  generateOrbitPoints,
  toSceneCoordinates,
  getDisplayRadius,
  calculateTelemetry,
  AU_IN_KM,
  SPEED_OF_LIGHT_KMS,
} from '../ephemeris';
import type { CelestialBody } from '../../types/solar';

describe('Ephemeris & Orbital Mechanics Service', () => {
  const mockSun: CelestialBody = {
    id: 'sun',
    name: 'Sun',
    naifId: 10,
    type: 'star',
    color: '#ffcc33',
    textureType: 'sun',
    physical: {
      meanRadiusKm: 696340,
      massKg: 1.989e30,
      massEarthRelative: 333000,
      densityGcm3: 1.408,
      gravityMs2: 274,
      escapeVelocityKms: 617.7,
      rotationPeriodHours: 609,
      axialTiltDeg: 7.25,
      meanTempC: 5505,
      surfaceFeatures: [],
      atmosphereComposition: [],
    },
    orbit: {
      semiMajorAxisAU: 0,
      eccentricity: 0,
      inclinationDeg: 0,
      orbitalPeriodDays: 0,
      orbitalSpeedKms: 0,
      perihelionAU: 0,
      aphelionAU: 0,
    },
    summary: 'Central star',
    funFacts: [],
    missions: [],
    tags: [],
    provenance: [],
  };

  const mockEarth: CelestialBody = {
    id: 'earth',
    name: 'Earth',
    naifId: 399,
    type: 'planet',
    parentId: 'sun',
    color: '#3b82f6',
    textureType: 'earth',
    physical: {
      meanRadiusKm: 6371,
      massKg: 5.972e24,
      massEarthRelative: 1,
      densityGcm3: 5.514,
      gravityMs2: 9.807,
      escapeVelocityKms: 11.186,
      rotationPeriodHours: 23.934,
      axialTiltDeg: 23.44,
      meanTempC: 15,
      surfaceFeatures: [],
      atmosphereComposition: [],
    },
    orbit: {
      semiMajorAxisAU: 1.0,
      eccentricity: 0.0167,
      inclinationDeg: 0.0,
      orbitalPeriodDays: 365.25,
      orbitalSpeedKms: 29.78,
      perihelionAU: 0.983,
      aphelionAU: 1.017,
    },
    summary: 'Third planet',
    funFacts: [],
    missions: [],
    tags: [],
    provenance: [],
  };

  const mockAsteroid: CelestialBody = {
    id: 'apophis',
    name: 'Apophis',
    naifId: 2099942,
    type: 'asteroid',
    parentId: 'sun',
    color: '#a1a1aa',
    textureType: 'rocky',
    physical: {
      meanRadiusKm: 0.17,
      massKg: 6.1e10,
      massEarthRelative: 0.00000000001,
      densityGcm3: 2.6,
      gravityMs2: 0.0001,
      escapeVelocityKms: 0.0001,
      rotationPeriodHours: 30.6,
      axialTiltDeg: 0,
      meanTempC: -30,
      surfaceFeatures: [],
      atmosphereComposition: [],
    },
    orbit: {
      semiMajorAxisAU: 0.9224,
      eccentricity: 0.1912,
      inclinationDeg: 3.331,
      orbitalPeriodDays: 323.6,
      orbitalSpeedKms: 30.73,
      perihelionAU: 0.746,
      aphelionAU: 1.099,
    },
    summary: 'Potentially hazardous asteroid',
    funFacts: [],
    missions: [],
    tags: [],
    provenance: [],
  };

  it('calculates the Sun position as origin (0, 0, 0)', () => {
    const pos = getHeliocentricPositionAU(mockSun, new Date('2026-10-15T00:00:00Z'));
    expect(pos).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('computes Earth heliocentric distance within astronomical bounds (~0.98 to ~1.02 AU)', () => {
    const pos = getHeliocentricPositionAU(mockEarth, new Date('2026-10-15T00:00:00Z'));
    const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    expect(dist).toBeGreaterThan(0.97);
    expect(dist).toBeLessThan(1.03);
    expect(Number.isFinite(pos.x)).toBe(true);
    expect(Number.isFinite(pos.y)).toBe(true);
    expect(Number.isFinite(pos.z)).toBe(true);
  });

  it('propagates Keplerian orbits for asteroids without throwing NaN', () => {
    const pos = getHeliocentricPositionAU(mockAsteroid, new Date('2029-04-13T21:46:00Z'));
    const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
    expect(dist).toBeGreaterThan(0.7);
    expect(dist).toBeLessThan(1.2);
    expect(Number.isFinite(pos.x)).toBe(true);
    expect(Number.isFinite(pos.y)).toBe(true);
  });

  it('generates closed elliptical orbit points for rendering orbits', () => {
    const points = generateOrbitPoints(mockEarth, 60);
    expect(points.length).toBeGreaterThan(30);
    points.forEach((pt) => {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
      expect(Number.isFinite(pt.z)).toBe(true);
    });
  });

  it('transforms coordinates correctly between realistic and explorer scale modes', () => {
    const posAU = { x: 1.0, y: 0.0, z: 0.0 };

    const realistic = toSceneCoordinates(posAU, 'realistic');
    expect(realistic.x).toBe(60);

    const explorer = toSceneCoordinates(posAU, 'explorer');
    expect(explorer.x).toBeGreaterThan(30);
    expect(explorer.x).toBeLessThan(60);
    expect(Number.isFinite(explorer.x)).toBe(true);
  });

  it('computes display radii appropriately for UI visibility in explorer mode', () => {
    const sunR = getDisplayRadius(mockSun, 'explorer');
    const earthR = getDisplayRadius(mockEarth, 'explorer');
    const asteroidR = getDisplayRadius(mockAsteroid, 'explorer');

    expect(sunR).toBeGreaterThan(earthR);
    expect(earthR).toBeGreaterThan(asteroidR);
  });

  it('calculates live telemetry: distances, speed, and light-travel time accurately', () => {
    const earthPos = { x: 1.0, y: 0.0, z: 0.0 };
    const marsPos = { x: 1.5, y: 0.0, z: 0.0 };

    const telemetry = calculateTelemetry(mockEarth, marsPos, earthPos);
    expect(telemetry.distSunAU).toBeCloseTo(1.5, 2);
    expect(telemetry.distEarthAU).toBeCloseTo(0.5, 2);
    expect(telemetry.distEarthKm).toBeCloseTo(0.5 * AU_IN_KM, 0);

    const expectedLightSec = (0.5 * AU_IN_KM) / SPEED_OF_LIGHT_KMS;
    expect(telemetry.lightTravelSeconds).toBeCloseTo(expectedLightSec, 1);
    expect(telemetry.lightTimeFormatted).toMatch(/m \d+s/);
    expect(telemetry.currentSpeedKms).toBeGreaterThan(15);
  });
});
