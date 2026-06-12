import type * as THREE from 'three';
import { getLang, onLangChange, type Lang } from '../i18n/set-language';

const GREETING: Record<Lang, string> = { en: 'Hello! 👋', vi: 'Xin chào! 👋' };

/**
 * HTML speech bubble anchored above the character's head — 3D position
 * projected to screen space every frame.
 */
export class SpeechBubble {
  private el: HTMLElement;
  private visible = false;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'speech-bubble';
    this.el.hidden = true;
    container.appendChild(this.el);
    onLangChange(() => {
      if (this.visible) this.el.textContent = GREETING[getLang()];
    });
  }

  show(durationMs = 2200): void {
    this.el.textContent = GREETING[getLang()];
    this.el.hidden = false;
    requestAnimationFrame(() => this.el.classList.add('pop'));
    this.visible = true;
    setTimeout(() => this.hide(), durationMs);
  }

  hide(): void {
    this.el.classList.remove('pop');
    this.visible = false;
    setTimeout(() => {
      if (!this.visible) this.el.hidden = true;
    }, 200);
  }

  /** Call each frame with the head world position + camera. */
  track(headWorld: THREE.Vector3, camera: THREE.Camera, canvas: HTMLCanvasElement): void {
    if (!this.visible) return;
    const projected = headWorld.clone().project(camera);
    const x = (projected.x * 0.5 + 0.5) * canvas.clientWidth;
    const y = (-projected.y * 0.5 + 0.5) * canvas.clientHeight;
    this.el.style.transform = `translate(-50%, -110%) translate(${x}px, ${y}px)`;
  }
}
