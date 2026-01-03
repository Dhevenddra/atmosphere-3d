import React, { useState, useEffect } from 'react';
import GlobeVisualization from './components/GlobeVisualization';
import WeatherCard from './components/WeatherCard';
import Sidebar from './components/Sidebar';
import { fetchWeather, fetchGlobalTemps } from './services/api';
import { GlobePoint, WeatherData } from './types';

// Default initial location (New York)
const DEFAULT_LOC = { name: "New York", lat: 40.71, lng: -74.01 };

function App() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number, name: string } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [globePoints, setGlobePoints] = useState<GlobePoint[]>([]);
  const [favorites, setFavorites] = useState<{ name: string; lat: number; lng: number }[]>([
    DEFAULT_LOC,
    { name: "London", lat: 51.51, lng: -0.13 },
    { name: "Tokyo", lat: 35.69, lng: 139.69 }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initial load
  useEffect(() => {
    // Fetch global points for heatmap
    fetchGlobalTemps().then(points => setGlobePoints(points));
    
    // Load weather for default
    handleLocationSelect(DEFAULT_LOC.lat, DEFAULT_LOC.lng, DEFAULT_LOC.name);
  }, []);

  const handleLocationSelect = async (lat: number, lng: number, name?: string) => {
    // If no name provided (e.g. random click), format coords
    const locName = name || `Loc: ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    
    setSelectedLocation({ lat, lng, name: locName });
    setLoading(true);
    try {
      const data = await fetchWeather(lat, lng);
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = (loc: { name: string; lat: number; lng: number }) => {
    if (!favorites.some(f => f.name === loc.name)) {
      setFavorites(prev => [...prev, loc]);
    }
  };

  const handleRemoveFavorite = (name: string) => {
    setFavorites(prev => prev.filter(f => f.name !== name));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      
      {/* 3D Globe Background */}
      <GlobeVisualization 
        pointsData={globePoints}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        favorites={favorites}
        onSelectLocation={(loc) => handleLocationSelect(loc.lat, loc.lng, loc.name)}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
      />

      {/* Weather Info Overlay */}
      {selectedLocation && (
        <WeatherCard 
          data={weatherData} 
          loading={loading} 
          locationName={selectedLocation.name}
          onClose={() => setSelectedLocation(null)}
        />
      )}
      
      {/* Hint for new users */}
      {!selectedLocation && !isSidebarOpen && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-10 animate-pulse">
           <p className="text-neutral-500 text-xs tracking-widest bg-black/50 px-6 py-3 rounded-full backdrop-blur border border-neutral-900 uppercase">
             Explore the globe
           </p>
        </div>
      )}
    </div>
  );
}

export default App;