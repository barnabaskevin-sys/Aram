  const EXAMPLES = [
    'A colleague took credit for my work. Should I confront him?',
    'என் நண்பன் கடன் வாங்கிவிட்டுத் திருப்பித் தரவில்லை.',
    'I keep putting off an important decision because I fear failing.',
    'பெற்றோரைக் கவனித்துக்கொள்வதா, என் வேலையா?',
    'How do I stay calm when someone insults me?',
    'Comment pardonner à quelqu\'un qui m\'a trahi ?',
    'كيف أتعامل مع الحسد في العمل؟',
    'Как простить человека, который меня предал?',
    '同事抢了我的功劳，我该当面质问他吗？',
    '직장에서 질투를 받을 때 어떻게 해야 하나요?',
    '大切な決断を、失敗が怖くて先延ばしにしてしまいます。',
    'Wie gehe ich damit um, wenn mich jemand ständig kritisiert?',
    'Een vriend heeft geld van me geleend en betaalt het niet terug. Wat moet ik doen?',
    '¿Cómo puedo ser paciente cuando todo sale mal?'
  ];
  let exShown = [];
  function renderExamples() {
    const d = Math.floor(Date.now() / 86400000), mine = t('ask.example');
    exShown = [mine];
    for (let k = 0; exShown.length < 5 && k < EXAMPLES.length; k++) { const e = EXAMPLES[(d + k * 3) % EXAMPLES.length]; if (!exShown.includes(e)) exShown.push(e); }
    $('examples').innerHTML = exShown.map((x, i) => `<button class="chip" data-i="${i}" dir="auto">${esc(x)}</button>`).join('');
  }
  $('examples').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) { $('q').value = exShown[+b.dataset.i]; $('q').focus(); } });
