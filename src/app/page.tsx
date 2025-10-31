'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Tree {
  id: string;
  user_id: string;
  name: string;
  species?: string;
  latitude: number;
  longitude: number;
  image_url: string;
  description?: string;
  planted_date: string;
  created_at: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [totalTrees, setTotalTrees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState<'dashboard' | 'map'>('dashboard');

  useEffect(() => {
    checkUser();
    fetchTotalTrees();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchTrees();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchTrees();
    setLoading(false);
  };

  const fetchTotalTrees = async () => {
    const { count } = await supabase.from('trees').select('*', { count: 'exact', head: true });
    setTotalTrees(count || 0);
  };

  const fetchTrees = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('trees').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setTrees(data || []);
  };

  const signIn = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://leafybuddy.vercel.app' } });
  const signOut = () => supabase.auth.signOut();

  const daysActive = trees.length > 0 ? Math.max(1, Math.floor((Date.now() - new Date(trees[trees.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const uniqueLocations = new Set(trees.map(t => `${Math.floor(t.latitude)},${Math.floor(t.longitude)}`)).size;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🌱</div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 text-center">
          <h1 className="text-5xl sm:text-6xl mb-4">🌳</h1>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">LeafyBuddy</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">Track your trees around the world</p>
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg mb-8">
            <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">{totalTrees}</div>
            <div className="text-gray-600">Trees Planted Globally</div>
          </div>
          <button onClick={signIn} className="bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg hover:bg-green-700 w-full sm:w-auto">
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-green-800">🌳 LeafyBuddy</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setView('dashboard')} className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${view === 'dashboard' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}>Dashboard</button>
              <button onClick={() => setView('map')} className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${view === 'map' ? 'bg-green-100 text-green-800' : 'text-gray-600'}`}>Map</button>
              <button onClick={() => setShowProfile(true)} className="text-gray-600 hover:text-green-600 text-sm sm:text-base">Profile</button>
              <button onClick={signOut} className="text-red-600 hover:text-red-700 text-sm sm:text-base hidden sm:block">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'dashboard' ? (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-3 sm:p-6 shadow">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌳</div>
              <div className="text-xl sm:text-3xl font-bold text-green-600">{trees.length}</div>
              <div className="text-xs sm:text-base text-gray-600">Your Trees</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-6 shadow">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌍</div>
              <div className="text-xl sm:text-3xl font-bold text-blue-600">{uniqueLocations}</div>
              <div className="text-xs sm:text-base text-gray-600">Locations</div>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-6 shadow">
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📅</div>
              <div className="text-xl sm:text-3xl font-bold text-purple-600">{daysActive}</div>
              <div className="text-xs sm:text-base text-gray-600">Days Active</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Your Trees ({trees.length})</h2>
            <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 w-full sm:w-auto">+ Add Tree</button>
          </div>

          {trees.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center">
              <div className="text-5xl sm:text-6xl mb-4">🌱</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Plant Your First Tree!</h3>
              <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-700">Add Your First Tree</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {trees.map(tree => (
                <div key={tree.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                  <img src={tree.image_url} alt={tree.name} className="w-full h-40 sm:h-48 object-cover" />
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg">{tree.name}</h3>
                    {tree.species && <p className="text-green-600 text-sm">{tree.species}</p>}
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">📅 {new Date(tree.planted_date).toLocaleDateString()}</p>
                    <button onClick={() => setSelectedTree(tree)} className="mt-3 w-full bg-gray-100 py-2 rounded hover:bg-gray-200 text-sm sm:text-base">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <MapView trees={trees} onTreeClick={setSelectedTree} />
      )}

      {showAddForm && <AddTreeForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); fetchTrees(); alert('✅ Tree added successfully!'); }} />}
      {selectedTree && <TreeModal tree={selectedTree} onClose={() => setSelectedTree(null)} />}
      {showProfile && <ProfileModal user={user} trees={trees} daysActive={daysActive} onClose={() => setShowProfile(false)} />}
    </div>
  );
}

function MapView({ trees, onTreeClick }: { trees: Tree[]; onTreeClick: (tree: Tree) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">🗺️ Your Trees on Map</h2>
        {trees.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No trees yet. Add your first tree!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {trees.map(tree => (
              <div key={tree.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition cursor-pointer" onClick={() => onTreeClick(tree)}>
                <div className="flex gap-3 sm:gap-4">
                  <img src={tree.image_url} alt={tree.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base truncate">{tree.name}</h3>
                    {tree.species && <p className="text-green-600 text-xs sm:text-sm">{tree.species}</p>}
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">📍 {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</p>
                    <p className="text-gray-500 text-xs sm:text-sm">📅 {new Date(tree.planted_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddTreeForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({ name: '', species: '', imageUrl: '', description: '' });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !form.name || !form.imageUrl) return alert('Please fill required fields and wait for location');
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('trees').insert({
      user_id: user!.id,
      name: form.name,
      species: form.species || null,
      latitude: location.lat,
      longitude: location.lng,
      image_url: form.imageUrl,
      description: form.description || null,
      planted_date: new Date().toISOString()
    });
    
    setLoading(false);
    if (error) return alert('Error adding tree: ' + error.message);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold">Add New Tree</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <input required placeholder="Tree Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base" />
          <input placeholder="Species" value={form.species} onChange={e => setForm({...form, species: e.target.value})} className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base" />
          <input required type="url" placeholder="Image URL * (e.g., from Imgur)" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 sm:p-3 border rounded text-sm sm:text-base" rows={3} />
          <div className={`p-2 sm:p-3 rounded text-xs sm:text-sm ${location ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {location ? `📍 Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Getting location...'}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button type="button" onClick={onClose} className="flex-1 p-2 sm:p-3 border rounded hover:bg-gray-50 text-sm sm:text-base">Cancel</button>
            <button type="submit" disabled={loading || !location} className="flex-1 p-2 sm:p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base">
              {loading ? 'Adding...' : 'Add Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TreeModal({ tree, onClose }: { tree: Tree; onClose: () => void }) {
  const shareTree = () => {
    const text = `Check out my tree "${tree.name}" on LeafyBuddy! 🌳`;
    if (navigator.share) {
      navigator.share({ title: tree.name, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold">{tree.name}</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <img src={tree.image_url} alt={tree.name} className="w-full h-40 sm:h-48 object-cover rounded mb-4" />
        {tree.species && <p className="mb-2 text-sm sm:text-base"><strong>Species:</strong> {tree.species}</p>}
        <p className="mb-2 text-sm sm:text-base"><strong>Planted:</strong> {new Date(tree.planted_date).toLocaleDateString()}</p>
        <p className="mb-2 text-sm sm:text-base"><strong>Location:</strong> {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</p>
        {tree.description && <p className="mt-4 text-sm sm:text-base"><strong>Story:</strong> {tree.description}</p>}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 mt-4">
          <h4 className="font-semibold mb-2 text-sm sm:text-base">🌍 Environmental Impact</h4>
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="text-center">
              <div className="font-bold text-green-600">~20kg</div>
              <div className="text-gray-600">CO₂/year</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">~260L</div>
              <div className="text-gray-600">O₂/day</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
          <button onClick={shareTree} className="flex-1 p-2 sm:p-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base">🔗 Share</button>
          <button onClick={onClose} className="flex-1 p-2 sm:p-3 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm sm:text-base">Close</button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ user, trees, daysActive, onClose }: { user: any; trees: Tree[]; daysActive: number; onClose: () => void }) {
  const stats = {
    totalTrees: trees.length,
    locations: new Set(trees.map(t => `${Math.floor(t.latitude)},${Math.floor(t.longitude)}`)).size,
    daysActive,
    favoriteSpecies: trees.filter(t => t.species).reduce((acc, t) => { acc[t.species!] = (acc[t.species!] || 0) + 1; return acc; }, {} as Record<string, number>)
  };
  const topSpecies = Object.entries(stats.favoriteSpecies).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold">👤 Profile</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-5xl mb-2">🌳</div>
          <h4 className="font-bold text-base sm:text-lg">{user.user_metadata?.name || 'Tree Planter'}</h4>
          <p className="text-gray-600 text-xs sm:text-sm">{user.email}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.totalTrees}</div>
            <div className="text-xs sm:text-sm text-gray-600">Trees</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.locations}</div>
            <div className="text-xs sm:text-sm text-gray-600">Locations</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.daysActive}</div>
            <div className="text-xs sm:text-sm text-gray-600">Days Active</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-xs sm:text-sm font-bold text-yellow-600 truncate">{topSpecies}</div>
            <div className="text-xs sm:text-sm text-gray-600">Top Species</div>
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">🏆 Achievements</h4>
          <div className="space-y-2 text-xs sm:text-sm">
            {stats.totalTrees >= 1 && <div className="flex items-center gap-2"><span>🌱</span><span>First Tree Planted</span></div>}
            {stats.totalTrees >= 5 && <div className="flex items-center gap-2"><span>🌳</span><span>Tree Enthusiast (5+ trees)</span></div>}
            {stats.totalTrees >= 10 && <div className="flex items-center gap-2"><span>🌲</span><span>Forest Builder (10+ trees)</span></div>}
            {stats.locations >= 3 && <div className="flex items-center gap-2"><span>🌍</span><span>Global Planter (3+ locations)</span></div>}
          </div>
        </div>
        <button onClick={onClose} className="w-full p-2 sm:p-3 bg-green-600 text-white rounded hover:bg-green-700 text-sm sm:text-base">Close</button>
      </div>
    </div>
  );
}
