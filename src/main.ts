import './styles/base.css';
import './styles/hero.css';
import './styles/line-art-hero.css';
import './styles/sections.css';

import { initLanguage } from './i18n/set-language';
import { renderWorkTeaser } from './sections/render-work-teaser';
import { renderPetProjects } from './sections/render-pet-projects';
import { initTypingEffect } from './ui/typing-effect';
import { initCursorBlob } from './ui/cursor-blob';
import { mountLineArtHero } from './hero/line-art-hero';

// Render dynamic sections first so initLanguage() translates them too.
mountLineArtHero();
renderWorkTeaser();
renderPetProjects();
initLanguage();
initTypingEffect();
initCursorBlob();
