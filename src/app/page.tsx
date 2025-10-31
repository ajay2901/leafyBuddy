'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const testStep = async (stepNum: number, testName: string, testFn: () => Promise<void>) => {
    try {
      await testFn();
      console.log(`✅ Step ${stepNum}: ${testName} - OK`);
      setStep(stepNum + 1);
    } catch (err) {
      setError(`❌ Step ${stepNum}: ${testName} - ${err}`);
      console.error(`❌ Step ${stepNum}:`, err);
    }
  };

  useEffect(() => {
    const runTests = async () => {
      if (step === 1) {
        await testStep(1, 'Import Supabase', async () => {
          const { supabase } = await import('@/lib/supabase');
        });
      } else if (step === 2) {
        await testStep(2, 'Import Types', async () => {
          const { Tree } = await import('@/types');
        });
      } else if (step === 3) {
        await testStep(3, 'Import AuthButton', async () => {
          const AuthButton = await import('@/components/AuthButton');
        });
      } else if (step === 4) {
        await testStep(4, 'Import Map', async () => {
          const Map = await import('@/components/Map');
        });
      } else if (step === 5) {
        await testStep(5, 'Import AddTreeForm', async () => {
          const AddTreeForm = await import('@/components/AddTreeForm');
        });
      } else if (step === 6) {
        await testStep(6, 'Import TreePopup', async () => {
          const TreePopup = await import('@/components/TreePopup');
        });
      }
    };

    runTests();
  }, [step]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Component Test</h1>
      <p>Current step: {step}</p>
      {error && <p className="text-red-500">{error}</p>}
      {step > 6 && <p className="text-green-500">✅ All components imported successfully!</p>}
    </div>
  );
}
