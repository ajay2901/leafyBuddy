'use client';

import { useState } from 'react';

export default function Home() {
  const [currentTest, setCurrentTest] = useState('basic');
  const [error, setError] = useState('');

  const TestAuthButton = () => {
    try {
      const AuthButton = require('@/components/AuthButton').default;
      return <AuthButton />;
    } catch (err) {
      return <div className="text-red-500">AuthButton Error: {String(err)}</div>;
    }
  };

  const TestMap = () => {
    try {
      const Map = require('@/components/Map').default;
      return <Map trees={[]} />;
    } catch (err) {
      return <div className="text-red-500">Map Error: {String(err)}</div>;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Component Test</h1>
      
      <div className="space-y-4 mt-4">
        <button 
          onClick={() => setCurrentTest('basic')}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
        >
          Basic Test
        </button>
        <button 
          onClick={() => setCurrentTest('auth')}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2"
        >
          Test AuthButton
        </button>
        <button 
          onClick={() => setCurrentTest('map')}
          className="px-4 py-2 bg-red-500 text-white rounded mr-2"
        >
          Test Map
        </button>
      </div>

      <div className="mt-8 p-4 border">
        {currentTest === 'basic' && <div>✅ Basic page works!</div>}
        {currentTest === 'auth' && <TestAuthButton />}
        {currentTest === 'map' && <TestMap />}
      </div>
    </div>
  );
}
