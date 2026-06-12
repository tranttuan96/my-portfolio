import * as THREE from 'three';

/**
 * Doctor Strange-style portal: two counter-rotating emissive rings + orbiting
 * spark particles. Attach the group to the character anchor; call update(dt)
 * every frame and dissolve() when landing.
 */
export class MagicRingEffect {
  readonly group = new THREE.Group();
  private ringA: THREE.Mesh;
  private ringB: THREE.Mesh;
  private sparks: THREE.Points;
  private sparkAngles: Float32Array;
  private dissolving = false;
  private opacity = 1;

  constructor(radius = 0.85) {
    const matA = new THREE.MeshBasicMaterial({
      color: 0xffb03f, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const matB = matA.clone();
    matB.color = new THREE.Color(0xffd23f);

    this.ringA = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.015, 8, 64), matA);
    this.ringB = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.88, 0.01, 8, 64), matB);
    // Rings lie flat-ish, tilted for the "spell circle" look
    this.ringA.rotation.x = Math.PI / 2.6;
    this.ringB.rotation.x = Math.PI / 2.6;
    this.group.add(this.ringA, this.ringB);

    const count = 90;
    this.sparkAngles = new Float32Array(count);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) this.sparkAngles[i] = Math.random() * Math.PI * 2;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sparks = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xffe9a0, size: 0.035, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    this.group.add(this.sparks);
    this.radius = radius;
  }

  private radius: number;
  private time = 0;

  update(dt: number): void {
    this.time += dt;
    this.ringA.rotation.z += dt * 1.6;
    this.ringB.rotation.z -= dt * 2.3;

    const positions = this.sparks.geometry.attributes.position as THREE.BufferAttribute;
    const r = this.radius * (this.dissolving ? 1 + (1 - this.opacity) * 2.2 : 1);
    for (let i = 0; i < this.sparkAngles.length; i++) {
      const a = this.sparkAngles[i] + this.time * (0.8 + (i % 5) * 0.12);
      const wobble = Math.sin(this.time * 2 + i) * 0.05;
      positions.setXYZ(i, Math.cos(a) * r, Math.sin(a * 1.7 + i) * 0.12 + wobble, Math.sin(a) * r * 0.42);
    }
    positions.needsUpdate = true;

    if (this.dissolving) {
      this.opacity = Math.max(0, this.opacity - dt * 1.4);
      (this.ringA.material as THREE.MeshBasicMaterial).opacity = this.opacity;
      (this.ringB.material as THREE.MeshBasicMaterial).opacity = this.opacity;
      (this.sparks.material as THREE.PointsMaterial).opacity = this.opacity;
      if (this.opacity === 0) this.group.visible = false;
    }
  }

  /** Burst the ring into drifting sparks, then hide. */
  dissolve(): void {
    this.dissolving = true;
  }

  reset(): void {
    this.dissolving = false;
    this.opacity = 1;
    this.group.visible = true;
    (this.ringA.material as THREE.MeshBasicMaterial).opacity = 1;
    (this.ringB.material as THREE.MeshBasicMaterial).opacity = 1;
    (this.sparks.material as THREE.PointsMaterial).opacity = 1;
  }
}
