import { describe, it, expect } from 'vitest';
import { calculateSatelliteLiveTrack } from '../satelliteTracker';
import { EARTH_SATELLITES } from '../../data/earthSatellites';

describe('Satellite Tracker Service', () => {
  it('propagates real-time satellite coordinates within valid Earth coordinate limits', () => {
    const iss = EARTH_SATELLITES.find((s) => s.id === 'iss') || EARTH_SATELLITES[0];
    const track = calculateSatelliteLiveTrack(iss, new Date('2026-10-15T12:00:00Z'));

    expect(track.latitude).toBeGreaterThanOrEqual(-iss.orbit.inclinationDeg - 0.5);
    expect(track.latitude).toBeLessThanOrEqual(iss.orbit.inclinationDeg + 0.5);
    expect(track.longitude).toBeGreaterThanOrEqual(-180);
    expect(track.longitude).toBeLessThanOrEqual(180);
    expect(track.altitudeKm).toBe(iss.orbit.altitudeKm);
    expect(track.velocityKmh).toBe(iss.orbit.velocityKmh);
    expect(typeof track.isDaylight).toBe('boolean');
    expect(track.totalOrbitsCompleted).toBeGreaterThan(0);
  });

  it('updates coordinates when simulation time progresses', () => {
    const hubble = EARTH_SATELLITES.find((s) => s.id === 'hubble') || EARTH_SATELLITES[1];
    const t1 = new Date('2026-10-15T12:00:00Z');
    const t2 = new Date('2026-10-15T12:30:00Z'); // 30 minutes later

    const track1 = calculateSatelliteLiveTrack(hubble, t1);
    const track2 = calculateSatelliteLiveTrack(hubble, t2);

    expect(track1.latitude !== track2.latitude || track1.longitude !== track2.longitude).toBe(true);
  });
});
