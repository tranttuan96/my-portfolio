import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';

import { initLanguage } from './i18n/set-language';
import { renderWorkTeaser } from './sections/render-work-teaser';
import { renderPetProjects } from './sections/render-pet-projects';
import { initTypingEffect } from './ui/typing-effect';
import { initCursorBlob } from './ui/cursor-blob';

// Render dynamic sections first so initLanguage() translates them too.
renderWorkTeaser();
renderPetProjects();
initLanguage();
initTypingEffect();
initCursorBlob();

// Floating 3D shapes hero — lazy-loaded, skipped on reduced-motion.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (canvas) {
    import('./hero/floating-shapes-hero')
      .then(({ mountFloatingShapesHero }) => mountFloatingShapesHero(canvas))
      .catch((err) => console.warn('hero shapes unavailable:', err));
  }
}
