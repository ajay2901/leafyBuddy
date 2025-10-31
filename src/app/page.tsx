'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tree } from '@/types';
import AuthButton from '@/components/AuthButton';
import Map from '@/components/Map';
import AddTreeForm from '@/components/AddTreeForm';
import TreePopup from '@/components/TreePopup';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (mounted) {
          if (error) throw error;
          setUser(user);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Auth error:', err);
          setError(`Auth error: ${err}`);
          setLoading(false);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchTrees = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrees(data || []);
    } catch (err) {
      console.error('Error fetching trees:', err);
      setError(`Error fetching trees: ${err}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrees();
    }
  }, [user]);

  const handleAddTreeSuccess = () => {
    setShowAddForm(false);
    fetchTrees();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-4">🌳 myTree</h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your green impact around the world
          </p>
          <AuthButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-green-500">🌳 myTree</h1>
            <span className="text-sm text-gray-500">
              {trees.length} tree{trees.length !== 1 ? 's' : ''} planted
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Add Tree
            </button>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="p-4">
        <div className="max-w-6xl mx-auto">
          {trees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-2xl font-bold mb-4">Plant Your First Tree!</h2>
              <p className="text-gray-600 mb-6">
                Start building your personal forest by adding your first tree.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Add Your First Tree
              </button>
            </div>
          ) : (
            <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
              <Map 
                trees={trees} 
                onTreeClick={setSelectedTree}
              />
            </div>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddTreeForm
          onSuccess={handleAddTreeSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {selectedTree && (
        <TreePopup
          tree={selectedTree}
          onClose={() => setSelectedTree(null)}
        />
      )}
    </div>
  );
}
