'use client';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-purple-600 p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Life OS</h1>
        <p className="text-2xl text-blue-100 mb-8">Welcome to your application</p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <p className="text-gray-800 mb-4">Your app is now deployed and running!</p>
          <p className="text-gray-600">Build amazing things here.</p>
        </div>
      </div>
    </main>
  );
}
