'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('hero');

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0e27] to-[#1a1f3a]">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Dex
            </h1>
            <p className="text-xl md:text-3xl text-cyan-200 mb-8 font-light">
              Your Personal AI Life Coach
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your life with AI-powered guidance for goals, habits, journal insights, and daily growth
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold rounded-full hover:from-cyan-400 hover:to-cyan-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
            >
              Enter Dex
            </Link>
            <button
              onClick={() => setActiveSection('goals')}
              className="px-8 py-4 border-2 border-violet-500 text-violet-400 font-bold rounded-full hover:bg-violet-500/10 transition-all"
            >
              Explore Features
            </button>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Experience the Power of Dex
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Goals Feature */}
            <div className="group cursor-pointer" onClick={() => setActiveSection('goals')}>
              <div className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-3 text-cyan-300">Smart Goals</h3>
                <p className="text-gray-300">
                  Set ambitious goals and track progress with AI-powered insights and real-time feedback.
                </p>
              </div>
            </div>

            {/* Habits Feature */}
            <div className="group cursor-pointer" onClick={() => setActiveSection('habits')}>
              <div className="bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 rounded-2xl p-8 hover:border-violet-400 transition-all hover:shadow-lg hover:shadow-violet-500/20">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold mb-3 text-violet-300">Habit Tracking</h3>
                <p className="text-gray-300">
                  Build sustainable habits with streak tracking, visual progress, and motivational reminders.
                </p>
              </div>
            </div>

            {/* Journal Feature */}
            <div className="group cursor-pointer" onClick={() => setActiveSection('journal')}>
              <div className="bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-3 text-cyan-300">Smart Journaling</h3>
                <p className="text-gray-300">
                  Reflect on your day with intelligent prompts and AI-generated insights from your entries.
                </p>
              </div>
            </div>

            {/* Mood Check-in Feature */}
            <div className="group cursor-pointer" onClick={() => setActiveSection('mood')}>
              <div className="bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 rounded-2xl p-8 hover:border-violet-400 transition-all hover:shadow-lg hover:shadow-violet-500/20">
                <div className="text-4xl mb-4">💫</div>
                <h3 className="text-2xl font-bold mb-3 text-violet-300">Daily Check-ins</h3>
                <p className="text-gray-300">
                  Track your mood and energy levels with beautiful visualizations and personalized guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative w-full py-20 px-6 bg-gradient-to-r from-cyan-500/5 to-violet-500/5 border-y border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-cyan-400">100%</div>
              <p className="text-gray-400">AI-Powered</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-violet-400">24/7</div>
              <p className="text-gray-400">Available</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-cyan-400">∞</div>
              <p className="text-gray-400">Growth</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-violet-400">1st</div>
              <p className="text-gray-400">Start Today</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands already using Dex to achieve their goals and build lasting habits.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold text-lg rounded-full hover:from-cyan-400 hover:to-cyan-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-8 px-6 text-center text-gray-500">
        <p>Dex © 2026 • Your AI Life Coach • Made with ✨ and 🚀</p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
