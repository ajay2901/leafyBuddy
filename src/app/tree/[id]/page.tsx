'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tree } from '@/types';
import Map from '@/components/Map';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default function TreePage({ params }: PageProps) {
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTree();
  }, [params.id]);

  const fetchTree = async () => {
    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        setError('Tree not found');
      } else {
        setTree(data);
      }
    } catch (err) {
      setError('Failed to load tree');
    } finally {
      setLoading(false);
    }
  };

  const shareTree = async () => {
    const shareData = {
      title: `${tree?.name} - LeafyBuddy`,
      text: `Check out this tree "${tree?.name}" on LeafyBuddy! 🌳`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🌱</div>
          <p className="text-gray-600">Loading tree...</p>
        </div>
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tree Not Found</h1>
          <p className="text-gray-600 mb-6">
            The tree you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            🏠 Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl">🌳</span>
              <h1 className="text-2xl font-bold text-green-800">LeafyBuddy</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={shareTree}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>🔗</span>
                <span>Share</span>
              </button>
              <Link
                href="/"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Join LeafyBuddy
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tree Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src={tree.image_url}
              alt={tree.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{tree.name}</h2>
              
              {tree.species && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">🌿</span>
                  <span className="text-green-600 font-medium">{tree.species}</span>
                </div>
              )}

              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">📅</span>
                <span className="text-gray-600">
                  Planted on {new Date(tree.planted_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg">📍</span>
                <span className="text-gray-600">
                  {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}
                </span>
              </div>

              {tree.description && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🌳 Tree Story</h3>
                  <p className="text-gray-600 leading-relaxed">{tree.description}</p>
                </div>
              )}

              {/* Environmental Impact */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-800 mb-3">🌍 Environmental Impact</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">~20kg</div>
                    <div className="text-gray-600">CO₂ absorbed/year</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">~260L</div>
                    <div className="text-gray-600">O₂ produced/day</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">📍 Location</h3>
            </div>
            <div className="h-96">
              <Map trees={[tree]} />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Inspired to Plant Your Own Tree?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of eco-warriors around the world who are making a difference, 
            one tree at a time. Track your green impact and inspire others!
          </p>
          <Link
            href="/"
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors inline-block"
          >
            🚀 Start Your Green Journey
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl">🌳</span>
              <span className="text-xl font-bold text-green-800">LeafyBuddy</span>
            </div>
            <p className="text-gray-600">
              Making the world greener, one tree at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}