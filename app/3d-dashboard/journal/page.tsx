// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function JournalLibraryPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create floating books
    const bookColors = [
      0xb24bff, // Purple
      0xc084fc, // Light purple
      0xa855f7, // Dark purple
      0x9333ea, // Darker purple
      0x7c3aed, // Indigo
    ];

    const books = [];
    bookColors.forEach((color, index) => {
      const bookGeometry = new THREE.BoxGeometry(1, 1.5, 0.2);
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.5,
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.position.set(
        Math.cos((index / bookColors.length) * Math.PI * 2) * 4,
        3 + Math.sin(index * 0.5) * 2,
        Math.sin((index / bookColors.length) * Math.PI * 2) * 4
      );
      book.rotation.z = Math.random() * 0.5;
      book.castShadow = true;
      book.receiveShadow = true;
      scene.add(book);
      books.push(book);

      // Glow around book
      const glowGeometry = new THREE.BoxGeometry(1.1, 1.6, 0.3);
      const glowMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(book.position);
      glow.rotation.copy(book.rotation);
      scene.add(glow);
    });

    // Bookshelf support
    const shelfGeometry = new THREE.BoxGeometry(10, 0.3, 8);
    const shelfMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      metalness: 0.1,
      roughness: 0.8,
    });
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.y = 1.5;
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    scene.add(shelf);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0e0e,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Particles (magical dust)
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xb24bff,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Float and rotate books
      books.forEach((book, idx) => {
        book.rotation.y += 0.003;
        book.position.y += Math.sin(Date.now() * 0.001 + idx) * 0.0005;
      });

      if (particles) {
        particles.rotation.y += 0.0001;
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
          <Link href="/3d-dashboard" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-5xl font-bold text-purple-400">Journal Library</h1>
          <p className="text-gray-300 mt-2">Explore your memories and reflections</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="p-8 pointer-events-auto"
        >
          <div className="bg-black/50 backdrop-blur border border-purple-500/30 rounded-lg p-6 max-w-md">
            <h2 className="text-purple-400 font-bold mb-4">Recent Entries</h2>
            <div className="space-y-3">
              {[
                { date: 'Today', mood: '😊', preview: 'Great day of learning...' },
                { date: 'Yesterday', mood: '🤔', preview: 'Reflected on goals...' },
                { date: '2 days ago', mood: '💪', preview: 'Completed a milestone...' },
              ].map((entry, idx) => (
                <div key={idx} className="p-3 rounded border border-purple-500/20 bg-purple-900/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">{entry.date}</span>
                    <span className="text-lg">{entry.mood}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{entry.preview}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
