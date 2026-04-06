'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MoodObservatoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting with dynamic sky
    const ambientLight = new THREE.AmbientLight(0xff9900, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffaa44, 0.8);
    directionalLight.position.set(20, 25, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Observatory dome
    const domeGeometry = new THREE.IcosahedronGeometry(6, 4);
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5a6d,
      metalness: 0.6,
      roughness: 0.3,
      wireframe: false,
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.castShadow = true;
    dome.receiveShadow = true;
    scene.add(dome);

    // Center sphere (mood indicator)
    const moodGeometry = new THREE.SphereGeometry(2, 32, 32);
    const moodMaterial = new THREE.MeshStandardMaterial({
      color: 0xff9500,
      emissive: 0xff9500,
      emissiveIntensity: 0.4,
      metalness: 0.3,
      roughness: 0.4,
    });
    const mood = new THREE.Mesh(moodGeometry, moodMaterial);
    mood.position.y = 5;
    mood.castShadow = true;
    mood.receiveShadow = true;
    scene.add(mood);

    // Mood energy rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(2.5 + i * 1.2, 0.2, 16, 100);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.08 + i * 0.02, 1, 0.5),
        emissive: new THREE.Color().setHSL(0.08 + i * 0.02, 1, 0.5),
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.y = 5;
      ring.rotation.x = Math.PI / 4;
      scene.add(ring);
    }

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a3a52,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Weather particles (clouds)
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = 5 + Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (mood) {
        mood.rotation.x += 0.001;
        mood.rotation.y += 0.002;
      }

      if (particles) {
        particles.rotation.y += 0.0002;
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
          <Link href="/3d-dashboard" className="text-orange-400 hover:text-orange-300 text-sm mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-5xl font-bold text-orange-400">Mood Observatory</h1>
          <p className="text-gray-300 mt-2">Track your emotional weather</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 pointer-events-auto"
        >
          <div className="bg-black/50 backdrop-blur border border-orange-500/30 rounded-lg p-6 max-w-md">
            <h2 className="text-orange-400 font-bold mb-4">Today's Mood</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Overall Mood</span>
                  <span className="text-orange-400">7/10</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div className="w-70% h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Energy Level</span>
                  <span className="text-orange-400">6/10</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div className="w-60% h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
