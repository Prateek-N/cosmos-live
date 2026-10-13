export type BodyType = 
  | 'star' 
  | 'planet' 
  | 'dwarf_planet' 
  | 'moon' 
  | 'asteroid' 
  | 'comet' 
  | 'spacecraft';

export type ScaleMode = 'explorer' | 'realistic';

export interface PhysicalData {
  meanRadiusKm: number;
  massKg: number;
  massEarthRelative?: number;
  densityGcm3: number;
  gravityMs2: number;
  escapeVelocityKms: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  meanTempC: number;
  minTempC?: number;
  maxTempC?: number;
  atmosphereComposition?: { gas: string; percentage: number }[];
  atmosphericPressureKPa?: number;
  surfaceFeatures?: string[];
}

export interface OrbitalElements {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  orbitalPeriodDays: number;
  orbitalSpeedKms: number;
  perihelionAU: number;
  aphelionAU: number;
  epoch?: string;
  parentBodyId?: string; // e.g. 'earth' for the Moon
}

export interface MissionInfo {
  name: string;
  agency: string;
  year: number | string;
  status: 'Past' | 'Active' | 'Planned';
  description: string;
}

export interface CelestialBody {
  id: string;
  name: string;
  designation?: string;
  naifId: number;
  type: BodyType;
  parentId?: string;
  color: string;
  secondaryColor?: string;
  glowColor?: string;
  textureType: 'sun' | 'rocky' | 'gas_giant' | 'ringed_giant' | 'ice_giant' | 'earth' | 'moon' | 'mars' | 'spacecraft' | 'metallic';
  hasRings?: boolean;
  ringInnerRadiusAU?: number;
  ringOuterRadiusAU?: number;
  ringColors?: [string, string];
  hasClouds?: boolean;
  hasAtmosphere?: boolean;
  physical: PhysicalData;
  orbit: OrbitalElements;
  summary: string;
  funFacts: string[];
  missions: MissionInfo[];
  tags: string[];
  provenance: {
    source: string;
    url: string;
    lastUpdated: string;
  }[];
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SpaceWeatherTelemetry {
  kpIndex: number;
  kpTrend?: { time: string; kp: number }[];
  solarWindSpeedKms: number;
  solarWindBz?: number;
  solarWindBt?: number;
  solarRadioFlux10cm?: number;
  solarFlareClass: string;
  geomagneticStormStatus: 'Quiet' | 'Unsettled' | 'Minor Storm' | 'Moderate Storm' | 'Severe Storm' | 'Extreme Storm';
  radioBlackoutScale?: string;
  solarRadiationScale?: string;
  geomagneticScale?: string;
  lastUpdated: string;
}

export interface DSNDish {
  dishId: string;
  name: string;
  station: 'Goldstone' | 'Madrid' | 'Canberra' | 'Unknown';
  azimuthDeg: number;
  elevationDeg: number;
  windSpeedKmh: number;
  activity: string;
  targets: string[];
  user: string;
}

export interface DSNTelemetry {
  timestamp: number;
  activeDishes: DSNDish[];
  trackedSpacecraft: {
    code: string;
    name: string;
    station: string;
    dish: string;
  }[];
}

export interface LiveTelemetry {
  iss: {
    latitude: number;
    longitude: number;
    altitudeKm: number;
    velocityKmh: number;
    visibility: string;
  };
  spaceWeather: SpaceWeatherTelemetry;
  dsn?: DSNTelemetry;
  nearEarthObjects: {
    name: string;
    closeApproachDate: string;
    missDistanceKm: number;
    missDistanceLunar: number;
    velocityKms: number;
    isPotentiallyHazardous: boolean;
  }[];
  upcomingLaunches: {
    mission: string;
    rocket: string;
    agency: string;
    date: string;
    destination: string;
    padName?: string;
    statusText?: string;
  }[];
}

export interface LayerVisibility {
  orbits: boolean;
  labels: boolean;
  moons: boolean;
  asteroids: boolean;
  spacecraft: boolean;
  atmosphereGlow: boolean;
  grid: boolean;
  constellations: boolean;
}

export interface GuidedTourStep {
  targetId: string;
  title: string;
  narration: string;
  cameraDistanceMultiplier?: number;
  lookAtOffset?: Vector3D;
  highlights?: string[];
}

export interface GuidedTour {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  steps: GuidedTourStep[];
}
