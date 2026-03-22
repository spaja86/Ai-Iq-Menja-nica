/* =========================================================
   Ai IQ Menjačnica — Main JS (main.js)
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     Sanitize — prevent XSS when inserting user data
  ------------------------------------------------------- */
  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* -------------------------------------------------------
     Hamburger Menu
  ------------------------------------------------------- */
  function initHamburger() {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* -------------------------------------------------------
     Sticky Header
  ------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------
     Platform Dropdown
  ------------------------------------------------------- */
  function initDropdown() {
    const btn  = document.getElementById('platform-btn');
    const menu = document.getElementById('platform-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', menu.classList.contains('open'));
    });

    document.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  }

  /* -------------------------------------------------------
     Smooth Scroll
  ------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id  = a.getAttribute('href').slice(1);
        const el  = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* -------------------------------------------------------
     Counter Animation
  ------------------------------------------------------- */
  function animateCounter(el, target, duration, suffix) {
    const start = performance.now();
    const startVal = 0;
    suffix = suffix || '';

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = Math.floor(startVal + ease * target);

      // Format large numbers
      let display;
      if (target >= 1000000) display = (current / 1000000).toFixed(1) + 'M';
      else if (target >= 1000) display = (current / 1000).toFixed(0) + 'K';
      else display = current.toString();

      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target._counted) {
          e.target._counted = true;
          const target   = parseInt(e.target.dataset.count, 10);
          const duration = parseInt(e.target.dataset.duration || '1800', 10);
          const suffix   = e.target.dataset.suffix || '';
          animateCounter(e.target, target, duration, suffix);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  }

  /* -------------------------------------------------------
     Ticker Bar
  ------------------------------------------------------- */
  function buildTickerItem(sym, coin) {
    const up = coin.change24h >= 0;
    const item = document.createElement('span');
    item.className = 'ticker-item';

    const symEl = document.createElement('span');
    symEl.className = 'sym';
    symEl.textContent = sym;

    const priceEl = document.createElement('span');
    priceEl.className = 'price';
    priceEl.textContent = window.cryptoAPI ? window.cryptoAPI.formatPrice(coin.price) : '$' + coin.price;

    const chEl = document.createElement('span');
    chEl.className = up ? 'up' : 'dn';
    chEl.textContent = (up ? '▲' : '▼') + ' ' + Math.abs(coin.change24h).toFixed(2) + '%';

    item.appendChild(symEl);
    item.appendChild(priceEl);
    item.appendChild(chEl);
    return item;
  }

  function initTicker() {
    const track = document.getElementById('ticker-track');
    if (!track || !window.cryptoAPI) return;

    function renderTicker() {
      track.innerHTML = '';
      const coins = window.cryptoAPI.getAll();
      Object.entries(coins).forEach(([sym, coin]) => {
        track.appendChild(buildTickerItem(sym, coin));
      });
      // Duplicate for seamless loop
      const items = Array.from(track.children);
      items.forEach(item => track.appendChild(item.cloneNode(true)));
    }

    renderTicker();

    // Update prices in ticker every price update
    window.addEventListener('priceUpdate', () => {
      const coins = window.cryptoAPI.getAll();
      const items = track.querySelectorAll('.ticker-item');
      const syms  = Object.keys(coins);
      items.forEach((item, i) => {
        const sym  = syms[i % syms.length];
        const coin = coins[sym];
        const priceEl = item.querySelector('.price');
        const chEl    = item.querySelector('.up, .dn');
        if (priceEl) priceEl.textContent = window.cryptoAPI.formatPrice(coin.price);
        if (chEl) {
          const up = coin.change24h >= 0;
          chEl.className = up ? 'up' : 'dn';
          chEl.textContent = (up ? '▲' : '▼') + ' ' + Math.abs(coin.change24h).toFixed(2) + '%';
        }
      });
    });
  }

  /* -------------------------------------------------------
     Intersection Observer — Reveal animations
  ------------------------------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => observer.observe(el));
  }

  /* -------------------------------------------------------
     Featured Coins Sparklines on index
  ------------------------------------------------------- */
  function initSparklines() {
    const canvases = document.querySelectorAll('.coin-sparkline');
    if (!canvases.length || !window.Charts || !window.cryptoAPI) return;

    canvases.forEach(canvas => {
      const sym  = canvas.dataset.symbol;
      if (!sym) return;
      const coin = window.cryptoAPI.get(sym);
      if (!coin) return;
      const hist = window.cryptoAPI.getHistorical(sym, '1D');
      const color = coin.change24h >= 0 ? '#00ff88' : '#ff4757';
      window.Charts.drawSparkline(canvas, hist, color);
    });
  }

  /* -------------------------------------------------------
     Mini widget on landing page
  ------------------------------------------------------- */
  function initMiniWidget() {
    const widget = document.getElementById('mini-widget-prices');
    if (!widget || !window.cryptoAPI) return;
    const featured = ['BTC', 'ETH', 'SOL', 'BNB'];

    function renderWidget() {
      widget.innerHTML = '';
      featured.forEach(sym => {
        const coin = window.cryptoAPI.get(sym);
        if (!coin) return;
        const up = coin.change24h >= 0;
        const row = document.createElement('div');
        row.className = 'mini-price-row';

        const coinDiv = document.createElement('div');
        coinDiv.className = 'mini-coin';

        const symEl = document.createElement('span');
        symEl.className = 'mini-coin-sym';
        symEl.textContent = sym;

        const nameEl = document.createElement('span');
        nameEl.className = 'mini-coin-name';
        nameEl.textContent = coin.name;

        coinDiv.appendChild(symEl);
        coinDiv.appendChild(nameEl);

        const priceEl = document.createElement('span');
        priceEl.className = 'mini-price';
        priceEl.textContent = window.cryptoAPI.formatPrice(coin.price);

        const chEl = document.createElement('span');
        chEl.className = 'mini-change ' + (up ? 'up' : 'dn');
        chEl.textContent = window.cryptoAPI.formatChange(coin.change24h);

        row.appendChild(coinDiv);
        row.appendChild(priceEl);
        row.appendChild(chEl);
        widget.appendChild(row);
      });
    }

    renderWidget();
    window.addEventListener('priceUpdate', renderWidget);
  }

  /* -------------------------------------------------------
     Coin Cards live price update
  ------------------------------------------------------- */
  function initCoinCards() {
    window.addEventListener('priceUpdate', () => {
      document.querySelectorAll('.coin-card[data-symbol]').forEach(card => {
        const sym  = card.dataset.symbol;
        const coin = window.cryptoAPI ? window.cryptoAPI.get(sym) : null;
        if (!coin) return;
        const priceEl  = card.querySelector('.coin-price');
        const changeEl = card.querySelector('.coin-change');
        if (priceEl) priceEl.textContent = window.cryptoAPI.formatPrice(coin.price);
        if (changeEl) {
          changeEl.textContent = window.cryptoAPI.formatChange(coin.change24h);
          changeEl.className   = 'coin-change ' + (coin.change24h >= 0 ? 'up' : 'dn');
        }
      });
    });
  }

  /* -------------------------------------------------------
     Active nav link
  ------------------------------------------------------- */
  function initActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* -------------------------------------------------------
     Init All
  ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initHamburger();
    initStickyHeader();
    initDropdown();
    initSmoothScroll();
    initCounters();
    initReveal();
    initActiveNav();

    // These depend on cryptoAPI being loaded
    if (window.cryptoAPI) {
      initTicker();
      initMiniWidget();
      initSparklines();
      initCoinCards();
    } else {
      window.addEventListener('load', () => {
        initTicker();
        initMiniWidget();
        initSparklines();
        initCoinCards();
      });
    }
  });

})();
