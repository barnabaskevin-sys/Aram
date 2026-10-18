// Layout check in every interface language: nothing wider than a phone screen, no clipped labels, no page errors.
// Usage: npm run build && npm run preview   (in one terminal), then: npm run sweep [-- ta ar ja]
// Set ARAM_URL to check another address, and PW_CHANNEL=msedge (or chrome) to use an installed browser
// instead of Playwright's own Chromium (npx playwright install chromium).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { UI } from '../src/i18n/index.js';

const BASE = process.env.ARAM_URL || 'http://localhost:4173/';
const LOC = { zht: 'zh-TW', zh: 'zh-CN', nb: 'nb-NO', fil: 'fil-PH' };
const SHOTS = new Set(['ar', 'ta', 'ja', 'th', 'hi']);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : UI.LANGS.map(l => l[0]);

const probe = () => {
  const vw = document.documentElement.clientWidth, bad = [];
  if (document.documentElement.scrollWidth > vw + 1) bad.push('page scrollWidth ' + document.documentElement.scrollWidth + ' > ' + vw);
  document.querySelectorAll('body *').forEach(e => {
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
    if (e.closest('[hidden]')) return;
    if ((r.right > vw + 1 || r.left < -1) && !e.closest('.strand,.cord,.medal-bg')) bad.push('out ' + e.tagName + '.' + (typeof e.className === 'string' ? e.className : '') + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    if (e.matches('.dock button span, .btn, .tile .tt') && e.scrollWidth > e.clientWidth + 1) bad.push('clip ' + e.tagName + ' "' + (e.textContent || '').trim().slice(0, 20) + '" ' + e.scrollWidth + '>' + e.clientWidth);
  });
  return bad.slice(0, 8);
};

const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
mkdirSync('shots', { recursive: true });
let failed = 0;
for (const L of ids) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: LOC[L] || L, serviceWorkers: 'block' });
  const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(BASE + '?ui=' + L);
  await pg.waitForSelector('#today .leaf', { timeout: 20000 });
  const lang = await pg.evaluate(() => document.documentElement.lang + '|' + document.documentElement.dir);
  const res = {};
  for (const v of ['home', 'check', 'library']) {
    if (v !== 'home') { await pg.click('#d-' + v); await pg.waitForTimeout(250); }
    const r = await pg.evaluate(probe); if (r.length) res[v] = r;
  }
  await pg.click('.tile'); await pg.waitForSelector('#browse-out .leaf');
  const rb = await pg.evaluate(probe); if (rb.length) res.book = rb;
  await pg.click('#btn-set'); await pg.waitForTimeout(400);
  const rs = await pg.evaluate(probe); if (rs.length) res.settings = rs;
  if (SHOTS.has(L)) await pg.screenshot({ path: `shots/sweep_${L}.png` });
  const ok = !Object.keys(res).length && !errs.length;
  if (!ok) failed++;
  console.log(L, lang, ok ? 'OK' : JSON.stringify(res).slice(0, 400), errs.slice(0, 2).join(' | '));
  await ctx.close();
}
await browser.close();
console.log(`${ids.length - failed} / ${ids.length} languages clean`);
process.exit(failed ? 1 : 0);
