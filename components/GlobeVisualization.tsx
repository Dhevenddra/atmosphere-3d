import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { GlobePoint } from '../types';

interface GlobeVisualizationProps {
  pointsData: GlobePoint[];
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

const GlobeVisualization: React.FC<GlobeVisualizationProps> = ({ pointsData, onLocationSelect, selectedLocation }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [landPolygons, setLandPolygons] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    // Fetch country boundaries for the vector outline look
    fetch('//raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setLandPolygons(data.features));

    // Custom Cursor Tracking
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  // Focus on selected location
  useEffect(() => {
    if (selectedLocation && globeEl.current) {
      globeEl.current.pointOfView({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        altitude: 1.5
      }, 1000);
      globeEl.current.controls().autoRotate = false;
    }
  }, [selectedLocation]);

  // Color scale logic for heat map - Grayscale
  const getPointColor = (temp: number) => {
    // Gradient from dark grey to white based on temperature
    if (temp < 0) return '#525252';   // Dark Grey (Cold)
    if (temp < 10) return '#a3a3a3';  // Light Grey
    if (temp < 20) return '#d4d4d4';  // Very Light Grey
    if (temp < 30) return '#e5e5e5';  // Near White
    return '#ffffff';                 // Pure White (Hot)
  };

  const gData = useMemo(() => pointsData.map(p => ({
    lat: p.lat,
    lng: p.lng,
    size: 0.5,
    color: getPointColor(p.temp),
    city: p.city,
    temp: p.temp
  })), [pointsData]);

  // Rings for selected location
  const ringsData = selectedLocation ? [{ lat: selectedLocation.lat, lng: selectedLocation.lng }] : [];

  return (
    <div className="absolute inset-0 z-0 bg-black cursor-none">
      {/* Custom Cursor Styles Override */}
      <style>{`
        .scene-container canvas {
          cursor: none !important;
        }
      `}</style>
      
      {/* Custom Cursor Element */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[100] mix-blend-exclusion will-change-transform"
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
           {/* Outer Ring */}
           <div className="w-8 h-8 border border-white/60 rounded-full flex items-center justify-center transition-all duration-300">
             {/* Center Dot */}
             <div className="w-1 h-1 bg-white rounded-full"></div>
           </div>
           {/* Crosshair Lines */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-[1px] bg-white/20"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-10 bg-white/20"></div>
        </div>
      </div>

      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        
        // Base Appearance: Dark/Black Sphere
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.15}

        // Vector Layer: Country Outlines
        polygonsData={landPolygons}
        polygonCapColor={() => '#050505'} // Near-black land
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={() => '#525252'} // Grey outlines
        polygonAltitude={0.01}
        polygonsTransitionDuration={300}
        
        // Handle clicks on the polygons (continents)
        onPolygonClick={(polygon: any, event: any, coords: any) => {
          if (coords) {
             onLocationSelect(coords.lat, coords.lng);
          }
        }}

        // Data Points (Weather)
        pointsData={gData}
        pointAltitude={0.05}
        pointColor="color"
        pointRadius={0.4}
        pointsMerge={true}
        pointLabel={(d: any) => `
          <div style="background: rgba(0,0,0,0.9); color: white; padding: 6px 10px; border: 1px solid #333; border-radius: 4px; font-family: sans-serif; font-size: 12px;">
            <b style="color: #fff;">${d.city}</b> <span style="color: #aaa;">${d.temp}°C</span>
          </div>
        `}
        onPointClick={(d: any) => {
          onLocationSelect(d.lat, d.lng, d.city);
        }}
        
        // Handle clicks on the background sphere (oceans)
        onGlobeClick={(d) => {
            if (d) {
                onLocationSelect(d.lat, d.lng);
            }
        }}

        // Selection Rings
        ringsData={ringsData}
        ringColor={() => '#ffffff'}
        ringMaxRadius={5}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1000}
        ringAltitude={0.02} // Higher than polygonAltitude (0.01) to be visible
      />
    </div>
  );
};

export default GlobeVisualization;