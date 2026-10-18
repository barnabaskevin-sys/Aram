/* Interface text for அறம் · Aram. One dictionary per language; English is the master and the fallback. */
export const UI = (function () {
  // id, native name, English name (used in prompts), direction, HTML lang
  const LANGS = [
    ['ta', 'தமிழ்', 'Tamil', 'ltr', 'ta'], ['en', 'English', 'English', 'ltr', 'en'],
    ['hi', 'हिन्दी', 'Hindi', 'ltr', 'hi'], ['bn', 'বাংলা', 'Bengali', 'ltr', 'bn'], ['te', 'తెలుగు', 'Telugu', 'ltr', 'te'], ['kn', 'ಕನ್ನಡ', 'Kannada', 'ltr', 'kn'],
    ['ml', 'മലയാളം', 'Malayalam', 'ltr', 'ml'], ['mr', 'मराठी', 'Marathi', 'ltr', 'mr'], ['gu', 'ગુજરાતી', 'Gujarati', 'ltr', 'gu'], ['pa', 'ਪੰਜਾਬੀ', 'Punjabi (Gurmukhi)', 'ltr', 'pa'],
    ['ur', 'اردو', 'Urdu', 'rtl', 'ur'], ['si', 'සිංහල', 'Sinhala', 'ltr', 'si'], ['ne', 'नेपाली', 'Nepali', 'ltr', 'ne'],
    ['ar', 'العربية', 'Modern Standard Arabic', 'rtl', 'ar'], ['he', 'עברית', 'Hebrew', 'rtl', 'he'], ['fa', 'فارسی', 'Persian (Farsi)', 'rtl', 'fa'], ['tr', 'Türkçe', 'Turkish', 'ltr', 'tr'],
    ['fr', 'Français', 'French', 'ltr', 'fr'], ['de', 'Deutsch', 'German', 'ltr', 'de'], ['es', 'Español', 'Spanish', 'ltr', 'es'], ['pt', 'Português', 'Portuguese', 'ltr', 'pt'],
    ['it', 'Italiano', 'Italian', 'ltr', 'it'], ['nl', 'Nederlands', 'Dutch', 'ltr', 'nl'], ['sv', 'Svenska', 'Swedish', 'ltr', 'sv'], ['nb', 'Norsk', 'Norwegian (Bokmål)', 'ltr', 'nb'],
    ['da', 'Dansk', 'Danish', 'ltr', 'da'], ['fi', 'Suomi', 'Finnish', 'ltr', 'fi'], ['pl', 'Polski', 'Polish', 'ltr', 'pl'], ['cs', 'Čeština', 'Czech', 'ltr', 'cs'],
    ['hu', 'Magyar', 'Hungarian', 'ltr', 'hu'], ['ro', 'Română', 'Romanian', 'ltr', 'ro'], ['el', 'Ελληνικά', 'Greek', 'ltr', 'el'], ['ru', 'Русский', 'Russian', 'ltr', 'ru'], ['uk', 'Українська', 'Ukrainian', 'ltr', 'uk'],
    ['zh', '简体中文', 'Simplified Chinese', 'ltr', 'zh-Hans'], ['zht', '繁體中文', 'Traditional Chinese', 'ltr', 'zh-Hant'], ['ja', '日本語', 'Japanese', 'ltr', 'ja'], ['ko', '한국어', 'Korean', 'ltr', 'ko'],
    ['vi', 'Tiếng Việt', 'Vietnamese', 'ltr', 'vi'], ['th', 'ไทย', 'Thai', 'ltr', 'th'], ['id', 'Bahasa Indonesia', 'Indonesian', 'ltr', 'id'], ['ms', 'Bahasa Melayu', 'Malay', 'ltr', 'ms'],
    ['fil', 'Filipino', 'Filipino (Tagalog)', 'ltr', 'fil'], ['sw', 'Kiswahili', 'Swahili', 'ltr', 'sw'], ['af', 'Afrikaans', 'Afrikaans', 'ltr', 'af']
  ];
  const DICT = {};
  DICT.en = {
    'nav.home': 'Home', 'nav.ask': 'Ask', 'nav.check': 'Check', 'nav.library': 'Library',
    'home.tagline': 'Tamil wisdom, one verse at a time',
    'home.today': 'Verse of the day', 'home.another': 'Another verse',
    'home.intro': 'Thousands of verses from the Thirukkural, the Sangam poems, the Tēvāram and more. Read and check them offline, or ask a question to find the verses that speak to it.',
    'ask.hint': 'What are you facing? One or two sentences is enough.',
    'ask.placeholder': 'e.g. A friend borrowed money and has not paid it back.',
    'ask.go': 'Find verses', 'ask.stop': 'Stop',
    'ask.empty_q': 'Write your question first.',
    'ask.finding': 'Finding the right chapters…', 'ask.reading': 'Reading the verses ({n})…',
    'ask.no_chapter': 'No chapter matched. Try describing the situation differently.',
    'ask.no_pick': 'No verse could be matched to that answer. Try asking again.',
    'ask.offline': 'Asking needs an internet connection. The library and Check work offline.',
    'ask.examples': 'Try asking', 'ask.example': 'How do I forgive someone who let me down?', 'ask.flag': 'Report this answer',
    'err.rate': 'Too many requests just now. Wait a moment and try again.', 'err.stopped': 'Stopped.', 'err.generic': 'Could not get an answer. Check your connection and try again.',
    'check.hint': 'Paste a verse you saw somewhere. It is matched against every verse in the library, then run through the Yāppu metre check.',
    'check.placeholder': 'Paste two or four lines of Tamil', 'check.go': 'Check', 'check.short': 'Paste at least a full line of Tamil.',
    'check.exact_t': 'Exact match.', 'check.exact_d': 'This is a genuine verse; spacing and punctuation are ignored.',
    'check.part_t': 'Part of a genuine verse.', 'check.part_d': 'What you pasted appears inside {ref}; the full text is below.',
    'check.close_t': 'Close, but not the same.', 'check.close_d': 'It resembles {ref} ({pct}% alike). It may be misquoted or a variant reading. Words that differ are marked.',
    'check.none_t': 'No match.', 'check.none_d': 'This is not in any text held here. It may be a paraphrase, a verse from another work, or a saying credited to the wrong poet.',
    'check.metre_ok': 'Your text passes the Yāppu metre check, so it is at least a well-formed venba.', 'check.metre_bad': 'Your text does not pass the Yāppu metre check:',
    'lib.all': 'All works', 'lib.section': 'Section', 'lib.entries': 'Entries: {n}', 'lib.explain': 'Explain', 'lib.reading': 'Reading…',
    'card.ok': 'Passes the Yāppu metre check', 'card.rd_p': 'as printed', 'card.rd_c': 'classical reading',
    'card.notvenba': 'Not a venba, so the Yāppu metre check does not apply.',
    'card.fail': 'Does not pass the Yāppu metre check as printed. The edition may differ from the classical wording, or the text may hold a slip.',
    'card.damaged': 'Part of this verse is lost in the source (shown as dots), so the metre check cannot be run.',
    'card.two_sutras': 'This entry may hold two neighbouring sūtras.', 'card.landscape': 'The landscape follows the traditional arrangement of the anthology.',
    'card.poet': 'Poet', 'card.praised': 'Praised', 'card.author': 'Traditional author', 'card.lines': 'Lines: {n}', 'card.share': 'Share', 'card.copied': 'Copied',
    'lab.meaning': 'Meaning', 'lab.applies': 'For your question', 'lab.context': 'Context', 'lab.overview': 'Overview',
    'ai.note': 'AI-written from the verse. Check it against the words above.', 'ai.translating': 'Translating the explanations…',
    'set.title': 'Settings', 'set.ui': 'App language', 'set.search': 'Search languages', 'set.meanings': 'Meanings in',
    'set.meanings_hint': 'Meanings are written by AI in the languages you choose. Limit: {n}.', 'set.max': 'You can choose up to {n} languages.',
    'set.appearance': 'Appearance', 'set.auto': 'Auto', 'set.day': 'Day leaf', 'set.night': 'Night lamp', 'set.size': 'Text size',
    'set.about': 'About', 'set.credits': 'Texts and credits', 'set.privacy': 'Privacy', 'set.close': 'Close',
    'about.p1': 'அறம் (aram) means virtue, the first of the three parts of the Thirukkural. This app gathers classical Tamil verses, shows each with its kolam, and checks their metre with Yāppu, a programming language in which every program is a venba.',
    'about.p2': 'Meanings and answers are written by AI from the verse itself. They are there to help you study, not to settle a question; where commentators differ, treat any single reading with care.',
    'ai.agree': 'Agree and continue', 'ai.later': 'Not now',
    'privacy.p': 'Reading, browsing and checking work offline and send nothing anywhere. When you ask a question or request a meaning, that text is sent to an AI service so it can write the answer. Nothing else leaves your phone.'
  };
  return { LANGS, DICT, add(id, o) { DICT[id] = Object.assign(DICT[id] || {}, o); } };
})();
