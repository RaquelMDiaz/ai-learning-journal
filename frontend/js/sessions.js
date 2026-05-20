import { currentLang } from './config.js';
import { apiFetch } from './api.js';
import { t } from './i18n.js';
import { showView, esc } from './utils.js';
import { openSession } from './chat.js';

export async function loadSessions() {
  try {
    const r = await apiFetch('/sessions/');
    renderSessions(await r.json());
  } catch {}
}

function renderSessions(sessions) {
  const list = document.getElementById('session-list');
  if (!sessions.length) {
    list.innerHTML = `<div class="empty-state">${t('journal_no_sessions')}</div>`;
    return;
  }
  list.innerHTML = sessions.map(s => `
    <div class="session-card" data-id="${s.id}">
      <div>
        <div class="session-topic">${esc(s.topic)}</div>
        <div class="session-date">${new Date(s.updated_at).toLocaleDateString(currentLang.replace('_', '-'))}</div>
      </div>
      <div class="session-card-actions" onclick="event.stopPropagation()">
        <button class="btn-danger" onclick="window.__deleteSession(${s.id})">${t('journal_delete')}</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('.session-card').forEach(card => {
    card.addEventListener('click', () => openSession(
      +card.dataset.id,
      sessions.find(s => s.id === +card.dataset.id).topic
    ));
  });
}

export async function deleteSession(id) {
  if (!confirm('Delete this session?')) return;
  await apiFetch(`/sessions/${id}`, { method: 'DELETE' });
  loadSessions();
}

export function initSessionListeners() {
  document.getElementById('new-session-btn').addEventListener('click', async () => {
    const topic = document.getElementById('new-topic-input').value.trim();
    if (!topic) return;
    try {
      const r = await apiFetch('/sessions/', { method: 'POST', body: JSON.stringify({ topic }) });
      const s = await r.json();
      document.getElementById('new-topic-input').value = '';
      openSession(s.id, s.topic);
    } catch { alert(t('error_network')); }
  });

  document.getElementById('new-topic-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('new-session-btn').click();
  });

  // Expose deleteSession globally for inline onclick handlers
  window.__deleteSession = deleteSession;
}