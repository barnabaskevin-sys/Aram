/* The verse library: every work in the corpus as one list of verse objects, with chapter labels and references.
   The corpus itself (about 7 MB) is a separate, content-hashed JSON file, fetched once and then served by the offline cache. */
import url from './verses.json?url';

const res = await fetch(url);
if (!res.ok) throw new Error('corpus: HTTP ' + res.status);
const D = await res.json();

const SYM = { nal: ['நாள்', 'nāḷ'], malar: ['மலர்', 'malar'], kasu: ['காசு', 'kācu'], pirappu: ['பிறப்பு', 'piṟappu'] };
const KV = D.k.map(r => ({ id: 'K' + r[0], src: 'K', n: r[0], text: r[1], lines: r[1].split('\n'), pope: r[2], sym: r[3], nl: r[4], rd: r[5], ch: Math.ceil(r[0] / 10) - 1 }));
const NV = D.n.map(r => ({ id: 'N' + r[0], src: 'N', n: r[0], text: r[1], lines: r[1].split('\n'), pope: r[7], ptitle: r[6], sym: r[3], nl: r[4], rd: r[5], ch: r[2] }));
const TV = D.t.s.map(r => ({ id: 'T' + r[0] + '-' + r[1], src: 'T', n: r[1], text: r[2], lines: [r[2]], pope: '', sym: '', nl: 0, rd: '', ch: r[0], flag: r[3] }));
const PV = D.p.map(r => ({ id: 'P' + r[0], src: 'P', n: r[0], title: r[1], poet: r[2], patron: r[3], tinai: r[4], turai: r[5], lines: r[6], text: r[6].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 25) }));
const MV = []; D.m.forEach(c => { for (let k = 0; k * 8 < c[2].length; k++) { const ls = c[2].slice(k * 8, k * 8 + 8); MV.push({ id: 'M' + c[0] + '.' + (k + 1), src: 'M', n: k + 1, text: ls.join('\n'), lines: ls, from: k * 8 + 1, to: k * 8 + ls.length, pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: c[0] }); } });
const QV = D.q.map(r => ({ id: 'Q' + r[0], src: 'Q', n: r[0], tinai: r[1], speaker: r[2], poet: r[3], lines: r[4], text: r[4].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 25) }));
const LV = D.l.map(r => ({ id: 'L' + r[0], src: 'L', n: r[0], sec: r[1], poet: r[2], lines: r[3], text: r[3].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 5) }));
const CMAP = {}; D.c.forEach(c => CMAP[c[0]] = c);
const CV = []; D.c.forEach(c => { for (let k = 0; k * 8 < c[2].length; k++) { const ls = c[2].slice(k * 8, k * 8 + 8); CV.push({ id: 'C' + c[0] + '.' + (k + 1), src: 'C', n: k + 1, text: ls.join('\n'), lines: ls, from: k * 8 + 1, to: k * 8 + ls.length, pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: c[0] }); } });
const AV = D.a.map(r => ({ id: 'A' + r[0], src: 'A', n: r[0], tinai: r[1], lines: r[2], text: r[2].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: Math.floor((r[0] - 1) / 25) }));
const BV = D.pt.map(r => ({ id: 'B' + r[0], src: 'B', n: r[0], pattu: r[1], patron: r[2], poet: r[3], peyar: r[4], turai: r[5], lines: r[6], text: r[6].join('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: r[1] - 2 }));
const WN = [['ஆத்திசூடி', 'Āttiṟcūṭi'], ['கொன்றை வேந்தன்', 'Koṉṟaivēntaṉ'], ['மூதுரை', 'Mūturai'], ['நல்வழி', 'Nalvaḻi']];
const WV = D.w.map(r => ({ id: 'W' + r[0] + '.' + r[1], src: 'W', n: r[1], grp: r[3], text: r[2], lines: r[2].split('\n'), pope: '', ptitle: '', sym: '', nl: 0, rd: '', ch: r[0] }));
// transliterated texts (Tēvāram, Tirumantiram, Tiruvācakam) are converted to Tamil script when first read
const TA_V = { a: '', 'ā': 'ா', i: 'ி', 'ī': 'ீ', u: 'ு', 'ū': 'ூ', e: 'ெ', 'ē': 'ே', ai: 'ை', o: 'ொ', 'ō': 'ோ', au: 'ௌ' };
const TA_VI = { a: 'அ', 'ā': 'ஆ', i: 'இ', 'ī': 'ஈ', u: 'உ', 'ū': 'ஊ', e: 'எ', 'ē': 'ஏ', ai: 'ஐ', o: 'ஒ', 'ō': 'ஓ', au: 'ஔ' };
const TA_C = { k: 'க', 'ṅ': 'ங', c: 'ச', 'ñ': 'ஞ', 'ṭ': 'ட', 'ṇ': 'ண', t: 'த', n: 'ந', p: 'ப', m: 'ம', y: 'ய', r: 'ர', l: 'ல', v: 'வ', 'ḻ': 'ழ', 'ḷ': 'ள', 'ṟ': 'ற', 'ṉ': 'ன', j: 'ஜ', 'ṣ': 'ஷ', s: 'ஸ', h: 'ஹ' };
function ta(str) {
  str = String(str).replace(/ḵ/g, 'ஃ').replace(/[ṁṃ]/g, 'ம்');
  let out = '', i = 0; const n = str.length;
  const vowel = k => { if (str.startsWith('ai', k)) return ['ai', k + 2]; if (str.startsWith('au', k)) return ['au', k + 2]; if (k < n && Object.prototype.hasOwnProperty.call(TA_V, str[k])) return [str[k], k + 1]; return null; };
  while (i < n) {
    const ch = str[i], lo = ch.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(TA_C, lo)) {
      const c = TA_C[lo]; i++; const v = vowel(i);
      if (v) { out += c + TA_V[v[0]]; i = v[1]; } else out += c + '்';
    } else {
      const v = vowel(i);
      if (v) { out += TA_VI[v[0]]; i = v[1]; } else { out += ch; i++; }
    }
  }
  return out;
}
const lazy = (o, raw) => { let l = null, t = null; Object.defineProperty(o, 'lines', { get() { return l || (l = raw.map(ta)); }, enumerable: true }); Object.defineProperty(o, 'text', { get() { return t || (t = this.lines.join('\n')); }, enumerable: true }); return o; };
const base0 = { pope: '', ptitle: '', sym: '', nl: 0, rd: '' };
const TMN = ['', 'முதல் திருமுறை · சம்பந்தர்', 'இரண்டாம் திருமுறை · சம்பந்தர்', 'மூன்றாம் திருமுறை · சம்பந்தர்', 'நான்காம் திருமுறை · அப்பர்', 'ஐந்தாம் திருமுறை · அப்பர்', 'ஆறாம் திருமுறை · அப்பர்', 'ஏழாம் திருமுறை · சுந்தரர்'];
const VP = D.v.p.map(p => ({ tm: p[0], n: p[1], name: p[2], pan: p[3] }));
const VV = D.v.v.map((r, i) => lazy(Object.assign({ id: 'V' + i, src: 'V', n: r[1], pi: r[0], ch: r[0] }, base0), r[2]));
const VCNT = new Array(VP.length).fill(0); VV.forEach(v => { VCNT[v.ch]++; });
const TANT = { 'pāyiram': 'பாயிரம்', 'mutal tantiram': 'முதல் தந்திரம்', 'iraṇṭām tantiram': 'இரண்டாம் தந்திரம்', 'mūṉṟām tantiram': 'மூன்றாம் தந்திரம்', 'nāṉkām tantiram': 'நான்காம் தந்திரம்', 'aintām tantiram': 'ஐந்தாம் தந்திரம்', 'āṟām tantiram': 'ஆறாம் தந்திரம்', 'ēḻām tantiram': 'ஏழாம் தந்திரம்', 'eṭṭām tantiram': 'எட்டாம் தந்திரம்', 'oṉpatām tantiram': 'ஒன்பதாம் தந்திரம்' };
const XC = D.x.c.map(c => ({ tant: c[0], title: c[1] }));
const XV = D.x.v.map(r => lazy(Object.assign({ id: 'X' + r[1], src: 'X', n: r[1], ch: r[0] }, base0), r[2]));
const HS = D.h.map(h => ({ n: h[0], title: h[1], kind: h[2] }));
const HV = []; D.h.forEach((h, si) => h[3].forEach(p => HV.push(lazy(Object.assign({ id: 'H' + h[0] + '.' + p[0], src: 'H', n: p[0], ch: si, stanza: h[2] === 's' }, base0), p[1]))));
const ZN = D.z.map(w => ({ ta: w.ta, en: w.k, il: w.il || 'வாழ்த்து' }));
const ZNV = new Set([12]);
const ztx = c => c ? c.split(' | ').map(x => x.startsWith('tin:') ? 'திணை: ' + ta(x.slice(4)) : x.startsWith('ctx:') ? ta(x.slice(4)) : x.startsWith('tuṟai: ') ? 'துறை: ' + ta(x.slice(7)) : ta(x)).join(' · ') : '';
const ZV = []; D.z.forEach((w, wi) => { if (w.inv && w.inv.length) ZV.push(lazy(Object.assign({ id: 'Z' + wi + '.0', src: 'Z', n: 0, ch: wi, ctx: '', dmg: false }, base0), w.inv)); w.v.forEach(r => ZV.push(lazy(Object.assign({ id: 'Z' + wi + '.' + r[0], src: 'Z', n: r[0], ch: wi, ctx: r[2], dmg: r[1].some(x => x.indexOf('..') >= 0) }, base0), r[1]))); });
const ALL = KV.concat(NV, TV, PV, MV, QV, LV, CV, AV, BV, WV, VV, XV, HV, ZV);
const SRCV = { K: KV, N: NV, T: TV, P: PV, M: MV, Q: QV, L: LV, C: CV, A: AV, B: BV, W: WV, V: VV, X: XV, H: HV, Z: ZV };
const NONVENBA = new Set(['T', 'P', 'M', 'Q', 'L', 'C', 'A', 'B', 'V', 'X', 'H']);
const BY = {}; ALL.forEach(v => BY[v.id] = v);
const chInfo = v => v.src === 'K' ? { ta: D.kc[v.ch][0], en: D.kc[v.ch][1] } : v.src === 'T' ? { ta: D.tp[D.t.n[v.ch][2]][0] + ' · ' + D.t.n[v.ch][0], en: D.t.n[v.ch][1] } : v.src === 'P' ? { ta: [v.title, v.tinai, v.turai].filter(Boolean).join(' · '), en: '' } : v.src === 'M' ? { ta: D.m[v.ch][1] + ' · வரிகள் ' + v.from + '–' + v.to, en: '' } : v.src === 'V' ? { ta: TMN[VP[v.ch].tm] + ' · ' + VP[v.ch].tm + '.' + VP[v.ch].n + ' ' + ta(VP[v.ch].name) + (VP[v.ch].pan ? ' · பண் ' + ta(VP[v.ch].pan) : ''), en: '' } : v.src === 'X' ? { ta: TANT[XC[v.ch].tant] + ' · ' + ta(XC[v.ch].title), en: '' } : v.src === 'H' ? { ta: HS[v.ch].n + '. ' + ta(HS[v.ch].title), en: '' } : v.src === 'A' ? { ta: v.tinai, en: '' } : v.src === 'B' ? { ta: [(['', '', 'இரண்டாம்', 'மூன்றாம்', 'நான்காம்', 'ஐந்தாம்', 'ஆறாம்', 'ஏழாம்', 'எட்டாம்', 'ஒன்பதாம்'][v.pattu] || '') + ' பத்து', v.peyar, v.turai].filter(Boolean).join(' · '), en: '' } : v.src === 'W' ? { ta: WN[v.ch][0] + (v.grp ? ' · ' + v.grp : ''), en: '' } : v.src === 'Z' ? { ta: ZN[v.ch].ta + (v.ctx ? ' · ' + ztx(v.ctx) : ''), en: '' } : v.src === 'Q' ? { ta: [v.tinai, v.speaker].filter(Boolean).join(' · '), en: '' } : v.src === 'L' ? { ta: v.sec, en: '' } : v.src === 'C' ? { ta: CMAP[v.ch][1] + ' · வரிகள் ' + v.from + '–' + v.to, en: '' } : { ta: D.nc[v.ch][0], en: '' };
const ref = v => v.src === 'V' ? `Tēvāram ${VP[v.ch].tm}.${VP[v.ch].n}${v.n ? '.' + v.n : ''}` : v.src === 'X' ? `Tirumantiram ${v.n}` : v.src === 'H' ? `Tiruvācakam ${HS[v.ch].n}.${v.n}` : v.src === 'W' ? `${WN[v.ch][1]} ${v.n || '(invocation)'}` : v.src === 'Z' ? `${ZN[v.ch].en} ${v.n || '(invocation)'}` : v.src === 'C' ? `Cilappatikāram ${CMAP[v.ch][1]}, lines ${v.from}–${v.to}` : v.src === 'M' ? `Maṇimēkalai ${D.m[v.ch][1]}, lines ${v.from}–${v.to}` : v.src === 'T' ? `Tolkāppiyam ${D.t.n[v.ch][0]} sūtra ${v.n}` : `${BOOK[v.src][1]} ${v.n}`;
const BOOK = { K: ['குறள்', 'Kural'], N: ['நாலடி', 'Nālaṭiyār'], T: ['நூற்பா', 'Tolkāppiyam'], P: ['புறநானூறு', 'Puṟanāṉūṟu'], M: ['மணிமேகலை', 'Maṇimēkalai'], Q: ['குறுந்தொகை', 'Kuṟuntokai'], L: ['கலித்தொகை', 'Kalittokai'], C: ['சிலப்பதிகாரம்', 'Cilappatikāram'], A: ['அகநானூறு', 'Akanāṉūṟu'], B: ['பதிற்றுப்பத்து', 'Patiṟṟuppattu'], W: ['அவ்வையார்', 'Auvaiyār'], V: ['தேவாரம்', 'Tēvāram'], X: ['திருமந்திரம்', 'Tirumantiram'], H: ['திருவாசகம்', 'Tiruvācakam'], Z: ['பதினெண்கீழ்க்கணக்கு', 'Minor Works'] };

export { D, SYM, BOOK, WN, ZN, ZNV, VP, VCNT, TMN, TANT, XC, HS, CMAP, NONVENBA, KV, ALL, SRCV, BY, ta, chInfo, ref };
