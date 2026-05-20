export const API = 'http://localhost:8000/api';

export let token = localStorage.getItem('jwt') || null;
export let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
export let currentSessionId = null;
export let currentLang = localStorage.getItem('lang') || 'en_GB';

export function setToken(value) { token = value; }
export function setCurrentUser(value) { currentUser = value; }
export function setCurrentSessionId(value) { currentSessionId = value; }
export function setCurrentLang(value) { currentLang = value; }