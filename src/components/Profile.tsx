'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tree } from '@/types';

interface ProfileProps {
  onClose: () => void;
}

export default function Profile({ onClose }: ProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [stats, setStats] = useState({
    totalTrees: 0,
    uniqueLocations: 0,
    daysActive: 0,
    favoriteSpecies: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: treesData } = await supabase
          .from('trees')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (treesData) {
          setTrees(treesData);
          calculateStats(treesData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (treesData: Tree[]) => {
    const totalTrees = treesData.length;
    const uniqueLocations = new Set(
      treesData.map(t => `${Math.floor(t.latitude)},${Math.floor(t.longitude)}`)
    ).size;
    
    const firstTreeDate = treesData.length > 0 
      ? new Date(treesData[treesData.length - 1].planted_date)
      : new Date();
    const daysActive = Math.floor((Date.now() - firstTreeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const speciesCount = treesData.reduce((acc, tree) => {
      if (tree.species) {
        acc[tree.species] = (acc[tree.species] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteSpecies = Object.entries(speciesCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None specified';

    setStats({
      totalTrees,
      uniqueLocations,
      daysActive,
      favoriteSpecies,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin text-4xl mb-4">🌱</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">👤 Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* User Info */}
        <div className="text-center mb-6">
          <img
            src={user?.user_metadata?.avatar_url || 'https://via.placeholder.com/80x80?text=👤'}
            alt="Profile"
            className="w-20 h-20 rounded-full mx-auto mb-3"
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80x80?text=👤'; }}
          />
          <h3 className="text-xl font-semibold text-gray-800">
            {user?.user_metadata?.name || 'Tree Planter'}
          </h3>
          <p className="text-gray-600 text-sm">{user?.email}</p>
          <p className="text-green-600 text-sm mt-1">
            Member since {new Date(user?.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalTrees}</div>
            <div className="text-sm text-gray-600">Trees Planted</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.uniqueLocations}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.daysActive}</div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-sm font-bold text-yellow-600 truncate">{stats.favoriteSpecies}</div>
            <div className="text-sm text-gray-600">Favorite Species</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">🏆 Achievements</h4>
          <div className="space-y-2">
            {stats.totalTrees >= 1 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-lg">🌱</span>
                <span>First Tree Planted</span>
              </div>
            )}
            {stats.totalTrees >= 5 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-lg">🌳</span>
                <span>Tree Enthusiast (5+ trees)</span>
              </div>
            )}
            {stats.totalTrees >= 10 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-lg">🌲</span>
                <span>Forest Builder (10+ trees)</span>
              </div>
            )}
            {stats.uniqueLocations >= 3 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-lg">🌍</span>
                <span>Global Planter (3+ locations)</span>
              </div>
            )}
            {stats.daysActive >= 30 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-lg">⭐</span>
                <span>Dedicated Planter (30+ days)</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trees */}
        {trees.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">🌳 Recent Trees</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trees.slice(0, 3).map((tree) => (
                <div key={tree.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={tree.image_url}
                    alt={tree.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{tree.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tree.planted_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Close Profile
          </button>
          <button
            onClick={signOut}
            className="w-full p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}