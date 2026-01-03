import React, { useState } from 'react';
import { Trash2, MapPin, Search, Menu, X, Loader2 } from 'lucide-react';
import { Button, Input, Card } from './ui/primitives';
import { GeoLocation } from '../types';
import { searchCity } from '../services/api';

interface SidebarProps {
  onSelectLocation: (loc: { name: string; lat: number; lng: number }) => void;
  favorites: { name: string; lat: number; lng: number }[];
  onAddFavorite: (loc: { name: string; lat: number; lng: number }) => void;
  onRemoveFavorite: (name: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onSelectLocation, 
  favorites, 
  onAddFavorite, 
  onRemoveFavorite,
  isOpen,
  setIsOpen
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchCity(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: GeoLocation) => {
    const loc = { name: result.name, lat: result.latitude, lng: result.longitude };
    onAddFavorite(loc);
    onSelectLocation(loc);
    setQuery('');
    setSearchResults([]);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed top-4 left-4 z-50 md:hidden bg-black/80 backdrop-blur border-neutral-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 transform bg-black/95 backdrop-blur-xl border-r border-neutral-800 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 mt-12 md:mt-0">
            <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="bg-white w-2 h-8 rounded-full"></span>
              Atmosphere
            </h1>
            <p className="text-neutral-400 text-sm">Global Weather Visualizer</p>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="Search city..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="default" disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto bg-neutral-900 border-neutral-800">
                <div className="p-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800 rounded-md flex items-center gap-2"
                      onClick={() => handleResultClick(result)}
                    >
                      <MapPin className="h-3 w-3 text-neutral-500" />
                      <span>{result.name}, {result.country}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Saved Locations</h2>
            <div className="space-y-3">
              {favorites.map((loc) => (
                <div 
                  key={loc.name}
                  className="group relative flex items-center p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800 transition-all cursor-pointer"
                  onClick={() => onSelectLocation(loc)}
                >
                  <div className="bg-white/10 p-2 rounded-full mr-3 text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-200">{loc.name}</p>
                    <p className="text-xs text-neutral-500">{loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-neutral-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(loc.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {favorites.length === 0 && (
                <div className="text-center py-8 text-neutral-600 text-sm border-2 border-dashed border-neutral-900 rounded-lg">
                  <p>No saved locations</p>
                  <p className="text-xs mt-1">Search to add one</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-neutral-800">
             <p className="text-xs text-neutral-600 text-center">Powered by Open-Meteo & Globe.GL</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;