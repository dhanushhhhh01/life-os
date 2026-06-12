'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  animate,
} from 'framer-motion';
import { EnhancedParticles, EnhancedAmbientOrbs } from '../../lib/3d-components-enhanced';

/* ───────────────────────── helpers ───────────────────────── */

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20% 0px' }}
      transition={{ staggerChildren: 0.035 }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          variants={{
            hidden: { opacity: 0.08, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.p>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

/* ───────────────────────── data ───────────────────────── */

const FEATURES = [
  {
    icon: '🎯',
    title: 'Smart Goals',
    color: 'text-theme-primary',
    glow: 'hover:shadow-theme-primary/20 hover:border-theme-primary',
    desc: 'Set ambitious goals and track progress with AI-powered insights and real-time feedback.',
  },
  {
    icon: '⚡',
    title: 'Habit Tracking',
    color: 'text-theme-secondary',
    glow: 'hover:shadow-theme-secondary/20 hover:border-theme-secondary',
    desc: 'Build sustainable habits with streak tracking, visual progress, and motivational reminders.',
  },
  {
    icon: '📝',
    title: 'Smart Journaling',
    color: 'text-theme-primary',
    glow: 'hover:shadow-theme-primary/20 hover:border-theme-primary',
    desc: 'Reflect on your day with intelligent prompts and AI-generated insights from your entries.',
  },
  {
    icon: '💫',
    title: 'Daily Check-ins',
    color: 'text-theme-secondary',
    glow: 'hover:shadow-theme-secondary/20 hover:border-theme-secondary',
    desc: 'Track mood and energy with beautiful visualizations and personalized guidance.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Check in. Thirty seconds.',
    desc: 'Mood, energy, one line about your day. Dex turns it into signal.',
  },
  {
    n: '02',
    title: 'Dex learns your patterns.',
    desc: 'Goals, habits, journals and check-ins feed one AI coach that actually knows you.',
  },
  {
    n: '03',
    title: 'Level up — literally.',
    desc: 'Every action earns XP. Streaks, achievements and a weekly report card keep score.',
  },
];

/* ───────────────────────── page ───────────────────────── */

export default function LandingPage() {
  /* page progress bar */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  /* hero parallax */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroP } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroP, [0, 1], [0, -140]);
  const heroOpacity = useTransform(heroP, [0, 0.75], [1, 0]);
  const heroScale = useTransform(heroP, [0, 1], [1, 0.94]);

  /* sticky steps scrub */
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepsP } = useScroll({
    target: stepsRef,
    offset: ['start start', 'end end'],
  });
  const [activeStep, setActiveStep] = useState(0);
  useEffect(
    () =>
      stepsP.on('change', (v) => {
        setActiveStep(Math.min(2, Math.floor(v * 3)));
      }),
    [stepsP],
  );
  const stepLine = useTransform(stepsP, [0, 1], ['0%', '100%']);

  return (
    <div className="w-full min-h-screen bg-theme-bg text-white overflow-x-clip">
      {/* scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left bg-gradient-to-r from-theme-primary to-theme-secondary"
        style={{ scaleX: progress }}
      />

      {/* 3D background */}
      <EnhancedParticles particleCount={120} connectionDistance={160} mouseResponsive={true} />
      <EnhancedAmbientOrbs />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative w-full h-screen flex items-center justify-center z-10"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.15 }}
          >
            <motion.h1
              variants={fadeUp}
              className="text-7xl md:text-9xl font-black text-gradient-gold font-display mb-6"
            >
              Dex
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-xl md:text-3xl text-theme-primary font-bold mb-6"
            >
              Your Personal AI Life Coach
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Goals, habits, journaling and daily growth — one operating system for your life.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-theme-primary to-theme-secondary text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-theme-primary/30"
              >
                Enter Dex
              </Link>
              <button
                onClick={() =>
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white font-bold rounded-xl hover:bg-white/[0.1] transition-all"
              >
                Explore Features
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-theme-primary to-transparent"
            animate={{ scaleY: [0, 1, 0], originY: [0, 0, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="relative z-10 py-[18vh] px-6">
        <div className="max-w-4xl mx-auto">
          <WordReveal
            className="text-3xl md:text-5xl font-bold leading-snug font-display"
            text="Most apps track your life. Dex coaches it — turning every check-in, habit and journal entry into momentum you can see."
          />
        </div>
      </section>

      {/* ── STICKY STEPS ── */}
      <div ref={stepsRef} className="relative z-10 h-[300vh]">
        <div className="sticky top-0 h-screen flex items-center px-6">
          <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1fr_2fr] gap-12 items-center">
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">
                How it works
              </p>
              <div className="relative h-40 w-px bg-white/10 hidden md:block">
                <motion.div
                  className="absolute top-0 left-0 w-px bg-gradient-to-b from-theme-primary to-theme-secondary"
                  style={{ height: stepLine }}
                />
              </div>
            </div>
            <div className="relative min-h-[16rem]">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.n}
                  className="absolute inset-0"
                  animate={{
                    opacity: activeStep === i ? 1 : 0,
                    y: activeStep === i ? 0 : activeStep > i ? -30 : 30,
                  }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  <div className="text-theme-secondary font-display font-black text-6xl md:text-8xl opacity-30 mb-4">
                    {s.n}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black font-display mb-4 text-gradient-cyan">
                    {s.title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-400 max-w-lg">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 w-full py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10% 0px' }}
            variants={fadeUp}
            className="text-4xl md:text-5xl font-black text-center mb-16 text-gradient-cyan font-display"
          >
            Experience the Power of Dex
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ staggerChildren: 0.12 }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
                transition={{ type: 'spring', stiffness: 250, damping: 20 }}
                className={`glass-card border-theme-cardBorder rounded-2xl p-8 transition-colors hover:shadow-lg ${f.glow}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className={`text-2xl font-bold mb-3 ${f.color}`}>{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 w-full py-20 px-6 border-y border-white/[0.05] bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div className="space-y-2">
            <div className="text-5xl font-black text-theme-primary font-display">
              <Counter to={100} suffix="%" />
            </div>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">AI-Powered</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-theme-secondary font-display">
              <Counter to={24} suffix="/7" />
            </div>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Available</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-theme-primary font-display">
              <Counter to={16} />
            </div>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Achievements</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-theme-secondary font-display">
              <Counter to={7} />
            </div>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Levels to Legend</p>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative z-10 overflow-hidden py-12 border-b border-white/[0.05]">
        <div className="marquee-track flex whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0">
              {['Goals', 'Habits', 'Journal', 'Check-ins', 'Focus', 'XP', 'Streaks', 'Dex AI'].map(
                (w) => (
                  <span
                    key={w}
                    className="text-5xl md:text-7xl font-black font-display px-6 text-transparent"
                    style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)' }}
                  >
                    {w} —
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
        <style>{`
          .marquee-track { animation: lifeos-marquee 24s linear infinite; }
          @keyframes lifeos-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        `}</style>
      </div>

      {/* ── CTA ── */}
      <section className="relative z-10 w-full py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-4xl mx-auto text-center glass-card p-12 rounded-3xl border-theme-cardBorder shadow-2xl shadow-theme-secondary/10"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-gradient-gold font-display">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Your goals, habits and growth — coached by Dex, scored in XP.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-theme-primary to-theme-secondary text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-theme-primary/30"
          >
            Get Started Free
          </Link>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 text-center text-gray-500 bg-black/40 backdrop-blur-xl">
        <p>Dex © 2026 • Your Premium AI Life Coach • Made with ✨ and 🚀</p>
      </footer>
    </div>
  );
}
