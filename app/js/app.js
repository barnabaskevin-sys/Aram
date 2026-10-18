(function () {
  'use strict';
  const Y = window.Yappu;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // ----- corpus -----
  const SYM = { nal: ['நாள்', 'nāḷ'], malar: ['மலர்', 'malar'], kasu: ['காசு', 'kācu'], pirappu: ['பிறப்பு', 'piṟappu'] };
  const KV = D.k.map(r => ({ id: 'K' + r[0], src: 'K', n: r[0], text: r[1], lines: r[1].split('\n'), pope: r[2], sym: r[3], nl: r[4], rd: r[5], ch: Math.ceil(r[0] / 10) - 1 }));
  const NV = D.n.map(r => ({ id: 'N' + r[0], src: 'N', n: r[0], text: r[1], lines: r[1].split('\n'), pope: r[7], ptitle: r[6], sym: r[3], nl: r[4], rd: r[5], ch: r[2] }));
  const TV = D.t.s.map(r => ({ id: 'T' + r[0] + '-' + r[1], src: 'T', n: r[1], text: r[2], lines: [r[2]], pope: '', sym: '', nl: 0, rd: '', ch: r[0], flag: r[3] }));
  const PV = D.p.map(r => ({ id: 'P' + r[0], src: 'P', n: r[0], title: r[1], poet: r[2], patron: r[3], tinai: r[4], turai: r[5], lines: r[6], text: r[6].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 25) }));
  const MV = []; D.m.forEach(c => { for (let k = 0; k * 8 < c[2].length; k++) { const ls = c[2].slice(k * 8, k * 8 + 8); MV.push({ id: 'M' + c[0] + '.' + (k + 1), src: 'M', n: k + 1, text: ls.join('\n'), lines: ls, from: k * 8 + 1, to: k * 8 + ls.length, pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: c[0] }); } });
  const QV = D.q.map(r => ({ id: 'Q' + r[0], src: 'Q', n: r[0], tinai: r[1], speaker: r[2], poet: r[3], lines: r[4], text: r[4].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 25) }));
  const LV = D.l.map(r => ({ id: 'L' + r[0], src: 'L', n: r[0], sec: r[1], poet: r[2], lines: r[3], text: r[3].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 5) }));
  const CMAP = {}; D.c.forEach(c => CMAP[c[0]] = c);
  const CV = []; D.c.forEach(c => { for (let k = 0; k * 8 < c[2].length; k++) { const ls = c[2].slice(k * 8, k * 8 + 8); CV.push({ id: 'C' + c[0] + '.' + (k + 1), src: 'C', n: k + 1, text: ls.join('\n'), lines: ls, from: k * 8 + 1, to: k * 8 + ls.length, pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: c[0] }); } });
  const AV = D.a.map(r => ({ id: 'A' + r[0], src: 'A', n: r[0], tinai: r[1], lines: r[2], text: r[2].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 25) }));
  const BV = D.pt.map(r => ({ id: 'B' + r[0], src: 'B', n: r[0], pattu: r[1], patron: r[2], poet: r[3], peyar: r[4], turai: r[5], lines: r[6], text: r[6].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: r[1] - 2 }));
  const WN = [['ஆத்திசூடி', 'Āttiṟcūṭi'], ['கொன்றை வேந்தன்', 'Koṉṟaivēntaṉ'], ['மூதுரை', 'Mūturai'], ['நல்வழி', 'Nalvaḻi']];
  const WV = D.w.map(r => ({ id: 'W' + r[0] + '.' + r[1], src: 'W', n: r[1], grp: r[3], text: r[2], lines: r[2].split('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: r[0] }));
  // transliterated texts (Tēvāram, Tirumantiram, Tiruvācakam) are converted to Tamil script when first read
  const TA_V = { a: '', 'ā': 'ா', i: 'ி', 'ī': 'ீ', u: 'ு', 'ū': 'ூ', e: 'ெ', 'ē': 'ே', ai: 'ை', o: 'ொ', 'ō': 'ோ', au: 'ௌ' };
  const TA_VI = { a: 'அ', 'ā': 'ஆ', i: 'இ', 'ī': 'ஈ', u: 'உ', 'ū': 'ஊ', e: 'எ', 'ē': 'ஏ', ai: 'ஐ', o: 'ஒ', 'ō': 'ஓ', au: 'ஔ' };
  const TA_C = { k: 'க', 'ṅ': 'ங', c: 'ச', 'ñ': 'ஞ', 'ṭ': 'ட', 'ṇ': 'ண', t: 'த', n: 'ந', p: 'ப', m: 'ம', y: 'ய', r: 'ர', l: 'ல', v: 'வ', 'ḻ': 'ழ', 'ḷ': 'ள', 'ṟ': 'ற', 'ṉ': 'ன', j: 'ஜ', 'ṣ': 'ஷ', s: 'ஸ', h: 'ஹ' };
  function ta(str) {
    str = String(str).replace(/ḵ/g, 'ஃ').replace(/[ṁṃ]/g, 'ம்');
    let out = '', i = 0; const n = str.length;
    const vowel = k => { if (str.startsWith('ai', k)) return ['ai', k + 2]; if (str.startsWith('au', k)) return ['au', k + 2]; if (k < n && Object.prototype.hasOwnProperty.call(TA_V, str[k])) return [str[k], k + 1]; return null; };
    while (i < n) {
      const ch = str[i], lo = ch.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(TA_C, lo)) {
        const c = TA_C[lo]; i++; const v = vowel(i);
        if (v) { out += c + TA_V[v[0]]; i = v[1]; } else out += c + '்';
      } else {
        const v = vowel(i);
        if (v) { out += TA_VI[v[0]]; i = v[1]; } else { out += ch; i++; }
      }
    }
    return out;
  }
  const lazy = (o, raw) => { let l = null, t = null; Object.defineProperty(o, 'lines', { get() { return l || (l = raw.map(ta)); }, enumerable: true }); Object.defineProperty(o, 'text', { get() { return t || (t = this.lines.join('\n')); }, enumerable: true }); return o; };
  const base0 = { pope: '', ptitle: '', sym: '', nl: 0, rd: '' };
  const TMN = ['', 'முதல் திருமுறை · சம்பந்தர்', 'இரண்டாம் திருமுறை · சம்பந்தர்', 'மூன்றாம் திருமுறை · சம்பந்தர்', 'நான்காம் திருமுறை · அப்பர்', 'ஐந்தாம் திருமுறை · அப்பர்', 'ஆறாம் திருமுறை · அப்பர்', 'ஏழாம் திருமுறை · சுந்தரர்'];
  const VP = D.v.p.map(p => ({ tm: p[0], n: p[1], name: p[2], pan: p[3] }));
  const VV = D.v.v.map((r, i) => lazy(Object.assign({ id: 'V' + i, src: 'V', n: r[1], pi: r[0], ch: r[0] }, base0), r[2]));
  const VCNT = new Array(VP.length).fill(0); VV.forEach(v => { VCNT[v.ch]++; });
  const TANT = { 'pāyiram': 'பாயிரம்', 'mutal tantiram': 'முதல் தந்திரம்', 'iraṇṭām tantiram': 'இரண்டாம் தந்திரம்', 'mūṉṟām tantiram': 'மூன்றாம் தந்திரம்', 'nāṉkām tantiram': 'நான்காம் தந்திரம்', 'aintām tantiram': 'ஐந்தாம் தந்திரம்', 'āṟām tantiram': 'ஆறாம் தந்திரம்', 'ēḻām tantiram': 'ஏழாம் தந்திரம்', 'eṭṭām tantiram': 'எட்டாம் தந்திரம்', 'oṉpatām tantiram': 'ஒன்பதாம் தந்திரம்' };
  const XC = D.x.c.map(c => ({ tant: c[0], title: c[1] }));
  const XV = D.x.v.map(r => lazy(Object.assign({ id: 'X' + r[1], src: 'X', n: r[1], ch: r[0] }, base0), r[2]));
  const HS = D.h.map(h => ({ n: h[0], title: h[1], kind: h[2] }));
  const HV = []; D.h.forEach((h, si) => h[3].forEach(p => HV.push(lazy(Object.assign({ id: 'H' + h[0] + '.' + p[0], src: 'H', n: p[0], ch: si, stanza: h[2] === 's' }, base0), p[1]))));
  const ZN = D.z.map(w => ({ ta: w.ta, en: w.k, il: w.il || 'வாழ்த்து' }));
  const ZNV = new Set([12]);
  const ztx = c => c ? c.split(' | ').map(x => x.startsWith('tin:') ? 'திணை: ' + ta(x.slice(4)) : x.startsWith('ctx:') ? ta(x.slice(4)) : x.startsWith('tuṟai: ') ? 'துறை: ' + ta(x.slice(7)) : ta(x)).join(' · ') : '';
  const ZV = []; D.z.forEach((w, wi) => { if (w.inv && w.inv.length) ZV.push(lazy(Object.assign({ id: 'Z' + wi + '.0', src: 'Z', n: 0, ch: wi, ctx: '', dmg: false }, base0), w.inv)); w.v.forEach(r => ZV.push(lazy(Object.assign({ id: 'Z' + wi + '.' + r[0], src: 'Z', n: r[0], ch: wi, ctx: r[2], dmg: r[1].some(x => x.indexOf('..') >= 0) }, base0), r[1]))); });
  const ALL = KV.concat(NV, TV, PV, MV, QV, LV, CV, AV, BV, WV, VV, XV, HV, ZV);
  const SRCV = { K: KV, N: NV, T: TV, P: PV, M: MV, Q: QV, L: LV, C: CV, A: AV, B: BV, W: WV, V: VV, X: XV, H: HV, Z: ZV };
  const NONVENBA = new Set(['T', 'P', 'M', 'Q', 'L', 'C', 'A', 'B', 'V', 'X', 'H']);
  const BY = {}; ALL.forEach(v => BY[v.id] = v);
  const chInfo = v => v.src === 'K' ? { ta: D.kc[v.ch][0], en: D.kc[v.ch][1] } : v.src === 'T' ? { ta: D.tp[D.t.n[v.ch][2]][0] + ' · ' + D.t.n[v.ch][0], en: D.t.n[v.ch][1] } : v.src === 'P' ? { ta: [v.title, v.tinai, v.turai].filter(Boolean).join(' · '), en: '' } : v.src === 'M' ? { ta: D.m[v.ch][1] + ' · வரிகள் ' + v.from + '–' + v.to, en: '' } : v.src === 'V' ? { ta: TMN[VP[v.ch].tm] + ' · ' + VP[v.ch].tm + '.' + VP[v.ch].n + ' ' + ta(VP[v.ch].name) + (VP[v.ch].pan ? ' · பண் ' + ta(VP[v.ch].pan) : ''), en: '' } : v.src === 'X' ? { ta: TANT[XC[v.ch].tant] + ' · ' + ta(XC[v.ch].title), en: '' } : v.src === 'H' ? { ta: HS[v.ch].n + '. ' + ta(HS[v.ch].title), en: '' } : v.src === 'A' ? { ta: v.tinai, en: '' } : v.src === 'B' ? { ta: [(['', '', 'இரண்டாம்', 'மூன்றாம்', 'நான்காம்', 'ஐந்தாம்', 'ஆறாம்', 'ஏழாம்', 'எட்டாம்', 'ஒன்பதாம்'][v.pattu] || '') + ' பத்து', v.peyar, v.turai].filter(Boolean).join(' · '), en: '' } : v.src === 'W' ? { ta: WN[v.ch][0] + (v.grp ? ' · ' + v.grp : ''), en: '' } : v.src === 'Z' ? { ta: ZN[v.ch].ta + (v.ctx ? ' · ' + ztx(v.ctx) : ''), en: '' } : v.src === 'Q' ? { ta: [v.tinai, v.speaker].filter(Boolean).join(' · '), en: '' } : v.src === 'L' ? { ta: v.sec, en: '' } : v.src === 'C' ? { ta: CMAP[v.ch][1] + ' · வரிகள் ' + v.from + '–' + v.to, en: '' } : { ta: D.nc[v.ch][0], en: '' };
  const ref = v => v.src === 'V' ? `Tēvāram ${VP[v.ch].tm}.${VP[v.ch].n}${v.n ? '.' + v.n : ''}` : v.src === 'X' ? `Tirumantiram ${v.n}` : v.src === 'H' ? `Tiruvācakam ${HS[v.ch].n}.${v.n}` : v.src === 'W' ? `${WN[v.ch][1]} ${v.n || '(invocation)'}` : v.src === 'Z' ? `${ZN[v.ch].en} ${v.n || '(invocation)'}` : v.src === 'C' ? `Cilappatikāram ${CMAP[v.ch][1]}, lines ${v.from}–${v.to}` : v.src === 'M' ? `Maṇimēkalai ${D.m[v.ch][1]}, lines ${v.from}–${v.to}` : v.src === 'T' ? `Tolkāppiyam ${D.t.n[v.ch][0]} sūtra ${v.n}` : `${BOOK[v.src][1]} ${v.n}`;
  const BOOK = { K: ['குறள்', 'Kural'], N: ['நாலடி', 'Nālaṭiyār'], T: ['நூற்பா', 'Tolkāppiyam'], P: ['புறநானூறு', 'Puṟanāṉūṟu'], M: ['மணிமேகலை', 'Maṇimēkalai'], Q: ['குறுந்தொகை', 'Kuṟuntokai'], L: ['கலித்தொகை', 'Kalittokai'], C: ['சிலப்பதிகாரம்', 'Cilappatikāram'], A: ['அகநானூறு', 'Akanāṉūṟu'], B: ['பதிற்றுப்பத்து', 'Patiṟṟuppattu'], W: ['அவ்வையார்', 'Auvaiyār'], V: ['தேவாரம்', 'Tēvāram'], X: ['திருமந்திரம்', 'Tirumantiram'], H: ['திருவாசகம்', 'Tiruvācakam'], Z: ['பதினெண்கீழ்க்கணக்கு', 'Minor Works'] };

  // ----- interface language, and the languages explanations are written in -----
  const UI = window.ARAM_UI, LANGS = UI.LANGS, LORDER = LANGS.map(l => l[0]);
  const LMETA = {}, langName = {};
  LANGS.forEach(l => { LMETA[l[0]] = { native: l[1], en: l[2], dir: l[3], html: l[4] }; langName[l[0]] = l[2]; });
  const MAXLANG = 4, FIELDS = ['overview', 'note', 'meaning', 'applies', 'context'];
  const KEYRE = new RegExp('^(' + FIELDS.join('|') + ')_(' + LORDER.join('|') + ')$');
  const TNUM = '௦௧௨௩௪௫௬௭௮௯';
  const LOCALE = { zht: 'zh-TW', zh: 'zh-CN', nb: 'nb-NO', fil: 'fil-PH' };
  let ui = 'en';
  function detectUI() {
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
  const t = (k, v) => {
    let s = (UI.DICT[ui] && UI.DICT[ui][k]) || UI.DICT.en[k] || k;
    if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]);
    return s;
  };
  const toTamil = s => String(s).replace(/[0-9]/g, d => TNUM[d]);
  const snum = n => ui === 'ta' ? toTamil(n) : String(n);   // verse and line numbers: Tamil digits in the Tamil interface
  const num = n => { let s; try { s = new Intl.NumberFormat(LOCALE[ui] || ui).format(n); } catch (e) { s = String(n); } return ui === 'ta' ? toTamil(s) : s; };
  const active = new Set();
  function loadActive() {
    try { const s = JSON.parse(store.get('aram.langs') || 'null'); if (Array.isArray(s)) s.filter(x => LMETA[x]).slice(0, MAXLANG).forEach(x => active.add(x)); } catch (e) {}
    if (!active.size) active.add(ui);
  }
  const activeList = () => LORDER.filter(l => active.has(l));
  const la = l => ` lang="${LMETA[l].html}"${LMETA[l].dir === 'rtl' ? ' dir="rtl"' : ''}`;
  // a paragraph per language that is switched on (or, failing that, the first language the text exists in)
  const paras = (o, key) => {
    let ls = activeList().filter(l => o[key + '_' + l]), tag = ls.length > 1;
    if (!ls.length) { const f = LORDER.find(l => o[key + '_' + l]); if (f) { ls = [f]; tag = true; } }
    return ls.map(l => `<p${la(l)}>${tag ? `<span class="ltag">${esc(LMETA[l].native)}</span>` : ''}${esc(o[key + '_' + l])}</p>`).join('');
  };
  const lab = k => `<span class="lab">${esc(t('lab.' + k))}</span>`;
  const AI_NOTE = () => `<p class="ai">${esc(t('ai.note'))}</p>`;
  // every explanation object on the page, with a function that redraws it
  const REG = new Set();
  function register(obj, redraw, scope) { const e = { obj, redraw, scope }; REG.add(e); return e; }
  const dropScope = s => REG.forEach(e => { if (e.scope === s) REG.delete(e); });
  const hasAny = (o, k) => LORDER.some(l => o[k + '_' + l]);
  let translating = false;
  const setLangStatus = (txt, err) => { document.querySelectorAll('[data-langstatus]').forEach(el => { el.textContent = txt || ''; el.className = 'status' + (err ? ' err' : ''); }); };
  async function ensureLangs() {
    if (translating) return;
    const need = [], items = [];
    REG.forEach(e => {
      const miss = {};
      FIELDS.forEach(k => { if (hasAny(e.obj, k)) { const m = activeList().filter(l => !e.obj[k + '_' + l]); if (m.length) miss[k] = m; } });
      if (Object.keys(miss).length) {
        const text = {}; Object.keys(miss).forEach(k => { const src = ['en', 'ta'].concat(LORDER).find(l => e.obj[k + '_' + l]); text[k] = { lang: langName[src], text: e.obj[k + '_' + src], into: miss[k].map(l => langName[l] + ' (' + l + ')') }; });
        need.push(e); items.push({ id: need.length - 1, fields: text });
      }
    });
    if (!items.length) { setLangStatus(''); return; }
    const sample = await getSample(); if (!sample) { setLangStatus(t('ask.offline'), true); return; }
    translating = true; setLangStatus(t('ai.translating'));
    try {
      const r = await sample.json(`Translate these short explanations of verses from classical Tamil literature into the requested languages. Stay faithful to the source text, keep the same simple register, add nothing and leave nothing out. Use Modern Standard Arabic for Arabic, Simplified Chinese for Chinese (zh) and Traditional Chinese for zht.\n\nInput (JSON array; each item has fields, each with its source language, text and the languages to translate into, each followed by its language code):\n${JSON.stringify(items.map(it => ({ id: it.id, fields: Object.fromEntries(Object.entries(it.fields).map(([k, v]) => [k, { from: v.lang, text: v.text, into: v.into }])) })))}\n\nReply with JSON only, as an array: [{"id": 0, "fields": {"meaning_fr": "...", "meaning_ar": "..."}}] where each key is the field name, an underscore and the language code (the code in brackets after the language name) of the translation.`, { modelTier: 'quick' });
      (Array.isArray(r) ? r : []).forEach(it => {
        const e = need[it.id]; if (!e || !it.fields) return;
        Object.entries(it.fields).forEach(([k, v]) => { if (typeof v === 'string' && KEYRE.test(k) && !e.obj[k]) e.obj[k] = v; });
        e.redraw();
      });
      setLangStatus('');
    } catch (e) { setLangStatus(errCopy(e), true); }
    translating = false;
    // a language switched on while this call ran
    if ([...REG].some(e => FIELDS.some(k => hasAny(e.obj, k) && activeList().some(l => !e.obj[k + '_' + l])))) { if (!document.querySelector('[data-langstatus].err')) ensureLangs(); }
  }
  function applyLangs() { store.set('aram.langs', JSON.stringify([...active])); REG.forEach(e => e.redraw()); renderLangBars(); }
  function toggleLang(id) {
    if (active.has(id)) { if (active.size > 1) active.delete(id); }
    else if (active.size >= MAXLANG) { toast(t('set.max', { n: MAXLANG })); return false; }
    else active.add(id);
    applyLangs(); ensureLangs(); return true;
  }
  function renderLangBars() {
    document.querySelectorAll('[data-langbar]').forEach(el => {
      el.innerHTML = `<span class="lbl">${esc(t('set.meanings'))}</span>` + activeList().map(l => `<button type="button" class="lc" data-open="meanings"${la(l)}>${esc(LMETA[l].native)}</button>`).join('') + `<button type="button" class="lc add" data-open="meanings" aria-label="${esc(t('set.meanings'))}">+</button>`;
    });
  }
  let toastT = 0;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; clearTimeout(toastT); toastT = setTimeout(() => { el.remove(); }, 2300);
  }

  // ----- views -----
  const VIEWS = ['home', 'ask', 'check', 'library'];
  let view = 'home';
  function showView(v) {
    view = v;
    VIEWS.forEach(x => { $('v-' + x).hidden = x !== v; $('d-' + x).setAttribute('aria-selected', String(x === v)); });
    window.scrollTo(0, 0);
    if (v === 'library' && typeof fitTiles === 'function') fitTiles();
  }
  // bring a fresh result into view (it lands below the examples and the keyboard)
  function reveal(el) {
    try { const slow = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); setTimeout(() => el.scrollIntoView({ block: 'start', behavior: slow ? 'smooth' : 'auto' }), 60); } catch (e) {}
  }
  VIEWS.forEach(x => $('d-' + x).addEventListener('click', () => { if (x === 'library' && view === 'library') closeBook(); showView(x); }));
  $('go-home').addEventListener('click', () => showView('home'));
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-go]'); if (q) { showView(q.dataset.go); return; }
    const o = e.target.closest('[data-open]'); if (o) openSettings(o.dataset.open);
  });

  // ----- verse card: a palm leaf on the strand -----
  function kolamSVG(v) {
    try {
      const r = Y.read(v.text); if ((v.src === 'W' || v.src === 'Z') && r.check && r.check.errs.length) return null; const prog = Y.compile(r.verse), res = Y.run(prog, r.verse), loops = Y.kolam(res);
      return { svg: Y.toSVG(res, loops, { size: 112 }), lines: loops.length, sym: res.endKind };
    } catch (e) { return null; }
  }
  const sealText = v => v.src === 'V' ? `${VP[v.ch].tm}.${VP[v.ch].n}${v.n ? '.' + v.n : ''}` : v.src === 'H' ? `${HS[v.ch].n}.${v.n}` : (v.src === 'W' || v.src === 'Z') && !v.n ? '✦' : snum(v.n);
  async function shareVerse(v) {
    const b = BOOK[v.src], text = `${b[0]} · ${b[1]}\n\n${v.lines.join('\n')}\n\n— அறம் · Aram`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast(t('card.copied')); } catch (e) { toast(b[0] + ' · ' + sealText(v)); }
  }
  function card(v, opt) {
    opt = opt || {};
    const el = document.createElement('article'); el.className = 'leaf' + (opt.i % 3 === 1 ? ' alt' : opt.i % 3 === 2 ? ' alt2' : ''); el.style.setProperty('--i', Math.min(opt.i || 0, 8));
    const c = chInfo(v), b = BOOK[v.src];
    const k = NONVENBA.has(v.src) || (v.src === 'W' && v.ch < 2) || (v.src === 'Z' && (ZNV.has(v.ch) || v.dmg)) ? null : kolamSVG(v);
    const sy = SYM[k ? k.sym : v.sym] || ['', ''];
    const reading = t(v.rd === 'p' ? 'card.rd_p' : 'card.rd_c');
    let verdict;
    if (v.src === 'Z') verdict = ZNV.has(v.ch) ? ['n', t('card.notvenba')] : v.dmg ? ['n', t('card.damaged')] : k ? ['ok', t('card.ok')] : ['n', t('card.fail')];
    else if (v.src === 'W') verdict = v.ch < 2 ? ['n', t('card.notvenba')] : k ? ['ok', t('card.ok')] : ['n', t('card.fail')];
    else if (NONVENBA.has(v.src)) verdict = ['n', t('card.notvenba') + (v.flag ? ' ' + t('card.two_sutras') : v.src === 'A' ? ' ' + t('card.landscape') : '')];
    else verdict = ['ok', t('card.ok') + ' (' + reading + ')'];
    const poet = (v.src === 'P' || v.src === 'Q' || v.src === 'L' || v.src === 'B') && (v.poet || v.patron)
      ? `<p class="meta" lang="ta">${v.poet ? esc(t(v.src === 'L' ? 'card.author' : 'card.poet')) + ': ' + esc(v.poet) : ''}${v.poet && v.patron ? ' · ' : ''}${v.patron ? esc(t('card.praised')) + ': ' + esc(v.patron) : ''}</p>` : '';
    el.innerHTML =
      `<div class="vh"><span class="seal">${esc(sealText(v))}</span><div class="vmeta"><span class="vbook" lang="ta">${esc(b[0])} · ${esc(b[1])}</span><span class="vch" lang="ta" dir="ltr">${esc(c.ta)}${c.en ? ' · ' + esc(c.en) : ''}</span></div></div>` +
      `<div class="vbody"><div class="vtext"><p class="vt" lang="ta" dir="ltr">${v.lines.map(esc).join('<br>')}</p>` +
      (v.pope ? `<p class="pope" lang="en" dir="ltr">${v.ptitle ? `<span class="gist">${esc(v.ptitle)}</span> ` : ''}${esc(v.pope)}</p>` : '') + poet +
      (verdict[0] === 'ok' ? `<p class="chk">${esc(verdict[1])}</p>` : `<p class="note-line">${esc(verdict[1])}</p>`) + `</div>` +
      (k ? `<div class="kol"><div class="pic">${k.svg}</div><small>${esc(t('card.lines', { n: snum(k.lines) }))} · ${sy[0]}</small></div>` : '') +
      `</div><div class="interp"></div>` +
      `<div class="acts">` + (opt.explain ? `<button type="button" class="btn quiet small" data-act="explain">${esc(t('lib.explain'))}</button>` : '') + `<button type="button" class="btn quiet small" data-act="share">${esc(t('card.share'))}</button><span class="status"></span></div>`;
    if (opt.interp) showInterp(el, opt.interp, 'ask');
    el.querySelector('[data-act="share"]').addEventListener('click', () => shareVerse(v));
    if (opt.explain) {
      const btn = el.querySelector('[data-act="explain"]'), st = el.querySelector('.status');
      btn.addEventListener('click', () => explainOne(v, el, btn, st));
    }
    return el;
  }
  function showInterp(el, obj, scope) {
    el._interp = obj;
    const box = el.querySelector('.interp');
    const draw = () => {
      let h = '';
      const pair = k => hasAny(obj, k) ? `<div>${lab(k)}${paras(obj, k)}</div>` : '';
      h += pair('meaning') + pair('applies') + pair('context');
      box.innerHTML = h ? h + AI_NOTE() : '';
    };
    draw(); register(obj, draw, scope);
  }
  const strandOf = (cards) => { const s = document.createElement('div'); s.className = 'strand'; cards.forEach(c => s.appendChild(c)); return s; };

  // ----- asking an AI -----
  // Inside Claude the page asks Claude directly. In the installed app it asks a small server of your own (see server/README.md),
  // which holds the API key; the key is never inside the app.
  const CFG = window.ARAM_CONFIG || {};
  let samplePromise = null;
  function looseJSON(s) {
    s = String(s || '').trim();
    const a = s.search(/[\[{]/); if (a < 0) throw { code: 'bad_json' };
    const open = s[a], close = open === '{' ? '}' : ']', b = s.lastIndexOf(close);
    if (b <= a) throw { code: 'bad_json' };
    try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { throw { code: 'bad_json' }; }
  }
  // Before the first question leaves the phone, say what is sent and where, and ask (stores require this for third-party AI).
  function aiConsent() {
    if (store.get('aram.aiok') === '1') return Promise.resolve(true);
    return new Promise(res => {
      let done = false, poll = 0;
      const fin = v => { if (done) return; done = true; clearInterval(poll); if (v) store.set('aram.aiok', '1'); closeSheet(); res(v); };
      openSheet(t('set.privacy'), `<p>${esc(t('privacy.p'))}</p><div class="row"><button type="button" class="btn" data-agree>${esc(t('ai.agree'))}</button><button type="button" class="btn quiet" data-later>${esc(t('ai.later'))}</button></div>`, el => {
        el.querySelector('[data-agree]').addEventListener('click', () => fin(true));
        el.querySelector('[data-later]').addEventListener('click', () => fin(false));
      });
      poll = setInterval(() => { if (!document.querySelector('.sheet')) fin(false); }, 200);   // closed with the cross, the backdrop or Escape
    });
  }
  function proxySample() {
    return {
      async json(prompt, o) {
        o = o || {};
        if (!(await aiConsent())) throw { code: 'cancelled' };
        let res;
        try {
          res = await fetch(String(CFG.api).replace(/\/+$/, '') + '/ask', { method: 'POST', signal: o.signal, headers: { 'content-type': 'application/json', 'x-aram-key': CFG.key || '' }, body: JSON.stringify({ prompt, tier: o.modelTier || 'default', lang: ui, stable: o.stable && prompt.indexOf(o.stable) > 0 ? prompt.indexOf(o.stable) : 0 }) });
        } catch (e) { throw { code: e && e.name === 'AbortError' ? 'cancelled' : 'offline' }; }
        if (res.status === 429) throw { code: 'rate_limited' };
        if (!res.ok) throw { code: 'failed' };
        const j = await res.json();
        return looseJSON(j.text);
      }
    };
  }
  function getSample() {
    if (!samplePromise) samplePromise = (async () => {
      if (window.claude && window.claude.use) {
        try {
          const sm = await window.claude.use('sample');
          if (!sm) return CFG.api ? proxySample() : null;   // this viewer has no AI access
          // inside Claude, drop the server-only cache hint
          return { json: (p, o) => { o = Object.assign({}, o); delete o.stable; return sm.json(p, o); } };
        } catch (e) {}
      }
      if (CFG.api) return proxySample();
      return null;
    })();
    return samplePromise;
  }
  function errCopy(e) {
    switch (e && e.code) {
      case 'rate_limited': return t('err.rate');
      case 'cancelled': return t('err.stopped');
      case 'offline': return t('ask.offline');
      default: return t('err.generic');
    }
  }
  const CH_LIST = D.kc.map((c, i) => `KC${i + 1} | ${c[0]} | ${c[1]}`).concat(D.nc.map((c, i) => `NC${i + 1} | ${c[0]} | ${D.ne[c[1]]}`), D.t.n.map((c, i) => `TC${i + 1} | ${c[0]} | ${c[1]}`), D.m.map(c => `MC${c[0]} | ${c[1]} | Maṇimēkalai`), D.c.map(c => `CC${c[0]} | ${c[1]} | Cilappatikāram`), WN.map((w, i) => `WC${i} | ${w[0]} | Auvaiyār, ${['one-line maxims in alphabetical order (a to ṉ)', 'one-line maxims on conduct', 'thirty short verses on conduct and wisdom', 'forty verses on the good path'][i]}`), XC.map((c, i) => `XC${i} | ${c.title} | Tirumantiram, ${c.tant}`), HS.map(h => `HC${h.n} | ${h.title} | Tiruvācakam`), ZN.map((w, i) => `ZC${i} | ${w.ta} | ${w.en}, Eighteen Minor Works, ${['maxims in four-line venba', 'what is painful (ethics)', 'what is pleasant (ethics)', 'love in the rainy season (akam)', 'praise of a battle', 'love in the five landscapes (akam)', 'love in the five landscapes (akam)', 'love in the five landscapes (akam)', 'love in the five landscapes (akam)', 'ethics in threes', 'manners and conduct', 'ethics, five-root remedies', 'sayings in ten tens', 'ethics, six-ingredient remedies', 'ethics and wisdom', 'love (akam), fragmentary'][i]}`), VP.map((p, i) => VCNT[i] ? `VC${i} | ${p.name} | Tēvāram ${p.tm}.${p.n}` : '').filter(Boolean)).join('\n');
  const POEM_LIST = D.p.map(r => `P${r[0]} | ${r[1]}${r[4] ? ' | ' + r[4] : ''}`).concat(D.q.map(r => `Q${r[0]} | ${r[1]} | ${r[2]} | ${r[4][0]}`), D.l.map(r => `L${r[0]} | ${r[1]} | ${r[3][0]}`), D.a.map(r => `A${r[0]} | ${r[1]} | ${r[2][0]}`), D.pt.map(r => `B${r[0]} | ${r[4]} | ${r[2]}`)).join('\n');
  const EXAMPLES = [
    'A colleague took credit for my work. Should I confront him?',
    'என் நண்பன் கடன் வாங்கிவிட்டுத் திருப்பித் தரவில்லை.',
    'I keep putting off an important decision because I fear failing.',
    'பெற்றோரைக் கவனித்துக்கொள்வதா, என் வேலையா?',
    'How do I stay calm when someone insults me?',
    'Comment pardonner à quelqu\'un qui m\'a trahi ?',
    'كيف أتعامل مع الحسد في العمل؟',
    'Как простить человека, который меня предал?',
    '同事抢了我的功劳，我该当面质问他吗？',
    '직장에서 질투를 받을 때 어떻게 해야 하나요?',
    '大切な決断を、失敗が怖くて先延ばしにしてしまいます。',
    'Wie gehe ich damit um, wenn mich jemand ständig kritisiert?',
    'Een vriend heeft geld van me geleend en betaalt het niet terug. Wat moet ik doen?',
    '¿Cómo puedo ser paciente cuando todo sale mal?'
  ];
  let exShown = [];
  function renderExamples() {
    const d = Math.floor(Date.now() / 86400000), mine = t('ask.example');
    exShown = [mine];
    for (let k = 0; exShown.length < 5 && k < EXAMPLES.length; k++) { const e = EXAMPLES[(d + k * 3) % EXAMPLES.length]; if (!exShown.includes(e)) exShown.push(e); }
    $('examples').innerHTML = exShown.map((x, i) => `<button class="chip" data-i="${i}" dir="auto">${esc(x)}</button>`).join('');
  }
  $('examples').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { $('q').value = exShown[+b.dataset.i]; $('q').focus(); } });

  let ctl = null;
  const verseLine = v => v.src === 'M' ? `${v.id} (${D.m[v.ch][1]}): ${v.lines.join(' / ')}` : v.src === 'C' ? `${v.id} (${CMAP[v.ch][1]}): ${v.lines.join(' / ')}` : v.src === 'Q' ? `${v.id} (${v.tinai}, ${v.speaker}): ${v.lines.join(' / ')}` : v.src === 'A' ? `${v.id} (${v.tinai}): ${v.lines.join(' / ')}` : v.src === 'B' ? `${v.id} (${v.peyar}; ${v.patron}): ${v.lines.join(' / ')}` : v.src === 'W' ? `${v.id} (${WN[v.ch][1]}): ${v.lines.join(' / ')}` : v.src === 'Z' ? `${v.id} (${ZN[v.ch].en}${v.ctx ? ', ' + ztx(v.ctx) : ''}): ${v.lines.join(' / ')}` : v.src === 'V' ? `${v.id} (Tēvāram ${VP[v.ch].tm}.${VP[v.ch].n}): ${v.lines.join(' / ')}` : v.src === 'X' ? `${v.id} (Tirumantiram, ${ta(XC[v.ch].title)}): ${v.lines.join(' / ')}` : v.src === 'H' ? `${v.id} (Tiruvācakam, ${ta(HS[v.ch].title)}): ${v.lines.join(' / ')}` : v.src === 'L' ? `${v.id} (${v.sec}): ${v.lines.join(' / ')}` : v.src === 'P' ? `${v.id} (${v.title}): ${v.lines.join(' / ')}` : `${v.id}: ${v.lines.join(' / ')}` + (v.pope ? ` || Pope: ${v.pope}` : '');
  const keysFor = (langs, keys) => keys.flatMap(k => langs.map(l => `"${k}_${l}":""`)).join(', ');
  async function ask() {
    const q = $('q').value.trim(); if (!q) { $('ask-status').textContent = t('ask.empty_q'); return; }
    const st = $('ask-status'), out = $('ask-out'); st.className = 'status';
    const sample = await getSample();
    if (!sample) { st.className = 'status err'; st.textContent = t('ask.offline'); return; }
    const langs = activeList();
    ctl = new AbortController(); $('ask').disabled = true; $('stop').hidden = false; out.innerHTML = ''; dropScope('ask');
    try {
      st.textContent = t('ask.finding');
      const s1 = await sample.json(
        `You help people find verses of the Thirukkural (chapters KC1-KC133), the Nālaṭiyār (chapters NC1-NC40) the Tolkāppiyam (chapters TC1-TC27), the Puṟanāṉūṟu (single poems, listed below as P1-P400) the Maṇimēkalai (chapters MC0-MC30), the Cilappatikāram (chapters CC11-CC30, its Maturai and Vañci books) Auvaiyār's four works (chapters WC0-WC3) the Tirumantiram (chapters XC0-XC${XC.length - 1}), the Tiruvācakam (chapters HC1-HC51), the Tēvāram (patikams VC0-VC${VP.length - 1}, each a set of about ten hymns to Śiva at one holy place), sixteen of the Eighteen Minor Works (chapters ZC0-ZC15, each a whole short work) and the Kuṟuntokai, Kalittokai, Akanāṉūṟu and Patiṟṟuppattu (single poems, listed below as Q1-Q401, L1-L150, A1-A400 and B11-B90) that bear on a question. The Tolkāppiyam is a grammar and poetics: choose its chapters only when the question concerns love, courtship and marriage, war and kingship, the expression of feeling, poetry or language, or the conventions of conduct they describe. The Puṟanāṉūṟu holds heroic and elegiac poems on kings, war, generosity, poets, old age and death. The Maṇimēkalai is a Buddhist epic: choose its chapters (at most 2) only when the question concerns hunger and charity, grief, desire and attachment, renunciation, or religious and philosophical debate. The Cilappatikāram is the epic of Kōvalaṉ, Kaṇṇaki and Mātavi: choose its chapters (at most 2) only when the question concerns faithfulness and betrayal, justice and the duty of rulers, wrongful punishment, grief and anger, or fate. Auvaiyār's works (WC0-WC3) are plain advice on conduct and a good life: choose one or two when the question is a practical or moral dilemma. The Tirumantiram (Tirumūlar, Śaiva yoga and wisdom), the Tiruvācakam (Māṇikkavācakar, the longing and surrender of the soul) and the Tēvāram (the three great hymnists, praise of Śiva) are devotional and philosophical: choose their chapters (at most 3 in all) only when the question concerns faith, surrender and grace, suffering and illness, the body and its impermanence, death, ethics of a spiritual life, or when the person names a temple town. The Patiṟṟuppattu praises Cēra kings: choose its poems when the question concerns rulers, generosity, courage or gratitude. The Kuṟuntokai holds short love poems, the Akanāṉūṟu long ones (mostly of separation and waiting), and the Kalittokai longer dramatic love poems; choose from them when the question concerns love, longing, separation, jealousy, waiting or a lover's or friend's words. The Minor Works (ZC0-ZC15) are short collections in venba metre: most give ethical and practical advice (ZC0 Nāṉmaṇikkaṭikai, ZC1 Innā Nāṟpatu on what is painful, ZC2 Iniyavai Nāṟpatu on what is pleasant, ZC9 Tirikaṭukam, ZC10 Ācārakkōvai on manners, ZC11, ZC12, ZC13, ZC14), ZC3, ZC5, ZC6, ZC7, ZC8 and ZC15 are love poems and ZC4 praises a battle: choose one or two of them (at most 2) when the question is a practical, moral or love dilemma.\n\nChapters (id | Tamil | English):\n${CH_LIST}\n\nPoems (Puṟanāṉūṟu P: title | theme; Kuṟuntokai Q: landscape | speaker | first line; Kalittokai L: landscape | first line; Akanāṉūṟu A: landscape | first line; Patiṟṟuppattu B: title | king praised):\n${POEM_LIST}\n\nQuestion (in any language):\n${q}\n\nChoose the 3 to 5 chapters most likely to hold verses that speak to the question, and up to 8 poems (P, Q, L, A or B ids) if any fit. Include several books when they have something to say. Reply with JSON only: {"chapters": ["KC12", "NC7"], "poems": ["P18"]}`,
        { modelTier: 'quick', signal: ctl.signal, stable: 'Question (in any language):' });
      const ids = (s1.chapters || []).filter(x => /^(KC\d+|NC\d+|TC\d+|MC\d+|CC\d+|WC\d|XC\d+|HC\d+|VC\d+|ZC\d{1,2})$/.test(x)).slice(0, 5);
      const pool = [];
      ids.forEach(id => {
        const i = +id.slice(2) - 1;
        if (id[0] === 'M' || id[0] === 'C' || id[0] === 'W' || id[0] === 'X' || id[0] === 'H' || id[0] === 'V' || id[0] === 'Z') return;
        if (id[0] === 'K' && D.kc[i]) KV.filter(v => v.ch === i).forEach(v => pool.push(v));
        if (id[0] === 'N' && D.nc[i]) NV.filter(v => v.ch === i).forEach(v => pool.push(v));
        if (id[0] === 'T' && D.t.n[i]) TV.filter(v => v.ch === i).forEach(v => pool.push(v));
      });
      let mc = 0;
      ids.filter(x => x[0] === 'M').forEach(id => { const ci = +id.slice(2); if (D.m[ci] && mc < 2 && pool.length < 400) { mc++; MV.filter(v => v.ch === ci).slice(0, 60).forEach(v => pool.push(v)); } });
      let cc = 0;
      ids.filter(x => x[0] === 'C').forEach(id => { const ci = +id.slice(2); if (CMAP[ci] && cc < 2 && pool.length < 400) { cc++; CV.filter(v => v.ch === ci).slice(0, 60).forEach(v => pool.push(v)); } });
      let dv = 0;
      ids.forEach(id => {
        const k = +id.slice(2);
        if (dv >= 3 || pool.length >= 380) return;
        if (id[0] === 'X' && XC[k]) { dv++; XV.filter(v => v.ch === k).slice(0, 30).forEach(v => pool.push(v)); }
        if (id[0] === 'H' && HS.find(h => h.n === k)) { dv++; const si = HS.findIndex(h => h.n === k); HV.filter(v => v.ch === si).slice(0, 25).forEach(v => pool.push(v)); }
        if (id[0] === 'V' && VP[k]) { dv++; VV.filter(v => v.ch === k).slice(0, 12).forEach(v => pool.push(v)); }
      });
      let zc = 0;
      ids.filter(x => x[0] === 'Z').forEach(id => { const zi = +id.slice(2); if (ZN[zi] && zc < 2 && pool.length < 330) { zc++; ZV.filter(v => v.ch === zi && v.n && !v.dmg).slice(0, 160).forEach(v => pool.push(v)); } });
      let wc = 0;
      ids.filter(x => x[0] === 'W').forEach(id => { const wi = +id.slice(2); if (WN[wi] && wc < 2) { wc++; WV.filter(v => v.ch === wi && v.n).forEach(v => pool.push(v)); } });
      const cnt = { P: 0, Q: 0, L: 0, A: 0, B: 0 }, cap = { P: 6, Q: 6, L: 4, A: 5, B: 4 };
      (s1.poems || []).filter(x => /^[PQLAB]\d+$/.test(x) && BY[x]).forEach(x => { if (cnt[x[0]] < cap[x[0]]) { cnt[x[0]]++; pool.push(BY[x]); } });
      if (!pool.length) throw { code: 'empty' };
      st.textContent = t('ask.reading', { n: pool.length });
      const s2 = await sample.json(
        `You are a careful, humble reader of the Thirukkural, the Nālaṭiyār, the Tolkāppiyam and the Sangam and epic poems.\n\nA person asks (in any language):\n${q}\n\nCandidate verses, one per line as id: Tamil lines (and G. U. Pope's English for Kurals and Nālaṭiyār verses):\n${pool.map(verseLine).join('\n')}\n\nTask: choose the 3 to 5 verses (never more than 6) that best bear on the question. Use only ids from the list. Write in these languages only: ${langs.map(l => langName[l] + ' (' + l + ')').join(', ')}. For each verse give:\n- meaning_<lang>: the plain meaning of the verse, 1 to 2 sentences, taken from its own words.\n- applies_<lang>: how it bears on the person's situation, 1 to 2 sentences, offered as a thought and not an order.\nAlso give overview_<lang> (2 to 3 sentences drawing the verses together) and, only if needed, note_<lang> (for example when the verses speak to the question only loosely, or a word in a verse is read in different ways).\nRules: ids starting with T are Tolkāppiyam sūtras, terse rules of grammar and poetics: say plainly what the rule states, and relate it to the person's situation only where it describes a convention of love, conduct, war or expression, never by stretching a grammar rule into advice; ids starting with P are Puṟanāṉūṟu poems (heroic and elegiac, c. 1st to 3rd century): say what the poem says and what human experience it speaks to; ids starting with V are Tēvāram hymns (a verse of a patikam in praise of Śiva at a holy place, by Campantar, Appar or Cuntarar); ids starting with X are Tirumantiram verses (Tirumūlar's Śaiva wisdom and yoga, by chapter); ids starting with H are passages of the Tiruvācakam (Māṇikkavācakar's hymns of longing and surrender): for these three, say what the verse says, and relate it to the person's situation only where it truly speaks to faith, suffering, impermanence or ethics; do not claim doctrines the lines do not state; ids starting with A are Akanāṉūṟu poems (long Sangam love poems, mostly of separation and waiting, spoken by a lover, the woman's friend or the mother; the landscape is given): say what the poem says and the feeling it holds; ids starting with B are Patiṟṟuppattu poems (praise poems for Cēra kings): say what the poem says in praise and what virtue or experience it speaks to; ids starting with W are Auvaiyār's maxims (W0 Āttiṟcūṭi and W1 Koṉṟaivēntaṉ are one-line sayings, W2 Mūturai and W3 Nalvaḻi are short verses on conduct): give the plain meaning and how it applies; ids starting with Q are Kuṟuntokai poems (short Sangam love poems in the voice of a lover, the woman's friend or the mother; the landscape and speaker are given): say what the poem says and the feeling it holds; ids starting with L are Kalittokai poems (longer dramatic Sangam love poems, in kali metre): say what happens in the poem and the feeling it holds; ids starting with C are 8-line passages of the Cilappatikāram, the epic of Kōvalaṉ and Kaṇṇaki: read each passage inside its story, say only what its lines and its chapter title support, and invent no plot details; ids starting with M are 8-line passages of the Maṇimēkalai, a Buddhist epic: read each passage inside its story, say only what its lines and its chapter title support, and invent no plot details; ids starting with Z are verses of the Minor Works (Patiṉeṇkīḻkkaṇakku, c. 3rd to 6th century, in venba metre) and the work is named in brackets: for those on ethics and conduct give the plain meaning and how it applies; for the love poems (Kār Nāṟpatu, the Aintiṇai and Tiṇaimoḻi works, Tiṇaimālai, Kainnilai) say what is said, by the woman, her friend or the lover, and the feeling it holds; Kaḷavaḻi Nāṟpatu praises a battle, so say what it describes; do not quote the Tamil verse again; do not attribute readings to named commentators; if no verse really fits, say so in the note and return fewer verses; write natural, simple language in each language (Modern Standard Arabic for Arabic, Simplified Chinese for Chinese); no flattery.\nReply with JSON only: {${keysFor(langs, ['overview'])}, "picks": [{"id": "K1", ${keysFor(langs, ['meaning', 'applies'])}}], ${keysFor(langs, ['note'])}}`,
        { signal: ctl.signal });
      st.textContent = '';
      renderAnswer(s2, out);
    } catch (e) {
      st.className = 'status err';
      st.textContent = e && e.code === 'empty' ? t('ask.no_chapter') : errCopy(e);
    } finally { $('ask').disabled = false; $('stop').hidden = true; ctl = null; }
  }
  function renderAnswer(a, out) {
    const frag = document.createDocumentFragment();
    if (hasAny(a, 'overview')) {
      const o = document.createElement('div'); o.className = 'overview';
      const draw = () => { o.innerHTML = lab('overview') + paras(a, 'overview'); };
      draw(); register(a, draw, 'ask'); frag.appendChild(o);
    }
    let shown = 0; const cards = [];
    (a.picks || []).slice(0, 6).forEach(pk => { const v = BY[pk.id]; if (v) { cards.push(card(v, { interp: pk, i: shown })); shown++; } });
    if (shown) frag.appendChild(strandOf(cards));
    if (hasAny(a, 'note') || !shown) {
      const n = document.createElement('div'); n.className = 'note';
      const draw = () => { n.innerHTML = paras(a, 'note') + (!shown ? `<p>${esc(t('ask.no_pick'))}</p>` : ''); };
      draw(); register(a, draw, 'ask'); frag.appendChild(n);
    }
    if (shown) {
      const row = document.createElement('div'); row.className = 'row';
      row.innerHTML = `<button type="button" class="btn quiet small">${esc(t('ask.flag'))}</button>`;
      row.firstChild.addEventListener('click', () => reportAnswer(a));
      frag.appendChild(row);
    }
    out.appendChild(frag);
    reveal(out);
    ensureLangs();
  }
  // Report this answer: an in-app route for flagging an AI answer (stores expect one).
  async function reportAnswer(a) {
    const body = 'Question:\n' + ($('q').value || '') + '\n\nVerses: ' + (a.picks || []).map(p => p.id).join(', ') + '\n\nAnswer:\n' + JSON.stringify(a, null, 1).slice(0, 3500);
    if (CFG.support) { location.href = 'mailto:' + CFG.support + '?subject=' + encodeURIComponent('Aram: report an answer') + '&body=' + encodeURIComponent(body); return; }
    try { await navigator.clipboard.writeText(body); } catch (e) {}
    toast(t('card.copied'));
  }
  $('ask').addEventListener('click', ask);
  $('stop').addEventListener('click', () => { if (ctl) ctl.abort(); });
  $('q').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(); });

  async function explainOne(v, el, btn, st) {
    const sample = await getSample();
    if (!sample) { st.className = 'status err'; st.textContent = t('ask.offline'); return; }
    const langs = activeList();
    btn.disabled = true; st.className = 'status'; st.textContent = t('lib.reading');
    try {
      const c = chInfo(v);
      const r = await sample.json(
        `Explain one ${v.src === 'T' ? 'sūtra of the Tolkāppiyam (a grammar and poetics, so say plainly what the rule states and do not stretch it into life advice)' : v.src === 'V' ? 'verse of the Tēvāram (a hymn in praise of Śiva at a holy place by one of the three great Śaiva hymnists; say what it says and what it praises)' : v.src === 'X' ? 'verse of the Tirumantiram (Tirumūlar\'s Śaiva wisdom and yoga; say what it says plainly and do not invent doctrine the lines do not state)' : v.src === 'H' ? 'passage of the Tiruvācakam (Māṇikkavācakar\'s hymns of longing and surrender to Śiva; say what it says and the feeling it holds)' : v.src === 'A' ? 'poem of the Akanāṉūṟu (a long Sangam love poem, mostly of separation and waiting; say what it says, who is speaking and to whom if the lines show it)' : v.src === 'B' ? 'poem of the Patiṟṟuppattu (a Sangam praise poem for a Cēra king; say what it says and what it praises)' : v.src === 'W' ? 'saying or verse of Auvaiyār (' + WN[v.ch][1] + ', a work of plain moral advice)' : v.src === 'Z' ? 'verse of the ' + ZN[v.ch].en + ' (one of the Eighteen Minor Works, short collections in venba metre on ethics, conduct and love; say what it says and, for a love verse, who speaks if the lines or the label show it)' : v.src === 'Q' ? 'poem of the Kuṟuntokai (a short Sangam love poem; say what it says, who is speaking and to whom if the lines or the label show it)' : v.src === 'L' ? 'poem of the Kalittokai (a longer dramatic Sangam love poem in kali metre; say what happens and the feeling it holds)' : v.src === 'C' ? 'passage of the Cilappatikāram (the epic of Kōvalaṉ and Kaṇṇaki; read it inside its story, say only what its lines and chapter title support, and invent no plot details)' : v.src === 'P' ? 'poem of the Puṟanāṉūṟu (a Sangam anthology of heroic and elegiac poems; say what it says and who speaks or is addressed if the lines show it)' : v.src === 'M' ? 'passage of the Maṇimēkalai (a Buddhist epic; read it inside its story, say only what its lines and chapter title support, and invent no plot details)' : 'verse of the ' + (v.src === 'K' ? 'Thirukkural' : 'Nālaṭiyār')} to a thoughtful reader.\nChapter: ${c.ta}${c.en ? ' (' + c.en + ')' : ''}\n${v.src === 'T' ? 'Sūtra' : v.src === 'M' || v.src === 'C' || v.src === 'H' ? 'Passage' : v.src === 'P' || v.src === 'Q' || v.src === 'L' || v.src === 'A' || v.src === 'B' ? 'Poem' : 'Verse'} ${v.n}: ${v.lines.join(' / ')}${v.pope ? '\nPope\'s English: ' + v.pope : ''}\n\nWrite in these languages only: ${langs.map(l => langName[l] + ' (' + l + ')').join(', ')}. Give meaning_<lang> (the plain meaning, 1 to 2 sentences, from the verse's own words) and context_<lang> (1 to 2 sentences on the theme and how the verse is usually understood; say so if the reading is disputed). Do not quote the verse again; do not attribute readings to named commentators; write natural, simple language (Modern Standard Arabic for Arabic, Simplified Chinese for Chinese). Reply with JSON only: {${keysFor(langs, ['meaning', 'context'])}}`);
      showInterp(el, r, el.closest('#v-home') ? 'home' : el.closest('#v-check') ? 'check' : 'browse'); st.textContent = '';
    } catch (e) { st.className = 'status err'; st.textContent = errCopy(e); }
    btn.disabled = false;
  }

  // ----- check a quote -----
  const norm = s => (s.match(/[஀-௿]/g) || []).join('');
  let NORM = null;
  function bigrams(s) { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.substr(i, 2); m.set(g, (m.get(g) || 0) + 1); } return m; }
  function dice(a, b) { let hit = 0, na = 0, nb = 0; a.forEach(x => na += x); b.forEach(x => nb += x); a.forEach((x, g) => { if (b.has(g)) hit += Math.min(x, b.get(g)); }); return na + nb ? 2 * hit / (na + nb) : 0; }
  function runCheck() {
    const raw = $('cq').value.trim(), out = $('check-out'), st = $('check-status'); out.innerHTML = ''; st.className = 'status';
    dropScope('check');
    if (!NORM) NORM = ALL.map(v => norm(v.text));
    const q = norm(raw);
    if (q.length < 12) { st.textContent = t('check.short'); return; }
    st.textContent = '';
    let best = -1, bs = 0, part = -1;
    const qb = bigrams(q);
    for (let i = 0; i < ALL.length; i++) {
      if (NORM[i] === q) { best = i; bs = 1; part = -1; break; }
      if (part < 0 && q.length >= 14 && NORM[i].includes(q)) part = i;
      if (NORM[i].length < q.length * 0.5 || NORM[i].length > q.length * 2) continue;
      const s = dice(qb, bigrams(NORM[i])); if (s > bs) { bs = s; best = i; }
    }
    const note = document.createElement('div'); note.className = 'note';
    const say = (title, text) => `<p><b>${esc(title)}</b> ${esc(text)}</p>`;
    if (part >= 0 && bs < 1) {
      note.innerHTML = say(t('check.part_t'), t('check.part_d', { ref: ref(ALL[part]) }));
      out.appendChild(note); out.appendChild(strandOf([card(ALL[part], { explain: true })]));
    } else if (bs === 1) {
      note.innerHTML = say(t('check.exact_t'), t('check.exact_d'));
      out.appendChild(note); out.appendChild(strandOf([card(ALL[best], { explain: true })]));
    } else if (bs >= 0.8) {
      const v = ALL[best], vw = new Set(v.text.split(/\s+/).map(norm));
      const diff = raw.split(/\s+/).map(w => vw.has(norm(w)) || !norm(w) ? esc(w) : `<mark>${esc(w)}</mark>`).join(' ');
      note.innerHTML = say(t('check.close_t'), t('check.close_d', { ref: ref(v), pct: Math.round(bs * 100) })) + `<p class="diff ta" lang="ta" dir="ltr">${diff}</p>`;
      out.appendChild(note); out.appendChild(strandOf([card(v, { explain: true })]));
    } else {
      note.innerHTML = say(t('check.none_t'), t('check.none_d'));
      out.appendChild(note);
    }
    // the metre check on what was pasted, when it looks like a venba
    const lines = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 2 || lines.length === 4) {
      try {
        const r = Y.read(lines.join('\n'));
        const p = document.createElement('p'); p.className = 'chk' + (r.check.errs.length ? ' bad' : '');
        p.textContent = r.check.errs.length ? t('check.metre_bad') + ' ' + r.check.errs[0].msg : t('check.metre_ok');
        out.appendChild(p);
      } catch (e) {}
    }
    reveal(out);
  }
  $('check').addEventListener('click', runCheck);

  // ----- browse -----
  function fillChapters() {
    const sel = $('bch'), src = $('bsrc').value; let h = '';
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
    const src = $('bsrc').value, i = +$('bch').value, out = $('browse-out'); out.innerHTML = ''; dropScope('browse');
    SRCV[src].filter(v => v.ch === i).forEach((v, k) => out.appendChild(card(v, { explain: true, i: k })));
  }
  $('bch').addEventListener('change', browse);
  // ----- library: a shelf of works, then one work at a time -----
  const BOOKS = [['K', 'திருக்குறள்', 'Thirukkural'], ['N', 'நாலடியார்', 'Nālaṭiyār'], ['W', 'அவ்வையார்', 'Auvaiyār'], ['Z', 'பதினெண் கீழ்க்கணக்கு', 'Minor Works'],
    ['T', 'தொல்காப்பியம்', 'Tolkāppiyam'], ['P', 'புறநானூறு', 'Puṟanāṉūṟu'], ['Q', 'குறுந்தொகை', 'Kuṟuntokai'], ['A', 'அகநானூறு', 'Akanāṉūṟu'], ['L', 'கலித்தொகை', 'Kalittokai'],
    ['B', 'பதிற்றுப்பத்து', 'Patiṟṟuppattu'], ['C', 'சிலப்பதிகாரம்', 'Cilappatikāram'], ['M', 'மணிமேகலை', 'Maṇimēkalai'], ['V', 'தேவாரம்', 'Tēvāram'], ['X', 'திருமந்திரம்', 'Tirumantiram'], ['H', 'திருவாசகம்', 'Tiruvācakam']];
  function renderShelf() {
    $('shelf').innerHTML = BOOKS.map((b, i) => `<button type="button" class="tile" data-b="${b[0]}" style="--i:${i}"><span class="tt" lang="ta" dir="ltr">${b[1]}</span><span><span class="tr">${b[2]}</span><br><span class="tn">${esc(t('lib.entries', { n: num(SRCV[b[0]].length) }))}</span></span></button>`).join('');
  }
  // Tamil titles differ a lot in length; shrink a title only as far as needed so a word is never broken in two
  function fitTiles() {
    document.querySelectorAll('#shelf .tt').forEach(el => {
      el.style.fontSize = '';
      if (!el.offsetParent) return;
      let s = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 0.5 && s > 11) { s -= 0.5; el.style.fontSize = s + 'px'; }
    });
  }
  window.addEventListener('resize', fitTiles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTiles);
  $('shelf').addEventListener('click', e => { const b = e.target.closest('.tile'); if (b) openBook(b.dataset.b); });
  let bookOpen = false;
  function openBook(id) {
    const b = BOOKS.find(x => x[0] === id); if (!b) return;
    $('bsrc').value = id; bookOpen = true;
    $('book-ta').textContent = b[1]; $('book-en').textContent = b[2];
    $('shelf-wrap').hidden = true; $('book').hidden = false;
    fillChapters(); browse(); window.scrollTo(0, 0);
  }
  function closeBook() { bookOpen = false; $('book').hidden = true; $('shelf-wrap').hidden = false; dropScope('browse'); $('browse-out').innerHTML = ''; window.scrollTo(0, 0); }
  $('book-back').addEventListener('click', closeBook);

  // ----- settings and credits (bottom sheets) -----
  let sheetEl = null, scrimEl = null, lastFocus = null;
  function openSheet(title, body, onMount) {
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
  function closeSheet() {
    if (!sheetEl) return;
    sheetEl.remove(); scrimEl.remove(); sheetEl = scrimEl = null;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  const THEMES = ['auto', 'day', 'night'];
  function applyTheme(pref) {
    if (pref === 'day' || pref === 'night') document.documentElement.dataset.theme = pref; else delete document.documentElement.dataset.theme;
    const dark = pref === 'night' || (pref !== 'day' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? '#22130B' : '#43251A';
  }
  function applySize(pct) { document.documentElement.style.setProperty('--fs', String(pct / 100)); }

  function openSettings(focus) {
    const pref = store.get('aram.theme') || 'auto', size = +(store.get('aram.size') || 100);
    const body = `
      <div><h3>${esc(t('set.ui'))}</h3>
        <input class="search" id="ls-q" type="search" placeholder="${esc(t('set.search'))}" aria-label="${esc(t('set.search'))}" autocomplete="off" autocapitalize="off" spellcheck="false">
      </div>
      <div id="sec-ui"><div class="langlist" id="ls-ui" role="radiogroup" aria-label="${esc(t('set.ui'))}"></div></div>
      <div id="sec-mean"><h3>${esc(t('set.meanings'))}</h3><p class="hint">${esc(t('set.meanings_hint', { n: MAXLANG }))}</p><div class="langlist" id="ls-mean"></div></div>
      <div><h3>${esc(t('set.appearance'))}</h3><div class="segmented" id="seg-theme">${THEMES.map(x => `<button type="button" data-th="${x}" aria-pressed="${pref === x}">${esc(t('set.' + (x === 'auto' ? 'auto' : x)))}</button>`).join('')}</div></div>
      <div><h3>${esc(t('set.size'))}</h3><div class="sizer"><span aria-hidden="true" style="font-size:.85rem">A</span><input type="range" id="fs" min="90" max="140" step="5" value="${size}" aria-label="${esc(t('set.size'))}"><span aria-hidden="true" style="font-size:1.4rem">A</span></div></div>
      <div class="prose"><h3>${esc(t('set.about'))}</h3><p>${esc(t('about.p1'))}</p><p class="m">${esc(t('about.p2'))}</p><h3>${esc(t('set.privacy'))}</h3><p class="m">${esc(t('privacy.p'))}</p>
        <div class="row"><button type="button" class="btn quiet" id="open-credits">${esc(t('set.credits'))}</button></div></div>`;
    openSheet(t('set.title'), body, el => {
      const q = el.querySelector('#ls-q');
      const draw = () => {
        const f = q.value.trim().toLowerCase();
        const ok = l => !f || l[1].toLowerCase().includes(f) || l[2].toLowerCase().includes(f) || l[0] === f;
        el.querySelector('#ls-ui').innerHTML = LANGS.filter(ok).map(l => `<button type="button" role="radio" aria-checked="${l[0] === ui}" data-ui="${l[0]}" lang="${l[4]}"${l[3] === 'rtl' ? ' dir="rtl"' : ''}><span>${esc(l[1])}</span><small>${esc(l[2])}</small></button>`).join('');
        el.querySelector('#ls-mean').innerHTML = LANGS.filter(ok).map(l => `<button type="button" aria-pressed="${active.has(l[0])}" data-m="${l[0]}" lang="${l[4]}"${l[3] === 'rtl' ? ' dir="rtl"' : ''}><span>${esc(l[1])}</span><small>${esc(l[2])}</small></button>`).join('');
      };
      draw(); q.addEventListener('input', draw);
      el.addEventListener('click', e => {
        const u = e.target.closest('[data-ui]'); if (u) { setUI(u.dataset.ui); closeSheet(); return; }
        const m = e.target.closest('[data-m]'); if (m) { toggleLang(m.dataset.m); draw(); return; }
        const th = e.target.closest('[data-th]'); if (th) { store.set('aram.theme', th.dataset.th); applyTheme(th.dataset.th); el.querySelectorAll('[data-th]').forEach(b => b.setAttribute('aria-pressed', String(b === th))); return; }
        if (e.target.closest('#open-credits')) openCredits();
      });
      el.querySelector('#fs').addEventListener('input', e => { store.set('aram.size', e.target.value); applySize(+e.target.value); });
      if (focus === 'meanings') setTimeout(() => { const s = el.querySelector('#sec-mean'); if (s) s.scrollIntoView({ block: 'start' }); }, 30);
    });
  }
  $('btn-set').addEventListener('click', () => openSettings());
  $('btn-lang').addEventListener('click', () => openSettings('ui'));

  const CR = [
    ['Thirukkural', 'Text from the open tk120404/thirukkural dataset (Apache License 2.0), with 24 corrections found by comparing other editions. English by G. U. Pope (1886), from the Project Madurai e-text (made by OCR and edited, so a stray slip is possible).'],
    ['Nālaṭiyār', 'Project Madurai edition in Tamil script, with encoding repairs and corrections checked against other editions. English by G. U. Pope (1893).'],
    ['Tolkāppiyam', 'Etext by Dr. K. Kalyanasundaram, proof-read by N. D. Logasundaram: the sūtras alone, without commentary, with words split as that edition gives them. In five places its numbering skips, so one entry there may hold two neighbouring sūtras.'],
    ['Puṟanāṉūṟu', 'Text from K. A. P. Viswanatham Higher Secondary School, Tiruchirappalli. Poems 200, 267 and 268 are missing from it.'],
    ['Maṇimēkalai', 'From the Tamilex transcription, University of Cologne, proof-read by Ma. Sivakumar. Cut here into passages of eight lines.'],
    ['Cilappatikāram', 'Etext by P. R. Sivakumar, proof-read by P. K. Ilango. The Maturai and Vañci kāṇṭams (kātai 11–30) are included; the Pukār kāṇṭam is not. Cut into passages of eight lines.'],
    ['Kuṟuntokai and Kalittokai', 'Prepared by Dr. K. Kalyanasundaram; the Kuṟuntokai proof-read by Sarala Sandirasegarane. The Kalittokai authorship shown follows the tradition recorded in that edition.'],
    ['Akanāṉūṟu', 'Transliteration by Dr. Thomas Malten and colleagues, University of Cologne; proof-read by Sivakumar and Raju Rajendran. The source repeats two poem numbers, read here as 131 and 319, and gives no landscape, so each poem’s landscape follows the traditional arrangement of the anthology.'],
    ['Patiṟṟuppattu', 'Text input by Sivalingam Ramalingam, proof-read by Periannan Chandrasekaran. It holds poems 11 to 90, since the first and tenth tens are lost, and some lines are missing.'],
    ['Auvaiyār', 'Āttiṟcūṭi, Koṉṟaivēntaṉ, Mūturai and Nalvaḻi, edition prepared by Dr. K. Kalyanasundaram. Some Mūturai and Nalvaḻi verses do not pass the metre check as printed.'],
    ['The Eighteen Minor Works', 'Sixteen works, input and proof-reading by Ms. Sarala Sandirasegarane, web versions by Dr. K. Kalyanasundaram. About nine in ten of their venbas pass the metre check as printed. Kainnilai survives in fragments, so 17 of its verses are damaged and shown with dots. In Aintiṇai Eḻupatu verses 25 and 26 are lost and the file ends at verse 68. Palamoḻi Nāṉūṟu is not included. Where a work numbers its invocation as verse 1, the numbers follow the etext.'],
    ['Tēvāram', 'The seven tirumuṟai (Campantar, Appar, Cuntarar), etexts by many volunteers. About 97 per cent of the numbered verses are here (roughly 8,040 of 8,240). In some patikams the source’s verse markers are damaged, so a card may hold two neighbouring verses. Patikams 6.42–6.50 are absent, because the source for the sixth tirumuṟai breaks off after verse 409 and the next file begins at 509.'],
    ['Tirumantiram', 'Prepared by Dr. K. Kalyanasundaram, proof-read by G. Venugopalan. 2,772 of the 3,047 verses are here; verses 1155 to 1418 of the fourth tantiram are not in the files used.'],
    ['Tiruvācakam', 'Project Madurai etext, shown in passages: the hymns that number their stanzas are split by stanza, the others in eight-line passages.'],
    ['All the Project Madurai texts', 'The Tēvāram, Tirumantiram, Tiruvācakam and Minor Works were converted from transliteration into Tamil script and may keep a few slips.'],
    ['Yāppu and fonts', 'The metre check and kolam come from Yāppu 0.5 (MIT licence, © 2026 Kevin Cruz). Fonts: Tiro Tamil, Noto Serif Tamil and Mukta Malar, under the SIL Open Font License.']
  ];
  function openCredits() {
    const body = `<div class="credits-list">
      <p>Most texts are Project Madurai e-texts (projectmadurai.org). Their notice, which asks that it be kept with the texts:</p>
      <p class="pm" lang="en" dir="ltr">© Project Madurai, 1998-2021. Project Madurai is an open, voluntary, worldwide initiative devoted to preparation of electronic texts of tamil literary works and to distribute them free on the Internet. Details of Project Madurai are available at the website http://www.projectmadurai.org/ You are welcome to freely distribute this file, provided this header page is kept intact.</p>
      ${CR.map(c => `<p lang="en" dir="ltr"><b>${esc(c[0])}.</b> ${esc(c[1])}</p>`).join('')}
    </div>`;
    openSheet(t('set.credits'), body);
  }
  // ----- home -----
  function medalSVG() {
    try {
      const r = Y.read(KV[9].text), prog = Y.compile(r.verse), res = Y.run(prog, r.verse), loops = Y.kolam(res);
      const n = res.n, N = 2 * n, pad = 0.9, W = N + 2 * pad;
      let s = `<svg viewBox="${-pad} ${-pad} ${W} ${W}" aria-hidden="true">`;
      loops.forEach(lp => { s += `<path d="${Y.loopPath(lp, 1)}" fill="none" stroke="#F6EFDF" stroke-width="0.2" stroke-linecap="round" stroke-linejoin="round"/>`; });
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += `<circle cx="${2 * i + 1}" cy="${2 * j + 1}" r="0.17" fill="#F6EFDF"/>`;
      return s + '</svg>';
    } catch (e) { return ''; }
  }
  function drawMedal() {
    const el = $('medal'); el.innerHTML = medalSVG();
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.querySelectorAll('path').forEach(p => {
      const len = p.getTotalLength(); if (!len) return;
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      const a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 3200, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
      a.onfinish = () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; a.cancel(); };
    });
  }
  let todayIdx = (Math.floor(Date.now() / 86400000) * 37 + 11) % KV.length;
  function renderToday() { dropScope('home'); const el = $('today'); el.innerHTML = ''; el.appendChild(card(KV[todayIdx], { explain: true, i: 0 })); }
  $('another').addEventListener('click', () => { let n; do { n = Math.floor(Math.random() * KV.length); } while (n === todayIdx); todayIdx = n; renderToday(); });

  // ----- language switch -----
  function applyUI() {
    const m = LMETA[ui];
    document.documentElement.lang = m.html; document.documentElement.dir = m.dir;
    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
    renderLangBars(); renderShelf(); renderExamples(); renderToday();
    if (bookOpen) { fillChapters(); browse(); }
  }
  function setUI(id) {
    if (!LMETA[id]) return;
    const wasOnly = active.size === 1 && active.has(ui);
    ui = id; store.set('aram.ui', id);
    if (wasOnly) { active.clear(); active.add(id); store.set('aram.langs', JSON.stringify([id])); }   // meanings follow the app language until you choose otherwise
    applyUI(); REG.forEach(e => e.redraw()); ensureLangs();
  }

  // ----- start -----
  ui = detectUI(); loadActive();
  const urlUI = new URLSearchParams(location.search).get('ui'); if (urlUI && LMETA[urlUI]) { ui = urlUI; if (!store.get('aram.langs')) { active.clear(); active.add(ui); } }
  applyTheme(store.get('aram.theme') || 'auto'); applySize(+(store.get('aram.size') || 100));
  if (window.matchMedia) { try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(store.get('aram.theme') || 'auto')); } catch (e) {} }
  fillChapters();
  applyUI(); drawMedal(); showView('home');
  document.title = 'அறம் · Aram';

  // Android back button inside the installed app
  try {
    const CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (CapApp && CapApp.addListener) CapApp.addListener('backButton', () => {
      if (sheetEl) closeSheet(); else if (view === 'library' && bookOpen) closeBook(); else if (view !== 'home') showView('home'); else CapApp.exitApp();
    });
  } catch (e) {}
  // offline reading as a web app (not inside the native shell)
  // reader edition: no AI at all (a public link cannot carry it), so hide every way to ask for one
  if (CFG.reader) document.body.classList.add('reader');
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.Capacitor) navigator.serviceWorker.register('sw.js').catch(() => {});
})();