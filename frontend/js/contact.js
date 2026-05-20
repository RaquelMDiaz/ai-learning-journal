import { apiFetch } from './api.js';
import { t } from './i18n.js';
import { showErr, showFieldError, clearErrors } from './utils.js';

export function initContactListeners() {
  document.getElementById('contact-send-btn').addEventListener('click', async () => {
    clearErrors('contact-success', 'contact-error', 'err-contact-name', 'err-contact-email', 'err-contact-message');
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    let ok = true;
    if (!name) { showFieldError('err-contact-name', t('contact_error_name')); ok = false; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { showFieldError('err-contact-email', t('contact_error_email')); ok = false; }
    if (message.length < 10) { showFieldError('err-contact-message', t('contact_error_message')); ok = false; }
    if (!ok) return;
    const btn = document.getElementById('contact-send-btn'); btn.disabled = true;
    try {
      const r = await apiFetch('/contact/', { method: 'POST', body: JSON.stringify({ name, email, message }) });
      if (!r.ok) { const d = await r.json(); showErr('contact-error', d.detail || t('error_network')); return; }
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-email').value = '';
      document.getElementById('contact-message').value = '';
      const s = document.getElementById('contact-success');
      s.textContent = t('contact_success');
      s.classList.add('visible');
    } catch { showErr('contact-error', t('error_network')); } finally { btn.disabled = false; }
  });
}