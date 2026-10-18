// Usage: npm run check:i18n  — checks every language file against the English master.
import { UI } from '../src/i18n/index.js';

const en = UI.DICT.en, keys = Object.keys(en);
const ph = s => (s.match(/\{[a-z]+\}/g) || []).sort().join(',');
let bad = 0;
const have = [];
for (const [id] of UI.LANGS) {
  if (id === 'en') continue;
  const d = UI.DICT[id];
  if (!d) { console.log('MISSING language', id); bad++; continue; }
  have.push(id);
  for (const k of keys) {
    if (typeof d[k] !== 'string' || !d[k].trim()) { console.log(id, 'missing key', k); bad++; continue; }
    if (ph(d[k]) !== ph(en[k])) { console.log(id, 'placeholder mismatch', k, ph(d[k]), 'vs', ph(en[k])); bad++; }
  }
  for (const k of Object.keys(d)) if (!(k in en)) { console.log(id, 'extra key', k); bad++; }
  for (const k of ['nav.home', 'nav.check', 'nav.library']) if ([...d[k]].length > 11) console.log(id, 'long dock label', k, d[k]);
  if (!/Yāppu|யாப்பு/.test(d['check.hint'] + d['about.p1'])) console.log(id, 'Yāppu not kept in check.hint/about.p1');
}

// script-mixing guard: a language may only use its own script (plus Latin, digits, punctuation) and the Tamil word அறம்
const BLOCKS = { tamil: [0x0B80, 0x0BFF], deva: [0x0900, 0x097F], beng: [0x0980, 0x09FF], guru: [0x0A00, 0x0A7F], gujr: [0x0A80, 0x0AFF], telu: [0x0C00, 0x0C7F], knda: [0x0C80, 0x0CFF], mlym: [0x0D00, 0x0D7F], sinh: [0x0D80, 0x0DFF], arab: [0x0600, 0x06FF], hebr: [0x0590, 0x05FF], grek: [0x0370, 0x03FF], cyrl: [0x0400, 0x04FF], thai: [0x0E00, 0x0E7F], hang: [0xAC00, 0xD7AF], kana: [0x3040, 0x30FF], han: [0x4E00, 0x9FFF] };
const OWN = { ta: ['tamil'], hi: ['deva'], mr: ['deva'], ne: ['deva'], bn: ['beng'], pa: ['guru'], gu: ['gujr'], te: ['telu'], kn: ['knda'], ml: ['mlym'], si: ['sinh'], ur: ['arab'], ar: ['arab'], fa: ['arab'], he: ['hebr'], el: ['grek'], ru: ['cyrl'], uk: ['cyrl'], th: ['thai'], ko: ['hang'], ja: ['kana', 'han'], zh: ['han'], zht: ['han'] };
for (const id of have) {
  const own = OWN[id] || [];
  for (const k of keys) {
    const txt = UI.DICT[id][k].replace(/அறம்/g, '');
    for (const ch of txt) {
      const cp = ch.codePointAt(0); if (cp === 0x964 || cp === 0x965) continue;
      for (const [b, [lo, hi]] of Object.entries(BLOCKS)) if (cp >= lo && cp <= hi && !own.includes(b)) { console.log(id, k, 'foreign script char', ch, b); bad++; break; }
    }
  }
}
console.log('languages with dictionaries:', have.length, '/', UI.LANGS.length - 1, ' problems:', bad);
process.exit(bad ? 1 : 0);
