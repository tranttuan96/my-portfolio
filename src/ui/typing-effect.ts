import { getLang, onLangChange } from '../i18n/set-language';

const phrases = {
  en: ['build apps that actually ship.', 'ship 2× faster with AI 🤖', 'debug at 2am 🌙', 'turn coffee into commits ☕'],
  vi: ['làm app thật sự lên prod.', 'ship nhanh gấp đôi nhờ AI 🤖', 'debug lúc 2h sáng 🌙', 'biến cà phê thành commit ☕'],
};

let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function typeLoop(target: HTMLElement): void {
  const list = phrases[getLang()];
  const full = list[phraseIndex % list.length];
  charIndex += deleting ? -1 : 1;
  target.textContent = full.substring(0, charIndex);

  let delay = deleting ? 40 : 75;
  if (!deleting && charIndex === full.length) {
    delay = 1500;
    deleting = true;
  } else if (deleting && charIndex === 0) {
    deleting = false;
    phraseIndex++;
    delay = 300;
  }
  timer = setTimeout(() => typeLoop(target), delay);
}

export function initTypingEffect(): void {
  const target = document.getElementById('typed');
  if (!target) return;

  const restart = () => {
    if (timer) clearTimeout(timer);
    charIndex = 0;
    deleting = false;
    typeLoop(target);
  };
  onLangChange(restart);
  restart();
}
