/**
 * theme.js — Theme switching module (light / dark)
 * Handles dark mode toggle, persistence, and initial application.
 */

(function() {
  var saved = localStorage.getItem('resume-theme');
  applyTheme(saved === 'dark' ? 'dark' : 'light');
})();

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('resume-theme', theme);
  var btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}
