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
