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

