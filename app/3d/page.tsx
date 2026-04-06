'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '@/components/3D/Scene';
import Link from 'next/link';

export default function ThreeDLanding() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Life OS 3D
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your personal development in an immersive 3D world
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="grid grid-cols-3 gap-8 my-12 text-center"
        >
          <div>
            <div className="text-4xl font-bold text-cyan-400">12</div>
            <p className="text-gray-400 text-sm">Day Streak</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400">5</div>
            <p className="text-gray-400 text-sm">Active Goals</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400">42</div>
            <p className="text-gray-400 text-sm">Habits Tracked</p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex gap-4 pointer-events-auto"
        >
          <Link
            href="/dashboard/coach"
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-lg transition transform hover:scale-105"
          >
            Enter Dashboard
          </Link>
          <Link
            href="/"
            className="px-8 py-3 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold rounded-lg transition"
          >
            Back to Classic
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-cyan-400 text-sm pointer-events-none"
      >
        Scroll to explore ↓
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-5 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
    </div>
  );
}
