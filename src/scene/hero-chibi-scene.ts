import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { StageDressing } from './stage-dressing';

/**
 * Hero stage: transparent renderer, lights, desk + chair set dressing, render
 * loop with offscreen pause. Camera target ≈ desk center at chest height.
 */
export class HeroChibiScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  private controls: OrbitControls | null = null;
  private dressing: StageDressing | null = null;
  private updaters: Array<(dt: number) => void> = [];
  private clock = new THREE.Clock();
  private running = true;
  private visible = true;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60);
    this.camera.position.set(1.7, 1.5, 2.7);
    this.camera.lookAt(0, 0.7, 0);

    // softer ambient now that the lamp carries the warmth
    const hemi = new THREE.HemisphereLight(0xfff6e6, 0x4a3a7d, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2.5, 4, 3);
    const rim = new THREE.DirectionalLight(0xff7eb6, 0.9);
    rim.position.set(-3, 2, -3);
    this.scene.add(hemi, key, rim);

    // cosy workspace: lit podium, warm desk lamp, screen glow
    this.dressing = new StageDressing();
    this.scene.add(this.dressing.group);
    this.onFrame((dt) => this.dressing!.update(dt));

    // soft ground blob shadow on the podium
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.1, 32), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.scene.add(shadow);

    this.fitToCanvas();
    new ResizeObserver(() => this.fitToCanvas()).observe(canvas.parentElement ?? canvas);
    new IntersectionObserver((entries) => {
      this.visible = entries[0]?.isIntersecting ?? true;
    }).observe(canvas);

    this.loop();
  }

  async loadDeskSet(basePath = '/props/'): Promise<void> {
    const loader = new GLTFLoader();
    const [desk, chair] = await Promise.all([
      loader.loadAsync(basePath + 'desk.glb'),
      loader.loadAsync(basePath + 'chair.glb'),
    ]);
    desk.scene.position.set(0, 0, 0);
    chair.scene.position.set(0, 0, -0.78);
    chair.scene.rotation.y = 0; // backrest away from desk; character faces +z
    this.scene.add(desk.scene, chair.scene);
  }

  onFrame(updater: (dt: number) => void): void {
    this.updaters.push(updater);
  }

  /** Clamped orbit for post-intro exploration. */
  enableOrbitControls(): void {
    if (this.controls) {
      this.controls.enabled = true;
      return;
    }
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 0.62, -0.35);
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minPolarAngle = Math.PI * 0.3;
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minAzimuthAngle = -Math.PI * 0.32;
    this.controls.maxAzimuthAngle = Math.PI * 0.32;
    this.controls.enableDamping = true;
  }

  disableOrbitControls(): void {
    if (this.controls) this.controls.enabled = false;
  }

  private fitToCanvas(): void {
    const host = this.canvas.parentElement ?? this.canvas;
    const w = host.clientWidth || 480;
    const h = host.clientHeight || 480;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private loop = (): void => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.visible) return;
    for (const update of this.updaters) update(dt);
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.running = false;
    this.controls?.dispose();
    this.renderer.dispose();
  }
}
