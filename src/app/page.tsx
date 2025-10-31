'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tree } from '@/types';
import AddTreeForm from '@/components/AddTreeForm';
import Map from '@/components/Map';
import Profile from '@/components/Profile';

type ViewType = 'home' | 'dashboard' | 'map';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [totalTrees, setTotalTrees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState<ViewType>('home');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) setView('dashboard');
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
    fetchTotalTrees();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('dashboard');
        fetchTrees();
      } else {
        setView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchTrees();
  }, [user]);

  const fetchTotalTrees = async () => {
    const { count } = await supabase
      .from('trees')
      .select('*', { count: 'exact', head: true });
    setTotalTrees(count || 0);
  };

  const fetchTrees = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('trees')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTrees(data || []);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
  };

  const signOut = () => {
    supabase.auth.signOut();
    setView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🌱</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public Home Page
  if (view === 'home' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🌳</span>
                <h1 className="text-2xl font-bold text-green-800">LeafyBuddy</h1>
              </div>
              <button
                onClick={signInWithGoogle}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Track Your Green Impact 🌍
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of eco-warriors documenting their trees and plants around the world. 
              Every tree counts in our fight against climate change.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-2">🌳</div>
                <div className="text-3xl font-bold text-green-600">{totalTrees.toLocaleString()}</div>
                <div className="text-gray-600">Trees Planted</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-3xl font-bold text-blue-600">Global</div>
                <div className="text-gray-600">Community</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-2">📱</div>
                <div className="text-3xl font-bold text-purple-600">Mobile</div>
                <div className="text-gray-600">Friendly</div>
              </div>
            </div>

            <button
              onClick={signInWithGoogle}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              🚀 Start Your Journey
            </button>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose LeafyBuddy?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">📍</div>
                <h4 className="font-semibold mb-2">GPS Tracking</h4>
                <p className="text-gray-600">Automatically capture precise locations</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📸</div>
                <h4 className="font-semibold mb-2">Photo Stories</h4>
                <p className="text-gray-600">Document your trees with beautiful photos</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🗺️</div>
                <h4 className="font-semibold mb-2">Interactive Maps</h4>
                <p className="text-gray-600">Visualize your impact on world maps</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🔗</div>
                <h4 className="font-semibold mb-2">Share Impact</h4>
                <p className="text-gray-600">Share your trees with friends and family</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const currentView: ViewType = view;

  if (currentView === 'dashboard' || currentView === 'map') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">🌳</span>
                <h1 className="text-xl font-bold text-green-800">LeafyBuddy</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-2 rounded-lg ${currentView === 'dashboard' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-green-600'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-4 py-2 rounded-lg ${currentView === 'map' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:text-green-600'}`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                >
                  <img
                    src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/32x32?text=👤'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32x32?text=👤'; }}
                  />
                  <span className="text-sm text-gray-600">{user?.user_metadata?.name}</span>
                </button>
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-red-600 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {currentView === 'dashboard' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🌳</div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{trees.length}</div>
                    <div className="text-gray-600">Your Trees</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🌍</div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{new Set(trees.map(t => `${Math.floor(t.latitude)},${Math.floor(t.longitude)}`)).size}</div>
                    <div className="text-gray-600">Locations</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">📅</div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {trees.length > 0 ? Math.floor((Date.now() - new Date(trees[trees.length - 1].planted_date).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                    </div>
                    <div className="text-gray-600">Days Active</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg flex items-center space-x-2"
              >
                <span className="text-xl">+</span>
                <span>Add New Tree</span>
              </button>
            </div>

            {trees.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                <div className="text-6xl mb-4">🌱</div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Plant Your First Tree!</h2>
                <p className="text-gray-600 mb-6">Start your green journey by adding your first tree to the map.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  🌳 Add Your First Tree
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trees.map((tree) => (
                  <div key={tree.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={tree.image_url}
                      alt={tree.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{tree.name}</h3>
                      {tree.species && <p className="text-green-600 text-sm mb-2">{tree.species}</p>}
                      <p className="text-gray-500 text-sm mb-3">
                        📅 {new Date(tree.planted_date).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => setSelectedTree(tree)}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-80px)]">
            <Map trees={trees} onTreeClick={setSelectedTree} />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {showAddForm && (
        <AddTreeForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchTrees();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {selectedTree && (
        <TreeDetailsModal
          tree={selectedTree}
          onClose={() => setSelectedTree(null)}
        />
      )}

      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

function TreeDetailsModal({ tree, onClose }: { tree: Tree; onClose: () => void }) {
  const shareTree = async () => {
    const shareUrl = `${window.location.origin}/tree/${tree.id}`;
    const shareText = `Check out my tree "${tree.name}" on LeafyBuddy! 🌳`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tree.name} - LeafyBuddy`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{tree.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        
        <img src={tree.image_url} alt={tree.name} className="w-full h-56 object-cover rounded-lg mb-4" />
        
        <div className="space-y-3 mb-6">
          {tree.species && (
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌿</span>
              <span><strong>Species:</strong> {tree.species}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">📅</span>
            <span><strong>Planted:</strong> {new Date(tree.planted_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg">📍</span>
            <span><strong>Location:</strong> {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</span>
          </div>
          
          {tree.description && (
            <div className="border-t pt-3">
              <div className="flex items-start space-x-2">
                <span className="text-lg">📝</span>
                <div>
                  <strong>Story:</strong>
                  <p className="text-gray-600 mt-1">{tree.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <span>🌍</span>
            <span>Environmental Impact</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">~20kg</div>
              <div className="text-gray-600">CO₂ absorbed/year</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">~260L</div>
              <div className="text-gray-600">O₂ produced/day</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={shareTree}
            className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <span>🔗</span>
            <span>Share Tree</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}