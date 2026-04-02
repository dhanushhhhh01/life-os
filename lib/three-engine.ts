import * as THREE from 'three';

/**
 * Three.js Engine Setup
 * Provides utilities for WebGL/3D rendering on Dex landing page
 */

export class DexThreeEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 100, 1000);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 30;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.setupLighting();
    this.handleResize();
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point lights for accent colors (cyan & violet)
    const cyanLight = new THREE.PointLight(0x00d9ff, 0.5);
    cyanLight.position.set(-20, 10, 20);
    this.scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa78bfa, 0.5);
    violetLight.position.set(20, 10, -20);
    this.scene.add(violetLight);
  }

  private handleResize() {
    window.addEventListener('resize', () => {
      this.width = this.canvas.clientWidth;
      this.height = this.canvas.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  createNeuralNetwork(particleCount: number = 150): THREE.Group {
    const group = new THREE.Group();

    // Create particles
    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({
        color: 0x00d9ff,
        size: 0.3,
        sizeAttenuation: true,
      })
    );

    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = (Math.random() - 0.5) * 60;

      velocities[i] = (Math.random() - 0.5) * 0.1;
      velocities[i + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i + 2] = (Math.random() - 0.5) * 0.1;
    }

    particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.userData.velocities = velocities;
    group.add(particles);

    // Store animation data
    group.userData.animate = (time: number) => {
      const pos = particles.geometry.attributes.position.array as Float32Array;
      const vels = particles.userData.velocities as Float32Array;

      for (let i = 0; i < particleCount * 3; i += 3) {
        pos[i] += vels[i];
        pos[i + 1] += vels[i + 1];
        pos[i + 2] += vels[i + 2];

        // Bounce off boundaries
        if (Math.abs(pos[i]) > 30) vels[i] *= -1;
        if (Math.abs(pos[i + 1]) > 30) vels[i + 1] *= -1;
        if (Math.abs(pos[i + 2]) > 30) vels[i + 2] *= -1;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.x += 0.0001;
      particles.rotation.y += 0.0002;
    };

    return group;
  }

  createFloatingOrb(color: string = '#00d9ff', size: number = 5): THREE.Mesh {
    const geometry = new THREE.IcosahedronGeometry(size, 16);
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      wireframe: false,
    });

    const orb = new THREE.Mesh(geometry, material);
    orb.castShadow = true;
    orb.receiveShadow = true;

    // Animation data
    orb.userData.floatAmount = Math.random() * 2;
    orb.userData.floatSpeed = 0.5 + Math.random() * 0.5;
    orb.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
    orb.userData.originalY = orb.position.y;

    return orb;
  }

  createDataVisualization(
    type: 'goals' | 'habits' | 'journal' | 'mood'
  ): THREE.Group {
    const group = new THREE.Group();

    switch (type) {
      case 'goals':
        this.createGoalsVisualization(group);
        break;
      case 'habits':
        this.createHabitsVisualization(group);
        break;
      case 'journal':
        this.createJournalVisualization(group);
        break;
      case 'mood':
        this.createMoodVisualization(group);
        break;
    }

    return group;
  }

  private createGoalsVisualization(group: THREE.Group) {
    // Create ascending spheres representing goal progress
    const colors = [0x00d9ff, 0x7c3aed, 0xa78bfa];

    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(1 + i * 0.3, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = i * 3;
      mesh.castShadow = true;
      group.add(mesh);

      mesh.userData.rotationSpeed = 0.002 + Math.random() * 0.003;
    }
  }

  private createHabitsVisualization(group: THREE.Group) {
    // Create boxes in a grid representing habits
    const size = 2;
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
          color: 0xa78bfa,
          emissive: 0xa78bfa,
          emissiveIntensity: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x * 3.5, 0, z * 3.5);
        mesh.castShadow = true;
        group.add(mesh);

        mesh.userData.floatAmount = Math.random() * 1;
        mesh.userData.floatSpeed = 0.3 + Math.random() * 0.3;
      }
    }
  }

  private createJournalVisualization(group: THREE.Group) {
    // Create scrolling paper-like planes
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.PlaneGeometry(8, 12);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00d9ff,
        emissive: 0x00d9ff,
        emissiveIntensity: 0.1,
        wireframe: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(i * 5 - 5, 0, 0);
      mesh.rotation.y = (Math.PI / 8) * (i - 1);
      group.add(mesh);

      mesh.userData.scrollSpeed = 0.1 + Math.random() * 0.1;
    }
  }

  private createMoodVisualization(group: THREE.Group) {
    // Create a torus knot representing mood states
    const geometry = new THREE.TorusKnotGeometry(3, 1, 100, 16);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.4,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    group.add(mesh);

    mesh.userData.rotationSpeed = 0.002;
  }

  animate(callback?: () => void) {
    const renderFrame = (time: number) => {
      this.animationId = requestAnimationFrame(renderFrame);

      // Animate scene objects
      this.scene.children.forEach((child) => {
        if (child.userData.animate) {
          child.userData.animate(time);
        }

        // Apply rotations
        if (child.userData.rotationSpeed) {
          child.rotation.x += child.userData.rotationSpeed;
          child.rotation.y += child.userData.rotationSpeed * 1.5;
        }

        // Apply floating
        if (child.userData.floatAmount !== undefined) {
          child.position.y =
            (child.userData.originalY || 0) +
            Math.sin(time * child.userData.floatSpeed * 0.001) *
              child.userData.floatAmount;
        }
      });

      this.renderer.render(this.scene, this.camera);

      if (callback) callback();
    };

    renderFrame(0);
  }

  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }

  addObject(object: THREE.Object3D) {
    this.scene.add(object);
  }

  removeObject(object: THREE.Object3D) {
    this.scene.remove(object);
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }
}
