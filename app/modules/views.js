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

