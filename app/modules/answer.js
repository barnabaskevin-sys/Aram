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
