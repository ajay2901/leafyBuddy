'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Tree {
  id: string;
  name: string;
  species?: string;
  latitude: number;
  longitude: number;
  image_url: string;
  planted_date: string;
}

export default function ForestPage({ params }: { params: { userId: string } }) {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [userName, setUserName] = useState<string>('Tree Planter');
  const [loading, setLoading] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    fetchUserTrees();
  }, []);

  useEffect(() => {
    if (trees.length > 0 && mapContainer.current && !map.current) {
      const avgLat = trees.reduce((sum, t) => sum + t.latitude, 0) / trees.length;
      const avgLng = trees.reduce((sum, t) => sum + t.longitude, 0) / trees.length;

      import('maplibre-gl').then((maplibregl) => {
        map.current = new maplibregl.Map({
          container: mapContainer.current!,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [avgLng, avgLat],
          zoom: 10
        });

        trees.forEach(tree => {
          const el = document.createElement('div');
          el.innerHTML = '🌳';
          el.style.fontSize = '24px';
          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`<strong>${tree.name}</strong><br/>📅 ${new Date(tree.planted_date).toLocaleDateString()}`);
          new maplibregl.Marker({ element: el }).setLngLat([tree.longitude, tree.latitude]).setPopup(popup).addTo(map.current);
        });
      });
    }
  }, [trees]);

  const fetchUserTrees = async () => {
    const { data } = await supabase.from('trees').select('*').eq('user_id', params.userId).order('planted_date', { ascending: false });
    setTrees(data || []);
    // Get username from first tree's user metadata (stored when tree was created)
    if (data && data.length > 0) {
      // Try to get user info from public profile or use default
      setUserName('Tree Planter'); // Default for now - can be enhanced later
    }
    setLoading(false);
  };

  const oldestTree = trees.length > 0 ? trees[trees.length - 1] : null;
  const daysActive = oldestTree ? Math.max(1, Math.floor((Date.now() - new Date(oldestTree.planted_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const uniqueLocations = new Set(trees.map(t => `${Math.floor(t.latitude)},${Math.floor(t.longitude)}`)).size;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🌱</div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-800">🌳 LeafyBuddy</Link>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('🔗 Link copied!'); }} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">📋 Copy Link</button>
            <Link href="/" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Join LeafyBuddy</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">🌲 {userName}'s Forest</h1>
        <p className="text-gray-600 mb-6">{trees.length} trees planted across {uniqueLocations} locations</p>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl mb-2">🌳</div>
            <div className="text-3xl font-bold text-green-600">{trees.length}</div>
            <div className="text-gray-600">Trees</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl mb-2">🌍</div>
            <div className="text-3xl font-bold text-blue-600">{uniqueLocations}</div>
            <div className="text-gray-600">Locations</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold text-purple-600">{daysActive}</div>
            <div className="text-gray-600">Days Active</div>
          </div>
        </div>

        {/* Map */}
        {trees.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">🗺️ Map View</h2>
            <div ref={mapContainer} className="w-full h-[500px] rounded-lg" />
          </div>
        )}

        {/* Trees Grid */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Trees ({trees.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trees.map(tree => (
              <Link key={tree.id} href={`/tree/${tree.id}`} className="border rounded-lg p-3 hover:shadow-lg transition">
                <img src={tree.image_url} alt={tree.name} className="w-full h-32 object-cover rounded mb-2" />
                <h3 className="font-bold truncate">{tree.name}</h3>
                <p className="text-gray-500 text-sm">📅 {new Date(tree.planted_date).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
