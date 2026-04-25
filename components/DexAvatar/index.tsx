"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

export type DexState = "idle" | "thinking" | "speaking" | "listening";

// ─── Per-state visual config ─────────────────────────────────────────────────

const STATE_CONFIG = {
  idle: {
    color:          "#00d4ff",
    emissive:       "#003a5c",
    distort:        0.18,
    speed:          1.2,
    orbSpeed:       0.35,
    ring1Color:     "#00d4ff",
    ring2Color:     "#7c3aed",
    ring1Speed:     0.4,
    pulseAmplitude: 0.03,
  },
  thinking: {
    color:          "#a855f7",
    emissive:       "#3b0764",
    distort:        0.55,
    speed:          5.0,
    orbSpeed:       1.2,
    ring1Color:     "#a855f7",
    ring2Color:     "#00d4ff",
    ring1Speed:     1.1,
    pulseAmplitude: 0.07,
  },
  speaking: {
    color:          "#00ff88",
    emissive:       "#003d1f",
    distort:        0.42,
    speed:          4.5,
    orbSpeed:       0.5,
    ring1Color:     "#00ff88",
    ring2Color:     "#00d4ff",
    ring1Speed:     1.4,
    pulseAmplitude: 0.12,
  },
  listening: {
    color:          "#f97316",
    emissive:       "#431407",
    distort:        0.28,
    speed:          2.5,
    orbSpeed:       0.6,
    ring1Color:     "#f97316",
    ring2Color:     "#a855f7",
    ring1Speed:     0.7,
    pulseAmplitude: 0.06,
  },
};

// ─── Core orb ────────────────────────────────────────────────────────────────

function OrbCore({ state }: { state: DexState }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cfg     = STATE_CONFIG[state];
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * cfg.orbSpeed;
    meshRef.current.rotation.x  = Math.sin(timeRef.current * 0.4) * 0.08;
    const pulse = 1 + Math.sin(timeRef.current * 3.5) * cfg.pulseAmplitude;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.35, 64, 64]} />
        <MeshDistortMaterial
          color={cfg.color}
          emissive={cfg.emissive}
          emissiveIntensity={0.6}
          distort={cfg.distort}
          speed={cfg.speed}
          roughness={0.05}
          metalness={0.7}
        />
      </mesh>
    </Float>
  );
}

// ─── Inner glow core ─────────────────────────────────────────────────────────

function InnerGlow({ state }: { state: DexState }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const cfg     = STATE_CONFIG[state];
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (!meshRef.current) return;
    const s = 0.55 + Math.sin(timeRef.current * 4) * 0.06;
    meshRef.current.scale.setScalar(s);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.35 + Math.sin(timeRef.current * 3) * 0.12;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.35, 32, 32]} />
      <meshBasicMaterial color={cfg.color} transparent opacity={0.35} />
    </mesh>
  );
}

// ─── Orbit ring 1 ────────────────────────────────────────────────────────────

function Ring1({ state }: { state: DexState }) {
  const ref = useRef<THREE.Mesh>(null!);
  const cfg = STATE_CONFIG[state];

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * cfg.ring1Speed;
    ref.current.rotation.x += delta * 0.15;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.05, 0.04, 16, 100]} />
      <meshStandardMaterial
        color={cfg.ring1Color}
        emissive={cfg.ring1Color}
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ─── Orbit ring 2 ────────────────────────────────────────────────────────────

function Ring2({ state }: { state: DexState }) {
  const ref = useRef<THREE.Mesh>(null!);
  const cfg = STATE_CONFIG[state];

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z -= delta * 0.28;
    ref.current.rotation.y += delta * 0.38;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2.8, 0.3, 0]}>
      <torusGeometry args={[2.65, 0.025, 16, 100]} />
      <meshStandardMaterial
        color={cfg.ring2Color}
        emissive={cfg.ring2Color}
        emissiveIntensity={0.7}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// ─── Particle field ───────────────────────────────────────────────────────────

function Particles({ state }: { state: DexState }) {
  const ref = useRef<THREE.Points>(null!);
  const cfg = STATE_CONFIG[state];

  const geometry = useMemo(() => {
    const geo      = new THREE.BufferGeometry();
    const count    = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 3.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (state === "thinking" ? 0.12 : 0.04);
    ref.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={cfg.ring1Color}
        size={0.045}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Scene lighting ───────────────────────────────────────────────────────────

function SceneLights({ state }: { state: DexState }) {
  const cfg = STATE_CONFIG[state];
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[4,  4,  4]} intensity={2}   color={cfg.color} />
      <pointLight position={[-4, -3, -3]} intensity={1.2} color={cfg.ring2Color} />
      <pointLight position={[0,  5,  0]} intensity={0.6} color="#ffffff" />
    </>
  );
}

// ─── CSS glow backdrop (outside canvas) ──────────────────────────────────────

function GlowBackdrop({ state }: { state: DexState }) {
  const glowColors: Record<DexState, string> = {
    idle:      "rgba(0,212,255,0.14)",
    thinking:  "rgba(168,85,247,0.18)",
    speaking:  "rgba(0,255,136,0.16)",
    listening: "rgba(249,115,22,0.16)",
  };

  return (
    <div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{
        background: `radial-gradient(circle at 50% 55%, ${glowColors[state]} 0%, transparent 68%)`,
        transition: "background 1s ease",
      }}
    />
  );
}

// ─── Pulse ring (CSS, outside canvas) ────────────────────────────────────────

function PulseRing({ state }: { state: DexState }) {
  const ringColors: Record<DexState, string> = {
    idle:      "rgba(0,212,255,0.25)",
    thinking:  "rgba(168,85,247,0.3)",
    speaking:  "rgba(0,255,136,0.28)",
    listening: "rgba(249,115,22,0.28)",
  };

  const shouldAnimate = state !== "idle";

  return (
    <div
      className="absolute inset-0 rounded-full pointer-events-none border"
      style={{
        borderColor:  ringColors[state],
        animation:    shouldAnimate ? "dexPulse 1.4s ease-out infinite" : "none",
        transition:   "border-color 0.6s ease",
      }}
    />
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface DexAvatarProps {
  state?: DexState;
  size?:  number;
}

export default function DexAvatar({ state = "idle", size = 280 }: DexAvatarProps) {
  return (
    <>
      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes dexPulse {
          0%   { transform: scale(1);    opacity: 0.8; }
          70%  { transform: scale(1.12); opacity: 0;   }
          100% { transform: scale(1);    opacity: 0;   }
        }
      `}</style>

      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center select-none"
      >
        <GlowBackdrop state={state} />
        <PulseRing    state={state} />

        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 42 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true, alpha: true }}
        >
          <SceneLights  state={state} />
          <InnerGlow    state={state} />
          <OrbCore      state={state} />
          <Ring1        state={state} />
          <Ring2        state={state} />
          <Particles    state={state} />
        </Canvas>
      </div>
    </>
  );
}
