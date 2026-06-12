import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Loads the avatar glb, owns its AnimationMixer and exposes crossfaded states.
 * Clip aliases let the final Mixamo rig (Fly/Land/Wave/Sit/Type) and the
 * staging fallback model (Idle/Jump/Wave/Sitting...) share one controller.
 */
const CLIP_ALIASES: Record<string, string[]> = {
  Fly: ['Fly', 'Flying', 'Idle'],
  Land: ['Land', 'Landing', 'Jump'],
  Wave: ['Wave', 'Waving'],
  Sit: ['Sit', 'Sitting', 'SitDown'],
  Type: ['Type', 'Typing', 'Sitting', 'Idle'],
};

export class ChibiCharacterController {
  readonly root = new THREE.Group();
  private mixer!: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;

  /** targetHeight: world meters the character should stand tall. */
  async load(url: string, targetHeight = 1.05): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(url);
    const model = gltf.scene;

    // animated skinned meshes move outside their bind-pose bounds — without
    // this three.js frustum-culls the character into invisibility
    model.traverse((node) => {
      const mesh = node as THREE.SkinnedMesh;
      if (!mesh.isSkinnedMesh) return;
      mesh.frustumCulled = false;
      // single-sided + matte — double-sided rendering reads as translucent
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.side = THREE.FrontSide;
      if (material.roughness < 0.85) material.roughness = 0.9;
    });

    // Measure the SKINNED bounds (bones often live in another unit space —
    // Mixamo exports cm — so the static geometry bbox lies wildly)
    this.root.add(model);
    let skinned: THREE.SkinnedMesh | null = null;
    model.traverse((node) => {
      if ((node as THREE.SkinnedMesh).isSkinnedMesh) skinned = node as THREE.SkinnedMesh;
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = targetHeight / size.y;
    model.scale.setScalar(scale);
    const scaledBox = new THREE.Box3().setFromObject(model);
    model.position.y -= scaledBox.min.y; // feet on ground

    this.mixer = new THREE.AnimationMixer(model);

    // Mixamo clips arrive with bone position/scale keyframes in mixed units
    // (cm vs the rig's meters) — the standard cleanup: keep rotations, keep a
    // unit-corrected hips position (sit/crouch height), drop everything else.
    if (skinned) {
      const hips = (skinned as THREE.SkinnedMesh).skeleton.bones[0];
      const restLength = hips.position.length();
      for (const clip of gltf.animations) {
        const hipsTrack = clip.tracks.find(
          (t) => t.name.endsWith('.position') && t.name.includes(hips.name)
        );
        if (hipsTrack) {
          let sum = 0;
          const n = hipsTrack.values.length / 3;
          for (let i = 0; i < n; i++) {
            sum += Math.hypot(hipsTrack.values[i * 3], hipsTrack.values[i * 3 + 1], hipsTrack.values[i * 3 + 2]);
          }
          const factor = restLength / (sum / n);
          if (factor < 0.5 || factor > 2) {
            for (let i = 0; i < hipsTrack.values.length; i++) hipsTrack.values[i] *= factor;
          }
          // in-place: keep only the height channel so clips never drag the
          // character away from where the sequence placed it
          for (let i = 0; i < hipsTrack.values.length / 3; i++) {
            hipsTrack.values[i * 3] = hips.position.x;
            hipsTrack.values[i * 3 + 2] = hips.position.z;
          }
        }
        clip.tracks = clip.tracks.filter(
          (t) => t.name.endsWith('.quaternion') || t === hipsTrack
        );
      }
    }

    for (const [state, aliases] of Object.entries(CLIP_ALIASES)) {
      for (const alias of aliases) {
        const clip = THREE.AnimationClip.findByName(gltf.animations, alias);
        if (clip) {
          this.actions.set(state, this.mixer.clipAction(clip));
          break;
        }
      }
    }
  }

  /** Crossfade to a named state. Loop once for transitional states. */
  play(state: string, fadeSeconds = 0.3, once = false): void {
    const next = this.actions.get(state);
    if (!next || next === this.current) return;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.play();
    if (this.current) this.current.crossFadeTo(next, fadeSeconds, false);
    this.current = next;
  }

  hasState(state: string): boolean {
    return this.actions.has(state);
  }

  update(dt: number): void {
    this.mixer?.update(dt);
  }

  /** World-space position of the head area (for the speech bubble anchor). */
  headAnchor(target: THREE.Vector3): THREE.Vector3 {
    const box = new THREE.Box3().setFromObject(this.root);
    target.set((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
    return target;
  }
}
