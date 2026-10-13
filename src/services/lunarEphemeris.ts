import * as Astronomy from 'astronomy-engine';

export interface UpcomingMoonPhase {
  name: string;
  phaseAngle: number;
  date: Date;
}

export interface LunarTelemetry {
  date: Date;
  phaseAngleDeg: number;
  phaseName: string;
  illuminationFraction: number;
  illuminationPct: string;
  moonAgeDays: number;
  distanceKm: number;
  distanceMiles: number;
  distanceScale: 'Perigee' | 'Apogee' | 'Mean Distance';
  visualMagnitude: number;
  apparentDiameterArcmin: number;
  subEarthLibration: {
    latDeg: number;
    lonDeg: number;
  };
  subSolarCoordinates: {
    latDeg: number;
    lonDeg: number;
  };
  upcomingPhases: UpcomingMoonPhase[];
  geophysics: {
    seismicActivity: string;
    temperatureRange: string;
    polarColdTraps: string;
    crustalThickness: string;
    gravityAcceleration: string;
  };
}

export function calculateLunarTelemetry(simDate: Date): LunarTelemetry {
  const date = isNaN(simDate.getTime()) ? new Date() : simDate;

  // 1. Phase angle (0 = New, 90 = 1st Quarter, 180 = Full, 270 = 3rd Quarter)
  let phaseAngleDeg = 0;
  try {
    phaseAngleDeg = Astronomy.MoonPhase(date);
  } catch {
    phaseAngleDeg = 0;
  }

  // 2. Illumination & Visual Magnitude
  let illuminationFraction = 0;
  let visualMagnitude = -12.7;
  try {
    const illum = Astronomy.Illumination(Astronomy.Body.Moon, date);
    illuminationFraction = illum.phase_fraction;
    visualMagnitude = illum.mag;
  } catch {
    // Fallback formula
    illuminationFraction = (1 - Math.cos((phaseAngleDeg * Math.PI) / 180)) / 2;
  }

  // 3. Libration & Geocentric Distance
  let distanceKm = 384400;
  let apparentDiameterArcmin = 31.0;
  let elat = 0;
  let elon = 0;
  let mlat = 0;
  let mlon = 0;

  try {
    const lib = Astronomy.Libration(date);
    distanceKm = Math.round(lib.dist_km);
    apparentDiameterArcmin = Number((lib.diam_deg * 60).toFixed(2));
    elat = Number(lib.elat.toFixed(2));
    elon = Number(lib.elon.toFixed(2));
    mlat = Number(lib.mlat.toFixed(2));
    mlon = Number(lib.mlon.toFixed(2));
  } catch {
    distanceKm = 384400;
  }

  // Determine Distance relative to Perigee (363,300 km) and Apogee (405,500 km)
  let distanceScale: 'Perigee' | 'Apogee' | 'Mean Distance' = 'Mean Distance';
  if (distanceKm < 370000) {
    distanceScale = 'Perigee'; // Supermoon territory
  } else if (distanceKm > 400000) {
    distanceScale = 'Apogee'; // Micromoon territory
  }

  // 4. Phase Name & Moon Age
  const synodicMonthDays = 29.530588853;
  const moonAgeDays = Number(((phaseAngleDeg / 360) * synodicMonthDays).toFixed(1));

  let phaseName = 'New Moon';
  if (phaseAngleDeg >= 355 || phaseAngleDeg < 5) {
    phaseName = 'New Moon';
  } else if (phaseAngleDeg >= 5 && phaseAngleDeg < 85) {
    phaseName = 'Waxing Crescent';
  } else if (phaseAngleDeg >= 85 && phaseAngleDeg < 95) {
    phaseName = 'First Quarter';
  } else if (phaseAngleDeg >= 95 && phaseAngleDeg < 175) {
    phaseName = 'Waxing Gibbous';
  } else if (phaseAngleDeg >= 175 && phaseAngleDeg < 185) {
    phaseName = 'Full Moon';
  } else if (phaseAngleDeg >= 185 && phaseAngleDeg < 265) {
    phaseName = 'Waning Gibbous';
  } else if (phaseAngleDeg >= 265 && phaseAngleDeg < 275) {
    phaseName = 'Third Quarter';
  } else {
    phaseName = 'Waning Crescent';
  }

  // 5. Search Upcoming Lunar Primary Phases
  const upcomingPhases: UpcomingMoonPhase[] = [];
  try {
    const phasesToFind = [
      { name: 'New Moon', target: 0 },
      { name: 'First Quarter', target: 90 },
      { name: 'Full Moon', target: 180 },
      { name: 'Third Quarter', target: 270 },
    ];

    phasesToFind.forEach((p) => {
      try {
        const resultTime = Astronomy.SearchMoonPhase(p.target, date, 45);
        if (resultTime) {
          upcomingPhases.push({
            name: p.name,
            phaseAngle: p.target,
            date: resultTime.date,
          });
        }
      } catch {
        // ignore individual search failure
      }
    });

    upcomingPhases.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch {
    // ignore
  }

  return {
    date,
    phaseAngleDeg: Number(phaseAngleDeg.toFixed(1)),
    phaseName,
    illuminationFraction,
    illuminationPct: `${(illuminationFraction * 100).toFixed(1)}%`,
    moonAgeDays,
    distanceKm,
    distanceMiles: Math.round(distanceKm * 0.621371),
    distanceScale,
    visualMagnitude: Number(visualMagnitude.toFixed(2)),
    apparentDiameterArcmin,
    subEarthLibration: {
      latDeg: elat,
      lonDeg: elon,
    },
    subSolarCoordinates: {
      latDeg: mlat,
      lonDeg: mlon,
    },
    upcomingPhases,
    geophysics: {
      seismicActivity: 'Apollo ALSEP network recorded >12,000 moonquakes. Deep quakes trigger at 800–1000 km by tidal pull; shallow quakes up to Mw 5.5 from global crustal contraction.',
      temperatureRange: '+120°C (248°F) at lunar noon down to -130°C (-202°F) during 14-day night.',
      polarColdTraps: 'Permanently Shadowed Regions (PSRs) at Hermite & Shackleton reach -246°C (27 K) — colder than Pluto — trapping water ice deposits.',
      crustalThickness: '30–45 km on Near Side, up to 70 km on Far Side (anorthosite feldspar highland crust).',
      gravityAcceleration: '1.62 m/s² (0.166 g / ~1/6th Earth gravity). Escape velocity: 2.38 km/s.',
    },
  };
}
