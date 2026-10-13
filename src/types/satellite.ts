export type SatelliteCategory =
  | 'station'
  | 'observatory'
  | 'earth_observation'
  | 'weather'
  | 'navigation'
  | 'communications'
  | 'historic';

export interface SatelliteOrigin {
  country: string;
  countryCode: string;
  countryFlag: string;
  agency: string;
  operator: string;
  launchSite: string;
  launchPad: string;
  launchVehicle: string;
  launchDate: string;
  cosparId: string; // International Designator (e.g. 1998-067A)
  noradId: number;
}

export interface SatelliteOrbit {
  regime: 'LEO' | 'MEO' | 'GEO' | 'SSO' | 'HEO';
  altitudeKm: number;
  velocityKmh: number;
  inclinationDeg: number;
  periodMinutes: number;
  eccentricity: number;
  semiMajorAxisKm: number;
}

export interface EarthSatellite {
  id: string;
  name: string;
  displayName: string;
  category: SatelliteCategory;
  origin: SatelliteOrigin;
  orbit: SatelliteOrbit;
  summary: string;
  purpose: string;
  instruments?: string[];
  massKg?: number;
  status: 'Active' | 'Operational' | 'Historic' | 'Decommissioned';
}
