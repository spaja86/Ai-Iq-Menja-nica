/* =========================================================
   Ai IQ Menjačnica — Trading Page Logic (trading.js)
   ========================================================= */
(function () {
  'use strict';

  /* --- Sanitize --- */
  function sanitize(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }
  function safeNum(val, fallback) {
    const n = parseFloat(val);
    return isFinite(n) && n >= 0 ? n : (fallback || 0);
  }

  const FEE_RATE = 0.001; // 0.1%

  /* -------------------------------------------------------
     State
  ------------------------------------------------------- */
  const state = {
    pair:      'BTC',
    side:      'buy',   // 'buy' | 'sell'
    orderType: 'market',
    amount:    '',
    limitPrice: '',
  };

  /* -------------------------------------------------------
     Order Book Generation
  ------------------------------------------------------- */
  function genOrderBook(midPrice, levels) {
    const asks = [], bids = [];
    let askP = midPrice * 1.0002;
    let bidP = midPrice * 0.9998;
    for (let i = 0; i < levels; i++) {
      const askVol = +(Math.random() * 2 + 0.1).toFixed(4);
      const bidVol = +(Math.random() * 2 + 0.1).toFixed(4);
      asks.push({ price: askP, volume: askVol, total: +(askP * askVol).toFixed(2) });
      bids.push({ price: bidP, volume: bidVol, total: +(bidP * bidVol).toFixed(2) });
      askP *= (1 + Math.random() * 0.0004);
      bidP *= (1 - Math.random() * 0.0004);
    }
    return { asks: asks.sort((a, b) => a.price - b.price), bids: bids.sort((a, b) => b.price - a.price) };
  }

  function renderOrderBook(asks, bids, midPrice) {
    const askContainer = document.getElementById('ob-asks');
    const bidContainer = document.getElementById('ob-bids');
    const spreadEl     = document.getElementById('ob-spread-price');
    if (!askContainer || !bidContainer) return;

    // Find max total for fill bars
    const maxAsk = Math.max(...asks.map(a => a.total));
    const maxBid = Math.max(...bids.map(b => b.total));

    askContainer.innerHTML = '';
    const askSlice = asks.slice(0, 12).reverse(); // show closest first at bottom
    askSlice.forEach(row => {
      const div = document.createElement('div');
      div.className = 'ob-row';

      const fill = document.createElement('div');
      fill.className = 'fill-bar';
      fill.style.width = ((row.total / maxAsk) * 100).toFixed(1) + '%';
      div.appendChild(fill);

      const p = document.createElement('span');
      p.textContent = fmtPrice(row.price);
      const v = document.createElement('span');
      v.textContent = row.volume.toFixed(4);
      const t = document.createElement('span');
      t.textContent = fmtPrice(row.total);
      div.appendChild(p); div.appendChild(v); div.appendChild(t);

      // Click to fill price
      div.addEventListener('click', () => fillOrderPrice(row.price));
      askContainer.appendChild(div);
    });

    bidContainer.innerHTML = '';
    bids.slice(0, 12).forEach(row => {
      const div = document.createElement('div');
      div.className = 'ob-row';

      const fill = document.createElement('div');
      fill.className = 'fill-bar';
      fill.style.width = ((row.total / maxBid) * 100).toFixed(1) + '%';
      div.appendChild(fill);

      const p = document.createElement('span');
      p.textContent = fmtPrice(row.price);
      const v = document.createElement('span');
      v.textContent = row.volume.toFixed(4);
      const t = document.createElement('span');
      t.textContent = fmtPrice(row.total);
      div.appendChild(p); div.appendChild(v); div.appendChild(t);

      div.addEventListener('click', () => fillOrderPrice(row.price));
      bidContainer.appendChild(div);
    });

    if (spreadEl) spreadEl.textContent = fmtPrice(midPrice);
  }

  function fillOrderPrice(price) {
    const limitInput = document.getElementById('limit-price');
    if (limitInput && state.orderType !== 'market') {
      limitInput.value = price.toFixed(2);
    }
  }

  /* -------------------------------------------------------
     Chart
  ------------------------------------------------------- */
  function initChart(sym) {
    const canvas = document.getElementById('price-chart');
    if (!canvas || !window.Charts || !window.cryptoAPI) return;
    const tf   = document.querySelector('.tf-btn.active')?.dataset?.tf || '1D';
    const data = window.cryptoAPI.getHistorical(sym, tf);
    window.Charts.drawPriceChart(canvas, data, {});
  }

  function initTimeframes() {
    document.querySelectorAll('.tf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        initChart(state.pair);
      });
    });
  }

  /* -------------------------------------------------------
     Pair Selector
  ------------------------------------------------------- */
  function initPairSelector() {
    const sel = document.getElementById('pair-select');
    if (!sel) return;
    sel.addEventListener('change', () => {
      state.pair = sel.value;
      updatePairBar();
      initChart(state.pair);
      updateOrderBook();
    });
  }

  function updatePairBar() {
    const coin = window.cryptoAPI ? window.cryptoAPI.get(state.pair) : null;
    if (!coin) return;
    const nameEl   = document.getElementById('pair-name');
    const priceEl  = document.getElementById('pair-price');
    const changeEl = document.getElementById('pair-change');
    if (nameEl)  nameEl.textContent  = state.pair + '/USDT';
    if (priceEl) priceEl.textContent = window.cryptoAPI.formatPrice(coin.price);
    if (changeEl) {
      changeEl.textContent = window.cryptoAPI.formatChange(coin.change24h);
      changeEl.className   = 'pair-change ' + (coin.change24h >= 0 ? 'up' : 'dn');
    }
    const volEl = document.getElementById('pair-vol');
    if (volEl) volEl.textContent = coin.volume;
    const mcEl = document.getElementById('pair-mc');
    if (mcEl) mcEl.textContent = coin.marketCap;
  }

  /* -------------------------------------------------------
     Order Book Loop
  ------------------------------------------------------- */
  function updateOrderBook() {
    const coin = window.cryptoAPI ? window.cryptoAPI.get(state.pair) : null;
    if (!coin) return;
    const { asks, bids } = genOrderBook(coin.price, 20);
    renderOrderBook(asks, bids, coin.price);
  }

  /* -------------------------------------------------------
     Trade Form
  ------------------------------------------------------- */
  function initTradeTabs() {
    const tabs = document.querySelectorAll('.trade-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.side = tab.dataset.side;
        updateSubmitBtn();
        calcPreview();
      });
    });
  }

  function initOrderTypeBtns() {
    const btns = document.querySelectorAll('.order-type-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.orderType = btn.dataset.type;
        const limitRow = document.getElementById('limit-price-row');
        if (limitRow) limitRow.style.display = state.orderType !== 'market' ? 'block' : 'none';
        calcPreview();
      });
    });
  }

  function initPctBtns() {
    document.querySelectorAll('.pct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.pct, 10) / 100;
        const coin = window.cryptoAPI ? window.cryptoAPI.get(state.pair) : null;
        const amtInput = document.getElementById('trade-amount');
        if (!coin || !amtInput) return;
        // For buy: % of 1000 USDT demo balance; sell: % of demo crypto balance
        const demoBalance = state.side === 'buy' ? 1000 : 1.0;
        const val = (demoBalance * pct);
        amtInput.value = val.toFixed(state.side === 'buy' ? 2 : 6);
        calcPreview();
      });
    });
  }

  /* --- Validate & Preview --- */
  function calcPreview() {
    const amtInput  = document.getElementById('trade-amount');
    const amtUSDEl  = document.getElementById('preview-total');
    const feeEl     = document.getElementById('preview-fee');
    const receiveEl = document.getElementById('preview-receive');
    const errEl     = document.getElementById('trade-error');

    if (errEl) errEl.textContent = '';

    const coin = window.cryptoAPI ? window.cryptoAPI.get(state.pair) : null;
    if (!coin || !amtInput) return;

    const rawVal = amtInput.value.trim();
    // Sanitize: only allow numeric input
    if (rawVal && !/^[0-9]*\.?[0-9]*$/.test(rawVal)) {
      if (errEl) errEl.textContent = 'Unesi validan broj.';
      return;
    }

    const amount = safeNum(rawVal, 0);
    const price  = coin.price;

    // Validation
    if (amount < 0) {
      if (errEl) errEl.textContent = 'Iznos mora biti > 0.';
      return;
    }

    let usdValue;
    if (state.side === 'buy') {
      // amount is in USDT
      usdValue = amount;
    } else {
      // amount is in crypto
      usdValue = amount * price;
    }

    // Max order check
    if (usdValue > 1000000) {
      if (errEl) errEl.textContent = 'Maksimalni nalog je $1,000,000.';
      return;
    }

    const fee     = usdValue * FEE_RATE;
    const receive = state.side === 'buy'
      ? ((usdValue - fee) / price)
      : (usdValue - fee);

    if (amtUSDEl)  amtUSDEl.textContent  = '$' + usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (feeEl)     feeEl.textContent     = '$' + fee.toFixed(4) + ' (0.1%)';
    if (receiveEl) {
      if (state.side === 'buy') {
        receiveEl.textContent = receive.toFixed(6) + ' ' + state.pair;
      } else {
        receiveEl.textContent = '$' + receive.toFixed(2);
      }
    }
  }

  function updateSubmitBtn() {
    const btn = document.getElementById('trade-submit');
    if (!btn) return;
    if (state.side === 'buy') {
      btn.textContent  = '🟢 Kupi ' + state.pair;
      btn.className    = 'trade-submit-btn buy-btn';
    } else {
      btn.textContent  = '🔴 Prodaj ' + state.pair;
      btn.className    = 'trade-submit-btn sell-btn';
    }
  }

  function initTradeSubmit() {
    const form = document.getElementById('trade-form');
    const btn  = document.getElementById('trade-submit');
    if (!form || !btn) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      submitOrder();
    });
  }

  function submitOrder() {
    const amtInput = document.getElementById('trade-amount');
    const errEl    = document.getElementById('trade-error');
    if (errEl) errEl.textContent = '';

    const rawVal = amtInput ? amtInput.value.trim() : '';
    if (!rawVal || !/^[0-9]*\.?[0-9]*$/.test(rawVal)) {
      if (errEl) errEl.textContent = 'Unesi validan iznos.';
      return;
    }
    const amount = parseFloat(rawVal);
    if (!amount || amount <= 0) {
      if (errEl) errEl.textContent = 'Iznos mora biti veći od 0.';
      return;
    }

    const coin = window.cryptoAPI ? window.cryptoAPI.get(state.pair) : null;
    if (!coin) return;
    const usdVal = state.side === 'buy' ? amount : amount * coin.price;
    if (usdVal > 1000000) {
      if (errEl) errEl.textContent = 'Maksimalni nalog je $1,000,000.';
      return;
    }

    showToast(`✅ ${state.side === 'buy' ? 'Kupovina' : 'Prodaja'} naloga za ${state.pair} uspešna! (Demo)`);
    if (amtInput) amtInput.value = '';
    calcPreview();
  }

  /* -------------------------------------------------------
     Toast notification
  ------------------------------------------------------- */
  function showToast(msg) {
    const existing = document.querySelector('.trade-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'trade-toast';
    // Use textContent to prevent XSS
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  /* -------------------------------------------------------
     Portfolio (right column)
  ------------------------------------------------------- */
  const mockBalances = [
    { sym: 'BTC',  name: 'Bitcoin',  amount: 0.5   },
    { sym: 'ETH',  name: 'Ethereum', amount: 2.0   },
    { sym: 'USDT', name: 'Tether',   amount: 1000  },
    { sym: 'SOL',  name: 'Solana',   amount: 5.0   },
    { sym: 'ADA',  name: 'Cardano',  amount: 1000  },
  ];

  function renderPortfolio() {
    const el = document.getElementById('portfolio-balances');
    if (!el || !window.cryptoAPI) return;
    el.innerHTML = '';
    mockBalances.forEach(b => {
      const coin = window.cryptoAPI.get(b.sym);
      if (!coin) return;
      const usd = coin.price * b.amount;

      const div = document.createElement('div');
      div.className = 'balance-item';

      const left = document.createElement('div');
      const symEl = document.createElement('div');
      symEl.className = 'bal-coin-sym';
      symEl.textContent = b.sym;
      const nameEl = document.createElement('div');
      nameEl.className = 'bal-coin-name';
      nameEl.textContent = b.name;
      left.appendChild(symEl);
      left.appendChild(nameEl);

      const right = document.createElement('div');
      right.className = 'bal-amount';
      const cryptoEl = document.createElement('div');
      cryptoEl.className = 'bal-crypto';
      cryptoEl.textContent = b.amount + ' ' + b.sym;
      const usdEl = document.createElement('div');
      usdEl.className = 'bal-usd';
      usdEl.textContent = window.cryptoAPI.formatPrice(usd);
      right.appendChild(cryptoEl);
      right.appendChild(usdEl);

      div.appendChild(left);
      div.appendChild(right);
      el.appendChild(div);
    });
  }

  /* -------------------------------------------------------
     Portfolio Tabs
  ------------------------------------------------------- */
  function initPortfolioTabs() {
    const tabs = document.querySelectorAll('.portfolio-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const pane = tab.dataset.pane;
        document.querySelectorAll('.portfolio-pane').forEach(p => {
          p.classList.toggle('active', p.id === 'pane-' + pane);
        });
      });
    });
  }

  /* --- Format helpers --- */
  function fmtPrice(v) {
    if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (v >= 1)    return v.toFixed(2);
    return v.toFixed(6);
  }

  /* -------------------------------------------------------
     Init
  ------------------------------------------------------- */
  function init() {
    initTradeTabs();
    initOrderTypeBtns();
    initPctBtns();
    initPairSelector();
    initTradeSubmit();
    initTimeframes();
    initPortfolioTabs();
    updateSubmitBtn();
    updatePairBar();
    initChart(state.pair);
    updateOrderBook();
    renderPortfolio();

    // Live updates
    window.addEventListener('priceUpdate', () => {
      updatePairBar();
      updateOrderBook();
      renderPortfolio();
    });

    // Amount input handler
    const amtInput = document.getElementById('trade-amount');
    if (amtInput) amtInput.addEventListener('input', calcPreview);
    const limitInput = document.getElementById('limit-price');
    if (limitInput) limitInput.addEventListener('input', calcPreview);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
