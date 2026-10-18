/* The interface language: detection, lookup, numbers, and the static text marked with data-i18n. */
import { UI } from '../i18n/index.js';
import { store } from './dom.js';

export const LANGS = UI.LANGS;
export const LMETA = {};
LANGS.forEach(l => { LMETA[l[0]] = { native: l[1], en: l[2], dir: l[3], html: l[4] }; });
const TNUM = '௦௧௨௩௪௫௬௭௮௯';
const LOCALE = { zht: 'zh-TW', zh: 'zh-CN', nb: 'nb-NO', fil: 'fil-PH' };

export let ui = 'en';
export function setUILang(id, save = true) { if (!LMETA[id]) return; ui = id; if (save) store.set('aram.ui', id); }

// ?ui=xx in the address (for links and screenshots), then the saved choice, then the browser's languages
export function detectUI() {
  const url = new URLSearchParams(location.search).get('ui'); if (url && LMETA[url]) return url;
  const saved = store.get('aram.ui'); if (saved && LMETA[saved]) return saved;
  const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  for (const raw of list) {
    const tag = String(raw).toLowerCase();
    if (/^zh-(tw|hk|mo|hant)/.test(tag)) return 'zht';
    const base = tag.split('-')[0];
    const alias = { no: 'nb', nn: 'nb', tl: 'fil', iw: 'he', in: 'id' }[base] || base;
    if (LMETA[alias]) return alias;
  }
  return 'en';
}

export const t = (k, v) => {
  let s = (UI.DICT[ui] && UI.DICT[ui][k]) || UI.DICT.en[k] || k;
  if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]);
  return s;
};
const toTamil = s => String(s).replace(/[0-9]/g, d => TNUM[d]);
export const snum = n => ui === 'ta' ? toTamil(n) : String(n);   // verse and line numbers: Tamil digits in the Tamil interface
export const num = n => { let s; try { s = new Intl.NumberFormat(LOCALE[ui] || ui).format(n); } catch (e) { s = String(n); } return ui === 'ta' ? toTamil(s) : s; };

export function applyStaticText() {
  const m = LMETA[ui];
  document.documentElement.lang = m.html; document.documentElement.dir = m.dir;
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
}
