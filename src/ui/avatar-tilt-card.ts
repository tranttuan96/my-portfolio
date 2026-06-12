/** Mouse-tilt for the hero avatar card. Phase 3 replaces this card with the 3D intro scene. */
export function initAvatarTiltCard(): void {
  const card = document.getElementById('avatarCard');
  if (!card) return;

  addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / rect.width));
    const dy = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / rect.height));
    card.style.transform = `rotateY(${dx * 12}deg) rotateX(${-dy * 12}deg)`;
  });

  // window never emits mouseleave — document does, when the cursor exits the viewport
  document.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0) rotateX(0)';
  });
}
