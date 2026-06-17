/** Custom cursor blob following the mouse; grows over interactive elements. */
export function initCursorBlob(): void {
  const blob = document.getElementById('blob');
  if (!blob) return;

  let blobX = innerWidth / 2;
  let blobY = innerHeight / 2;
  let mouseX = blobX;
  let mouseY = blobY;

  // stay hidden until the pointer actually moves, so it doesn't park
  // as a stray dot in the middle of the page on load
  blob.style.opacity = '0';
  addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    blob.style.opacity = '1';
  });

  document.querySelectorAll('a, button, .work-row, .pet-card, .chip').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      blob.style.width = '48px';
      blob.style.height = '48px';
    });
    el.addEventListener('mouseleave', () => {
      blob.style.width = '24px';
      blob.style.height = '24px';
    });
  });

  (function animate() {
    blobX += (mouseX - blobX) * 0.18;
    blobY += (mouseY - blobY) * 0.18;
    blob.style.left = `${blobX}px`;
    blob.style.top = `${blobY}px`;
    requestAnimationFrame(animate);
  })();
}
