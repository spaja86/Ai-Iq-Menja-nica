/* ===================================================
   Ai Iq Menjačnica — theme.js
   Dark / Light mode toggle with localStorage
   =================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'aiq-theme';

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    var btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = mode === 'light' ? '🌙' : '☀️';
  }

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply immediately (before paint) to avoid flash
  applyTheme(getPreferred());

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggle);
    // Sync button icon after DOM ready
    applyTheme(getPreferred());
  });
})();
