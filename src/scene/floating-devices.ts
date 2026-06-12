import * as THREE from 'three';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface DeviceSpec {
  file: string;
  /** resting transform on/around the desk (world space) */
  restPosition: [number, number, number];
  restRotationY: number;
  /** orbit ring placement while flying */
  orbitRadius: number;
  orbitPhase: number;
  orbitHeight: number;
}

const DEVICES: DeviceSpec[] = [
  { file: 'laptop.glb', restPosition: [0, 0.75, -0.08], restRotationY: Math.PI, orbitRadius: 0.75, orbitPhase: 0, orbitHeight: 0.15 },
  { file: 'keyboard.glb', restPosition: [0, 0.75, -0.27], restRotationY: Math.PI, orbitRadius: 0.8, orbitPhase: 2.1, orbitHeight: -0.1 },
  { file: 'mouse.glb', restPosition: [0.27, 0.75, -0.27], restRotationY: Math.PI, orbitRadius: 0.7, orbitPhase: 4.2, orbitHeight: 0.35 },
  { file: 'mug.glb', restPosition: [-0.45, 0.75, -0.15], restRotationY: 0, orbitRadius: 0.85, orbitPhase: 5.4, orbitHeight: -0.3 },
];

/**
 * The work devices: orbit the flying character like spell artifacts, then fly
 * along curved paths to their exact resting spots on the desk (the intro's
 * signature beat).
 */
export class FloatingDevices {
  readonly group = new THREE.Group();
  private items: Array<{ object: THREE.Group; spec: DeviceSpec }> = [];
  private orbiting = true;
  private time = 0;
  /** anchor the orbit follows (the character's chest height) */
  readonly anchor = new THREE.Vector3();

  async load(basePath = '/props/'): Promise<void> {
    const loader = new GLTFLoader();
    await Promise.all(
      DEVICES.map(async (spec) => {
        const gltf = await loader.loadAsync(basePath + spec.file);
        const object = gltf.scene;
        this.group.add(object);
        this.items.push({ object, spec });
      })
    );
  }

  update(dt: number): void {
    if (!this.orbiting) return;
    this.time += dt;
    for (const { object, spec } of this.items) {
      const a = this.time * 1.1 + spec.orbitPhase;
      object.position.set(
        this.anchor.x + Math.cos(a) * spec.orbitRadius,
        this.anchor.y + spec.orbitHeight + Math.sin(this.time * 2 + spec.orbitPhase) * 0.06,
        this.anchor.z + Math.sin(a) * spec.orbitRadius
      );
      object.rotation.y += dt * 1.4;
      object.rotation.x = Math.sin(this.time + spec.orbitPhase) * 0.25;
    }
  }

  /** Send every device along a bezier to its desk spot. Returns total duration (s). */
  flyToDesk(): number {
    this.orbiting = false;
    const duration = 1.1;
    this.items.forEach(({ object, spec }, index) => {
      const start = object.position.clone();
      const end = new THREE.Vector3(...spec.restPosition);
      const mid = start.clone().lerp(end, 0.5);
      mid.y += 0.5; // arc over the desk
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const progress = { t: 0 };
      const startRotX = object.rotation.x;
      const startRotY = object.rotation.y;
      const endRotY = spec.restRotationY;
      gsap.to(progress, {
        t: 1,
        duration,
        delay: index * 0.12,
        ease: 'power2.inOut',
        onUpdate: () => {
          curve.getPoint(progress.t, object.position);
          object.rotation.x = startRotX * (1 - progress.t);
          object.rotation.y = startRotY + (endRotY - startRotY) * progress.t;
          object.rotation.z = 0;
        },
      });
    });
    return duration + (this.items.length - 1) * 0.12;
  }

  /** Reset to orbit mode for replay. */
  resetToOrbit(): void {
    gsap.killTweensOf(this.items.map((i) => i.object.position));
    this.orbiting = true;
    this.time = 0;
  }
}
