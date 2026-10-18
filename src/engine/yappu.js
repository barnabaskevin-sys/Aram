// Yāppu 0.5 reference engine: Tamil scansion → venba check (printed, then classical reading) → compile → run → kolam.
// The Yāppu Language Specification is the authority; section numbers below refer to it.
// MIT licence. An ES module: import Yappu from './engine/yappu.js'.
const Yappu = (function () {
  'use strict';

  // ---------- 1. Letters ----------
  const VOWELS = { 'அ': 'k', 'ஆ': 'n', 'இ': 'k', 'ஈ': 'n', 'உ': 'k', 'ஊ': 'n', 'எ': 'k', 'ஏ': 'n', 'ஐ': 'n', 'ஒ': 'k', 'ஓ': 'n', 'ஔ': 'n' };
  const SIGNS = { 'ா': 'ஆ', 'ி': 'இ', 'ீ': 'ஈ', 'ு': 'உ', 'ூ': 'ஊ', 'ெ': 'எ', 'ே': 'ஏ', 'ை': 'ஐ', 'ொ': 'ஒ', 'ோ': 'ஓ', 'ௌ': 'ஔ' };
  const VIRAMA = '்', AYTHAM = 'ஃ';
  const isCons = c => c >= 'க' && c <= 'ஹ' && !(c in VOWELS) && !(c in SIGNS) && c !== VIRAMA;
  const VALLINAM = 'கசடதபற', MELLINAM = 'ஙஞணநமன', IDAIYINAM = 'யரலவழள';

  // returns [{text, kind:'kuril'|'nedil'|'ottu', cons, vowel}]
  function letters(word) {
    const out = [];
    const s = word.normalize('NFC');
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c in VOWELS) { out.push({ text: c, kind: VOWELS[c] === 'k' ? 'kuril' : 'nedil', cons: null, vowel: c }); continue; }
      if (c === AYTHAM) { out.push({ text: c, kind: 'ottu', cons: null, vowel: null, aytham: true }); continue; }
      if (isCons(c)) {
        let n = s[i + 1], text = c;
        // conjunct க்ஷ
        if (n === VIRAMA) {
          out.push({ text: c + VIRAMA, kind: 'ottu', cons: c, vowel: null }); i++; continue;
        }
        let v = 'அ';
        if (n in SIGNS) {
          v = SIGNS[n]; text += n; i++;
          // decomposed two-part signs
          const n2 = s[i + 1];
          if (n === 'ெ' && n2 === 'ா') { v = 'ஒ'; text += n2; i++; }
          else if (n === 'ே' && n2 === 'ா') { v = 'ஓ'; text += n2; i++; }
          else if (n === 'ெ' && n2 === 'ௗ') { v = 'ஔ'; text += n2; i++; }
        }
        out.push({ text, kind: VOWELS[v] === 'k' ? 'kuril' : 'nedil', cons: c, vowel: v });
      }
      // anything else (punctuation, Latin) is ignored here
    }
    return out;
  }

  const MATHIRAI = { kuril: 1, nedil: 2, ottu: 0.5 };

  // ---------- 2. Asai ----------
  function syllables(ls) {
    const syl = [];
    for (const l of ls) {
      if (l.kind === 'ottu') {
        if (syl.length) syl[syl.length - 1].push(l); else syl.push([l]);
      } else syl.push([l]);
    }
    return syl;
  }
  function asaiSplit(ls) {
    const syl = syllables(ls), out = [];
    for (let j = 0; j < syl.length;) {
      const a = syl[j];
      const shortOpen = a.length === 1 && a[0].kind === 'kuril';
      if (shortOpen && j + 1 < syl.length && syl[j + 1][0].kind !== 'ottu') {
        out.push({ type: 'nirai', letters: a.concat(syl[j + 1]) }); j += 2;
      } else { out.push({ type: 'ner', letters: a }); j += 1; }
    }
    return out;
  }

  // ---------- 3. Cīr ----------
  const CIR = {
    'n': ['நாள்', 'nāḷ'], 'i': ['மலர்', 'malar'],
    'nn': ['தேமா', 'tēmā'], 'in': ['புளிமா', 'puḷimā'], 'ni': ['கூவிளம்', 'kūviḷam'], 'ii': ['கருவிளம்', 'karuviḷam'],
    'nnn': ['தேமாங்காய்', 'tēmāṅkāy'], 'inn': ['புளிமாங்காய்', 'puḷimāṅkāy'], 'nin': ['கூவிளங்காய்', 'kūviḷaṅkāy'], 'iin': ['கருவிளங்காய்', 'karuviḷaṅkāy'],
    'nni': ['தேமாங்கனி', 'tēmāṅkani'], 'ini': ['புளிமாங்கனி', 'puḷimāṅkani'], 'nii': ['கூவிளங்கனி', 'kūviḷaṅkani'], 'iii': ['கருவிளங்கனி', 'karuviḷaṅkani'],
  };
  function key(asai) { return asai.map(a => a.type === 'ner' ? 'n' : 'i').join(''); }
  function isUEnding(asai) {
    const last = asai[asai.length - 1];
    return last.type === 'ner' && last.letters.length === 1 && last.letters[0].cons && last.letters[0].vowel === 'உ';
  }
  function classify(asai, isFinal) {
    const k = key(asai);
    if (isFinal) {
      if (k.length === 1) return { name: CIR[k][0], tr: CIR[k][1], kind: 'end', end: k === 'n' ? 'nal' : 'malar' };
      if (k.length === 2 && isUEnding(asai)) {
        return k[0] === 'n' ? { name: 'காசு', tr: 'kāsu', kind: 'end', end: 'kasu' } : { name: 'பிறப்பு', tr: 'pirappu', kind: 'end', end: 'pirappu' };
      }
    }
    if (CIR[k]) {
      const kind = k.length === 1 ? 'one' : k.length === 2 ? (k[1] === 'n' ? 'ma' : 'vilam') : (k[2] === 'n' ? 'kay' : 'kani');
      return { name: CIR[k][0], tr: CIR[k][1], kind };
    }
    return { name: 'பொதுச்சீர்', tr: 'potuccīr', kind: 'long' };
  }

  // ---------- 4. Verse ----------
  function parseVerse(text) {
    // Letters in brackets are ones an editor restores where sandhi took them away, வையத்(து): they belong to the word
    // they follow, so the brackets are dropped and the word is read whole
    let lines = text.split(/\n+/).map(l => l.trim().replace(/\s*\(\s*/g, '').replace(/\s*\)/g, '')).filter(Boolean)
      .map(l => l.split(/[\s,.;:!?'"“”‘’\-–—]+/).filter(w => letters(w).length));
    lines = lines.filter(l => l.length);
    let note = null;
    const total = lines.reduce((s, l) => s + l.length, 0);
    if (lines.length === 1 && total >= 7 && (total - 3) % 4 === 0) {
      const ws = lines[0], out = [];
      for (let i = 0; i < ws.length - 3; i += 4) out.push(ws.slice(i, i + 4));
      out.push(ws.slice(ws.length - 3));
      lines = out; note = 'Read as ' + out.map(l => l.length).join(' + ') + ' words per line.';
    }
    const words = [];
    lines.forEach((l, li) => l.forEach((w, wi) => words.push({ text: w, line: li, idx: words.length })));
    words.forEach((w, i) => {
      w.letters = letters(w.text);
      w.asai = asaiSplit(w.letters);
      w.final = i === words.length - 1;
      w.cir = classify(w.asai, w.final);
      w.bits = key(w.asai).replace(/n/g, '0').replace(/i/g, '1');
      w.value = parseInt(w.bits, 2) || 0;
      // a குற்றியலுகரம் is half a māthirai (Eḻuttu 12)
      w.mathirai = w.letters.reduce((s, l, j) => s + (j === w.letters.length - 1 && isKurriyalukaram(w.letters) ? 0.5 : MATHIRAI[l.kind]), 0);
    });
    return { lines, words, note, hasLatin: /[A-Za-z]/.test(text) };
  }

  const KIND_RULE = { ma: { need: 'nirai', rule: 'மா முன் நிரை', tr: 'after -mā comes nirai' },
    vilam: { need: 'ner', rule: 'விளம் முன் நேர்', tr: 'after -viḷam comes nēr' },
    kay: { need: 'ner', rule: 'காய் முன் நேர்', tr: 'after -kāy comes nēr' } };

  function validate(v) {
    const errs = [], joins = [];
    const { lines, words } = v;
    if (!words.length) { errs.push({ msg: 'Type a verse in Tamil script to begin.' }); return { errs, joins }; }
    if (lines.length < 2) errs.push({ msg: 'A venba needs at least two lines: four words in each line, three in the last.' });
    lines.forEach((l, i) => {
      const want = i === lines.length - 1 ? 3 : 4;
      if (lines.length >= 2 && l.length !== want) errs.push({ msg: `Line ${i + 1} has ${l.length} word${l.length === 1 ? '' : 's'}; a venba line needs ${want}.` });
    });
    words.forEach((w, i) => {
      const k = w.cir.kind;
      if (w.final && k !== 'end') errs.push({ word: i, msg: `The last word must be நாள், மலர், காசு or பிறப்பு. “${w.text}” scans as ${w.cir.name}.` });
      if (!w.final) {
        if (k === 'kani') errs.push({ word: i, msg: `“${w.text}” is ${w.cir.name} (${w.cir.tr}). Venba allows no -kani words.` });
        if (k === 'one') errs.push({ word: i, msg: `“${w.text}” is a one-asai word; only the last word of a venba may be that short.` });
        if (k === 'long') errs.push({ word: i, msg: `“${w.text}” has ${w.asai.length} asai; venba words have two or three.` });
      }
      if (i > 0) {
        const p = words[i - 1], r = KIND_RULE[p.cir.kind];
        if (r) {
          const ok = w.asai[0].type === r.need;
          joins.push({ at: i, ok, rule: r.rule, tr: r.tr });
          if (!ok) errs.push({ word: i, msg: `${r.rule} (${r.tr}): “${p.text}” is ${p.cir.name}, so “${w.text}” should start with ${r.need === 'ner' ? 'நேர்' : 'நிரை'}.` });
        } else joins.push({ at: i, ok: null });
      }
    });
    return { errs, joins };
  }

  // ---------- 4b. Classical reading (spec section 4.4) ----------
  // Used when the printed text does not scan, or holds a குற்றியலிகரம். Splits compounds written without sandhi,
  // applies sandhi, shortens a non-initial ஐ and reads each குற்றியலிகரம் as a consonant (Tolkāppiyam), then finds
  // the division into cīr that satisfies V1–V5, never splits off a word's first short letter or final உ
  // (Ceyyuḷiyal 6, 8), and moves the fewest printed word breaks. Only if no such division exists does it take a
  // metrical licence (4.5).
  const MAX_MOVED = 2;    // the classical reading may move at most two printed word breaks
  const MAX_LICENCES = 2; // and take at most two metrical licences
  const SIGN_OF = { 'அ': '', 'ஆ': 'ா', 'இ': 'ி', 'ஈ': 'ீ', 'உ': 'ு', 'ஊ': 'ூ', 'எ': 'ெ', 'ஏ': 'ே', 'ஐ': 'ை', 'ஒ': 'ொ', 'ஓ': 'ோ', 'ஔ': 'ௌ' };
  const ALAPEDAI = { 'ஆ': 'அ', 'ஈ': 'இ', 'ஊ': 'உ', 'ஏ': 'எ', 'ஓ': 'ஒ', 'ஐ': 'இ', 'ஔ': 'உ' }; // long vowel → the short vowel letter that may follow it (Eḻuttu 41–42)
  // குற்றியலுகரம்: a hard consonant + உ ending a word of two or more letters, unless the word is a short letter + உ (அது) (Eḻuttu 36)
  const isKurriyalukaram = ls => {
    const last = ls[ls.length - 1];
    return ls.length >= 2 && !!last.cons && VALLINAM.includes(last.cons) && last.vowel === 'உ' && !(ls.length === 2 && ls[0].kind === 'kuril');
  };
  const isHardI = l => !!l && !!l.cons && VALLINAM.includes(l.cons) && l.vowel === 'இ';
  const isYaa = l => !!l && l.cons === 'ய' && l.vowel === 'ஆ';
  // A vowel letter inside a printed word marks a compound written without sandhi: படிறுஇலவாம் = படிறு + இலவாம்.
  // An alapedai (ஓஒ, ளைஇ: a long vowel and then its short letter) is not a junction.
  const isAlapedai = (prev, l) => !!prev.vowel && ALAPEDAI[prev.vowel] === l.vowel;
  function compoundParts(word) {
    const ls = letters(word), parts = [];
    let cur = '';
    ls.forEach((l, j) => {
      if (j > 0 && !l.cons && l.vowel && !isAlapedai(ls[j - 1], l)) { parts.push(cur); cur = ''; }
      cur += l.text;
    });
    parts.push(cur);
    return parts;
  }
  function classicalStream(lines) {
    const flat = [];
    let split = 0;
    lines.forEach(l => l.forEach((w, wi) => {
      const parts = compoundParts(w);
      if (parts.length > 1) split++;
      parts.forEach((q, qi) => flat.push({ w: q, lineStart: wi === 0 && qi === 0, soft: qi > 0 }));
    }));
    const out = [], counts = { joined: 0, elided: 0, doubled: 0, shortened: 0, split, vittisai: 0 };
    flat.forEach((x, i) => {
      const ls = letters(x.w).map((l, j) => Object.assign({}, l, { wordStart: j === 0 ? (x.soft ? 'soft' : true) : false, lineStart: j === 0 && x.lineStart }));
      ls.forEach((l, j) => {
        if (j > 0 && l.vowel === 'ஐ') { l.kind = 'kuril'; l.shortened = true; }
        if (l.aytham && j > 0 && ls[j - 1].kind === 'kuril') l.licence = 'aytham'; // ஒற்றளபெடை (Nannūl 92)
        // the vowel of an alapedai counts as a letter, but may go uncounted when the cīr or the thaḷai would break
        // (Yāpparuṅkalam 4: அளபெடை ஆவியும் அலகியல் பிலவே): தழீஇம் read as தழீம்
        if (j > 0 && !l.cons && l.vowel && isAlapedai(ls[j - 1], l)) l.licence = 'alapedai';
        // a குற்றியலிகரம் inside a printed word: பண்பியார்க்கு = பண்பு + யார்க்கு. Spelling cannot tell it from a real இ
        // (தங்கியான்), so leaving it uncounted is a licence
        if (j > 0 && j < ls.length - 1 && isHardI(l) && isYaa(ls[j + 1]) && ls[j - 1].kind !== 'kuril') l.licence = 'ikaram-inside';
      });
      // விட்டிசை: a lone short vowel said apart from the vowel after it, as in the cry அஆ, is a nēr on its own
      // (Ceyyuḷiyal 6, with Naccinārkkiniyar's example அ ஆ விழந்தான், Nālaṭiyār 9; Yāpparuṅkalakkārikai 37)
      if (!x.soft && ls.length === 1 && !ls[0].cons && ls[0].kind === 'kuril' && flat[i + 1] && flat[i + 1].soft) {
        const nx = letters(flat[i + 1].w)[0];
        if (nx && !nx.cons && nx.vowel) { ls[0].vittisai = true; counts.vittisai++; }
      }
      // a குற்றியலிகரம் the printer has joined to this word, before யா: அருளல்ல தியாதெனின், இல்லாதார்க் கியாதொன்றும்,
      // also at the head of a line (தந்நெஞ்சத் / தியாத்தாரோ). But தியல்வது is தி + இயல்வது, so யா must follow
      if (ls.length > 1 && isHardI(ls[0]) && isYaa(ls[1]) && i > 0) ls[0].ikaram = 'joined';
      const next = flat[i + 1] && letters(flat[i + 1].w)[0];
      const vowelNext = next && !next.cons && next.vowel;
      if (vowelNext && isKurriyalukaram(ls)) { // குற்றியலுகரம் before a vowel loses its உ
        const last = ls[ls.length - 1];
        ls[ls.length - 1] = { text: last.cons + VIRAMA, kind: 'ottu', cons: last.cons, vowel: null, elided: true, wordStart: last.wordStart, lineStart: last.lineStart };
        counts.elided++;
      } else if (vowelNext && ls.length === 2 && ls[0].kind === 'kuril' && ls[1].kind === 'ottu' && ls[1].cons) {
        // தனிக்குறில் முன் ஒற்று உயிர் வரின் இரட்டும்: கொல் + எனும் → கொல்லெனும்
        ls.push({ text: ls[1].cons + VIRAMA, kind: 'ottu', cons: ls[1].cons, vowel: null, doubled: true });
        counts.doubled++;
      } else if (next && next.cons === 'ய' && isKurriyalukaram(ls)) ls[ls.length - 1].ikaram = 'final'; // கு + யா → கி யா (Eḻuttu 35)
      else if (isKurriyalukaram(ls)) ls[ls.length - 1].half = true; // a குற்றியலுகரம் is half a māthirai (Eḻuttu 12)
      out.push(...ls);
    });
    const merged = [];
    for (let i = 0; i < out.length; i++) { // a bare consonant joins the vowel after it
      const a = out[i], b = out[i + 1];
      if (a.kind === 'ottu' && a.cons && b && !b.cons && b.vowel && !b.vittisai) { // a vowel said apart takes no consonant
        merged.push({ text: a.cons + SIGN_OF[b.vowel], kind: b.kind, cons: a.cons, vowel: b.vowel, wordStart: b.wordStart, lineStart: b.lineStart, joined: true });
        if (b.wordStart === true) counts.joined++;
        i++;
      } else merged.push(a);
    }
    merged.forEach(l => { if (l.shortened) counts.shortened++; });
    return { letters: merged, counts };
  }
  // The குற்றியலிகரம் (spec 4.4, step 3) and the metrical licences (spec 4.5). `use` lists the licence sites taken.
  //   ikaram 'final' or 'joined': read as a consonant, half a māthirai, uncounted (Ceyyuḷiyal 7). Its licence counts it
  //     as a short letter. Either way a final one is written at the head of the next cīr: செல்வத்திற் கியாதெனின்.
  //   ikaram-inside: its licence leaves it uncounted.
  //   aytham: its licence lengthens ஃ (ஒற்றளபெடை, Nannūl 92) and counts it as a short letter.
  //   alapedai: its licence leaves the alapedai's vowel uncounted; it stays in its own syllable.
  function withLicences(stream, use) {
    const out = stream.slice(), on = new Set(use);
    stream.forEach((l, i) => {
      const nx = stream[i + 1], take = on.has(i);
      if (l.ikaram === 'final') {
        out[i] = Object.assign({}, l, { text: l.cons + 'ி', vowel: 'இ', kind: take ? 'kuril' : 'ottu', uncounted: !take, half: true, licensed: take ? 'ikaramCounted' : undefined, wordStart: nx.wordStart, lineStart: nx.lineStart });
        out[i + 1] = Object.assign({}, nx, { wordStart: false, lineStart: false });
      } else if (l.ikaram === 'joined') out[i] = Object.assign({}, l, { kind: take ? 'kuril' : 'ottu', uncounted: !take, half: true, licensed: take ? 'ikaramCounted' : undefined });
      else if (take && l.licence === 'aytham') out[i] = Object.assign({}, l, { kind: 'kuril', licensed: 'aytham' });
      else if (take && l.licence === 'ikaram-inside') out[i] = Object.assign({}, l, { kind: 'ottu', uncounted: true, half: true, licensed: 'ikaramInside' });
      else if (take && l.licence === 'alapedai') out[i] = Object.assign({}, l, { uncounted: true, licensed: 'alapedai' });
    });
    return out;
  }
  const mathiraiOf = l => (l.half ? 0.5 : MATHIRAI[l.kind]);
  // the counted letters of a syllable
  const counted = s => s.filter(l => !l.uncounted);
  function cirAsai(syls) {
    const out = [];
    for (let j = 0; j < syls.length;) {
      const a = counted(syls[j]);
      if (a.length === 1 && a[0].kind === 'kuril' && !a[0].vittisai && j + 1 < syls.length && counted(syls[j + 1])[0].kind !== 'ottu') { out.push({ type: 'nirai', letters: syls[j].concat(syls[j + 1]) }); j += 2; }
      else { out.push({ type: 'ner', letters: syls[j] }); j += 1; }
    }
    return out;
  }
  // the best division of a letter stream into cīr: fewest moved word breaks, at most MAX_MOVED
  function divide(stream, L) {
    const syl = [];
    let head = []; // uncounted letters wait for the next syllable
    for (const l of stream) {
      if (l.uncounted && l.licensed === 'alapedai' && syl.length) syl[syl.length - 1].push(l); // stays in its syllable
      else if (l.uncounted) head.push(l);
      else if (l.kind === 'ottu' && syl.length && !l.lineStart && !head.length) syl[syl.length - 1].push(l);
      else { syl.push(head.concat([l])); head = []; }
    }
    const S = syl.length, starts = [];
    syl.forEach((s, i) => { if (s[0].lineStart) starts.push(i); });
    if (starts.length !== L || starts[0] !== 0) return null;
    const lineEnd = li => (li + 1 < L ? starts[li + 1] : S);
    const total = 4 * (L - 1) + 3;
    const lineOf = k => Math.min(Math.floor(k / 4), L - 1);
    // Ceyyuḷiyal 6 and 8: a cīr may not begin just after a word's first letter when that is a lone short letter,
    // nor with a word's final உ cut off from the rest of its word
    const isStart = l => !!l && (l.wordStart === true || l.wordStart === 'soft');
    const badStart = syl.map((s, p) => {
      if (p === 0) return false;
      const prevLast = syl[p - 1][syl[p - 1].length - 1], first = s[0], after = s[1] || (syl[p + 1] && syl[p + 1][0]);
      if (prevLast.kind === 'kuril' && isStart(prevLast) && !isStart(first)) return true;
      return !!first.cons && first.vowel === 'உ' && first.kind === 'kuril' && !isStart(first) && (!after || isStart(after));
    });
    const memo = new Map();
    // best division of syllables p.. into cīr k.. given the previous cīr's kind
    function best(k, p, prev) {
      const key = k + '|' + p + '|' + prev;
      if (memo.has(key)) return memo.get(key);
      let res = null;
      const li = lineOf(k), firstInLine = k === 4 * li, lastInLine = k === total - 1 || (li < L - 1 && k === 4 * li + 3);
      if (!(firstInLine && p !== starts[li]) && !badStart[p]) {
        const end = lineEnd(li);
        for (let q = p + 1; q <= Math.min(end, p + 8); q++) {
          if (lastInLine !== (q === end)) continue;
          const asai = cirAsai(syl.slice(p, q));
          if (asai.length > 3) break;
          const isFinal = k === total - 1, cir = classify(asai, isFinal);
          if (isFinal ? cir.kind !== 'end' : !(cir.kind === 'ma' || cir.kind === 'vilam' || cir.kind === 'kay')) continue;
          const rule = prev && KIND_RULE[prev];
          if (rule && asai[0].type !== rule.need) continue;
          // a cīr that starts inside a printed word, or a printed word break inside a cīr, moves a break;
          // the junctions of a compound (soft breaks) are free either way
          let cost = syl[p][0].wordStart ? 0 : 1;
          for (let m = p + 1; m < q; m++) if (syl[m][0].wordStart === true) cost++;
          let rest = { cost: 0 };
          if (!isFinal) { rest = best(k + 1, q, cir.kind); if (!rest) continue; }
          if (!res || cost + rest.cost < res.cost) res = { cost: cost + rest.cost, cut: q, asai, cir };
        }
      }
      memo.set(key, res);
      return res;
    }
    const top = best(0, 0, '');
    if (!top || top.cost > MAX_MOVED) return null;
    const words = [];
    let k = 0, p = 0, prev = '';
    while (k < total) {
      const r = best(k, p, prev);
      const ls = syl.slice(p, r.cut).flat();
      const w = { text: ls.map(l => l.text).join(''), line: lineOf(k), idx: k, letters: ls, asai: r.asai, final: k === total - 1, cir: r.cir };
      w.bits = key(w.asai).replace(/n/g, '0').replace(/i/g, '1');
      w.value = parseInt(w.bits, 2) || 0;
      w.mathirai = ls.reduce((s, l) => s + mathiraiOf(l), 0);
      words.push(w);
      prev = r.cir.kind; p = r.cut; k++;
    }
    return { words, moved: top.cost };
  }
  // all sets of n licence sites, in order
  function choose(sites, n, from = 0) {
    if (n === 0) return [[]];
    const out = [];
    for (let i = from; i <= sites.length - n; i++) for (const rest of choose(sites, n - 1, i + 1)) out.push([sites[i]].concat(rest));
    return out;
  }
  function classicalReading(text) {
    const pv = parseVerse(text);
    const L = pv.lines.length;
    if (L < 2) return null;
    const { letters: stream, counts } = classicalStream(pv.lines);
    const sites = [];
    stream.forEach((l, i) => { if (l.licence || l.ikaram) sites.push(i); });
    // fewest licences first (a licence is taken only when the cīr or the thaḷai would break), then fewest moved breaks
    let found = null;
    for (let n = 0; n <= Math.min(MAX_LICENCES, sites.length) && !found; n++) {
      for (const use of choose(sites, n)) {
        const d = divide(withLicences(stream, use), L);
        if (d && (!found || d.moved < found.d.moved)) found = { d, use };
      }
    }
    if (!found) return null;
    const { words } = found.d, lines = Array.from({ length: L }, () => []);
    words.forEach(w => lines[w.line].push(w.text));
    const licensed = { ikaramCounted: 0, ikaramInside: 0, aytham: 0, alapedai: 0 };
    let ikaram = 0;
    words.forEach(w => w.letters.forEach(l => { if (l.licensed) licensed[l.licensed]++; else if (l.ikaram) ikaram++; }));
    const parts = [];
    const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    if (counts.split) parts.push(`split ${pl(counts.split, 'compound', 'compounds')}`);
    if (counts.elided) parts.push(`dropped ${counts.elided} final உ`);
    if (counts.doubled) parts.push(`doubled ${pl(counts.doubled, 'consonant', 'consonants')}`);
    if (counts.joined) parts.push(`joined ${pl(counts.joined, 'consonant', 'consonants')} to the next word`);
    if (counts.shortened) parts.push(`shortened ${counts.shortened} ஐ`);
    if (counts.vittisai) parts.push(`read ${counts.vittisai} short vowel apart (விட்டிசை)`);
    if (ikaram) parts.push(`read ${ikaram} குற்றியலிகரம் as a consonant`);
    if (found.d.moved) parts.push(`moved ${pl(found.d.moved, 'word break', 'word breaks')}`);
    if (licensed.ikaramCounted) parts.push(`counted ${licensed.ikaramCounted} குற்றியலிகரம் as a short letter (licence)`);
    if (licensed.ikaramInside) parts.push(`left ${licensed.ikaramInside} குற்றியலிகரம் inside a word uncounted (licence)`);
    if (licensed.aytham) parts.push(`counted ${licensed.aytham} ஃ as a short letter (ஒற்றளபெடை)`);
    if (licensed.alapedai) parts.push(`left ${licensed.alapedai} அளபெடை uncounted (licence)`);
    const note = 'Read classically' + (parts.length ? ': ' + parts.join(', ') + '.' : '.');
    return { lines, words, note, hasLatin: pv.hasLatin, reading: 'classical', moved: found.d.moved, licences: found.use.length, licensed, ikaram, counts };
  }
  // does the text hold a குற்றியலிகரம் (a final hard consonant + உ before ய, or one already joined before யா)?
  function hasIkaram(lines) {
    return lines.length > 0 && classicalStream(lines).letters.some(l => l.ikaram);
  }

  // ---------- 5. Compile ----------
  const OPS = {
    'க': { m: 'ADD', d: 'register + value' },
    'ச': { m: 'SUB', d: 'register − value' },
    'த': { m: 'SHIFT', d: 'shift the word’s bits into the register' },
    'ப': { m: 'LOOP', d: 'if register > 0: decrement, jump back value+1 words' },
    'ம': { m: 'WALL', d: 'ink becomes wall' },
    'ந': { m: 'GATE', d: 'ink becomes gate' },
    'ஞ': { m: 'ERASE', d: 'ink becomes erase' },
    'ய': { m: 'SKIP', d: 'pen jumps ahead by the register' },
    'வ': { m: 'TURN', d: 'pen reverses direction' },
  };
  function compile(v) {
    return v.words.map((w, i) => {
      const first = w.letters[0];
      const ins = { i, word: w.text, bits: w.bits, value: w.value, nbits: w.bits.length, cycles: w.mathirai, halt: w.letters.some(l => l.aytham), asai: w.asai.map(a => a.type) };
      const reg = first.vowel || 'அ'; // a bare consonant or ஃ at the start names register அ
      if (!first.cons) { ins.op = 'DATA'; ins.reg = reg; }
      else if (OPS[first.cons]) { ins.op = OPS[first.cons].m; ins.cons = first.cons; ins.reg = reg; }
      else { ins.op = 'NOP'; ins.cons = first.cons; ins.reg = reg; }
      return ins;
    });
  }

  // ---------- 6. Kolam geometry ----------
  // dots at (2i+1, 2j+1); edge midpoints have exactly one even coordinate
  const GROUPS = {
    nal: { name: 'four-fold turn', ta: 'நாள்', f: n => [p => p, p => [2 * n - p[1], p[0]], p => [2 * n - p[0], 2 * n - p[1]], p => [p[1], 2 * n - p[0]]] },
    malar: { name: 'eight-fold flower', ta: 'மலர்', f: n => [p => p, p => [2 * n - p[1], p[0]], p => [2 * n - p[0], 2 * n - p[1]], p => [p[1], 2 * n - p[0]], p => [2 * n - p[0], p[1]], p => [p[0], 2 * n - p[1]], p => [p[1], p[0]], p => [2 * n - p[1], 2 * n - p[0]]] },
    kasu: { name: 'two straight mirrors', ta: 'காசு', f: n => [p => p, p => [2 * n - p[0], 2 * n - p[1]], p => [2 * n - p[0], p[1]], p => [p[0], 2 * n - p[1]]] },
    pirappu: { name: 'two diagonal mirrors', ta: 'பிறப்பு', f: n => [p => p, p => [2 * n - p[0], 2 * n - p[1]], p => [p[1], p[0]], p => [2 * n - p[1], 2 * n - p[0]]] },
  };
  function tapeFor(n, groupKey) {
    const g = GROUPS[groupKey].f(n), seen = new Set(), orbits = [];
    const internal = [];
    for (let x = 0; x <= 2 * n; x++) for (let y = 0; y <= 2 * n; y++) {
      if ((x + y) % 2 !== 1) continue;
      if (x % 2 === 0 && (x === 0 || x === 2 * n)) continue;
      if (y % 2 === 0 && (y === 0 || y === 2 * n)) continue;
      internal.push([x, y]);
    }
    for (const p of internal) {
      const k = p.join(',');
      if (seen.has(k)) continue;
      const orb = [], ok = new Set();
      for (const t of g) { const q = t(p), qk = q.join(','); if (!ok.has(qk)) { ok.add(qk); orb.push(q); } seen.add(qk); }
      const d = Math.hypot(p[0] - n, p[1] - n);
      let best = Infinity;
      for (const q of orb) { let a = Math.atan2(q[1] - n, q[0] - n); if (a < -1e-9) a += 2 * Math.PI; if (a < best) best = a; }
      orbits.push({ cells: orb, d, a: best });
    }
    orbits.sort((A, B) => (A.d - B.d) || (A.a - B.a));
    return orbits;
  }

  // ---------- 7. Run ----------
  function run(prog, v, opts = {}) {
    const maxSteps = opts.maxSteps || 240;
    const endKind = v.words[v.words.length - 1].cir.end || 'nal';
    const n = Math.max(5, Math.min(13, v.words.length));
    const tape = tapeFor(n, endKind);
    const cells = new Array(tape.length).fill(0); // 0 cross, 1 wall, 2 gate
    const R = {}; Object.keys(VOWELS).forEach(k => R[k] = 0);
    let pc = 0, pen = 0, dir = 1, ink = 2, steps = 0, cycles = 0, halted = 'end';
    const trace = [];
    const L = tape.length, mod = x => ((x % L) + L) % L;
    while (pc < prog.length) {
      if (steps >= maxSteps) { halted = 'limit'; break; }
      const ins = prog[pc]; steps++; cycles += ins.cycles;
      const t = { pc, word: ins.word, op: ins.op, note: '' };
      let next = pc + 1;
      switch (ins.op) {
        case 'DATA': R[ins.reg] = ins.value; t.note = `${ins.reg} ← ${ins.value}`; break;
        case 'ADD': R[ins.reg] += ins.value; t.note = `${ins.reg} = ${R[ins.reg]}`; break;
        case 'SUB': R[ins.reg] -= ins.value; t.note = `${ins.reg} = ${R[ins.reg]}`; break;
        case 'SHIFT': R[ins.reg] = (R[ins.reg] * (1 << ins.nbits) + ins.value) % 4096; t.note = `${ins.reg} = ${R[ins.reg]}`; break;
        case 'WALL': ink = 1; t.note = 'ink: wall'; break;
        case 'GATE': ink = 2; t.note = 'ink: gate'; break;
        case 'ERASE': ink = 0; t.note = 'ink: erase'; break;
        case 'SKIP': pen = mod(pen + dir * Math.abs(R[ins.reg])); t.note = `pen +${Math.abs(R[ins.reg])}`; break;
        case 'TURN': dir = -dir; t.note = 'pen reversed'; break;
        default: break;
      }
      // stamp the rhythm: nirai lays ink, nēr leaves the crossing open
      const stamped = [];
      for (const a of ins.asai) {
        const c = mod(pen);
        if (a === 'nirai') { cells[c] = ink; stamped.push(c); }
        pen = mod(pen + dir);
      }
      t.stamped = stamped.length; t.inked = stamped;
      if (ins.op === 'LOOP') {
        if (R[ins.reg] > 0) { R[ins.reg]--; next = Math.max(0, pc - (ins.value + 1)); t.note = `${ins.reg} = ${R[ins.reg]}, back to word ${next + 1}`; }
        else t.note = `${ins.reg} = 0, continue`;
      }
      t.pen = pen;
      trace.push(t);
      if (ins.halt) { halted = 'aytham'; break; }
      pc = next;
    }
    return { R, cells, tape, n, endKind, steps, cycles, halted, trace };
  }

  // ---------- 8. Trace the line ----------
  function kolam(res) {
    const { n, tape, cells } = res, N = 2 * n;
    const state = new Map();
    tape.forEach((o, i) => o.cells.forEach(p => state.set(p.join(','), cells[i])));
    // ports: [dx,dy]; pairing at a midpoint
    function partner(x, y, dx, dy) {
      const vert = x % 2 === 0; // vertical edge between left/right squares
      let s;
      if (vert && x === 0) s = 1; else if (vert && x === N) s = 1;
      else if (!vert && y === 0) s = 1; else if (!vert && y === N) s = 1;
      else s = state.get(x + ',' + y) || 0;
      if (s === 0) return [-dx, -dy];          // cross straight through
      if (s === 1) return vert ? [dx, -dy] : [-dx, dy]; // wall along the edge: bounce back
      return vert ? [-dx, dy] : [dx, -dy];      // gate: pass across, turn
    }
    const used = new Set(), loops = [];
    const segKey = (x, y, dx, dy) => { const a = x + ',' + y, b = (x + dx) + ',' + (y + dy); return a < b ? a + '|' + b : b + '|' + a; };
    for (let x = 0; x <= N; x++) for (let y = 0; y <= N; y++) {
      if ((x + y) % 2 !== 1) continue;
      for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx > N || ny > N) continue;
        if (used.has(segKey(x, y, dx, dy))) continue;
        // walk
        const pts = [];
        let cx = x, cy = y, ddx = dx, ddy = dy, guard = 0;
        while (guard++ < 100000) {
          const k = segKey(cx, cy, ddx, ddy);
          if (used.has(k)) break;
          used.add(k); pts.push([cx, cy]);
          cx += ddx; cy += ddy;
          const out = partner(cx, cy, -ddx, -ddy);
          ddx = out[0]; ddy = out[1];
        }
        if (pts.length > 1) loops.push(pts);
      }
    }
    return loops;
  }

  // smooth closed path through midpoints with circular arcs at turns
  function loopPath(pts, scale) {
    const k = 0.5523, m = pts.length, P = i => pts[((i % m) + m) % m];
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const f = v => (v * scale).toFixed(2);
    let s = mid(P(-1), P(0));
    let d = `M${f(s[0])} ${f(s[1])}`;
    for (let i = 0; i < m; i++) {
      const A = mid(P(i - 1), P(i)), V = P(i), B = mid(P(i), P(i + 1));
      const c1 = [A[0] + k * (V[0] - A[0]), A[1] + k * (V[1] - A[1])];
      const c2 = [B[0] + k * (V[0] - B[0]), B[1] + k * (V[1] - B[1])];
      d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(B[0])} ${f(B[1])}`;
    }
    return d + 'Z';
  }

  // ---------- 9. Standalone SVG ----------
  const LINE_COLOURS = ['#F6EFDF', '#F2C14E', '#F497B5', '#93D58E', '#8ECBF2', '#CDAEF5', '#F7AC70', '#E8E39A'];
  function toSVG(res, loops, opts = {}) {
    const n = res.n, N = 2 * n, pad = 0.7, size = opts.size || 600, W = N + 2 * pad;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-pad} ${-pad} ${W} ${W}">`;
    s += `<rect x="${-pad}" y="${-pad}" width="${W}" height="${W}" fill="#6A291E"/>`;
    loops.forEach((lp, i) => {
      const c = opts.colour ? LINE_COLOURS[i % LINE_COLOURS.length] : '#F6EFDF';
      s += `<path d="${loopPath(lp, 1)}" fill="none" stroke="${c}" stroke-width="0.16" stroke-linecap="round"/>`;
    });
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += `<circle cx="${2 * i + 1}" cy="${2 * j + 1}" r="0.13" fill="#F6EFDF"/>`;
    return s + '</svg>\n';
  }

  // one call from text to everything
  // printed reading first; if it does not scan, or holds a குற்றியலிகரம், the classical reading (spec 4.4)
  function read(text, opts = {}) {
    const printed = parseVerse(text), printedCheck = validate(printed);
    printed.reading = 'printed';
    const asPrinted = extra => Object.assign({ verse: printed, check: printedCheck, reading: 'printed', printed, printedCheck }, extra);
    // a குற்றியலிகரம் arises in sandhi (Eḻuttu 35), so a verse that has one is read classically
    const ikaram = hasIkaram(printed.lines);
    if (opts.reading === 'printed' || (!printedCheck.errs.length && opts.reading !== 'classical' && !ikaram)) return asPrinted({});
    const cv = classicalReading(text);
    if (cv) {
      const cc = validate(cv);
      if (!cc.errs.length) return { verse: cv, check: cc, reading: 'classical', printed, printedCheck };
    }
    if (opts.reading === 'classical') {
      const errs = [{ msg: 'No classical reading of this verse scans.' }];
      return asPrinted({ check: { errs, joins: [] }, classicalFailed: true });
    }
    if (!printedCheck.errs.length) { // scans only as printed, with its குற்றியலிகரம் counted as written
      printed.note = 'Read as printed: no classical reading scans, so the குற்றியலிகரம் counts as written.';
      return asPrinted({});
    }
    return asPrinted({ classicalFailed: true });
  }

  // one call from text to everything
  function execute(text, opts = {}) {
    const r = read(text, opts);
    if (r.check.errs.length) return Object.assign(r, { ok: false });
    const program = compile(r.verse), result = run(program, r.verse, opts), lines = kolam(result);
    return Object.assign(r, { ok: true, program, result, lines });
  }

  const VERSION = '0.5.0';
  const api = { VERSION, letters, hasIkaram, asaiSplit, classify, parseVerse, validate, classicalReading, read, compile, run, kolam, loopPath, toSVG, execute, GROUPS, OPS, VOWELS, VALLINAM, MELLINAM, IDAIYINAM };
  return api;
})();
export default Yappu;