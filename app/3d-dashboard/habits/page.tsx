'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HabitsGardenPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 12);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    scene.add(directionalLight);

    // Create plant/habit models
    const habits = [
      { x: -4, color: 0x4ade80, streak: 12, label: 'Morning Exercise' },
      { x: 0, color: 0x60a5fa, streak: 8, label: 'Meditation' },
      { x: 4, color: 0xfbbf24, streak: 5, label: 'Learning' },
    ];

    habits.forEach((habit) => {
      // Plant stem
      const stemGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
      const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4ade80 });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.x = habit.x;
      stem.castShadow = true;
      stem.receiveShadow = true;
      scene.add(stem);

      // Flower/leaves (sphere)
      const flowerGeometry = new THREE.SphereGeometry(1, 16, 16);
      const flowerMaterial = new THREE.MeshStandardMaterial({
        color: habit.color,
        metalness: 0.2,
        roughness: 0.5,
      });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      flower.position.set(habit.x, 2.5, 0);
      flower.castShadow = true;
      flower.receiveShadow = true;
      scene.add(flower);

      // Bloom glow for high-streak habits
      if (habit.streak >= 10) {
        const bloomGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const bloomMaterial = new THREE.MeshStandardMaterial({
          color: habit.color,
          transparent: true,
          opacity: 0.3,
        });
        const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial);
        bloom.position.set(habit.x, 2.5, 0);
        scene.add(bloom);
      }
    });

    // Garden ground
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5a3d,
      metalness: 0.1,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 80;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (particles) {
        particles.rotation.x += 0.00003;
        particles.rotation.y += 0.00006;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0" ref={containerRef} />
      <div className="absolute inset-0 z-5 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

      <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 pointer-events-auto"
        >
          <Link href="/3d-dashboard" className="text-green-400 hover:text-green-300 text-sm mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-5xl font-bold text-green-400">Habits Garden</h1>
          <p className="text-gray-300 mt-2">Grow your daily rituals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 pointer-events-auto"
        >
          <div className="bg-black/50 backdrop-blur border border-green-500/30 rounded-lg p-6 max-w-md">
            <h2 className="text-green-400 font-bold mb-4">Current Streaks</h2>
            <div className="space-y-4">
              {[
                { name: 'Morning Exercise', streak: 12, emoji: '🔥' },
                { name: 'Meditation', streak: 8, emoji: '✨' },
                { name: 'Learning', streak: 5, emoji: '📚' },
              ].map((habit, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-300">{habit.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{habit.emoji}</span>
                    <span className="text-green-400 font-bold">{habit.streak} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
