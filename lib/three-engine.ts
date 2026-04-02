'use client';

/**
 * Three.js Engine Setup
 * Client-side only WebGL/3D rendering for Dex landing page
 */

export class DexThreeEngine {
  scene: any;
  camera: any;
  renderer: any;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  animationId: number | null = null;
  THREE: any;

  constructor(canvas: HTMLCanvasElement) {
    // Lazy load THREE only on client
    import('three').then((threeModule) => {
      this.THREE = threeModule;
      this.initScene();
    });

    this.canvas = canvas;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
  }

  private initScene() {
    const THREE = this.THREE;
    if (!THREE) return;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 100, 1000);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 30;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
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
    const THREE = this.THREE;
    if (!THREE || !this.scene) return;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

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

      if (this.camera) {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
      }

      if (this.renderer) {
        this.renderer.setSize(this.width, this.height);
      }
    });
  }

  createNeuralNetwork(particleCount: number = 150): any {
    const THREE = this.THREE;
    if (!THREE) return null;

    const group = new THREE.Group();

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

    particles.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    particles.userData.velocities = velocities;
    particles.userData.particleCount = particleCount;
    group.add(particles);

    group.userData.animate = (time: number) => {
      const pos = particles.geometry.attributes.position.array as Float32Array;
      const vels = particles.userData.velocities as Float32Array;

      for (let i = 0; i < particleCount * 3; i += 3) {
        pos[i] += vels[i];
        pos[i + 1] += vels[i + 1];
        pos[i + 2] += vels[i + 2];

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

  createFloatingOrb(color: string = '#00d9ff', size: number = 5): any {
    const THREE = this.THREE;
    if (!THREE) return null;

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

    orb.userData.floatAmount = Math.random() * 2;
    orb.userData.floatSpeed = 0.5 + Math.random() * 0.5;
    orb.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
    orb.userData.originalY = orb.position.y;

    return orb;
  }

  createDataVisualization(
    type: 'goals' | 'habits' | 'journal' | 'mood'
  ): any {
    const THREE = this.THREE;
    if (!THREE) return null;

    const group = new THREE.Group();

    switch (type) {
      case 'goals':
        this.createGoalsVisualization(group, THREE);
        break;
      case 'habits':
        this.createHabitsVisualization(group, THREE);
        break;
      case 'journal':
        this.createJournalVisualization(group, THREE);
        break;
      case 'mood':
        this.createMoodVisualization(group, THREE);
        break;
    }

    return group;
  }

  private createGoalsVisualization(group: any, THREE: any) {
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

  private createHabitsVisualization(group: any, THREE: any) {
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

  private createJournalVisualization(group: any, THREE: any) {
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

  private createMoodVisualization(group: any, THREE: any) {
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

      if (this.scene && this.renderer && this.camera) {
        this.scene.children.forEach((child: any) => {
          if (child.userData.animate) {
            child.userData.animate(time);
          }

          if (child.userData.rotationSpeed) {
            child.rotation.x += child.userData.rotationSpeed;
            child.rotation.y += child.userData.rotationSpeed * 1.5;
          }

          if (child.userData.floatAmount !== undefined) {
            child.position.y =
              (child.userData.originalY || 0) +
              Math.sin(time * child.userData.floatSpeed * 0.001) *
                child.userData.floatAmount;
          }
        });

        this.renderer.render(this.scene, this.camera);
      }

      if (callback) callback();
    };

    renderFrame(0);
  }

  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  addObject(object: any) {
    if (this.scene) {
      this.scene.add(object);
    }
  }

  removeObject(object: any) {
    if (this.scene) {
      this.scene.remove(object);
    }
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }
}
