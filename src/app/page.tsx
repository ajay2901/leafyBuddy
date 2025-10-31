'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [supabaseTest, setSupabaseTest] = useState('Testing...');

  useEffect(() => {
    const testSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase.auth.getUser();
        setSupabaseTest(error ? `Error: ${error.message}` : 'Supabase OK');
      } catch (err) {
        setSupabaseTest(`Failed: ${err}`);
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      <p>Environment check:</p>
      <ul>
        <li>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</li>
        <li>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'}</li>
        <li>Firebase API: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅' : '❌'}</li>
      </ul>
      <p>Supabase Connection: {supabaseTest}</p>
    </div>
  );
}
