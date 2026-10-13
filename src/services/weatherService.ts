export interface EarthWeather {
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  temperatureF: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  weatherCode: number;
  conditionText: string;
  conditionIcon: string;
  isDay: boolean;
  time: string;
}

// Global landmark cities for quick one-click radar lookup across all continents
export const GLOBAL_WEATHER_CITIES = [
  // Asia & Oceania
  { name: 'Tokyo', country: 'Japan 🇯🇵', region: 'Asia', lat: 35.6762, lon: 139.6503 },
  { name: 'New Delhi', country: 'India 🇮🇳', region: 'Asia', lat: 28.6139, lon: 77.209 },
  { name: 'Beijing', country: 'China 🇨🇳', region: 'Asia', lat: 39.9042, lon: 116.4074 },
  { name: 'Singapore', country: 'Singapore 🇸🇬', region: 'Asia', lat: 1.3521, lon: 103.8198 },
  { name: 'Dubai', country: 'United Arab Emirates 🇦🇪', region: 'Middle East', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', country: 'Australia 🇦🇺', region: 'Oceania', lat: -33.8688, lon: 151.2093 },
  { name: 'Honolulu', country: 'United States 🇺🇸', region: 'Pacific', lat: 21.3069, lon: -157.8583 },

  // Europe
  { name: 'London', country: 'United Kingdom 🇬🇧', region: 'Europe', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France 🇫🇷', region: 'Europe', lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin', country: 'Germany 🇩🇪', region: 'Europe', lat: 52.52, lon: 13.405 },
  { name: 'Reykjavik', country: 'Iceland 🇮🇸', region: 'Europe', lat: 64.1466, lon: -21.9426 },

  // Americas
  { name: 'New York', country: 'United States 🇺🇸', region: 'North America', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', country: 'United States 🇺🇸', region: 'North America', lat: 34.0522, lon: -118.2437 },
  { name: 'Mexico City', country: 'Mexico 🇲🇽', region: 'North America', lat: 19.4326, lon: -99.1332 },
  { name: 'São Paulo', country: 'Brazil 🇧🇷', region: 'South America', lat: -23.5505, lon: -46.6333 },
  { name: 'Buenos Aires', country: 'Argentina 🇦🇷', region: 'South America', lat: -34.6037, lon: -58.3816 },

  // Africa
  { name: 'Cairo', country: 'Egypt 🇪🇬', region: 'Africa', lat: 30.0444, lon: 31.2357 },
  { name: 'Nairobi', country: 'Kenya 🇰🇪', region: 'Africa', lat: -1.2921, lon: 36.8219 },
  { name: 'Cape Town', country: 'South Africa 🇿🇦', region: 'Africa', lat: -33.9249, lon: 18.4241 },

  // Polar Extremes
  { name: 'Tromsø', country: 'Norway 🇳🇴 (Arctic)', region: 'Polar', lat: 69.6492, lon: 18.9553 },
  { name: 'McMurdo Station', country: 'Antarctica 🇦🇶', region: 'Polar', lat: -77.8419, lon: 166.6863 },
];

export type GlobalWeatherCity = (typeof GLOBAL_WEATHER_CITIES)[number];

function getWeatherCondition(code: number, isDay: boolean): { text: string; icon: string } {
  if (code === 0) return { text: 'Clear Sky', icon: isDay ? '☀️' : '🌙' };
  if (code === 1 || code === 2) return { text: 'Partly Cloudy', icon: isDay ? '⛅' : '☁️' };
  if (code === 3) return { text: 'Overcast', icon: '☁️' };
  if (code === 45 || code === 48) return { text: 'Foggy & Haze', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { text: 'Light Drizzle', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { text: 'Rain Showers', icon: '🌧️' };
  if (code >= 71 && code <= 77) return { text: 'Snow Falling', icon: '❄️' };
  if (code >= 80 && code <= 82) return { text: 'Heavy Rain Showers', icon: '🌧️' };
  if (code >= 95) return { text: 'Thunderstorm', icon: '⛈️' };
  return { text: 'Fair Weather', icon: '🌤️' };
}

export async function fetchLiveEarthWeather(
  lat: number,
  lon: number,
  cityName: string = 'Current Coordinates',
  country: string = 'Earth'
): Promise<EarthWeather> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current_weather=true`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data.current_weather;
      if (current) {
        const tempC = Math.round(current.temperature);
        const tempF = Math.round((tempC * 9) / 5 + 32);
        const isDay = current.is_day === 1;
        const condition = getWeatherCondition(current.weathercode, isDay);

        return {
          cityName,
          country,
          latitude: lat,
          longitude: lon,
          temperatureC: tempC,
          temperatureF: tempF,
          windSpeedKmh: Math.round(current.windspeed),
          windDirectionDeg: current.winddirection,
          weatherCode: current.weathercode,
          conditionText: condition.text,
          conditionIcon: condition.icon,
          isDay,
          time: current.time,
        };
      }
    }
  } catch (err) {
    console.warn('Live Open-Meteo weather fetch fallback:', err);
  }

  // Graceful realistic fallback
  return {
    cityName,
    country,
    latitude: lat,
    longitude: lon,
    temperatureC: 19,
    temperatureF: 66,
    windSpeedKmh: 14,
    windDirectionDeg: 180,
    weatherCode: 1,
    conditionText: 'Partly Cloudy',
    conditionIcon: '⛅',
    isDay: true,
    time: new Date().toISOString(),
  };
}
