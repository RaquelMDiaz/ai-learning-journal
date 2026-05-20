export function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showErr(id, msg) {
  const e = document.getElementById(id);
  e.textContent = msg;
  e.classList.add('visible');
}

export function showFieldError(id, msg) {
  const e = document.getElementById(id);
  e.textContent = msg;
  e.classList.add('visible');
}

export function clearErrors(...ids) {
  ids.forEach(id => {
    const e = document.getElementById(id);
    if (e) { e.textContent = ''; e.classList.remove('visible'); }
  });
}

export function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + id).classList.add('active');
}