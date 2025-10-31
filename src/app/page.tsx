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

  const signIn = () => {
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://leafybuddy.vercel.app';
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl } });
  };
  const signOut = () => supabase.auth.signOut();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🌱</div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl mb-4">🌳</h1>
          <h2 className="text-4xl font-bold mb-4">LeafyBuddy</h2>
          <p className="text-xl text-gray-600 mb-8">Track your trees around the world</p>
          <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
            <div className="text-5xl font-bold text-green-600 mb-2">{totalTrees}</div>
            <div className="text-gray-600">Trees Planted Globally</div>
          </div>
          <button onClick={signIn} className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700">
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-800">🌳 LeafyBuddy</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button onClick={signOut} className="text-red-600 hover:text-red-700">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Trees ({trees.length})</h2>
          <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            + Add Tree
          </button>
        </div>

        {trees.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold mb-4">Plant Your First Tree!</h3>
            <button onClick={() => setShowAddForm(true)} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700">
              Add Your First Tree
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trees.map(tree => (
              <div key={tree.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                <img src={tree.image_url} alt={tree.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{tree.name}</h3>
                  {tree.species && <p className="text-green-600 text-sm">{tree.species}</p>}
                  <p className="text-gray-500 text-sm mt-2">📅 {new Date(tree.planted_date).toLocaleDateString()}</p>
                  <button onClick={() => setSelectedTree(tree)} className="mt-3 w-full bg-gray-100 py-2 rounded hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && <AddTreeForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); fetchTrees(); }} />}
      {selectedTree && <TreeModal tree={selectedTree} onClose={() => setSelectedTree(null)} />}
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
    if (!location || !form.name || !form.imageUrl) return alert('Please fill required fields');
    
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
    if (error) return alert('Error adding tree');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">Add New Tree</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Tree Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 border rounded" />
          <input placeholder="Species" value={form.species} onChange={e => setForm({...form, species: e.target.value})} className="w-full p-3 border rounded" />
          <input required type="url" placeholder="Image URL *" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full p-3 border rounded" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-3 border rounded" rows={3} />
          <div className="p-3 bg-gray-100 rounded text-sm">
            {location ? `📍 Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 Getting location...'}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 p-3 border rounded hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TreeModal({ tree, onClose }: { tree: Tree; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold">{tree.name}</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <img src={tree.image_url} alt={tree.name} className="w-full h-48 object-cover rounded mb-4" />
        {tree.species && <p className="mb-2"><strong>Species:</strong> {tree.species}</p>}
        <p className="mb-2"><strong>Planted:</strong> {new Date(tree.planted_date).toLocaleDateString()}</p>
        <p className="mb-2"><strong>Location:</strong> {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</p>
        {tree.description && <p className="mt-4"><strong>Story:</strong> {tree.description}</p>}
        <button onClick={onClose} className="w-full mt-6 p-3 bg-gray-500 text-white rounded hover:bg-gray-600">Close</button>
      </div>
    </div>
  );
}
