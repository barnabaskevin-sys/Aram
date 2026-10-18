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

