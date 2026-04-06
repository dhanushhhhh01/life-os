'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GoalsMountainPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup for goals visualization
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 3, 0);

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
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create 3 sample mountains (goals)
    const goals = [
      { height: 3, color: 0x4ade80, progress: 100, label: 'German B1' },
      { height: 2.5, color: 0x60a5fa, progress: 65, label: 'AI/Robotics Study' },
      { height: 2, color: 0xc084fc, progress: 40, label: 'Internship Ready' },
    ];

    goals.forEach((goal, index) => {
      const mountainGeometry = new THREE.ConeGeometry(goal.height * 0.8, goal.height, 32);
      const mountainMaterial = new THREE.MeshStandardMaterial({
        color: goal.color,
        metalness: 0.3,
        roughness: 0.4,
      });
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.x = (index - 1) * 4;
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      scene.add(mountain);

      // Progress indicator - glowing band around mountain
      const bandGeometry = new THREE.TorusGeometry(goal.height * 0.4, 0.2, 16, 100);
      const bandMaterial = new THREE.MeshStandardMaterial({
        color: goal.color,
        emissive: goal.color,
        emissiveIntensity: 0.5,
      });
      const band = new THREE.Mesh(bandGeometry, bandMaterial);
      band.position.set(mountain.position.x, (goal.height / 2) * (goal.progress / 100), 0);
      scene.add(band);

      // Summit flag for completed goals
      if (goal.progress === 100) {
        const flagGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.05);
        const flagMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(mountain.position.x, goal.height + 0.3, 0);
        scene.add(flag);
      }
    });

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a52,
      metalness: 0.2,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 15;
      positions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (particles) {
        particles.rotation.x += 0.00002;
        particles.rotation.y += 0.00005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
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
      {/* 3D Mountains Background */}
      <div className="absolute inset-0 z-0" ref={containerRef} />

      {/* Overlay */}
      <div className="absolute inset-0 z-5 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

      {/* UI */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="p-8 pointer-events-auto"
        >
          <Link href="/3d-dashboard" className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-5xl font-bold text-cyan-400">Goals Mountain</h1>
          <p className="text-gray-300 mt-2">Climb towards your ambitions</p>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 pointer-events-auto"
        >
          <div className="bg-black/50 backdrop-blur border border-cyan-500/30 rounded-lg p-6 max-w-md">
            <h2 className="text-cyan-400 font-bold mb-4">Active Goals</h2>
            <div className="space-y-3">
              {[
                { name: 'German B1', progress: 100 },
                { name: 'AI/Robotics Study', progress: 65 },
                { name: 'Internship Ready', progress: 40 },
              ].map((goal, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{goal.name}</span>
                    <span className="text-cyan-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${goal.progress}%` }}
                    />
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
