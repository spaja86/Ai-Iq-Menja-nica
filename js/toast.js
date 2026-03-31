/* ===================================================
   Ai Iq Menjačnica — toast.js
   Toast notification system
   =================================================== */

(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('toast-styles')) return;
    var css = '#toast-container{position:fixed;top:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}' +
      '.toast{min-width:260px;max-width:340px;padding:14px 18px;border-radius:10px;font-family:"Segoe UI",system-ui,sans-serif;font-size:0.88rem;line-height:1.4;display:flex;align-items:flex-start;gap:12px;pointer-events:all;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,0.35);transform:translateX(120%);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s;opacity:0;border:1px solid transparent;}' +
      '.toast.show{transform:translateX(0);opacity:1;}' +
      '.toast.hide{transform:translateX(120%);opacity:0;}' +
      '.toast-success{background:#0a2318;border-color:#00e676;color:#ccfcd8;}' +
      '.toast-error{background:#2d0a0a;border-color:#ff5252;color:#ffd0d0;}' +
      '.toast-info{background:#0a1a2d;border-color:#448aff;color:#d0e8ff;}' +
      '.toast-warn{background:#2d1e00;border-color:#ffab00;color:#fff3cc;}' +
      '[data-theme=light] .toast-success{background:#e8fdf1;border-color:#00c853;color:#1b4332;}' +
      '[data-theme=light] .toast-error{background:#fdecea;border-color:#f44336;color:#7f1d1d;}' +
      '[data-theme=light] .toast-info{background:#e8f0fe;border-color:#2979ff;color:#1a237e;}' +
      '[data-theme=light] .toast-warn{background:#fffde7;border-color:#ffd600;color:#4d3800;}' +
      '.toast-icon{font-size:1.3rem;flex-shrink:0;line-height:1;}' +
      '.toast-body{flex:1;}' +
      '.toast-title{font-weight:700;margin-bottom:3px;font-size:0.88rem;}' +
      '.toast-msg{font-size:0.8rem;opacity:0.85;}' +
      '.toast-progress{position:absolute;bottom:0;left:0;height:3px;background:currentColor;opacity:0.4;border-radius:0 0 10px 10px;animation:toast-prog linear forwards;}' +
      '@keyframes toast-prog{from{width:100%;}to{width:0;}}';
    var style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureContainer() {
    var el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  var icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };

  window.showToast = function (title, message, type, duration) {
    injectStyles();
    type = type || 'info';
    duration = duration || 4000;
    var container = ensureContainer();

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.style.position = 'relative';
    toast.innerHTML =
      '<div class="toast-icon">' + (icons[type] || 'ℹ️') + '</div>' +
      '<div class="toast-body">' +
        '<div class="toast-title">' + title + '</div>' +
        (message ? '<div class="toast-msg">' + message + '</div>' : '') +
      '</div>';

    // Progress bar
    var prog = document.createElement('div');
    prog.className = 'toast-progress';
    prog.style.animationDuration = duration + 'ms';
    toast.appendChild(prog);

    container.appendChild(toast);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('show'); });
    });

    function dismiss() {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
    }

    toast.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  };

  // Convenience wrappers
  window.toastSuccess = function (title, msg) { window.showToast(title, msg, 'success'); };
  window.toastError   = function (title, msg) { window.showToast(title, msg, 'error'); };
  window.toastInfo    = function (title, msg) { window.showToast(title, msg, 'info'); };
  window.toastWarn    = function (title, msg) { window.showToast(title, msg, 'warn'); };

  // Demo toasts on page load (market data update)
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      window.toastInfo('📊 Tržišni podaci', 'Live cene učitane — ažuriranje svakih 3s');
    }, 1500);
  });
})();
