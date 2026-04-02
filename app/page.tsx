'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LandingPageContent = dynamic(
  () => import('./landing/page').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
