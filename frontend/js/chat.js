import { currentSessionId, setCurrentSessionId } from './config.js';
import { apiFetch } from './api.js';
import { t } from './i18n.js';
import { showView, esc } from './utils.js';
import { loadSessions } from './sessions.js';

export async function openSession(id, topic) {
  setCurrentSessionId(id);
  document.getElementById('chat-topic-title').textContent = topic;
  document.getElementById('chat-messages').innerHTML = '';
  showView('chat');
  try {
    const r = await apiFetch(`/sessions/${id}`);
    const d = await r.json();
    d.messages.forEach(m => appendBubble(m.role, m.content));
  } catch {}
}

export function appendBubble(role, content) {
  const msgs = document.getElementById('chat-messages');
  const w = document.createElement('div');
  w.className = `message ${role}`;
  w.innerHTML = `<div class="msg-label">${role === 'user' ? t('journal_you') : t('journal_assistant')}</div><div class="bubble">${esc(content)}</div>`;
  msgs.appendChild(w);
  msgs.scrollTop = msgs.scrollHeight;
  return w;
}

function appendTyping() {
  const msgs = document.getElementById('chat-messages');
  const w = document.createElement('div');
  w.className = 'message assistant typing';
  w.innerHTML = `<div class="msg-label">${t('journal_assistant')}</div><div class="bubble"><span></span><span></span><span></span></div>`;
  msgs.appendChild(w);
  msgs.scrollTop = msgs.scrollHeight;
  return w;
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  const { currentSessionId } = await import('./config.js');
  if (!content || !currentSessionId) return;
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('chat-send').disabled = true;
  appendBubble('user', content);
  const typing = appendTyping();
  try {
    const r = await apiFetch(`/chat/${currentSessionId}`, { method: 'POST', body: JSON.stringify({ content }) });
    const msg = await r.json();
    typing.remove();
    appendBubble('assistant', msg.content);
  } catch {
    typing.remove();
    appendBubble('assistant', t('error_network'));
  } finally {
    document.getElementById('chat-send').disabled = false;
  }
}

export function initChatListeners() {
  document.getElementById('back-btn').addEventListener('click', () => {
    loadSessions(); showView('journal');
  });

  document.getElementById('chat-send').addEventListener('click', sendChat);

  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  });

  document.getElementById('chat-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 140) + 'px';
  });
}