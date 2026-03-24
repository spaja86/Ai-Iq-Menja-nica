/* ===================================================
   Ai Iq Menjačnica — main.js
   Header, ticker, hamburger, animations, counters,
   i18n (SR/EN), micro-interactions, PWA registration
   =================================================== */

(function () {
  'use strict';

  /* ---------- LOADING SPINNER ---------- */
  window.addEventListener('load', function () {
    var overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      setTimeout(function () { overlay.classList.add('hidden'); }, 300);
    }
  });

  /* ---------- ACTIVE NAV LINK ---------- */
  function setActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }
  setActiveNav();

  /* ---------- HAMBURGER MENU ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      }
    });

    // Close on nav link click
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ---------- STICKY HEADER SHADOW ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5)';
      } else {
        header.style.boxShadow = '';
      }
    });
  }

  /* ---------- SMOOTH SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- COUNTER ANIMATION ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.dataset.target || el.textContent.replace(/[^0-9.]/g, ''));
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var duration = 1800;
    var start = null;
    var startVal = 0;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = startVal + (target - startVal) * eased;

      if (target >= 1000) {
        el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      } else if (target < 1) {
        el.textContent = prefix + current.toFixed(2) + suffix;
      } else {
        el.textContent = prefix + Math.round(current) + suffix;
      }

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (target >= 1000 ? target.toLocaleString() : target) + suffix;
    }

    requestAnimationFrame(step);
  }

  var countersObserved = new Set();

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersObserved.has(entry.target)) {
        countersObserved.add(entry.target);
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---------- ANIMATE-IN ELEMENTS ---------- */
  var animObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(function (el) {
    animObserver.observe(el);
  });

  /* ---------- RIPPLE EFFECT ON BUTTONS ---------- */
  function addRipple(e) {
    var btn = e.currentTarget;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var x = e.clientX - rect.left - size / 2;
    var y = e.clientY - rect.top  - size / 2;
    var ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;';
    btn.classList.add('ripple-container');
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', function () { ripple.remove(); });
  }

  document.querySelectorAll('.btn-primary,.btn-outline,.btn-hero,.btn-submit,.btn-buy-submit,.btn-sell-submit').forEach(function (btn) {
    btn.addEventListener('click', addRipple);
  });

  /* ---------- 3D TILT ON CARDS ---------- */
  document.querySelectorAll('.feature-card,.price-card,.service-card,.team-card').forEach(function (card) {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var cx = rect.left + rect.width  / 2;
      var cy = rect.top  + rect.height / 2;
      var rx = ((e.clientY - cy) / (rect.height / 2)) * 6;
      var ry = ((e.clientX - cx) / (rect.width  / 2)) * -6;
      card.style.transform = 'perspective(600px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ---------- I18N (SR / EN) ---------- */
  var LANG_KEY = 'aiq-lang';

  var translations = {
    sr: {
      'nav-home':      'Početna',
      'nav-trade':     'Trading',
      'nav-wallet':    'Novčanik',
      'nav-education': 'Edukacija',
      'nav-services':  'Usluge',
      'nav-about':     'O nama',
      'nav-contact':   'Kontakt',
      'nav-ecosystem': '🌐 Ekosistem ▾',
      'hero-badge':    '🤖 AI-Powered Kripto Platform',
      'btn-trade':     '📊 Počni da trejduješ',
      'btn-wallet':    '💼 Moj Novčanik',
      'cta-h2':        'Spremi za profesionalni kripto trading?',
      'cta-p':         'Pridruži se milionima korisnika koji trejduju na Ai Iq Menjačnici svaki dan.'
    },
    en: {
      'nav-home':      'Home',
      'nav-trade':     'Trading',
      'nav-wallet':    'Wallet',
      'nav-education': 'Education',
      'nav-services':  'Services',
      'nav-about':     'About',
      'nav-contact':   'Contact',
      'nav-ecosystem': '🌐 Ecosystem ▾',
      'hero-badge':    '🤖 AI-Powered Crypto Platform',
      'btn-trade':     '📊 Start Trading',
      'btn-wallet':    '💼 My Wallet',
      'cta-h2':        'Ready for professional crypto trading?',
      'cta-p':         'Join millions of users trading on Ai Iq Exchange every day.'
    }
  };

  function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'sr');
    var btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'en' ? 'SR 🇷🇸' : 'EN 🇬🇧';

    // data-sr / data-en attributes
    document.querySelectorAll('[data-sr],[data-en]').forEach(function (el) {
      var txt = el.getAttribute('data-' + lang);
      if (txt) el.textContent = txt;
    });

    // Named keys
    var t = translations[lang] || translations.sr;
    Object.keys(t).forEach(function (key) {
      document.querySelectorAll('[data-i18n="' + key + '"]').forEach(function (el) {
        el.textContent = t[key];
      });
    });
  }

  function toggleLang() {
    var current = localStorage.getItem(LANG_KEY) || 'sr';
    var next = current === 'sr' ? 'en' : 'sr';
    localStorage.setItem(LANG_KEY, next);
    applyLang(next);
  }

  var savedLang = localStorage.getItem(LANG_KEY) || 'sr';
  applyLang(savedLang);

  document.addEventListener('DOMContentLoaded', function () {
    var langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);
    applyLang(localStorage.getItem(LANG_KEY) || 'sr');
  });

  /* ---------- PWA SERVICE WORKER ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {
        // SW registration failed silently (e.g. file:// protocol)
      });
    });
  }

  /* ---------- DROPDOWN NAV (hover + click for mobile) ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-links .dropdown > a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var li = a.closest('.dropdown');
        li.classList.toggle('open');
      });
    });
  });

})();
