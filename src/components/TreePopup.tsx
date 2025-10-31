'use client';

import { Tree } from '@/types';
import Image from 'next/image';

interface TreePopupProps {
  tree: Tree;
  onClose: () => void;
}

export default function TreePopup({ tree, onClose }: TreePopupProps) {
  const shareTree = () => {
    const url = `${window.location.origin}/tree/${tree.id}`;
    navigator.clipboard.writeText(url);
    alert('Tree link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{tree.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative h-48 w-full rounded-lg overflow-hidden">
            <Image
              src={tree.image_url}
              alt={tree.name}
              fill
              className="object-cover"
            />
          </div>

          {tree.species && (
            <div>
              <span className="font-medium">Species: </span>
              <span>{tree.species}</span>
            </div>
          )}

          <div>
            <span className="font-medium">Planted: </span>
            <span>{new Date(tree.planted_date).toLocaleDateString()}</span>
          </div>

          <div>
            <span className="font-medium">Location: </span>
            <span>{tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</span>
          </div>

          {tree.description && (
            <div>
              <span className="font-medium">Story: </span>
              <p className="mt-1 text-gray-700">{tree.description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={shareTree}
              className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Share Tree
            </button>
            <button
              onClick={onClose}
              className="flex-1 p-2 border rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}