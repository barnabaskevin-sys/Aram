/* Settings (app language, appearance, text size, about) and the texts-and-credits sheet. */
import { esc, store } from '../lib/dom.js';
import { t, ui, LANGS } from '../lib/i18n.js';
import { THEMES, savedTheme, savedSize, applyTheme, applySize } from '../lib/theme.js';
import { openSheet, closeSheet } from '../ui/sheet.js';

export function openSettings(onLanguage) {
  const pref = savedTheme(), size = savedSize();
  const body = `
    <div><h3>${esc(t('set.ui'))}</h3>
      <input class="search" id="ls-q" type="search" placeholder="${esc(t('set.search'))}" aria-label="${esc(t('set.search'))}" autocomplete="off" autocapitalize="off" spellcheck="false">
    </div>
    <div id="sec-ui"><div class="langlist" id="ls-ui" role="radiogroup" aria-label="${esc(t('set.ui'))}"></div></div>
    <div><h3>${esc(t('set.appearance'))}</h3><div class="segmented" id="seg-theme">${THEMES.map(x => `<button type="button" data-th="${x}" aria-pressed="${pref === x}">${esc(t('set.' + x))}</button>`).join('')}</div></div>
    <div><h3>${esc(t('set.size'))}</h3><div class="sizer"><span aria-hidden="true" style="font-size:.85rem">A</span><input type="range" id="fs" min="90" max="140" step="5" value="${size}" aria-label="${esc(t('set.size'))}"><span aria-hidden="true" style="font-size:1.4rem">A</span></div></div>
    <div class="prose"><h3>${esc(t('set.about'))}</h3><p>${esc(t('about.p1'))}</p>
      <div class="row"><button type="button" class="btn quiet" id="open-credits">${esc(t('set.credits'))}</button></div></div>`;
  openSheet(t('set.title'), body, el => {
    const q = el.querySelector('#ls-q');
    const draw = () => {
      const f = q.value.trim().toLowerCase();
      const ok = l => !f || l[1].toLowerCase().includes(f) || l[2].toLowerCase().includes(f) || l[0] === f;
      el.querySelector('#ls-ui').innerHTML = LANGS.filter(ok).map(l => `<button type="button" role="radio" aria-checked="${l[0] === ui}" data-ui="${l[0]}" lang="${l[4]}"${l[3] === 'rtl' ? ' dir="rtl"' : ''}><span>${esc(l[1])}</span><small>${esc(l[2])}</small></button>`).join('');
    };
    draw(); q.addEventListener('input', draw);
    el.addEventListener('click', e => {
      const u = e.target.closest('[data-ui]'); if (u) { onLanguage(u.dataset.ui); closeSheet(); return; }
      const th = e.target.closest('[data-th]'); if (th) { store.set('aram.theme', th.dataset.th); applyTheme(th.dataset.th); el.querySelectorAll('[data-th]').forEach(b => b.setAttribute('aria-pressed', String(b === th))); return; }
      if (e.target.closest('#open-credits')) openCredits();
    });
    el.querySelector('#fs').addEventListener('input', e => { store.set('aram.size', e.target.value); applySize(+e.target.value); });
  });
}

const CR = [
  ['Thirukkural', 'Text from the open tk120404/thirukkural dataset (Apache License 2.0), with 24 corrections found by comparing other editions. English by G. U. Pope (1886), from the Project Madurai e-text (made by OCR and edited, so a stray slip is possible).'],
  ['Nālaṭiyār', 'Project Madurai edition in Tamil script, with encoding repairs and corrections checked against other editions. English by G. U. Pope (1893).'],
  ['Tolkāppiyam', 'Etext by Dr. K. Kalyanasundaram, proof-read by N. D. Logasundaram: the sūtras alone, without commentary, with words split as that edition gives them. In five places its numbering skips, so one entry there may hold two neighbouring sūtras.'],
  ['Puṟanāṉūṟu', 'Text from K. A. P. Viswanatham Higher Secondary School, Tiruchirappalli. Poems 200, 267 and 268 are missing from it.'],
  ['Maṇimēkalai', 'From the Tamilex transcription, University of Cologne, proof-read by Ma. Sivakumar. Cut here into passages of eight lines.'],
  ['Cilappatikāram', 'Etext by P. R. Sivakumar, proof-read by P. K. Ilango. The Maturai and Vañci kāṇṭams (kātai 11–30) are included; the Pukār kāṇṭam is not. Cut into passages of eight lines.'],
  ['Kuṟuntokai and Kalittokai', 'Prepared by Dr. K. Kalyanasundaram; the Kuṟuntokai proof-read by Sarala Sandirasegarane. The Kalittokai authorship shown follows the tradition recorded in that edition.'],
  ['Akanāṉūṟu', 'Transliteration by Dr. Thomas Malten and colleagues, University of Cologne; proof-read by Sivakumar and Raju Rajendran. The source repeats two poem numbers, read here as 131 and 319, and gives no landscape, so each poem’s landscape follows the traditional arrangement of the anthology.'],
  ['Patiṟṟuppattu', 'Text input by Sivalingam Ramalingam, proof-read by Periannan Chandrasekaran. It holds poems 11 to 90, since the first and tenth tens are lost, and some lines are missing.'],
  ['Auvaiyār', 'Āttiṟcūṭi, Koṉṟaivēntaṉ, Mūturai and Nalvaḻi, edition prepared by Dr. K. Kalyanasundaram. Some Mūturai and Nalvaḻi verses do not pass the metre check as printed.'],
  ['The Eighteen Minor Works', 'Sixteen works, input and proof-reading by Ms. Sarala Sandirasegarane, web versions by Dr. K. Kalyanasundaram. About nine in ten of their venbas pass the metre check as printed. Kainnilai survives in fragments, so 17 of its verses are damaged and shown with dots. In Aintiṇai Eḻupatu verses 25 and 26 are lost and the file ends at verse 68. Palamoḻi Nāṉūṟu is not included. Where a work numbers its invocation as verse 1, the numbers follow the etext.'],
  ['Tēvāram', 'The seven tirumuṟai (Campantar, Appar, Cuntarar), etexts by many volunteers. About 97 per cent of the numbered verses are here (roughly 8,040 of 8,240). In some patikams the source’s verse markers are damaged, so a card may hold two neighbouring verses. Patikams 6.42–6.50 are absent, because the source for the sixth tirumuṟai breaks off after verse 409 and the next file begins at 509.'],
  ['Tirumantiram', 'Prepared by Dr. K. Kalyanasundaram, proof-read by G. Venugopalan. 2,772 of the 3,047 verses are here; verses 1155 to 1418 of the fourth tantiram are not in the files used.'],
  ['Tiruvācakam', 'Project Madurai etext, shown in passages: the hymns that number their stanzas are split by stanza, the others in eight-line passages.'],
  ['All the Project Madurai texts', 'The Tēvāram, Tirumantiram, Tiruvācakam and Minor Works were converted from transliteration into Tamil script and may keep a few slips.'],
  ['Yāppu and fonts', 'The metre check and kolam come from Yāppu 0.5 (MIT licence, © 2026 Kevin Cruz). Fonts: Tiro Tamil, Noto Serif Tamil and Mukta Malar, under the SIL Open Font License.']
];

function openCredits() {
  const body = `<div class="credits-list">
    <p>Most texts are Project Madurai e-texts (projectmadurai.org). Their notice, which asks that it be kept with the texts:</p>
    <p class="pm" lang="en" dir="ltr">© Project Madurai, 1998-2021. Project Madurai is an open, voluntary, worldwide initiative devoted to preparation of electronic texts of tamil literary works and to distribute them free on the Internet. Details of Project Madurai are available at the website http://www.projectmadurai.org/ You are welcome to freely distribute this file, provided this header page is kept intact.</p>
    ${CR.map(c => `<p lang="en" dir="ltr"><b>${esc(c[0])}.</b> ${esc(c[1])}</p>`).join('')}
  </div>`;
  openSheet(t('set.credits'), body);
}
