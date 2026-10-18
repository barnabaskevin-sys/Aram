/* Check: match a pasted verse against the whole library, then run the Yāppu metre check on it. */
import Y from '../engine/yappu.js';
import { $, esc, reveal } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { ALL, ref } from '../data/corpus.js';
import { card, strandOf } from '../ui/card.js';

const norm = s => (s.match(/[஀-௿]/g) || []).join('');
let NORM = null;
function bigrams(s) { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.substr(i, 2); m.set(g, (m.get(g) || 0) + 1); } return m; }
function dice(a, b) { let hit = 0, na = 0, nb = 0; a.forEach(x => na += x); b.forEach(x => nb += x); a.forEach((x, g) => { if (b.has(g)) hit += Math.min(x, b.get(g)); }); return na + nb ? 2 * hit / (na + nb) : 0; }

function runCheck() {
  const raw = $('cq').value.trim(), out = $('check-out'), st = $('check-status'); out.innerHTML = ''; st.className = 'status';
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
    out.appendChild(note); out.appendChild(strandOf([card(ALL[part])]));
  } else if (bs === 1) {
    note.innerHTML = say(t('check.exact_t'), t('check.exact_d'));
    out.appendChild(note); out.appendChild(strandOf([card(ALL[best])]));
  } else if (bs >= 0.8) {
    const v = ALL[best], vw = new Set(v.text.split(/\s+/).map(norm));
    const diff = raw.split(/\s+/).map(w => vw.has(norm(w)) || !norm(w) ? esc(w) : `<mark>${esc(w)}</mark>`).join(' ');
    note.innerHTML = say(t('check.close_t'), t('check.close_d', { ref: ref(v), pct: Math.round(bs * 100) })) + `<p class="diff ta" lang="ta" dir="ltr">${diff}</p>`;
    out.appendChild(note); out.appendChild(strandOf([card(v)]));
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

export function initCheck() {
  $('check').addEventListener('click', runCheck);
  $('cq').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runCheck(); });
}
