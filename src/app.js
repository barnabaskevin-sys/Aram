/* The app once the library has loaded: tabs, routing and the interface language.
   Routes live in the hash (#/, #/check, #/library, #/library/K), so any static host can serve them and Back works. */
import { $ } from './lib/dom.js';
import { LMETA, setUILang, applyStaticText } from './lib/i18n.js';
import { drawMedal, renderToday, initHome } from './views/home.js';
import { initCheck } from './views/check.js';
import { showBook, openBookId, renderShelf, refreshBook, initLibrary } from './views/library.js';
import { openSettings } from './views/settings.js';

const VIEWS = ['home', 'check', 'library'];
let view = null;

function route() {
  const [v, book] = location.hash.replace(/^#\/?/, '').split('/');
  const next = VIEWS.includes(v) ? v : 'home', nextBook = next === 'library' ? book || null : openBookId();
  const moved = next !== view || nextBook !== openBookId();
  view = next;
  VIEWS.forEach(x => { $('v-' + x).hidden = x !== view; $('d-' + x).setAttribute('aria-selected', String(x === view)); });
  if (view === 'library') showBook(nextBook);
  if (moved) window.scrollTo(0, 0);
}
const go = hash => { if (location.hash !== hash) location.hash = hash; else route(); };

function applyUI() { applyStaticText(); renderShelf(); renderToday(); refreshBook(); }
function setUI(id) { if (!LMETA[id]) return; setUILang(id); applyUI(); }

export function start() {
  initHome(); initCheck(); initLibrary();
  // the Library tab returns to the open work; pressed again inside the Library, it goes back to the shelf
  VIEWS.forEach(x => $('d-' + x).addEventListener('click', () => go(x === 'home' ? '#/' : x === 'library' && view !== 'library' && openBookId() ? '#/library/' + openBookId() : '#/' + x)));
  $('go-home').addEventListener('click', () => go('#/'));
  $('book-back').addEventListener('click', () => go('#/library'));
  document.addEventListener('click', e => { const q = e.target.closest('[data-go]'); if (q) go('#/' + q.dataset.go); });
  $('btn-set').addEventListener('click', () => openSettings(setUI));
  $('btn-lang').addEventListener('click', () => openSettings(setUI));
  window.addEventListener('hashchange', route);
  applyUI(); drawMedal(); route();
}
