import './styles/base.css';
import './styles/hero.css';
import './styles/sections.css';

import { initLanguage } from './i18n/set-language';
import { renderWorkTeaser } from './sections/render-work-teaser';
import { renderPetProjects } from './sections/render-pet-projects';
import { initCursorBlob } from './ui/cursor-blob';

// Render dynamic sections first so initLanguage() translates them too.
renderWorkTeaser();
renderPetProjects();
initLanguage();
initCursorBlob();
