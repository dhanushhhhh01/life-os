'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hub3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera setup - isometric view
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 15, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Central hub platform (main island)
    const platformGeometry = new THREE.CylinderGeometry(4, 5, 1, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d6d,
      metalness: 0.4,
      roughness: 0.3,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);

    // Glowing ring around central platform
    const ringGeometry = new THREE.TorusGeometry(5.2, 0.15, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = 0.6;
    scene.add(ring);

    // Create 4 directional paths (bridges to different zones)
    const createBridge = (posX: number, posZ: number, rotZ: number, color: number, label: string) => {
      // Bridge geometry
      const bridgeGeometry = new THREE.BoxGeometry(1.5, 0.3, 4);
      const bridgeMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.4,
        emissive: color,
        emissiveIntensity: 0.2,
      });
      const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
      bridge.position.set(posX, 0.5, posZ);
      bridge.castShadow = true;
      bridge.receiveShadow = true;
      scene.add(bridge);

      // Endpoint platform (smaller, floating)
      const endGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16);
      const endMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.5,
        roughness: 0.2,
      });
      const endpoint = new THREE.Mesh(endGeometry, endMaterial);
      endpoint.position.set(posX * 3.5, 1.5, posZ * 3.5);
      endpoint.castShadow = true;
      endpoint.receiveShadow = true;
      scene.add(endpoint);

      // Glowing ring around endpoint
      const endRingGeometry = new THREE.TorusGeometry(1.4, 0.1, 16, 100);
      const endRingMaterial = new THREE.MeshBasicMaterial({
        color: color,
        emissive: color,
      });
      const endRing = new THREE.Mesh(endRingGeometry, endRingMaterial);
      endRing.position.set(posX * 3.5, 2, posZ * 3.5);
      scene.add(endRing);

      return { bridge, endpoint, endRing };
    };

    // North: Goals Mountain (cyan)
    createBridge(0, -1, 0, 0x00d4ff, 'Goals');

    // East: Habits Garden (green)
    createBridge(1, 0, Math.PI / 2, 0x00ff88, 'Habits');

    // South: Journal Library (purple)
    createBridge(0, 1, Math.PI, 0xb24bff, 'Journal');

    // West: Mood Observatory (orange)
    createBridge(-1, 0, -Math.PI / 2, 0xff9500, 'Mood');

    // Floating particles background
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate particles
      if (particles) {
        particles.rotation.x += 0.00005;
        particles.rotation.y += 0.0001;
      }

      // Rotate main platform
      if (platform) {
        platform.rotation.y += 0.002;
      }

      // Rotate rings
      if (ring) {
        ring.rotation.z += 0.005;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || width;
      const newHeight = containerRef.current?.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
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
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
      }}
    />
  );
};

export default Hub3D;
