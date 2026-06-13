import * as THREE from 'three';

/**
 * Grounds the desk on a lit podium and adds a warm desk lamp + cool laptop
 * screen glow — turns the "floating furniture in a void" look into a cosy,
 * intentional little workspace. Pure primitives, no extra asset fetches.
 */
export class StageDressing {
  readonly group = new THREE.Group();
  private ringMaterial: THREE.MeshBasicMaterial;
  private time = 0;

  constructor() {
    this.group.add(this.buildPodium());
    this.ringMaterial = this.buildGlowRing();
    this.group.add(this.buildDeskLamp());
    this.group.add(this.buildScreenGlow());
  }

  private buildPodium(): THREE.Mesh {
    // dark matte disc the desk + chair sit on (top flush with y = 0)
    const geo = new THREE.CylinderGeometry(1.75, 1.9, 0.16, 64);
    const mat = new THREE.MeshStandardMaterial({ color: 0x16122b, roughness: 0.85, metalness: 0.1 });
    const podium = new THREE.Mesh(geo, mat);
    podium.position.y = -0.08;
    return podium;
  }

  private buildGlowRing(): THREE.MeshBasicMaterial {
    // accent-coloured rim around the podium edge — ties into the site palette
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffd23f,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.012, 8, 80), mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.012;
    this.group.add(ring);
    return mat;
  }

  private buildDeskLamp(): THREE.Group {
    const lamp = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x2c2350, roughness: 0.5, metalness: 0.6 });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 20), metal);
    base.position.set(0, 0.015, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 12), metal);
    stem.position.set(0, 0.23, 0);
    stem.rotation.z = 0.12;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 12), metal);
    arm.position.set(0.12, 0.45, 0.05);
    arm.rotation.set(Math.PI / 2.3, 0, -0.7);

    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.16, 20, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide })
    );
    shade.position.set(0.28, 0.52, 0.12);
    shade.rotation.set(2.5, 0, -0.4);
    // glowing bulb + warm light pooled on the desk
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff0c0 })
    );
    bulb.position.set(0.3, 0.5, 0.16);
    const warm = new THREE.PointLight(0xffcf8f, 6, 3.2, 2);
    warm.position.set(0.34, 0.46, 0.22);

    lamp.add(base, stem, arm, shade, bulb, warm);
    // sit the lamp on the desk's back-left corner
    lamp.position.set(-0.52, 0.75, -0.22);
    return lamp;
  }

  private buildScreenGlow(): THREE.PointLight {
    // cool light from the laptop screen lifts the character's face when seated
    const glow = new THREE.PointLight(0x9fc6ff, 2.4, 1.6, 2);
    glow.position.set(0, 0.92, -0.2);
    return glow;
  }

  update(dt: number): void {
    this.time += dt;
    // gentle pulse on the podium rim
    this.ringMaterial.opacity = 0.55 + Math.sin(this.time * 1.5) * 0.18;
  }
}
