'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AuthScreen } from '@/components/AuthScreen';

export default function Home() {
  const { loggedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure auth context is fully initialized
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasCheckedAuth && loggedIn) {
      router.push('/dashboard');
    }
  }, [hasCheckedAuth, loggedIn, router]);

  // Show loading state or nothing while checking auth
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If logged in, show nothing (redirect will happen)
  if (loggedIn) {
    return null;
  }

  // If not logged in, show auth screen
  return <AuthScreen />;
}
