import * as THREE from 'three';
import gsap from 'gsap';
import type { ChibiCharacterController } from './chibi-character-controller';
import type { FloatingDevices } from './floating-devices';
import type { MagicRingEffect } from './magic-ring-effect';
import type { HeroChibiScene } from './hero-chibi-scene';

export interface IntroCallbacks {
  onWave?: () => void; // show speech bubble
  onSettled?: () => void; // intro finished → enable controls, swap Skip→Replay
}

/** Storyboard positions (world space) */
const SKY_ENTRY = new THREE.Vector3(0.75, 2.4, 0.3);
const LANDING_SPOT = new THREE.Vector3(0.75, 0, 0.3);
const CHAIR_SEAT = new THREE.Vector3(0, 0.03, -0.68);
/** Glide path around the desk's right edge — desk spans x ±0.7, z ±0.35 */
const TO_CHAIR_WAYPOINTS = [
  LANDING_SPOT,
  new THREE.Vector3(1.1, 0.06, -0.15),
  new THREE.Vector3(0.6, 0.1, -1.0),
  CHAIR_SEAT,
];

/**
 * Master timeline: FLY_IN → LAND (+devices→desk) → WAVE → SIT → TYPE_LOOP.
 * skip() jumps straight to the settled end state; replay() rewinds everything.
 */
export class IntroAnimationSequence {
  private timeline: gsap.core.Timeline | null = null;
  private settled = false;

  constructor(
    private stage: HeroChibiScene,
    private character: ChibiCharacterController,
    private devices: FloatingDevices,
    private ring: MagicRingEffect,
    private callbacks: IntroCallbacks = {}
  ) {}

  play(): void {
    this.settled = false;
    this.stage.disableOrbitControls();
    const char = this.character.root;
    const cam = this.stage.camera;

    char.position.copy(SKY_ENTRY);
    char.rotation.y = Math.PI * 0.12;
    this.ring.reset();
    this.devices.resetToOrbit();
    this.character.play('Fly', 0.01);

    cam.position.set(2.4, 2.2, 3.4);

    const tl = gsap.timeline();
    this.timeline = tl;

    // FLY_IN 0–2s: descend; ring + devices follow via onFrame anchors
    tl.to(char.position, { y: LANDING_SPOT.y, duration: 2.0, ease: 'power2.in' }, 0);
    tl.to(cam.position, { x: 1.7, y: 1.5, z: 2.7, duration: 2.4, ease: 'power2.out', onUpdate: () => cam.lookAt(0, 0.7, 0) }, 0);

    // LAND 2–3.5s
    tl.call(() => {
      this.character.play('Land', 0.15, true);
      this.ring.dissolve();
      this.devices.flyToDesk();
    }, undefined, 2.0);

    // WAVE 3.5–5.5s: face the camera and greet
    tl.call(() => {
      this.character.play('Wave', 0.25, true);
      this.callbacks.onWave?.();
    }, undefined, 3.5);
    tl.to(char.rotation, { y: 0.35, duration: 0.4 }, 3.5); // face the camera

    // GLIDE 5.6–6.9s: float AROUND the desk's right edge (never through it),
    // facing the direction of travel
    const path = new THREE.CatmullRomCurve3(TO_CHAIR_WAYPOINTS, false, 'catmullrom', 0.3);
    const glide = { t: 0 };
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    tl.call(() => this.character.play('Fly', 0.3), undefined, 5.6);
    tl.to(glide, {
      t: 1, duration: 1.3, ease: 'power1.inOut',
      onUpdate: () => {
        path.getPoint(glide.t, point);
        char.position.copy(point);
        path.getTangent(glide.t, tangent);
        const target = Math.atan2(tangent.x, tangent.z);
        // shortest-arc lerp keeps the turn smooth
        let delta = target - char.rotation.y;
        delta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI;
        char.rotation.y += delta * 0.18;
      },
    }, 5.6);

    // SIT 6.9–8.2s: settle into the chair facing the desk (+z, toward camera)
    tl.to(char.rotation, { y: 0, duration: 0.4 }, 6.9);
    tl.call(() => this.character.play('Sit', 0.35, true), undefined, 7.0);

    // TYPE ~8.2s+: sit-to-type transition if available, then idle loop
    tl.call(() => {
      if (this.character.hasState('SitToType')) {
        this.character.play('SitToType', 0.3, true);
        gsap.delayedCall(0.9, () => this.character.play('Type', 0.35));
      } else {
        this.character.play('Type', 0.4);
      }
      this.finish();
    }, undefined, 8.2);
  }

  /** Jump to the end state instantly (Skip button / Esc / revisit). */
  skip(): void {
    this.timeline?.kill();
    gsap.killTweensOf(this.character.root.position);
    gsap.killTweensOf(this.character.root.rotation);
    this.ring.dissolve();
    this.devices.flyToDesk();

    const char = this.character.root;
    char.position.copy(CHAIR_SEAT);
    char.rotation.y = 0;
    this.character.play('Type', 0.05);

    this.stage.camera.position.set(1.7, 1.5, 2.7);
    this.stage.camera.lookAt(0, 0.7, 0);
    this.finish();
  }

  replay(): void {
    this.play();
  }

  get isSettled(): boolean {
    return this.settled;
  }

  private finish(): void {
    if (this.settled) return;
    this.settled = true;
    this.stage.enableOrbitControls();
    this.callbacks.onSettled?.();
  }
}
