/* Bottom sheets (settings, credits): one at a time, closed by the cross, the backdrop or Escape. */
import { esc } from '../lib/dom.js';
import { t } from '../lib/i18n.js';

let sheetEl = null, scrimEl = null, lastFocus = null;
export const sheetOpen = () => !!sheetEl;

export function openSheet(title, body, onMount) {
  closeSheet();
  lastFocus = document.activeElement;
  scrimEl = document.createElement('div'); scrimEl.className = 'scrim'; scrimEl.addEventListener('click', closeSheet);
  sheetEl = document.createElement('div'); sheetEl.className = 'sheet'; sheetEl.setAttribute('role', 'dialog'); sheetEl.setAttribute('aria-modal', 'true'); sheetEl.setAttribute('aria-label', title);
  sheetEl.innerHTML = `<div class="sheet-head"><h2>${esc(title)}</h2><button type="button" class="iconbtn" data-close aria-label="${esc(t('set.close'))}"><svg class="ic"><use href="#i-close"/></svg></button></div><div class="sheet-body">${body}</div>`;
  sheetEl.querySelector('[data-close]').addEventListener('click', closeSheet);
  document.body.appendChild(scrimEl); document.body.appendChild(sheetEl);
  if (onMount) onMount(sheetEl);
  sheetEl.querySelector('[data-close]').focus();
}

export function closeSheet() {
  if (!sheetEl) return;
  sheetEl.remove(); scrimEl.remove(); sheetEl = scrimEl = null;
  if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
