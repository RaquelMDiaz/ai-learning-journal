import { currentLang, token, currentUser, setCurrentLang } from './config.js';
import { loadTranslations, applyTranslations } from './i18n.js';
import { updateNav, setSession, initAuthListeners } from './auth.js';
import { loadSessions, initSessionListeners } from './sessions.js';
import { initChatListeners } from './chat.js';
import { initContactListeners } from './contact.js';
import { showView } from './utils.js';
import { t } from './i18n.js';

// Nav listeners
document.getElementById('nav-logout-btn').addEventListener('click', () => {
  import('./auth.js').then(({ logout }) => logout());
});
document.getElementById('nav-login-btn').addEventListener('click', () => showView('auth'));
document.getElementById('nav-journal-btn').addEventListener('click', () => { loadSessions(); showView('journal'); });
document.getElementById('nav-contact-btn').addEventListener('click', () => showView('contact'));

document.getElementById('lang-select').addEventListener('change', e => {
  setCurrentLang(e.target.value);
  localStorage.setItem('lang', e.target.value);
  loadTranslations(e.target.value);
});

// Register all event listeners
initAuthListeners();
initSessionListeners();
initChatListeners();
initContactListeners();

async function init() {
  document.getElementById('lang-select').value = currentLang;
  await loadTranslations(currentLang);
  updateNav();

  // Handle Google OAuth redirect
  const urlParams = new URLSearchParams(window.location.search);
  const googleToken = urlParams.get('access_token');
  if (googleToken) {
    const { setToken, setCurrentUser } = await import('./config.js');
    setToken(googleToken);
    try {
      const { apiFetch } = await import('./api.js');
      const res = await apiFetch('/auth/me');
      const user = await res.json();
      setCurrentUser(user);
      localStorage.setItem('jwt', googleToken);
      localStorage.setItem('user', JSON.stringify(user));
      window.history.replaceState({}, '', window.location.pathname);
      updateNav();
      await loadSessions();
      showView('journal');
      applyTranslations();
    } catch {
      const { showErr } = await import('./utils.js');
      showErr('auth-error', t('error_auth'));
      showView('auth');
    }
    return;
  }

  // Normal init — already logged in
  if (token && currentUser) {
    await loadSessions();
    showView('journal');
    applyTranslations();
  }
}

init();