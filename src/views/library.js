/* Library: a shelf of works, then one work at a time, chapter by chapter. */
import { $, esc } from '../lib/dom.js';
import { t, num } from '../lib/i18n.js';
import { D, SRCV, VP, VCNT, TMN, TANT, XC, HS, ZN, WN, ta } from '../data/corpus.js';
import { card } from '../ui/card.js';

export const BOOKS = [['K', 'திருக்குறள்', 'Thirukkural'], ['N', 'நாலடியார்', 'Nālaṭiyār'], ['W', 'அவ்வையார்', 'Auvaiyār'], ['Z', 'பதினெண் கீழ்க்கணக்கு', 'Minor Works'],
  ['T', 'தொல்காப்பியம்', 'Tolkāppiyam'], ['P', 'புறநானூறு', 'Puṟanāṉūṟu'], ['Q', 'குறுந்தொகை', 'Kuṟuntokai'], ['A', 'அகநானூறு', 'Akanāṉūṟu'], ['L', 'கலித்தொகை', 'Kalittokai'],
  ['B', 'பதிற்றுப்பத்து', 'Patiṟṟuppattu'], ['C', 'சிலப்பதிகாரம்', 'Cilappatikāram'], ['M', 'மணிமேகலை', 'Maṇimēkalai'], ['V', 'தேவாரம்', 'Tēvāram'], ['X', 'திருமந்திரம்', 'Tirumantiram'], ['H', 'திருவாசகம்', 'Tiruvācakam']];

let bookId = null;   // the work that is open, or null on the shelf
export const openBookId = () => bookId;

function fillChapters() {
  const sel = $('bch'), src = bookId; let h = '';
  if (src === 'K') D.ks.forEach((s, si) => { h += `<optgroup label="${esc(s[0])} · ${esc(s[1])}">`; D.kc.forEach((c, i) => { if (c[2] === si) h += `<option value="${i}">${i + 1}. ${esc(c[0])} · ${esc(c[1])}</option>`; }); h += '</optgroup>'; });
  else if (src === 'P') { for (let i = 0; i < 16; i++) h += `<option value="${i}">${i * 25 + 1}–${Math.min(400, i * 25 + 25)}</option>`; }
  else if (src === 'V') { [1, 2, 3, 4, 5, 6, 7].forEach(tm => { h += `<optgroup label="${esc(TMN[tm])}">`; VP.forEach((p, i) => { if (p.tm === tm && VCNT[i]) h += `<option value="${i}">${tm}.${p.n} ${esc(ta(p.name))}</option>`; }); h += '</optgroup>'; }); }
  else if (src === 'X') { let last = ''; XC.forEach((c, i) => { if (c.tant !== last) { if (last) h += '</optgroup>'; h += `<optgroup label="${esc(TANT[c.tant])}">`; last = c.tant; } h += `<option value="${i}">${esc(ta(c.title))}</option>`; }); h += '</optgroup>'; }
  else if (src === 'H') HS.forEach((x, i) => { h += `<option value="${i}">${x.n}. ${esc(ta(x.title))}</option>`; });
  else if (src === 'A') { for (let i = 0; i < 16; i++) h += `<option value="${i}">${i * 25 + 1}–${i * 25 + 25}</option>`; }
  else if (src === 'B') { ['இரண்டாம் பத்து', 'மூன்றாம் பத்து', 'நான்காம் பத்து', 'ஐந்தாம் பத்து', 'ஆறாம் பத்து', 'ஏழாம் பத்து', 'எட்டாம் பத்து', 'ஒன்பதாம் பத்து'].forEach((n, i) => { h += `<option value="${i}">${n} (${i * 10 + 11}–${i * 10 + 20})</option>`; }); }
  else if (src === 'Z') ZN.forEach((w, i) => { h += `<option value="${i}">${i + 1}. ${w.ta} · ${w.en}</option>`; });
  else if (src === 'W') WN.forEach((w, i) => { h += `<option value="${i}">${w[0]} · ${w[1]}</option>`; });
  else if (src === 'Q') { for (let i = 0; i < 17; i++) h += `<option value="${i}">${i * 25 + 1}–${Math.min(401, i * 25 + 25)}</option>`; }
  else if (src === 'L') { for (let i = 0; i < 30; i++) h += `<option value="${i}">${i * 5 + 1}–${i * 5 + 5}</option>`; }
  else if (src === 'C') D.c.forEach(c => { h += `<option value="${c[0]}">${c[0]}. ${esc(c[1])}</option>`; });
  else if (src === 'M') D.m.forEach(c => { h += `<option value="${c[0]}">${c[0] ? c[0] + '. ' : ''}${esc(c[1])}</option>`; });
  else if (src === 'T') D.tp.forEach((s, si) => { h += `<optgroup label="${esc(s[0])} · ${s[1]}">`; D.t.n.forEach((c, i) => { if (c[2] === si) h += `<option value="${i}">${i + 1}. ${esc(c[0])} · ${esc(c[1])}</option>`; }); h += '</optgroup>'; });
  else D.ns.forEach((s, si) => { h += `<optgroup label="${esc(s)} · ${D.ne[si]}">`; D.nc.forEach((c, i) => { if (c[1] === si) h += `<option value="${i}">${i + 1}. ${esc(c[0])}</option>`; }); h += '</optgroup>'; });
  sel.innerHTML = h;
}

function browse() {
  const i = +$('bch').value, out = $('browse-out'); out.innerHTML = '';
  SRCV[bookId].filter(v => v.ch === i).forEach((v, k) => out.appendChild(card(v, { i: k })));
}

export function renderShelf() {
  $('shelf').innerHTML = BOOKS.map((b, i) => `<a class="tile" href="#/library/${b[0]}" style="--i:${i}"><span class="tt" lang="ta" dir="ltr">${b[1]}</span><span><span class="tr">${b[2]}</span><br><span class="tn">${esc(t('lib.entries', { n: num(SRCV[b[0]].length) }))}</span></span></a>`).join('');
  fitTiles();
}

// Tamil titles differ a lot in length; shrink a title only as far as needed so a word is never broken in two
export function fitTiles() {
  document.querySelectorAll('#shelf .tt').forEach(el => {
    el.style.fontSize = '';
    if (!el.offsetParent) return;
    let s = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth + 0.5 && s > 11) { s -= 0.5; el.style.fontSize = s + 'px'; }
  });
}

// show the shelf (id null) or one work; called by the router
export function showBook(id) {
  const b = id && BOOKS.find(x => x[0] === id);
  if (!b) {
    bookId = null; $('book').hidden = true; $('shelf-wrap').hidden = false; $('browse-out').innerHTML = '';
    fitTiles(); return;
  }
  if (bookId === id) return;
  bookId = id;
  $('book-ta').textContent = b[1]; $('book-en').textContent = b[2];
  $('shelf-wrap').hidden = true; $('book').hidden = false;
  fillChapters(); browse();
}

// redraw after the interface language changes
export function refreshBook() { if (bookId) { const i = $('bch').value; fillChapters(); $('bch').value = i; browse(); } }

export function initLibrary() {
  $('bch').addEventListener('change', browse);
  window.addEventListener('resize', fitTiles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTiles);
}
