/* Entry point. Theme and interface text apply at once; the rest of the app waits for the verse library. */
import './styles/fonts.css';
import './styles/aram.css';
import { $ } from './lib/dom.js';
import { t, detectUI, setUILang, applyStaticText } from './lib/i18n.js';
import { initTheme } from './lib/theme.js';

initTheme();
setUILang(detectUI(), false);
applyStaticText();

const today = $('today');
today.innerHTML = `<p class="boot" role="status">${t('lib.reading')}</p>`;
import('./app.js').then(m => m.start()).catch(e => {
  console.error(e);
  today.innerHTML = '<p class="boot err" role="alert">Could not load the library. Check your connection and <a href="">reload the page</a>.</p>';
});
