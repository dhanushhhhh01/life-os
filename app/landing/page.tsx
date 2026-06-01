'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EnhancedParticles, EnhancedAmbientOrbs } from "../../lib/3d-components-enhanced";

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('hero');

  return (
    <div className="w-full min-h-screen bg-theme-bg text-white overflow-hidden" style={{ perspective: '1100px' }}>
      
      {/* 3D Background */}
      <EnhancedParticles particleCount={120} connectionDistance={160} mouseResponsive={true} />
      <EnhancedAmbientOrbs />

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center z-10 animate-page-in-r" style={{ transformStyle: 'preserve-3d' }}>
        {/* Content Overlay */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto glass-card p-12 rounded-[40px] border-theme-border shadow-2xl shadow-theme-primary/10">
          <div className="mb-8 animate-fade-in stagger-children">
            <h1 className="text-7xl md:text-8xl font-black text-gradient-gold font-display mb-6">
              Dex
            </h1>
            <p className="text-xl md:text-3xl text-theme-primary font-bold mb-8">
              Your Personal AI Life Coach
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Transform your life with AI-powered guidance for goals, habits, journal insights, and daily growth
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-theme-primary to-theme-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-theme-primary/30"
            >
              Enter Dex
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white font-bold rounded-xl hover:bg-white/[0.1] transition-all"
            >
              Explore Features
            </button>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-gradient-cyan font-display">
            Experience the Power of Dex
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Goals Feature */}
            <div className="group cursor-pointer">
              <div className="glass-card border-theme-border rounded-2xl p-8 hover:border-theme-primary transition-all hover:shadow-lg hover:shadow-theme-primary/20 animate-card-glow">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-3 text-theme-primary">Smart Goals</h3>
                <p className="text-gray-400">
                  Set ambitious goals and track progress with AI-powered insights and real-time feedback.
                </p>
              </div>
            </div>

            {/* Habits Feature */}
            <div className="group cursor-pointer">
              <div className="glass-card border-theme-border rounded-2xl p-8 hover:border-theme-secondary transition-all hover:shadow-lg hover:shadow-theme-secondary/20">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold mb-3 text-theme-secondary">Habit Tracking</h3>
                <p className="text-gray-400">
                  Build sustainable habits with streak tracking, visual progress, and motivational reminders.
                </p>
              </div>
            </div>

            {/* Journal Feature */}
            <div className="group cursor-pointer">
              <div className="glass-card border-theme-border rounded-2xl p-8 hover:border-theme-primary transition-all hover:shadow-lg hover:shadow-theme-primary/20">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-3 text-theme-primary">Smart Journaling</h3>
                <p className="text-gray-400">
                  Reflect on your day with intelligent prompts and AI-generated insights from your entries.
                </p>
              </div>
            </div>

            {/* Mood Check-in Feature */}
            <div className="group cursor-pointer">
              <div className="glass-card border-theme-border rounded-2xl p-8 hover:border-theme-secondary transition-all hover:shadow-lg hover:shadow-theme-secondary/20 animate-card-glow">
                <div className="text-4xl mb-4">💫</div>
                <h3 className="text-2xl font-bold mb-3 text-theme-secondary">Daily Check-ins</h3>
                <p className="text-gray-400">
                  Track your mood and energy levels with beautiful visualizations and personalized guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 w-full py-20 px-6 border-y border-white/[0.05] bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-black text-theme-primary">100%</div>
              <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">AI-Powered</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black text-theme-secondary">24/7</div>
              <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Available</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black text-theme-primary">∞</div>
              <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Growth</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black text-theme-secondary">1st</div>
              <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Start Today</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full py-32 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card p-12 rounded-3xl border-theme-border shadow-2xl shadow-theme-secondary/10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-gradient-gold font-display">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join thousands already using Dex to achieve their goals and build lasting habits.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-theme-primary to-theme-secondary text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-theme-primary/30"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 text-center text-gray-500 bg-black/40 backdrop-blur-xl">
        <p>Dex © 2026 • Your Premium AI Life Coach • Made with ✨ and 🚀</p>
      </footer>
    </div>
  );
}
