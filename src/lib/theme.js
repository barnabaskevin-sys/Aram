import { store } from './dom.js';

export const THEMES = ['auto', 'day', 'night'];
export const savedTheme = () => store.get('aram.theme') || 'auto';
export const savedSize = () => +(store.get('aram.size') || 100);

export function applyTheme(pref) {
  if (pref === 'day' || pref === 'night') document.documentElement.dataset.theme = pref; else delete document.documentElement.dataset.theme;
  const dark = pref === 'night' || (pref !== 'day' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? '#22130B' : '#43251A';
}
export function applySize(pct) { document.documentElement.style.setProperty('--fs', String(pct / 100)); }

export function initTheme() {
  applyTheme(savedTheme()); applySize(savedSize());
  if (window.matchMedia) { try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(savedTheme())); } catch (e) {} }
}
