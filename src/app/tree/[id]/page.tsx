'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Tree } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

export default function TreePage() {
  const params = useParams();
  const [tree, setTree] = useState<Tree | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTree = async () => {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching tree:', error);
      } else {
        setTree(data);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchTree();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tree Not Found</h1>
          <Link href="/" className="text-primary hover:underline">
            Back to myTree
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-primary hover:underline">
            ← Back to myTree
          </Link>
        </div>
      </header>

      <main className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-64 md:h-96">
              <Image
                src={tree.image_url}
                alt={tree.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{tree.name}</h1>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {tree.species && (
                    <div>
                      <span className="font-medium text-gray-600">Species:</span>
                      <p className="text-lg">{tree.species}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-600">Planted:</span>
                    <p className="text-lg">{new Date(tree.planted_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Location:</span>
                    <p className="text-lg">{tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</p>
                  </div>
                </div>
                
                {tree.description && (
                  <div>
                    <span className="font-medium text-gray-600">Story:</span>
                    <p className="text-lg mt-2 text-gray-700">{tree.description}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <p className="text-center text-gray-600">
                  🌳 Shared from <Link href="/" className="text-primary hover:underline font-medium">myTree</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}