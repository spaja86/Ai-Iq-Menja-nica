/* ===================================================
   Ai Iq Menjačnica — main.js
   Header, ticker, hamburger, animations, counters
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

})();
