import { API, token, currentUser, setToken, setCurrentUser } from './config.js';
import { apiFetch } from './api.js';
import { t, applyTranslations } from './i18n.js';
import { showErr, showFieldError, clearErrors, showView } from './utils.js';
import { loadSessions } from './sessions.js';

export function updateNav() {
  const li = !!token;
  document.getElementById('nav-login-btn').style.display   = li ? 'none' : '';
  document.getElementById('nav-logout-btn').style.display  = li ? '' : 'none';
  document.getElementById('nav-journal-btn').style.display = li ? '' : 'none';
  document.getElementById('nav-user-name').style.display   = li ? '' : 'none';
  if (li && currentUser) document.getElementById('nav-user-name').textContent = currentUser.name;
}

export function setSession(data) {
  setToken(data.access_token);
  setCurrentUser(data.user);
  localStorage.setItem('jwt', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  updateNav();
}

export function logout() {
  setToken(null);
  setCurrentUser(null);
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  updateNav();
  showView('auth');
}

export function initAuthListeners() {
  document.getElementById('switch-to-register').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = '';
    document.getElementById('auth-title').textContent = t('auth_create');
    clearErrors('auth-error', 'err-login-email', 'err-login-password');
  });

  document.getElementById('switch-to-login').addEventListener('click', () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = '';
    document.getElementById('auth-title').textContent = t('auth_welcome');
    clearErrors('auth-error', 'err-reg-name', 'err-reg-email', 'err-reg-password');
  });

  document.getElementById('login-btn').addEventListener('click', async () => {
    clearErrors('auth-error', 'err-login-email', 'err-login-password');
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    let ok = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) { showFieldError('err-login-email', t('contact_error_email')); ok = false; }
    if (!pass) { showFieldError('err-login-password', 'Password required.'); ok = false; }
    if (!ok) return;
    const btn = document.getElementById('login-btn'); btn.disabled = true;
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { showErr('auth-error', data.detail || t('error_network')); return; }
      setSession(data); await loadSessions(); showView('journal'); applyTranslations();
    } catch { showErr('auth-error', t('error_network')); } finally { btn.disabled = false; }
  });

  document.getElementById('register-btn').addEventListener('click', async () => {
    clearErrors('auth-error', 'err-reg-name', 'err-reg-email', 'err-reg-password');
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    let ok = true;
    if (!name) { showFieldError('err-reg-name', t('contact_error_name')); ok = false; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { showFieldError('err-reg-email', t('contact_error_email')); ok = false; }
    if (pass.length < 6) { showFieldError('err-reg-password', 'Minimum 6 characters.'); ok = false; }
    if (!ok) return;
    const btn = document.getElementById('register-btn'); btn.disabled = true;
    try {
      const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password: pass }) });
      const data = await res.json();
      if (!res.ok) { showErr('auth-error', data.detail || t('error_network')); return; }
      setSession(data); showView('journal'); applyTranslations();
    } catch { showErr('auth-error', t('error_network')); } finally { btn.disabled = false; }
  });

  document.getElementById('google-login-btn').addEventListener('click', () => {
    window.location.href = 'http://localhost:8000/api/auth/google';
  });
}