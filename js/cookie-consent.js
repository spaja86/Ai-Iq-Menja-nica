/* ===================================================
   Ai Iq Menjačnica — cookie-consent.js
   GDPR Cookie Consent Banner
   =================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'aiq-cookie-consent';

  function hasConsent() {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  function saveConsent(value) {
    localStorage.setItem(STORAGE_KEY, value);
  }

  function removeBanner(banner) {
    banner.style.transform = 'translateY(100%)';
    banner.style.opacity = '0';
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 400);
  }

  function injectStyles() {
    if (document.getElementById('cookie-styles')) return;
    var css = '#cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:99998;background:var(--cb-bg,#111820);border-top:1px solid rgba(0,255,136,0.2);padding:20px 24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:space-between;font-family:"Segoe UI",system-ui,sans-serif;transform:translateY(0);opacity:1;transition:transform 0.4s ease,opacity 0.4s ease;box-shadow:0 -4px 24px rgba(0,0,0,0.4);}' +
      '[data-theme=light] #cookie-banner{background:#f0f4f8;border-top-color:rgba(0,168,107,0.3);box-shadow:0 -4px 24px rgba(0,0,0,0.15);}' +
      '#cookie-banner .cookie-text{flex:1;min-width:220px;}' +
      '#cookie-banner .cookie-title{font-size:0.92rem;font-weight:700;margin-bottom:4px;color:inherit;}' +
      '#cookie-banner .cookie-desc{font-size:0.78rem;color:var(--crypto-muted,#888);line-height:1.5;}' +
      '#cookie-banner .cookie-desc a{color:var(--crypto-green,#00ff88);}' +
      '#cookie-banner .cookie-actions{display:flex;gap:10px;flex-wrap:wrap;}' +
      '#cookie-accept{background:#00ff88;color:#000;border:none;padding:10px 22px;border-radius:8px;font-size:0.85rem;font-weight:700;cursor:pointer;transition:background 0.2s;}' +
      '[data-theme=light] #cookie-accept{background:#00a86b;}' +
      '#cookie-accept:hover{background:#00ffaa;}' +
      '#cookie-essential{background:transparent;color:inherit;border:1px solid var(--crypto-border,#2a2a2a);padding:10px 18px;border-radius:8px;font-size:0.85rem;cursor:pointer;transition:border-color 0.2s;}' +
      '#cookie-essential:hover{border-color:var(--crypto-green,#00ff88);}' +
      '@media(max-width:600px){#cookie-banner{flex-direction:column;align-items:flex-start;}}';
    var style = document.createElement('style');
    style.id = 'cookie-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie Consent');
    banner.innerHTML =
      '<div class="cookie-text">' +
        '<div class="cookie-title">🍪 Ova stranica koristi kolačiće (cookies)</div>' +
        '<div class="cookie-desc">Koristimo kolačiće za poboljšanje korisničkog iskustva, analitiku i personalizaciju. ' +
          'Pogledajte našu <a href="SECURITY.md">politiku privatnosti</a>.</div>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button id="cookie-accept">✅ Prihvatam sve</button>' +
        '<button id="cookie-essential">🔒 Samo neophodni</button>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('cookie-accept').addEventListener('click', function () {
      saveConsent('all');
      removeBanner(banner);
      if (window.toastSuccess) window.toastSuccess('🍪 Kolačići prihvaćeni', 'Hvala! Sve funkcije su aktivirane.');
    });

    document.getElementById('cookie-essential').addEventListener('click', function () {
      saveConsent('essential');
      removeBanner(banner);
      if (window.toastInfo) window.toastInfo('🔒 Samo neophodni kolačići', 'Aktivirani su samo neophodni kolačići.');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (hasConsent()) return;
    injectStyles();
    buildBanner();
  });
})();
