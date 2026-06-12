// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Scene3D = ({ children }: { children?: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.022);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, 0);

    // Renderer — mounted inside the container, not document.body
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const cyanGlow = new THREE.PointLight(0x00d4ff, 14, 24);
    cyanGlow.position.set(0, 1, 0);
    scene.add(cyanGlow);

    const purpleGlow = new THREE.PointLight(0x7c3aed, 10, 30);
    purpleGlow.position.set(-6, 4, -4);
    scene.add(purpleGlow);

    // Particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 160;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Central platform
    const platformGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 48);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d6d,
      metalness: 0.45,
      roughness: 0.35,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -2;
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);

    // Glowing rings (inner + slow outer)
    const ringGeometry = new THREE.TorusGeometry(3.2, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 1.6,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = -1.75;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    const outerRingGeometry = new THREE.TorusGeometry(4.4, 0.04, 12, 100);
    const outerRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x7c3aed,
      emissiveIntensity: 1.2,
      metalness: 0.8,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8,
    });
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.position.y = -1.85;
    outerRing.rotation.x = Math.PI / 2;
    scene.add(outerRing);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    const handleMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      particles.rotation.y += 0.0004;
      platform.rotation.y += 0.004;
      ring.rotation.z += 0.01;
      outerRing.rotation.z -= 0.004;

      // breathing glow + floating platform
      cyanGlow.intensity = 12 + Math.sin(t * 1.6) * 4;
      platform.position.y = -2 + Math.sin(t * 0.8) * 0.12;
      ring.position.y = -1.75 + Math.sin(t * 0.8) * 0.12;
      outerRing.position.y = -1.85 + Math.sin(t * 0.8 + 0.6) * 0.1;

      // camera parallax drift toward mouse
      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (5 - mouse.y * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize against container
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationId);
      [particleGeometry, platformGeometry, ringGeometry, outerRingGeometry].forEach((g) => g.dispose());
      [particleMaterial, platformMaterial, ringMaterial, outerRingMaterial].forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
};

export default Scene3D;
