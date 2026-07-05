/**
 * i18n.js — Language switching module
 * Handles EN/ZH language toggle, persistence, and emits 'langchange' events.
 */

(function() {
  var saved = localStorage.getItem('resume-lang');
  if (saved) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setLang(saved); });
    } else {
      setLang(saved);
    }
  }
})();

function setLang(lang) {
  document.body.className = 'lang-' + lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(lang === 'en' ? 'english' : '中文'));
  });
  localStorage.setItem('resume-lang', lang);
  // Notify other modules that language changed
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
}
