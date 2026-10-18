/* Home: the kolam medal and a verse of the day. */
import Y from '../engine/yappu.js';
import { $, reducedMotion } from '../lib/dom.js';
import { KV } from '../data/corpus.js';
import { card } from '../ui/card.js';

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

export function drawMedal() {
  const el = $('medal'); el.innerHTML = medalSVG();
  if (reducedMotion()) return;
  el.querySelectorAll('path').forEach(p => {
    const len = p.getTotalLength(); if (!len) return;
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    const a = p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 3200, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
    a.onfinish = () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; a.cancel(); };
  });
}

let todayIdx = (Math.floor(Date.now() / 86400000) * 37 + 11) % KV.length;
export function renderToday() { const el = $('today'); el.innerHTML = ''; el.appendChild(card(KV[todayIdx], { i: 0 })); }

export function initHome() {
  $('another').addEventListener('click', () => { let n; do { n = Math.floor(Math.random() * KV.length); } while (n === todayIdx); todayIdx = n; renderToday(); });
}
