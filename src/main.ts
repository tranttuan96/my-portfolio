import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';

import { initLanguage } from './i18n/set-language';
import { renderWorkTeaser } from './sections/render-work-teaser';
import { renderPetProjects } from './sections/render-pet-projects';
import { initTypingEffect } from './ui/typing-effect';
import { initCursorBlob } from './ui/cursor-blob';
import { initAvatarTiltCard } from './ui/avatar-tilt-card';

// Render dynamic sections first so initLanguage() translates them too.
renderWorkTeaser();
renderPetProjects();
initLanguage();
initTypingEffect();
initCursorBlob();
initAvatarTiltCard();

// Three.js loads after first paint so content renders instantly.
import('./scene/background-particles').then(({ startBackgroundScene }) => startBackgroundScene());

// 3D hero intro — only on capable devices; tilt-card stays as the fallback.
import('./scene/webgl-capability-check').then(async ({ canRunHeroScene }) => {
  if (!canRunHeroScene()) return;
  const { mountHeroIntro } = await import('./scene/hero-intro-mount');
  mountHeroIntro().catch((err) => {
    // any load failure → keep the tilt-card fallback silently
    console.warn('hero intro unavailable:', err);
  });
});
