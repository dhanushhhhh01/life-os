'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Hub3D = dynamic(() => import('@/components/3D/Hub'), { ssr: false });
import Link from 'next/link';

export default function ThreeDDashboard() {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const zones = [
    {
      id: 'goals',
      name: 'Goals Mountain',
      description: 'Climb towards your ambitions',
      color: 'from-cyan-500 to-blue-500',
      href: '/3d-dashboard/goals',
    },
    {
      id: 'habits',
      name: 'Habits Garden',
      description: 'Grow your daily rituals',
      color: 'from-green-500 to-emerald-500',
      href: '/3d-dashboard/habits',
    },
    {
      id: 'journal',
      name: 'Journal Library',
      description: 'Explore your memories',
      color: 'from-purple-500 to-pink-500',
      href: '/3d-dashboard/journal',
    },
    {
      id: 'mood',
      name: 'Mood Observatory',
      description: 'Track your emotional weather',
      color: 'from-orange-500 to-red-500',
      href: '/3d-dashboard/mood',
    },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Hub Background */}
      <div className="absolute inset-0 z-0">
        <Hub3D />
      </div>

      {/* Semi-transparent overlay gradient */}
      <div className="absolute inset-0 z-5 pointer-events-none bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 pointer-events-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Life OS Hub
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            Navigate your personal development world
          </p>
        </motion.div>

        {/* Zone Navigation Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pointer-events-auto"
        >
          {zones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              onMouseEnter={() => setActiveZone(zone.id)}
              onMouseLeave={() => setActiveZone(null)}
            >
              <Link href={zone.href}>
                <div
                  className={`p-4 md:p-6 rounded-lg border-2 border-gray-700 hover:border-gray-400 transition-all transform hover:scale-105 cursor-pointer ${
                    activeZone === zone.id ? 'shadow-lg' : ''
                  }`}
                  style={{
                    boxShadow: activeZone === zone.id ? `0 0 20px ${zone.color}` : 'none',
                  }}
                >
                  <div className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${zone.color} bg-clip-text text-transparent mb-2`}>
                    {zone.name}
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm">{zone.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-4 pointer-events-auto"
      >
        <Link
          href="/"
          className="px-6 py-2 text-sm border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400 rounded-lg transition"
        >
          Back to Classic
        </Link>
        <Link
          href="/dashboard/coach"
          className="px-6 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition transform hover:scale-105"
        >
          Regular Dashboard
        </Link>
      </motion.div>

      {/* Dex floating indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute top-8 right-8 z-20 text-gray-400 text-sm pointer-events-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Dex is waiting...</span>
        </div>
      </motion.div>
    </div>
  );
}
