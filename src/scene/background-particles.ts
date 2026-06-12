import * as THREE from 'three';

/**
 * Floating low-poly shapes with mouse parallax + scroll drift.
 * Port of the original r128 background. PointLights use decay 1 to match
 * the r128 default (linear falloff); r166 defaults to decay 2 which would
 * darken distant shapes. r166 also outputs sRGB — tune intensities by eye.
 */
export function startBackgroundScene(): void {
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0b1a, 0.06);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 9;

  scene.add(new THREE.AmbientLight(0x6a5acd, 0.6));
  const warmLight = new THREE.PointLight(0xffd23f, 1.1, 100, 1);
  warmLight.position.set(6, 8, 10);
  scene.add(warmLight);
  const pinkLight = new THREE.PointLight(0xff5d8f, 1, 100, 1);
  pinkLight.position.set(-8, -4, 6);
  scene.add(pinkLight);

  const palette = [0xffd23f, 0xff5d8f, 0x3ddc97, 0x6a5acd, 0xffffff];
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.28, 16, 32),
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.ConeGeometry(0.8, 1.4, 5),
    new THREE.OctahedronGeometry(1, 0),
  ];

  interface FloatData { rx: number; ry: number; floatPhase: number; floatSpeed: number }
  const shapes: Array<{ mesh: THREE.Mesh; data: FloatData }> = [];

  for (let i = 0; i < 20; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: palette[i % palette.length],
      roughness: 0.35,
      metalness: 0.25,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geometries[i % geometries.length], material);
    mesh.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 14 - 4);
    const scale = 0.4 + Math.random() * 1.1;
    mesh.scale.setScalar(scale);
    scene.add(mesh);
    shapes.push({
      mesh,
      data: {
        rx: (Math.random() - 0.5) * 0.01,
        ry: (Math.random() - 0.5) * 0.01,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.4 + Math.random() * 0.7,
      },
    });
  }

  let pointerX = 0;
  let pointerY = 0;
  let scrolled = 0;
  addEventListener('mousemove', (e) => {
    pointerX = e.clientX / innerWidth - 0.5;
    pointerY = e.clientY / innerHeight - 0.5;
  });
  addEventListener('scroll', () => {
    scrolled = scrollY;
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  (function loop() {
    const t = clock.getElapsedTime();
    for (const { mesh, data } of shapes) {
      mesh.rotation.x += data.rx;
      mesh.rotation.y += data.ry;
      mesh.position.y += Math.sin(t * data.floatSpeed + data.floatPhase) * 0.004;
    }
    camera.position.x += (pointerX * 2.2 - camera.position.x) * 0.05;
    camera.position.y += (-pointerY * 1.6 - scrolled * 0.0008 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();
}
