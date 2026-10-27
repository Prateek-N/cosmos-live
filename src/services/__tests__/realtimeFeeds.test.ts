import { describe, it, expect, vi } from 'vitest';
import {
  fetchNOAASpaceWeather,
  fetchDSNStatus,
  fetchJPLCloseApproaches,
  fetchUpcomingLaunches,
  fetchLiveISSPosition,
} from '../realtimeFeeds';

describe('Realtime Feeds & Fallback Resilience', () => {
  it('fetchNOAASpaceWeather returns valid telemetry even under network failure', async () => {
    // Force network failure
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    try {
      const sw = await fetchNOAASpaceWeather();
      expect(sw).toBeDefined();
      expect(typeof sw.kpIndex).toBe('number');
      expect(typeof sw.solarWindSpeedKms).toBe('number');
      expect(sw.geomagneticStormStatus).toBeDefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('fetchJPLCloseApproaches returns fallback asteroid close-approaches if API fails', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('JPL CAD API timeout'));

    try {
      const neos = await fetchJPLCloseApproaches();
      expect(Array.isArray(neos)).toBe(true);
      expect(neos.length).toBeGreaterThan(0);
      expect(neos[0].name).toBeDefined();
      expect(neos[0].missDistanceKm).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('fetchLiveISSPosition gracefully propagates simulated ISS coordinates if endpoint offline', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('ISS API down'));

    try {
      const iss = await fetchLiveISSPosition();
      expect(iss).toBeDefined();
      expect(iss.latitude).toBeGreaterThanOrEqual(-52);
      expect(iss.latitude).toBeLessThanOrEqual(52);
      expect(iss.altitudeKm).toBeGreaterThan(400);
      expect(iss.velocityKmh).toBeGreaterThan(25000);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('fetchUpcomingLaunches returns fallback manifests if network unreachable', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Launch API unreachable'));

    try {
      const launches = await fetchUpcomingLaunches();
      expect(Array.isArray(launches)).toBe(true);
      expect(launches.length).toBeGreaterThan(0);
      expect(launches[0].rocket).toBeDefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('fetchDSNStatus returns null gracefully when DSN endpoint is down', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('DSN API down'));

    try {
      const dsn = await fetchDSNStatus();
      expect(dsn).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
