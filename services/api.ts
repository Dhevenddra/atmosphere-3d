import axios from 'axios';
import { WeatherData, GeoLocation, GlobePoint } from '../types';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Fetch weather for a specific location
export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const response = await axios.get(WEATHER_API_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      forecast_days: 4, // 3 days + today
      timezone: 'auto',
    },
  });
  return response.data;
};

// Search for a city
export const searchCity = async (query: string): Promise<GeoLocation[]> => {
  const response = await axios.get(GEOCODING_API_URL, {
    params: {
      name: query,
      count: 5,
      language: 'en',
      format: 'json',
    },
  });
  return response.data.results || [];
};

// Major cities for the global heatmap initialization
const MAJOR_CITIES = [
  { name: 'New York', lat: 40.71, lng: -74.01 },
  { name: 'London', lat: 51.51, lng: -0.13 },
  { name: 'Tokyo', lat: 35.69, lng: 139.69 },
  { name: 'Sydney', lat: -33.87, lng: 151.21 },
  { name: 'Moscow', lat: 55.75, lng: 37.62 },
  { name: 'Cairo', lat: 30.04, lng: 31.24 },
  { name: 'Sao Paulo', lat: -23.55, lng: -46.63 },
  { name: 'Mumbai', lat: 19.07, lng: 72.88 },
  { name: 'Beijing', lat: 39.90, lng: 116.40 },
  { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
  { name: 'Paris', lat: 48.85, lng: 2.35 },
  { name: 'Dubai', lat: 25.20, lng: 55.27 },
  { name: 'Singapore', lat: 1.35, lng: 103.82 },
  { name: 'Lagos', lat: 6.52, lng: 3.38 },
  { name: 'Johannesburg', lat: -26.20, lng: 28.04 },
  { name: 'Buenos Aires', lat: -34.60, lng: -58.38 },
  { name: 'Mexico City', lat: 19.43, lng: -99.13 },
  { name: 'Bangkok', lat: 13.75, lng: 100.50 },
  { name: 'Istanbul', lat: 41.01, lng: 28.98 },
  { name: 'Seoul', lat: 37.56, lng: 126.98 },
  { name: 'Jakarta', lat: -6.20, lng: 106.85 },
  { name: 'Shanghai', lat: 31.23, lng: 121.47 },
  { name: 'Delhi', lat: 28.61, lng: 77.21 },
  { name: 'Toronto', lat: 43.65, lng: -79.38 },
  { name: 'Madrid', lat: 40.42, lng: -3.70 },
  { name: 'Rome', lat: 41.90, lng: 12.49 },
  { name: 'Berlin', lat: 52.52, lng: 13.41 },
  { name: 'Reykjavik', lat: 64.14, lng: -21.94 },
  { name: 'Anchorage', lat: 61.22, lng: -149.90 },
  { name: 'Santiago', lat: -33.45, lng: -70.67 }
];

// Fetch global temperatures for heatmap
export const fetchGlobalTemps = async (): Promise<GlobePoint[]> => {
  // Construct batch request
  const lats = MAJOR_CITIES.map(c => c.lat).join(',');
  const longs = MAJOR_CITIES.map(c => c.lng).join(',');
  
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        latitude: lats,
        longitude: longs,
        current: 'temperature_2m',
        timezone: 'auto'
      }
    });

    // Handle Open-Meteo array response structure for batch requests
    const data = Array.isArray(response.data) ? response.data : [response.data];

    return data.map((d: any, index: number) => ({
      lat: MAJOR_CITIES[index].lat,
      lng: MAJOR_CITIES[index].lng,
      city: MAJOR_CITIES[index].name,
      temp: d.current.temperature_2m
    }));
  } catch (error) {
    console.error("Failed to fetch global temps", error);
    return [];
  }
};
