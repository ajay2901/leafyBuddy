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
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 20],
      zoom: 2,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.tree-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each tree
    trees.forEach((tree) => {
      const el = document.createElement('div');
      el.className = 'tree-marker';
      el.innerHTML = '🌳';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        if (onTreeClick) onTreeClick(tree);
      });

      new maplibregl.Marker(el)
        .setLngLat([tree.longitude, tree.latitude])
        .addTo(map.current!);
    });

    // Fit map to show all trees
    if (trees.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      trees.forEach(tree => {
        bounds.extend([tree.longitude, tree.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [trees, mapLoaded, onTreeClick]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full min-h-[400px] rounded-lg"
    />
  );
}