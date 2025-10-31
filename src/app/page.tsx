// 'use client';

// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import { storage } from '@/lib/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import imageCompression from 'browser-image-compression';

// interface Tree {
//   id: string;
//   user_id: string;
//   name: string;
//   species?: string;
//   latitude: number;
//   longitude: number;
//   image_url: string;
//   description?: string;
//   planted_date: string;
//   created_at: string;
// }

// export default function Home() {
//   const [user, setUser] = useState<any>(null);
//   const [trees, setTrees] = useState<Tree[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

//   // Auth
//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       setUser(user);
//       setLoading(false);
//     };
//     getUser();

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   // Fetch trees
//   useEffect(() => {
//     if (user) fetchTrees();
//   }, [user]);

//   const fetchTrees = async () => {
//     const { data } = await supabase
//       .from('trees')
//       .select('*')
//       .eq('user_id', user.id)
//       .order('created_at', { ascending: false });
//     setTrees(data || []);
//   };

//   const signInWithGoogle = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: { redirectTo: `${window.location.origin}/` }
//     });
//   };

//   const signOut = () => supabase.auth.signOut();

//   if (loading) return <div className="p-8">Loading...</div>;

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold mb-4">🌳 myTree</h1>
//           <p className="text-gray-600 mb-8">Track your trees around the world</p>
//           <button
//             onClick={signInWithGoogle}
//             className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//           >
//             Sign in with Google
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow p-4">
//         <div className="max-w-4xl mx-auto flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold">🌳 myTree</h1>
//             <p className="text-sm text-gray-600">{trees.length} trees planted</p>
//           </div>
//           <div className="flex gap-4">
//             <button
//               onClick={() => setShowAddForm(true)}
//               className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//             >
//               + Add Tree
//             </button>
//             <button
//               onClick={signOut}
//               className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto p-4">
//         {trees.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-6xl mb-4">🌱</div>
//             <h2 className="text-2xl font-bold mb-4">Plant Your First Tree!</h2>
//             <button
//               onClick={() => setShowAddForm(true)}
//               className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
//             >
//               Add Your First Tree
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {trees.map((tree) => (
//               <div key={tree.id} className="bg-white rounded-lg shadow p-4">
//                 <img
//                   src={tree.image_url}
//                   alt={tree.name}
//                   className="w-full h-48 object-cover rounded mb-4"
//                 />
//                 <h3 className="font-bold text-lg">{tree.name}</h3>
//                 {tree.species && <p className="text-gray-600">{tree.species}</p>}
//                 <p className="text-sm text-gray-500 mt-2">
//                   Planted: {new Date(tree.planted_date).toLocaleDateString()}
//                 </p>
//                 <button
//                   onClick={() => setSelectedTree(tree)}
//                   className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
//                 >
//                   View Details
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Add Tree Modal */}
//       {showAddForm && <AddTreeModal onClose={() => setShowAddForm(false)} onSuccess={fetchTrees} />}

//       {/* Tree Details Modal */}
//       {selectedTree && <TreeModal tree={selectedTree} onClose={() => setSelectedTree(null)} />}
//     </div>
//   );
// }

// // Add Tree Modal Component
// function AddTreeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
//   const [loading, setLoading] = useState(false);
//   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     species: '',
//     description: '',
//     image: null as File | null,
//   });

//   const getCurrentLocation = () => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
//       () => alert('Unable to get location')
//     );
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!location || !formData.image) return alert('Please add location and image');

//     setLoading(true);
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       // Upload image
//       const compressedImage = await imageCompression(formData.image, { maxSizeMB: 1 });
//       const imageRef = ref(storage, `trees/${user!.id}/${Date.now()}`);
//       const snapshot = await uploadBytes(imageRef, compressedImage);
//       const imageUrl = await getDownloadURL(snapshot.ref);

//       // Save to database
//       await supabase.from('trees').insert({
//         user_id: user!.id,
//         name: formData.name,
//         species: formData.species,
//         latitude: location.lat,
//         longitude: location.lng,
//         image_url: imageUrl,
//         description: formData.description,
//         planted_date: new Date().toISOString(),
//       });

//       onSuccess();
//       onClose();
//     } catch (error) {
//       alert('Failed to add tree');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-bold mb-4">Add New Tree</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Tree Name"
//             required
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             className="w-full p-2 border rounded"
//           />
//           <input
//             type="text"
//             placeholder="Species (optional)"
//             value={formData.species}
//             onChange={(e) => setFormData({ ...formData, species: e.target.value })}
//             className="w-full p-2 border rounded"
//           />
//           <input
//             type="file"
//             accept="image/*"
//             required
//             onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
//             className="w-full p-2 border rounded"
//           />
//           <button
//             type="button"
//             onClick={getCurrentLocation}
//             className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             {location ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Get Location'}
//           </button>
//           <textarea
//             placeholder="Description (optional)"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             className="w-full p-2 border rounded"
//             rows={3}
//           />
//           <div className="flex gap-2">
//             <button type="button" onClick={onClose} className="flex-1 p-2 border rounded">
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
//             >
//               {loading ? 'Adding...' : 'Add Tree'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // Tree Details Modal Component
// function TreeModal({ tree, onClose }: { tree: Tree; onClose: () => void }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="flex justify-between items-start mb-4">
//           <h2 className="text-xl font-bold">{tree.name}</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
//         </div>
//         <img src={tree.image_url} alt={tree.name} className="w-full h-48 object-cover rounded mb-4" />
//         {tree.species && <p><strong>Species:</strong> {tree.species}</p>}
//         <p><strong>Planted:</strong> {new Date(tree.planted_date).toLocaleDateString()}</p>
//         <p><strong>Location:</strong> {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</p>
//         {tree.description && <p className="mt-2"><strong>Story:</strong> {tree.description}</p>}
//         <button
//           onClick={onClose}
//           className="w-full mt-4 p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }
// export default function Home() {
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-4xl font-bold text-center mb-8">🌳 myTree</h1>
//         <div className="bg-white rounded-lg shadow p-6 text-center">
//           <p className="text-lg mb-4">Welcome to myTree!</p>
//           <p className="text-gray-600">Your tree tracking app is ready.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
  };

  const signOut = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">🌳 myTree</h1>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-lg mb-4">Track your trees around the world</p>
            <button
              onClick={signInWithGoogle}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">🌳 myTree</h1>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg mb-4">Welcome, {user.email}!</p>
          <p className="text-gray-600">Your tree tracking app is ready.</p>
        </div>
      </div>
    </div>
  );
}
