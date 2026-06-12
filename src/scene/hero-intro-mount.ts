import * as THREE from 'three';
import { HeroChibiScene } from './hero-chibi-scene';
import { ChibiCharacterController } from './chibi-character-controller';
import { FloatingDevices } from './floating-devices';
import { MagicRingEffect } from './magic-ring-effect';
import { IntroAnimationSequence } from './intro-animation-sequence';
import { SpeechBubble } from '../ui/speech-bubble';

const SEEN_KEY = 'hero-intro-seen';

/**
 * Wires the whole hero intro together and swaps the tilt-card for the stage.
 * Assumes #heroStage / #stage-canvas / #btnSkip / #btnReplay exist (hidden).
 */
export async function mountHeroIntro(): Promise<void> {
  const stageHost = document.getElementById('heroStage');
  const canvas = document.getElementById('stage-canvas') as HTMLCanvasElement | null;
  const card = document.getElementById('avatarCard');
  const btnSkip = document.getElementById('btnSkip');
  const btnReplay = document.getElementById('btnReplay');
  if (!stageHost || !canvas || !btnSkip || !btnReplay) return;

  const stage = new HeroChibiScene(canvas);
  const character = new ChibiCharacterController();
  const devices = new FloatingDevices();
  const ring = new MagicRingEffect();

  await Promise.all([stage.loadDeskSet(), character.load('/avatar.glb'), devices.load()]);
  stage.scene.add(character.root, devices.group, ring.group);

  const bubble = new SpeechBubble(stageHost);
  const head = new THREE.Vector3();

  const intro = new IntroAnimationSequence(stage, character, devices, ring, {
    onWave: () => bubble.show(),
    onSettled: () => {
      btnSkip.hidden = true;
      btnReplay.hidden = false;
      sessionStorage.setItem(SEEN_KEY, '1');
    },
  });

  stage.onFrame((dt) => {
    character.update(dt);
    ring.update(dt);
    // ring + device orbit follow the character's chest while airborne
    const chest = character.root.position;
    ring.group.position.set(chest.x, chest.y + 0.55, chest.z);
    devices.anchor.set(chest.x, chest.y + 0.6, chest.z);
    devices.update(dt);
    bubble.track(character.headAnchor(head), stage.camera, canvas);
  });

  // click character → quick wave hello again
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  canvas.addEventListener('click', (e) => {
    if (!intro.isSettled) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, stage.camera);
    if (raycaster.intersectObject(character.root, true).length > 0) {
      character.play('Wave', 0.25, true);
      bubble.show(1500);
      setTimeout(() => character.play('Type', 0.35), 2200);
    }
  });

  btnSkip.addEventListener('click', () => intro.skip());
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !intro.isSettled) intro.skip();
  });
  btnReplay.addEventListener('click', () => {
    btnReplay.hidden = true;
    btnSkip.hidden = false;
    intro.replay();
  });

  // swap tilt-card → 3D stage
  if (card?.parentElement) card.parentElement.style.display = 'none';
  stageHost.hidden = false;

  if (sessionStorage.getItem(SEEN_KEY)) intro.skip();
  else intro.play();
}
