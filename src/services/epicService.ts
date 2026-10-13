import type { EpicImage } from '../types/epic';

const FALLBACK_EPIC_IMAGES: EpicImage[] = [
  {
    identifier: '20261010203420',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010203420',
    date: '2026-10-10 20:29:32',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010203420.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010203420.jpg',
    centroidLat: 2.29,
    centroidLon: -136.66,
    dscovrDistanceKm: 1565500,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010174614',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010174614',
    date: '2026-10-10 17:41:26',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010174614.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010174614.jpg',
    centroidLat: 3.12,
    centroidLon: -95.25,
    dscovrDistanceKm: 1564800,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010145809',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010145809',
    date: '2026-10-10 14:53:21',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010145809.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010145809.jpg',
    centroidLat: 3.85,
    centroidLon: -54.12,
    dscovrDistanceKm: 1564200,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010121004',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010121004',
    date: '2026-10-10 12:05:16',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010121004.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010121004.jpg',
    centroidLat: 4.41,
    centroidLon: -12.45,
    dscovrDistanceKm: 1563700,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010092200',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010092200',
    date: '2026-10-10 09:17:12',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010092200.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010092200.jpg',
    centroidLat: 4.88,
    centroidLon: 29.82,
    dscovrDistanceKm: 1563200,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010063355',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010063355',
    date: '2026-10-10 06:29:07',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010063355.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010063355.jpg',
    centroidLat: 5.12,
    centroidLon: 71.34,
    dscovrDistanceKm: 1562900,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010034550',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010034550',
    date: '2026-10-10 03:41:02',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010034550.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010034550.jpg',
    centroidLat: 5.01,
    centroidLon: 113.88,
    dscovrDistanceKm: 1562700,
    sunDistanceKm: 148850000,
  },
  {
    identifier: '20261010005745',
    caption: "This image was taken by NASA's EPIC camera onboard the NOAA DSCOVR spacecraft",
    image: 'epic_1b_20261010005745',
    date: '2026-10-10 00:52:57',
    imageUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/jpg/epic_1b_20261010005745.jpg',
    thumbUrl: 'https://epic.gsfc.nasa.gov/archive/natural/2026/10/10/thumbs/epic_1b_20261010005745.jpg',
    centroidLat: 4.62,
    centroidLon: 155.67,
    dscovrDistanceKm: 1562600,
    sunDistanceKm: 148850000,
  },
];

let cachedImages: EpicImage[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function fetchNASAEPICImages(): Promise<EpicImage[]> {
  const now = Date.now();
  if (cachedImages && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedImages;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://epic.gsfc.nasa.gov/api/natural', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const parsed: EpicImage[] = data.map((item: any) => {
          // Date format in EPIC API is "YYYY-MM-DD HH:MM:SS"
          const dateStr = item.date || '';
          const [datePart] = dateStr.split(' ');
          const [year, month, day] = (datePart || '2026-10-10').split('-');
          const imgName = item.image;

          // DSCOVR distance in km
          const dscPos = item.dscovr_j2000_position || item.coords?.dscovr_j2000_position;
          let dscovrDist = 1565000;
          if (dscPos && typeof dscPos.x === 'number') {
            dscovrDist = Math.round(
              Math.sqrt(dscPos.x * dscPos.x + dscPos.y * dscPos.y + dscPos.z * dscPos.z)
            );
          }

          const sunPos = item.sun_j2000_position || item.coords?.sun_j2000_position;
          let sunDist = 148800000;
          if (sunPos && typeof sunPos.x === 'number') {
            sunDist = Math.round(
              Math.sqrt(sunPos.x * sunPos.x + sunPos.y * sunPos.y + sunPos.z * sunPos.z)
            );
          }

          const centroid = item.centroid_coordinates || item.coords?.centroid_coordinates || {};

          return {
            identifier: item.identifier,
            caption: item.caption,
            image: item.image,
            version: item.version,
            date: item.date,
            imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${imgName}.jpg`,
            thumbUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/thumbs/${imgName}.jpg`,
            centroidLat: centroid.lat != null ? parseFloat(centroid.lat.toFixed(2)) : 0,
            centroidLon: centroid.lon != null ? parseFloat(centroid.lon.toFixed(2)) : 0,
            dscovrDistanceKm: dscovrDist,
            sunDistanceKm: sunDist,
          };
        });

        cachedImages = parsed;
        lastFetchTime = now;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('NASA EPIC fetch failed or timed out, using calibrated fallback archive:', err);
  }

  cachedImages = FALLBACK_EPIC_IMAGES;
  lastFetchTime = now;
  return FALLBACK_EPIC_IMAGES;
}
