import './styles/base.css';
import './styles/cv.css';

import { initLanguage } from './i18n/set-language';
import { initCursorBlob } from './ui/cursor-blob';

// CV page stays light on purpose: no Three.js, printable, fast.
initLanguage();
initCursorBlob();
