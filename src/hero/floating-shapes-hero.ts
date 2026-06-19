import * as THREE from 'three';

/**
 * derikn-style hero: colourful glossy 3D primitives floating + bobbing with
 * mouse parallax. Clean, friendly, lightweight — no character/rig needed.
 * Transparent canvas layered over the hero; CSS handles the reduced-motion
 * fallback (canvas hidden).
 */
const PALETTE = [0xffd23f, 0xff5d8f, 0x3ddc97, 0x6a78ff, 0xff9f43, 0xa66bff];

interface Floater {
  mesh: THREE.Mesh;
  spin: THREE.Vector3;
  bobAmp: number;
  bobSpeed: number;
  phase: number;
  baseY: number;
}

export function mountFloatingShapesHero(canvas: HTMLCanvasElement): void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a5acd, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xff7eb6, 0.8);
  fill.position.set(-6, -2, 4);
  scene.add(fill);

  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.3, 24, 64),
    new THREE.TorusKnotGeometry(0.55, 0.2, 90, 16),
    new THREE.CapsuleGeometry(0.5, 0.7, 8, 16),
    new THREE.ConeGeometry(0.8, 1.3, 6),
    new THREE.DodecahedronGeometry(0.9, 0),
    new THREE.OctahedronGeometry(1, 0),
  ];

  const floaters: Floater[] = [];
  const count = 11;
  for (let i = 0; i < count; i++) {
    const geo = geometries[i % geometries.length];
    const mat = new THREE.MeshStandardMaterial({
      color: PALETTE[i % PALETTE.length],
      roughness: 0.28,
      metalness: 0.12,
      flatShading: geo instanceof THREE.ConeGeometry || geo instanceof THREE.IcosahedronGeometry,
    });
    const mesh = new THREE.Mesh(geo, mat);
    // ring the shapes around the centred text so they stay clear of the letters
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 5.6 + Math.random() * 2.6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.74;
    const z = -3 - Math.random() * 4;
    mesh.position.set(x, y, z);
    const s = 0.42 + Math.random() * 0.7;
    mesh.scale.setScalar(s);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    scene.add(mesh);
    floaters.push({
      mesh,
      spin: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.3),
      bobAmp: 0.15 + Math.random() * 0.3,
      bobSpeed: 0.4 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      baseY: y,
    });
  }

  let pointerX = 0;
  let pointerY = 0;
  addEventListener('pointermove', (e) => {
    pointerX = (e.clientX / innerWidth) * 2 - 1;
    pointerY = (e.clientY / innerHeight) * 2 - 1;
  });

  function fit(): void {
    const host = canvas.parentElement ?? canvas;
    const w = host.clientWidth || innerWidth;
    const h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  fit();
  new ResizeObserver(fit).observe(canvas.parentElement ?? canvas);

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true; }).observe(canvas);

  const clock = new THREE.Clock();
  function loop(): void {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);
    for (const f of floaters) {
      f.mesh.rotation.x += f.spin.x * dt;
      f.mesh.rotation.y += f.spin.y * dt;
      f.mesh.rotation.z += f.spin.z * dt;
      f.mesh.position.y = f.baseY + Math.sin(t * f.bobSpeed + f.phase) * f.bobAmp;
    }
    camera.position.x += (pointerX * 1.1 - camera.position.x) * 0.04;
    camera.position.y += (-pointerY * 0.7 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  loop();
}
