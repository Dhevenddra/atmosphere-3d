import React from 'react';
import { 
  Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, 
  Calendar, MapPin, X, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from './ui/primitives';
import { WeatherData } from '../types';

interface WeatherCardProps {
  data: WeatherData | null;
  loading: boolean;
  locationName: string;
  onClose: () => void;
}

// Monochrome Weather Icons
const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="h-8 w-8 text-white" />;
  if (code >= 1 && code <= 3) return <Cloud className="h-8 w-8 text-neutral-400" />;
  if (code >= 45 && code <= 48) return <Cloud className="h-8 w-8 text-neutral-500" />;
  if (code >= 51 && code <= 67) return <CloudRain className="h-8 w-8 text-neutral-300" />;
  if (code >= 71 && code <= 77) return <CloudSnow className="h-8 w-8 text-white" />;
  if (code >= 95) return <CloudRain className="h-8 w-8 text-neutral-300" />;
  return <Sun className="h-8 w-8 text-white" />;
};

const getWeatherDescription = (code: number) => {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
};

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const WeatherCard: React.FC<WeatherCardProps> = ({ data, loading, locationName, onClose }) => {
  if (loading) {
    return (
      <Card className="fixed top-20 right-4 w-80 z-30 bg-black/90 animate-in fade-in zoom-in-95 duration-200 border-neutral-800">
        <CardContent className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
          <p className="text-neutral-400 text-sm">Fetching weather data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="fixed top-20 right-4 w-full max-w-sm z-30 bg-black/90 backdrop-blur-md shadow-2xl border-neutral-800 animate-in slide-in-from-right-10 duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-900">
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className="h-4 w-4 text-white shrink-0" />
          <CardTitle className="truncate text-lg font-medium">{locationName}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 rounded-full hover:bg-neutral-800">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Current Weather */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
             <span className="text-5xl font-light text-white tracking-tighter">
               {Math.round(data.current.temperature_2m)}°
             </span>
             <Badge variant="outline" className="mt-2 w-fit text-neutral-400 border-neutral-700">
               {getWeatherDescription(data.current.weather_code)}
             </Badge>
          </div>
          <div className="p-4 bg-neutral-900 rounded-full border border-neutral-800">
            {getWeatherIcon(data.current.weather_code)}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/50">
            <Wind className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Wind</p>
              <p className="text-sm font-medium text-neutral-200">{data.current.wind_speed_10m} <span className="text-xs text-neutral-500">km/h</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800/50">
            <Droplets className="h-5 w-5 text-neutral-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Humidity</p>
              <p className="text-sm font-medium text-neutral-200">{data.current.relative_humidity_2m}<span className="text-xs text-neutral-500">%</span></p>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div>
          <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-1">
             3-Day Forecast
          </h4>
          <div className="space-y-1">
            {data.daily.time.slice(1, 4).map((day, i) => (
              <div key={day} className="flex items-center justify-between p-2 hover:bg-neutral-900 rounded-lg transition-colors group cursor-default">
                <span className="text-sm w-12 font-medium text-neutral-400 group-hover:text-white transition-colors">{formatDate(day)}</span>
                <div className="flex items-center gap-2 flex-1 justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                   {getWeatherIcon(data.daily.weather_code[i + 1])}
                </div>
                <div className="flex gap-3 text-sm font-mono">
                  <span className="text-white">
                    {Math.round(data.daily.temperature_2m_max[i + 1])}°
                  </span>
                  <span className="text-neutral-600">
                    {Math.round(data.daily.temperature_2m_min[i + 1])}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;