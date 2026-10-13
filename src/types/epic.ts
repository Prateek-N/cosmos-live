export interface EpicImage {
  identifier: string;
  caption: string;
  image: string;
  version?: string;
  date: string;
  imageUrl: string;
  thumbUrl: string;
  centroidLat: number;
  centroidLon: number;
  dscovrDistanceKm: number;
  sunDistanceKm: number;
  lunarDistanceKm?: number;
}
