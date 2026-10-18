  // ----- library: a shelf of works, then one work at a time -----
  const BOOKS = [['K', 'திருக்குறள்', 'Thirukkural'], ['N', 'நாலடியார்', 'Nālaṭiyār'], ['W', 'அவ்வையார்', 'Auvaiyār'], ['Z', 'பதினெண் கீழ்க்கணக்கு', 'Minor Works'],
    ['T', 'தொல்காப்பியம்', 'Tolkāppiyam'], ['P', 'புறநானூறு', 'Puṟanāṉūṟu'], ['Q', 'குறுந்தொகை', 'Kuṟuntokai'], ['A', 'அகநானூறு', 'Akanāṉūṟu'], ['L', 'கலித்தொகை', 'Kalittokai'],
    ['B', 'பதிற்றுப்பத்து', 'Patiṟṟuppattu'], ['C', 'சிலப்பதிகாரம்', 'Cilappatikāram'], ['M', 'மணிமேகலை', 'Maṇimēkalai'], ['V', 'தேவாரம்', 'Tēvāram'], ['X', 'திருமந்திரம்', 'Tirumantiram'], ['H', 'திருவாசகம்', 'Tiruvācakam']];
  function renderShelf() {
    $('shelf').innerHTML = BOOKS.map((b, i) => `<button type="button" class="tile" data-b="${b[0]}" style="--i:${i}"><span class="tt" lang="ta" dir="ltr">${b[1]}</span><span><span class="tr">${b[2]}</span><br><span class="tn">${esc(t('lib.entries', { n: num(SRCV[b[0]].length) }))}</span></span></button>`).join('');
  }
  // Tamil titles differ a lot in length; shrink a title only as far as needed so a word is never broken in two
  function fitTiles() {
    document.querySelectorAll('#shelf .tt').forEach(el => {
      el.style.fontSize = '';
      if (!el.offsetParent) return;
      let s = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 0.5 && s > 11) { s -= 0.5; el.style.fontSize = s + 'px'; }
    });
  }
  window.addEventListener('resize', fitTiles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTiles);
  $('shelf').addEventListener('click', e => { const b = e.target.closest('.tile'); if (b) openBook(b.dataset.b); });
  let bookOpen = false;
  function openBook(id) {
    const b = BOOKS.find(x => x[0] === id); if (!b) return;
    $('bsrc').value = id; bookOpen = true;
    $('book-ta').textContent = b[1]; $('book-en').textContent = b[2];
    $('shelf-wrap').hidden = true; $('book').hidden = false;
    fillChapters(); browse(); window.scrollTo(0, 0);
  }
  function closeBook() { bookOpen = false; $('book').hidden = true; $('shelf-wrap').hidden = false; dropScope('browse'); $('browse-out').innerHTML = ''; window.scrollTo(0, 0); }
  $('book-back').addEventListener('click', closeBook);

