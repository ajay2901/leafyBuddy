'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Tree } from '@/types';

interface MapProps {
  trees: Tree[];
  onTreeClick?: (tree: Tree) => void;
}

export default function Map({ trees, onTreeClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [showControls, setShowControls] = useState(true);

  const mapStyles = {
    satellite: 'https://api.maptiler.com/maps/hybrid/style.json?key=demo',
    street: 'https://demotiles.maplibre.org/style.json',
    terrain: 'https://api.maptiler.com/maps/outdoor/style.json?key=demo'
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle as keyof typeof mapStyles],
      center: [0, 20],
      zoom: 2,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl({}), 'top-right');
    map.current.addControl(new maplibregl.FullscreenControl({}), 'top-right');
    
    // Add geolocate control
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(mapStyles[mapStyle as keyof typeof mapStyles]);
    }
  }, [mapStyle, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each tree
    trees.forEach((tree) => {
      const el = document.createElement('div');
      el.className = 'tree-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #10b981, #059669);
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `;
      el.innerHTML = '🌳';

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.zIndex = '1';
      });

      el.addEventListener('click', () => {
        if (onTreeClick) onTreeClick(tree);
      });

      // Create popup for hover info
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: [0, -40]
      }).setHTML(`
        <div class="p-2 text-sm">
          <div class="font-semibold">${tree.name}</div>
          ${tree.species ? `<div class="text-gray-600">${tree.species}</div>` : ''}
          <div class="text-xs text-gray-500">${new Date(tree.planted_date).toLocaleDateString()}</div>
        </div>
      `);

      const marker = new maplibregl.Marker(el)
        .setLngLat([tree.longitude, tree.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit map to show all trees
    if (trees.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      trees.forEach(tree => {
        bounds.extend([tree.longitude, tree.latitude]);
      });
      
      const padding = trees.length === 1 ? 100 : 50;
      const zoom = trees.length === 1 ? { zoom: 15 } : {};
      
      map.current.fitBounds(bounds, { 
        padding,
        ...zoom,
        duration: 1000
      });
    }
  }, [trees, mapLoaded, onTreeClick]);

  return (
    <div className="relative w-full h-full">
      {/* Map Style Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
          <div className="flex space-x-1">
            {Object.keys(mapStyles).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                  mapStyle === style
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tree Counter */}
      {trees.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-lg">🌳</span>
            <span className="font-semibold">{trees.length}</span>
            <span className="text-gray-600">tree{trees.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Toggle Controls Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-20 z-10 bg-white rounded-lg shadow-lg p-2 text-gray-600 hover:text-gray-800"
        title={showControls ? 'Hide controls' : 'Show controls'}
      >
        {showControls ? '🙈' : '👁️'}
      </button>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg"
      />

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">🌍</div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}