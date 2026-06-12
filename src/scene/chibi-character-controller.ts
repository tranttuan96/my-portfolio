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

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = targetHeight / size.y;
    model.scale.setScalar(scale);
    // feet on local ground
    const scaledBox = new THREE.Box3().setFromObject(model);
    model.position.y -= scaledBox.min.y;

    this.root.add(model);
    this.mixer = new THREE.AnimationMixer(model);

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
