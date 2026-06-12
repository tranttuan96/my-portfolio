export type Lang = 'en' | 'vi';

const STORAGE_KEY = 'portfolio-lang';
let current: Lang = (localStorage.getItem(STORAGE_KEY) as Lang) || 'en';
const listeners: Array<(lang: Lang) => void> = [];

export function getLang(): Lang {
  return current;
}

export function onLangChange(listener: (lang: Lang) => void): void {
  listeners.push(listener);
}

export function setLang(lang: Lang): void {
  current = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.querySelectorAll<HTMLElement>('[data-en]').forEach((el) => {
    const value = el.getAttribute(`data-${lang}`);
    if (value !== null) el.innerHTML = value;
  });
  document.getElementById('btn-en')?.classList.toggle('active', lang === 'en');
  document.getElementById('btn-vi')?.classList.toggle('active', lang === 'vi');
  document.documentElement.lang = lang;
  listeners.forEach((listener) => listener(lang));
}

/** Wire toggle buttons and apply the persisted language. Call AFTER dynamic sections render. */
export function initLanguage(): void {
  document.getElementById('btn-en')?.addEventListener('click', () => setLang('en'));
  document.getElementById('btn-vi')?.addEventListener('click', () => setLang('vi'));
  setLang(current);
}
