'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

interface AddTreeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddTreeForm({ onSuccess, onCancel }: AddTreeFormProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    description: '',
    image: null as File | null,
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          alert('Unable to get location. Please enable location services.');
        }
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !formData.image) {
      alert('Please add location and image');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Compress and upload image
      const compressedImage = await imageCompression(formData.image, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });

      const imageRef = ref(storage, `trees/${user.id}/${Date.now()}`);
      const snapshot = await uploadBytes(imageRef, compressedImage);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Save to database
      const { error } = await supabase
        .from('trees')
        .insert({
          user_id: user.id,
          name: formData.name,
          species: formData.species,
          latitude: location.lat,
          longitude: location.lng,
          image_url: imageUrl,
          description: formData.description,
          planted_date: new Date().toISOString(),
        });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error adding tree:', error);
      alert('Failed to add tree');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Tree</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tree Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="My Oak Tree"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Species</label>
            <input
              type="text"
              value={formData.species}
              onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Oak, Pine, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Photo *</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {location ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Get Current Location'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Tell the story of this tree..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-2 bg-primary text-white rounded hover:bg-secondary disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Tree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}