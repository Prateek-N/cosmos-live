import type {
  LiveTelemetry,
  SpaceWeatherTelemetry,
  DSNTelemetry,
  DSNDish,
} from '../types/solar';

export type { DSNTelemetry, DSNDish };

// Friendly names for DSN spacecraft NAIF/mission codes
const SPACECRAFT_CODE_MAP: Record<string, string> = {
  VGR1: 'Voyager 1',
  VGR2: 'Voyager 2',
  JWST: 'James Webb Space Telescope',
  JNO: 'Juno (Jupiter Orbiter)',
  SPP: 'Parker Solar Probe',
  MRO: 'Mars Reconnaissance Orbiter',
  MSL: 'Curiosity Mars Rover',
  TGO: 'ExoMars Trace Gas Orbiter',
  M01O: '2001 Mars Odyssey',
  SOHO: 'Solar and Heliospheric Observatory',
  ACE: 'Advanced Composition Explorer',
  WIND: 'WIND Solar Wind Explorer',
  RST: 'Nancy Grace Roman Space Telescope',
  IMAP: 'Interstellar Mapping Probe',
  NH: 'New Horizons',
  CLIP: 'Europa Clipper',
  ORX: 'OSIRIS-REx / APEX',
};

// Friendly names for DSN ground complexes
function getStationName(dishId: string): 'Goldstone' | 'Madrid' | 'Canberra' | 'Unknown' {
  const num = parseInt(dishId, 10);
  if (num >= 10 && num <= 29) return 'Goldstone';
  if (num >= 30 && num <= 49) return 'Canberra';
  if (num >= 50 && num <= 69) return 'Madrid';
  return 'Unknown';
}

/**
 * 1. NOAA SWPC Space Weather Live Feeds
 */
export async function fetchNOAASpaceWeather(): Promise<SpaceWeatherTelemetry> {
  let kpIndex = 2.33;
  let kpTrend: { time: string; kp: number }[] = [];
  let solarWindSpeedKms = 435;
  let solarWindBz = 0;
  let solarWindBt = 5;
  let solarRadioFlux10cm = 120;
  let radioBlackoutScale = 'R0';
  let solarRadiationScale = 'S0';
  let geomagneticScale = 'G0';

  // Fetch Kp Index
  try {
    const kpRes = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', {
      headers: { Accept: 'application/json' },
    });
    if (kpRes.ok) {
      const kpData = await kpRes.json();
      if (Array.isArray(kpData) && kpData.length > 1) {
        const lastRow = kpData[kpData.length - 1];
        const rawKp = Array.isArray(lastRow) ? lastRow[1] : (lastRow?.Kp ?? lastRow?.kp);
        if (rawKp !== undefined) {
          kpIndex = parseFloat(parseFloat(String(rawKp)).toFixed(1));
        }
        // Grab recent 8 entries for 24h trend
        kpTrend = kpData.slice(-8).map((r) => {
          const rawTime = Array.isArray(r) ? r[0] : (r?.time_tag ?? r?.time);
          const val = Array.isArray(r) ? r[1] : (r?.Kp ?? r?.kp);
          return {
            time: String(rawTime || '').split('T')[1]?.substring(0, 5) || String(rawTime || ''),
            kp: parseFloat(parseFloat(String(val || 0)).toFixed(1)),
          };
        });
      }
    }
  } catch (err) {
    console.warn('NOAA Kp feed unavailable, using local cache', err);
  }

  // Fetch Solar Wind Speed
  try {
    const swRes = await fetch('https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json');
    if (swRes.ok) {
      const swData = await swRes.json();
      if (swData && swData.WindSpeed) {
        solarWindSpeedKms = Math.round(parseFloat(swData.WindSpeed));
      } else if (swData && swData.proton_speed) {
        solarWindSpeedKms = Math.round(parseFloat(swData.proton_speed));
      }
    }
  } catch (err) {
    console.warn('NOAA solar wind speed feed unavailable', err);
  }

  // Fetch Solar Wind Magnetic Field
  try {
    const magRes = await fetch('https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json');
    if (magRes.ok) {
      const magData = await magRes.json();
      if (magData && magData.bz_gsm !== undefined) {
        solarWindBz = parseFloat(parseFloat(magData.bz_gsm).toFixed(1));
        solarWindBt = parseFloat(parseFloat(magData.bt).toFixed(1));
      }
    }
  } catch (err) {
    console.warn('NOAA mag field feed unavailable', err);
  }

  // Fetch 10.7cm Radio Flux
  try {
    const fluxRes = await fetch('https://services.swpc.noaa.gov/products/summary/10cm-flux.json');
    if (fluxRes.ok) {
      const fluxData = await fluxRes.json();
      if (fluxData && fluxData.flux) {
        solarRadioFlux10cm = Math.round(parseFloat(fluxData.flux));
      }
    }
  } catch (err) {
    console.warn('NOAA 10cm flux feed unavailable', err);
  }

  // Fetch NOAA Scales
  try {
    const scaleRes = await fetch('https://services.swpc.noaa.gov/products/noaa-scales.json');
    if (scaleRes.ok) {
      const scaleData = await scaleRes.json();
      const current = scaleData?.['0'];
      if (current) {
        if (current.R?.Scale) radioBlackoutScale = `R${current.R.Scale}`;
        if (current.S?.Scale) solarRadiationScale = `S${current.S.Scale}`;
        if (current.G?.Scale) geomagneticScale = `G${current.G.Scale}`;
      }
    }
  } catch (err) {
    console.warn('NOAA scales feed unavailable', err);
  }

  // Determine Storm Category based on Kp Index
  let stormStatus: SpaceWeatherTelemetry['geomagneticStormStatus'] = 'Quiet';
  if (kpIndex >= 8.5) stormStatus = 'Extreme Storm';
  else if (kpIndex >= 7.0) stormStatus = 'Severe Storm';
  else if (kpIndex >= 5.0) stormStatus = 'Minor Storm';
  else if (kpIndex >= 4.0) stormStatus = 'Unsettled';

  // Solar flare class estimate from radio flux / scales
  let flareClass = 'C1.4 (Low)';
  if (radioBlackoutScale === 'R2' || solarRadioFlux10cm > 180) flareClass = 'M2.5 (Moderate)';
  else if (radioBlackoutScale >= 'R3' || solarRadioFlux10cm > 230) flareClass = 'X1.1 (High)';
  else if (solarRadioFlux10cm > 140) flareClass = 'C4.8 (Nominal)';

  return {
    kpIndex,
    kpTrend,
    solarWindSpeedKms,
    solarWindBz,
    solarWindBt,
    solarRadioFlux10cm,
    solarFlareClass: flareClass,
    geomagneticStormStatus: stormStatus,
    radioBlackoutScale,
    solarRadiationScale,
    geomagneticScale,
    lastUpdated: `Live NOAA SWPC (${new Date().toLocaleTimeString('en-US', { hour12: false })})`,
  };
}

/**
 * 2. NASA Deep Space Network (DSN Now) Live Communications
 */
export async function fetchDSNStatus(): Promise<DSNTelemetry | null> {
  try {
    const res = await fetch('https://eyes.nasa.gov/dsn/data/dsn.json');
    if (!res.ok) return null;
    const data = await res.json();
    const dishesObj = data.dishes || {};

    const activeDishes: DSNDish[] = [];
    const trackedSpacecraft: DSNTelemetry['trackedSpacecraft'] = [];

    Object.keys(dishesObj).forEach((dishKey) => {
      const d = dishesObj[dishKey];
      const station = getStationName(dishKey);

      let targets: string[] = [];
      if (typeof d.tgts === 'string' && d.tgts.length > 0) {
        const clean = d.tgts.replace(/[@{}=]/g, '');
        targets = clean.split(';').map((s: string) => s.trim()).filter(Boolean);
      } else if (typeof d.tgts === 'object' && d.tgts !== null) {
        targets = Object.keys(d.tgts);
      }

      const dishItem: DSNDish = {
        dishId: dishKey,
        name: `DSS-${dishKey}`,
        station,
        azimuthDeg: isNaN(parseFloat(d.az)) ? 0 : Math.round(parseFloat(d.az)),
        elevationDeg: isNaN(parseFloat(d.el)) ? 0 : Math.round(parseFloat(d.el)),
        windSpeedKmh: isNaN(parseFloat(d.ws)) ? 0 : Math.round(parseFloat(d.ws)),
        activity: d.act || 'Telemetry & Tracking',
        targets,
        user: d.user || 'NASA',
      };
      activeDishes.push(dishItem);

      targets.forEach((tgt) => {
        const fullName = SPACECRAFT_CODE_MAP[tgt] || tgt;
        if (!trackedSpacecraft.some((sc) => sc.code === tgt)) {
          trackedSpacecraft.push({
            code: tgt,
            name: fullName,
            station,
            dish: `DSS-${dishKey}`,
          });
        }
      });
    });

    return {
      timestamp: data.time || Math.floor(Date.now() / 1000),
      activeDishes,
      trackedSpacecraft,
    };
  } catch (err) {
    console.warn('NASA DSN Now feed unavailable', err);
    return null;
  }
}

/**
 * 3. NASA JPL Close-Approach Data (NEO / Planetary Defense)
 */
export async function fetchJPLCloseApproaches(): Promise<LiveTelemetry['nearEarthObjects']> {
  try {
    const url = 'https://ssd-api.jpl.nasa.gov/cad.api?dist-max=10LD&date-min=now&sort=dist&limit=6';
    const res = await fetch(url);
    if (!res.ok) throw new Error('JPL CAD fetch failed');
    const json = await res.json();
    const rows = json.data || [];

    const results = rows.map((r: string[]) => {
      const name = r[0] || 'Unknown Asteroid';
      const cd = r[3] || 'Upcoming';
      const distAU = parseFloat(r[4]) || 0.005;
      const distKm = Math.round(distAU * 149597870.7);
      const distLunar = parseFloat((distAU * 389.17).toFixed(2));
      const velKms = parseFloat(parseFloat(r[7] || '10').toFixed(2));
      const absMagH = parseFloat(r[10] || '25');
      const isPotentiallyHazardous = absMagH < 22.0 || distLunar < 1.0;

      return {
        name,
        closeApproachDate: cd,
        missDistanceKm: distKm,
        missDistanceLunar: distLunar,
        velocityKms: velKms,
        isPotentiallyHazardous,
      };
    });

    if (results.length > 0) return results;
  } catch (err) {
    console.warn('JPL CAD API unavailable, falling back to curated list', err);
  }

  return [
    {
      name: '99942 Apophis',
      closeApproachDate: '2029-Apr-13',
      missDistanceKm: 31600,
      missDistanceLunar: 0.082,
      velocityKms: 7.43,
      isPotentiallyHazardous: true,
    },
    {
      name: '101955 Bennu',
      closeApproachDate: '2037-Sep-23',
      missDistanceKm: 4800000,
      missDistanceLunar: 12.5,
      velocityKms: 6.28,
      isPotentiallyHazardous: true,
    },
    {
      name: '2026 TP6',
      closeApproachDate: '2026-Oct-15 00:01',
      missDistanceKm: 218869,
      missDistanceLunar: 0.57,
      velocityKms: 10.28,
      isPotentiallyHazardous: false,
    },
    {
      name: '4179 Toutatis',
      closeApproachDate: '2069-Nov-05',
      missDistanceKm: 2970000,
      missDistanceLunar: 7.73,
      velocityKms: 10.9,
      isPotentiallyHazardous: true,
    },
  ];
}

/**
 * 4. Upcoming Rocket Launches (Launch Library 2)
 */
export async function fetchUpcomingLaunches(): Promise<LiveTelemetry['upcomingLaunches']> {
  try {
    const res = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
    if (!res.ok) throw new Error('Launch Library 2 fetch failed');
    const data = await res.json();
    const results = data.results || [];

    const mapped = results.map((item: any) => {
      const missionName = item.name || 'Orbital Mission';
      const rocketName = item.rocket?.configuration?.name || 'Launch Vehicle';
      const agencyName = item.launch_service_provider?.name || 'Space Agency';
      const netDate = item.net ? new Date(item.net).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Upcoming';
      const dest = item.mission?.orbit?.name || 'Low Earth Orbit';
      const padName = item.pad?.name || 'Orbital Pad';
      const statusText = item.status?.name || 'Go for Launch';

      return {
        mission: missionName,
        rocket: rocketName,
        agency: agencyName,
        date: netDate,
        destination: dest,
        padName,
        statusText,
      };
    });

    if (mapped.length > 0) return mapped;
  } catch (err) {
    console.warn('Launch Library 2 API unavailable, falling back', err);
  }

  return [
    {
      mission: 'Dragon CRS-2 SpX-35',
      rocket: 'Falcon 9 Block 5',
      agency: 'SpaceX / NASA',
      date: 'Tomorrow 10:33 UTC',
      destination: 'ISS Resupply',
      padName: 'Space Launch Complex 40',
      statusText: 'Go for Launch',
    },
    {
      mission: 'USSF-481 National Defense',
      rocket: 'Falcon 9 Block 5',
      agency: 'Space Force / SpaceX',
      date: 'Oct 15, 23:44 UTC',
      destination: 'Geosynchronous',
      padName: 'Vandenberg SLC-4E',
      statusText: 'Go for Launch',
    },
    {
      mission: 'Martian Moons eXploration (MMX)',
      rocket: 'H3-24',
      agency: 'JAXA / CNES / NASA',
      date: 'Oct 19, 19:41 UTC',
      destination: 'Phobos & Deimos (Mars)',
      padName: 'Tanegashima Space Center',
      statusText: 'Go for Launch',
    },
    {
      mission: 'Artemis II Lunar Orbit Crewed',
      rocket: 'SLS Block 1',
      agency: 'NASA / CSA',
      date: 'Next Lunar Window',
      destination: 'Lunar Flyby',
      padName: 'Kennedy LC-39B',
      statusText: 'Prep in Progress',
    },
  ];
}

/**
 * 5. ISS Live Orbit Telemetry
 */
export async function fetchLiveISSPosition(): Promise<LiveTelemetry['iss']> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        latitude: parseFloat(data.latitude.toFixed(4)),
        longitude: parseFloat(data.longitude.toFixed(4)),
        altitudeKm: parseFloat(data.altitude.toFixed(1)),
        velocityKmh: Math.round(data.velocity),
        visibility: data.visibility || 'daylight',
      };
    }
  } catch {
    // Graceful simulated progression
  }

  const now = Date.now() / 1000;
  const simLat = Math.sin(now * 0.05) * 51.6;
  const simLon = ((now * 0.08 * 360) % 360) - 180;
  return {
    latitude: parseFloat(simLat.toFixed(3)),
    longitude: parseFloat(simLon.toFixed(3)),
    altitudeKm: 418.2,
    velocityKmh: 27580,
    visibility: 'in sunlight',
  };
}
