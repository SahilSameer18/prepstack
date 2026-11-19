// Theme choice: a saved "light" or "dark", else the system setting. index.html applies the same rule before the first paint.
const KEY = 'prepstack-theme';

export function systemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  // the browser bar takes the page colour from the --canvas token
  const canvas = getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim();
  if (canvas) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', canvas);
}

// Saves the choice; storage can be blocked (private window), then the choice lasts until reload.
export function saveTheme(theme) {
  applyTheme(theme);
  try { localStorage.setItem(KEY, theme); } catch { /* the page still switches */ }
}

export function hasSavedTheme() {
  try { const t = localStorage.getItem(KEY); return t === 'light' || t === 'dark'; } catch { return false; }
}
