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
