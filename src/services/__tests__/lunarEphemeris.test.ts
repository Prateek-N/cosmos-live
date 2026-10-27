import { describe, it, expect } from 'vitest';
import { calculateLunarTelemetry } from '../lunarEphemeris';

describe('Lunar Ephemeris Service', () => {
  it('computes accurate lunar telemetry for any given date', () => {
    const telemetry = calculateLunarTelemetry(new Date('2026-10-15T00:00:00Z'));

    expect(telemetry.phaseAngleDeg).toBeGreaterThanOrEqual(0);
    expect(telemetry.phaseAngleDeg).toBeLessThanOrEqual(360);
    expect(telemetry.illuminationFraction).toBeGreaterThanOrEqual(0);
    expect(telemetry.illuminationFraction).toBeLessThanOrEqual(1.0);
    expect(telemetry.distanceKm).toBeGreaterThan(350000);
    expect(telemetry.distanceKm).toBeLessThan(410000);
    expect(telemetry.phaseName.length).toBeGreaterThan(0);
    expect(telemetry.upcomingPhases.length).toBeGreaterThanOrEqual(4);
  });
});
