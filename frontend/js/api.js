import { API, token } from './config.js';
import { logout } from './auth.js';

export async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...options, headers });
  if (res.status === 401) { logout(); throw new Error('auth'); }
  return res;
}