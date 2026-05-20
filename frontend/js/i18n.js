import { currentLang, setCurrentLang } from './config.js';
import { updateNav } from './auth.js';

export let translations = {};

export async function loadTranslations(lang) {
  try {
    const r = await fetch(`i18n/${lang}.json?v=2`);
    translations = await r.json();
  } catch {}
  applyTranslations();
}

export function t(key, vars = {}) {
  let s = translations[key] || key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  const greeting = document.getElementById('journal-greeting');
  if (greeting) {
    import('./config.js').then(({ currentUser }) => {
      if (currentUser) greeting.textContent = t('journal_greeting', { name: currentUser.name.split(' ')[0] });
    });
  }
}