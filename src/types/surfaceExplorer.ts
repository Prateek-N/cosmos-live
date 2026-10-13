export type SurfaceTargetBody = 'mars' | 'moon';

export interface LandingSite {
  id: string;
  name: string;
  mission: string;
  targetBody: SurfaceTargetBody;
  agency: string;
  country: string;
  countryCode: string;
  flag: string;
  launchDate: string;
  landingDate: string;
  status: 'Operational' | 'Completed' | 'Decommissioned' | 'Planned';
  type: 'Rover' | 'Lander' | 'Crewed Lunar Module' | 'Penetrator' | 'Helicopter';
  coordinates: {
    lat: number;
    lon: number;
    elevationM?: number;
    craterRegion: string;
  };
  summary: string;
  keyDiscoveries: string[];
  instruments: {
    name: string;
    description: string;
  }[];
  distanceTraveledKm?: number;
  missionDurationDays?: number;
  surfacePhotoPrompt?: string;
}
