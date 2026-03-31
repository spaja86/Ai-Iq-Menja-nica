/* ===================================================
   Ai Iq Menjačnica — trading.js
   Simulated trading platform: prices, chart, order book
   =================================================== */

(function () {
  'use strict';

  /* ---------- STATE ---------- */
  var cryptoPrices = {
    BTC: { price: 67420,  change: 2.3,  high: 68100, low: 66500, vol: '24.3B', name: 'Bitcoin' },
    ETH: { price: 3840,   change: 1.7,  high: 3920,  low: 3780,  vol: '12.1B', name: 'Ethereum' },
    SOL: { price: 145.80, change: 3.1,  high: 148.5, low: 142.0, vol: '3.2B',  name: 'Solana' },
    BNB: { price: 420.50, change: -0.8, high: 428.0, low: 415.0, vol: '1.8B',  name: 'BNB' }
  };

  var activeCoin = 'BTC';
  var activeTab  = 'buy';  // 'buy' or 'sell'
  var chartHistory = {};   // price history per coin
  var orderBookData = {};
  var tradeHistoryData = {};
  var MOCK_BALANCE_USD = 10000;
  var MOCK_BALANCE_CRYPTO = { BTC: 0.1234, ETH: 1.0, SOL: 5.0, BNB: 2.0 };

  /* ---------- INIT HISTORY ---------- */
  function initHistory(coin) {
    if (chartHistory[coin]) return;
    var base = cryptoPrices[coin].price;
    var pts = [];
    for (var i = 60; i >= 0; i--) {
      base *= (1 + (Math.random() - 0.49) * 0.008);
      pts.push(base);
    }
    chartHistory[coin] = pts;
  }

  function initOrderBook(coin) {
    if (orderBookData[coin]) return;
    var mid = cryptoPrices[coin].price;
    var asks = [], bids = [];
    for (var i = 0; i < 12; i++) {
      asks.push({ price: mid * (1 + (i + 1) * 0.001), amount: (Math.random() * 2 + 0.01).toFixed(4), total: 0 });
      bids.push({ price: mid * (1 - (i + 1) * 0.001), amount: (Math.random() * 2 + 0.01).toFixed(4), total: 0 });
    }
    asks.forEach(function (a) { a.total = (a.price * parseFloat(a.amount)).toFixed(2); });
    bids.forEach(function (b) { b.total = (b.price * parseFloat(b.amount)).toFixed(2); });
    orderBookData[coin] = { asks: asks, bids: bids };
  }

  function initTradeHistory(coin) {
    if (tradeHistoryData[coin]) return;
    var mid = cryptoPrices[coin].price;
    var rows = [];
    var now = Date.now();
    for (var i = 0; i < 20; i++) {
      var isBuy = Math.random() > 0.5;
      var p = mid * (1 + (Math.random() - 0.5) * 0.006);
      rows.push({
        price: p,
        amount: (Math.random() * 0.5 + 0.001).toFixed(4),
        time: new Date(now - i * 8000).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        side: isBuy ? 'buy' : 'sell'
      });
    }
    tradeHistoryData[coin] = rows;
  }

  Object.keys(cryptoPrices).forEach(function (c) {
    initHistory(c);
    initOrderBook(c);
    initTradeHistory(c);
  });

  /* ---------- PRICE UPDATES ---------- */
  function updatePrices() {
    Object.keys(cryptoPrices).forEach(function (coin) {
      var d = cryptoPrices[coin];
      var pct = (Math.random() - 0.48) * 0.35;
      d.price *= (1 + pct / 100);

      // Update history
      if (chartHistory[coin]) {
        chartHistory[coin].push(d.price);
        if (chartHistory[coin].length > 80) chartHistory[coin].shift();
      }

      // Add trade history entry
      if (tradeHistoryData[coin]) {
        var isBuy = Math.random() > 0.5;
        tradeHistoryData[coin].unshift({
          price: d.price,
          amount: (Math.random() * 0.3 + 0.001).toFixed(4),
          time: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          side: isBuy ? 'buy' : 'sell'
        });
        if (tradeHistoryData[coin].length > 30) tradeHistoryData[coin].pop();
      }

      // Shuffle top order book row
      if (orderBookData[coin]) {
        var ob = orderBookData[coin];
        ob.asks[0].price = d.price * 1.001;
        ob.asks[0].amount = (Math.random() * 1.5 + 0.01).toFixed(4);
        ob.bids[0].price = d.price * 0.999;
        ob.bids[0].amount = (Math.random() * 1.5 + 0.01).toFixed(4);
      }
    });

    renderAll();
  }

  /* ---------- RENDER ---------- */
  function renderAll() {
    renderPriceDisplay();
    drawChart();
    renderOrderBook();
    renderTradeHistory();
    updateFormTotal();
  }

  function renderPriceDisplay() {
    var d = cryptoPrices[activeCoin];
    var el = document.getElementById('currentPrice');
    if (el) el.textContent = '$' + formatNum(d.price);

    var chEl = document.getElementById('priceChange');
    if (chEl) {
      var sign = d.change >= 0 ? '▲ +' : '▼ ';
      chEl.textContent = sign + d.change.toFixed(2) + '% (24h)';
      chEl.className = 'price-change ' + (d.change >= 0 ? 'up' : 'down');
    }

    var highEl = document.getElementById('price24h');
    if (highEl) highEl.textContent = '$' + formatNum(d.high);
    var lowEl  = document.getElementById('price24l');
    if (lowEl) lowEl.textContent = '$' + formatNum(d.low);
    var volEl  = document.getElementById('price24vol');
    if (volEl) volEl.textContent = '$' + d.vol;

    // Coin button
    document.querySelectorAll('.coin-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.coin === activeCoin);
    });

    // Buy/Sell button labels
    var buyBtn  = document.getElementById('btnBuy');
    var sellBtn = document.getElementById('btnSell');
    if (buyBtn)  buyBtn.textContent  = 'Kupi ' + activeCoin;
    if (sellBtn) sellBtn.textContent = 'Prodaj ' + activeCoin;

    // Balance display
    var balUsd  = document.getElementById('balanceUsd');
    var balCoin = document.getElementById('balanceCoin');
    if (balUsd) balUsd.textContent = '$' + MOCK_BALANCE_USD.toFixed(2);
    if (balCoin) {
      var coinBal = MOCK_BALANCE_CRYPTO[activeCoin] || 0;
      balCoin.textContent = coinBal.toFixed(4) + ' ' + activeCoin;
    }
  }

  /* ---------- CANVAS CHART ---------- */
  function drawChart() {
    var canvas = document.getElementById('priceChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    // Resize canvas to fit container
    var container = canvas.parentElement;
    canvas.width  = container.clientWidth  || 600;
    canvas.height = container.clientHeight || 240;

    var W = canvas.width;
    var H = canvas.height;
    var pts = chartHistory[activeCoin] || [];
    if (pts.length < 2) return;

    ctx.clearRect(0, 0, W, H);

    var minP = Math.min.apply(null, pts);
    var maxP = Math.max.apply(null, pts);
    var range = maxP - minP || 1;

    var padX = 10, padY = 20;

    function toX(i)  { return padX + (i / (pts.length - 1)) * (W - padX * 2); }
    function toY(p)  { return padY + (1 - (p - minP) / range) * (H - padY * 2); }

    // Grid lines
    ctx.strokeStyle = 'rgba(42,42,42,0.8)';
    ctx.lineWidth = 1;
    for (var g = 0; g < 5; g++) {
      var yg = padY + (g / 4) * (H - padY * 2);
      ctx.beginPath();
      ctx.moveTo(padX, yg);
      ctx.lineTo(W - padX, yg);
      ctx.stroke();
    }

    // Gradient fill
    var grad = ctx.createLinearGradient(0, padY, 0, H - padY);
    var d = cryptoPrices[activeCoin];
    var isUp = d.change >= 0;
    if (isUp) {
      grad.addColorStop(0, 'rgba(0,212,170,0.25)');
      grad.addColorStop(1, 'rgba(0,212,170,0)');
    } else {
      grad.addColorStop(0, 'rgba(255,77,77,0.25)');
      grad.addColorStop(1, 'rgba(255,77,77,0)');
    }

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0]));
    for (var i = 1; i < pts.length; i++) {
      ctx.lineTo(toX(i), toY(pts[i]));
    }
    ctx.lineTo(toX(pts.length - 1), H - padY);
    ctx.lineTo(toX(0), H - padY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(pts[0]));
    for (var j = 1; j < pts.length; j++) {
      ctx.lineTo(toX(j), toY(pts[j]));
    }
    ctx.strokeStyle = isUp ? '#00d4aa' : '#ff4d4d';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Price labels
    ctx.fillStyle = '#888';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'right';
    var lo = minP, hi = maxP;
    ctx.fillText('$' + formatNum(hi), W - padX + 2, padY + 4);
    ctx.fillText('$' + formatNum(lo), W - padX + 2, H - padY);

    // Last price dot
    var lastX = toX(pts.length - 1);
    var lastY = toY(pts[pts.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? '#00d4aa' : '#ff4d4d';
    ctx.fill();
  }

  /* ---------- ORDER BOOK ---------- */
  function renderOrderBook() {
    var ob = orderBookData[activeCoin];
    if (!ob) return;

    var asksEl = document.getElementById('orderBookAsks');
    var bidsEl = document.getElementById('orderBookBids');
    var spreadEl = document.getElementById('obSpread');
    if (!asksEl || !bidsEl) return;

    function maxTotal(rows) {
      return Math.max.apply(null, rows.map(function (r) { return parseFloat(r.total); }));
    }

    var maxA = maxTotal(ob.asks);
    var maxB = maxTotal(ob.bids);

    function rowHTML(r, side, max) {
      var pct = (parseFloat(r.total) / max * 100).toFixed(1);
      var cls = side === 'ask' ? 'order-row ask' : 'order-row bid';
      return '<div class="' + cls + '">' +
             '<div class="price-col">' + formatNum(parseFloat(r.price)) + '</div>' +
             '<div>' + r.amount + '</div>' +
             '<div>' + Number(r.total).toLocaleString() + '</div>' +
             '<div class="bar" style="width:' + pct + '%"></div>' +
             '</div>';
    }

    var asksHTML = '';
    var asksSlice = ob.asks.slice(0, 8).reverse();
    asksSlice.forEach(function (r) { asksHTML += rowHTML(r, 'ask', maxA); });
    asksEl.innerHTML = asksHTML;

    var bidsHTML = '';
    ob.bids.slice(0, 8).forEach(function (r) { bidsHTML += rowHTML(r, 'bid', maxB); });
    bidsEl.innerHTML = bidsHTML;

    if (spreadEl) {
      var spread = (ob.asks[0].price - ob.bids[0].price).toFixed(2);
      spreadEl.textContent = 'Spread: $' + spread;
    }
  }

  /* ---------- TRADE HISTORY ---------- */
  function renderTradeHistory() {
    var list = document.getElementById('tradeHistoryList');
    if (!list) return;
    var rows = tradeHistoryData[activeCoin] || [];
    var html = '';
    rows.slice(0, 20).forEach(function (r) {
      var cls = r.side === 'buy' ? 'up' : 'down';
      html += '<div class="history-row">' +
              '<span class="' + cls + '">' + formatNum(r.price) + '</span>' +
              '<span>' + r.amount + '</span>' +
              '<span class="muted">' + r.time + '</span>' +
              '</div>';
    });
    list.innerHTML = html;
  }

  /* ---------- TRADE FORM ---------- */
  function updateFormTotal() {
    var priceInput  = document.getElementById('tradePrice');
    var amountInput = document.getElementById('tradeAmount');
    var totalEl     = document.getElementById('tradeTotal');
    var feeEl       = document.getElementById('tradeFee');

    var price  = parseFloat(priceInput  && priceInput.value  || cryptoPrices[activeCoin].price);
    var amount = parseFloat(amountInput && amountInput.value || 0);

    if (isNaN(price))  price  = cryptoPrices[activeCoin].price;
    if (isNaN(amount)) amount = 0;

    var total = price * amount;
    var fee   = total * 0.002; // 0.2% fee

    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    if (feeEl)   feeEl.textContent   = '$' + fee.toFixed(4);

    // Auto-fill price
    if (priceInput && !priceInput.dataset.manual) {
      priceInput.value = cryptoPrices[activeCoin].price.toFixed(2);
    }
  }

  /* ---------- TOAST ---------- */
  function showToast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  /* ---------- EVENTS ---------- */
  function bindEvents() {
    // Coin buttons
    document.querySelectorAll('.coin-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCoin = btn.dataset.coin;
        initHistory(activeCoin);
        initOrderBook(activeCoin);
        initTradeHistory(activeCoin);
        var priceInput = document.getElementById('tradePrice');
        if (priceInput) { priceInput.value = ''; delete priceInput.dataset.manual; }
        renderAll();
      });
    });

    // Buy/Sell tabs
    document.querySelectorAll('.trade-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeTab = tab.dataset.side;
        document.querySelectorAll('.trade-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var buyForm  = document.getElementById('buyForm');
        var sellForm = document.getElementById('sellForm');
        if (buyForm)  buyForm.style.display  = activeTab === 'buy'  ? '' : 'none';
        if (sellForm) sellForm.style.display = activeTab === 'sell' ? '' : 'none';
      });
    });

    // Price / amount input
    ['tradePrice', 'tradeAmount'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          if (id === 'tradePrice') el.dataset.manual = '1';
          updateFormTotal();
        });
      }
    });

    // Percent buttons
    document.querySelectorAll('.pct-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pct    = parseInt(btn.dataset.pct) / 100;
        var amtEl  = document.getElementById('tradeAmount');
        if (!amtEl) return;
        if (activeTab === 'buy') {
          var price  = cryptoPrices[activeCoin].price;
          var budget = MOCK_BALANCE_USD * pct;
          amtEl.value = (budget / price).toFixed(6);
        } else {
          var coinBal = MOCK_BALANCE_CRYPTO[activeCoin] || 0;
          amtEl.value = (coinBal * pct).toFixed(6);
        }
        updateFormTotal();
      });
    });

    // Submit buy
    var buyBtn = document.getElementById('btnBuy');
    if (buyBtn) {
      buyBtn.addEventListener('click', function () {
        var amt = parseFloat(document.getElementById('tradeAmount').value);
        if (!amt || amt <= 0) { showToast('Unesite količinu!', 'error'); return; }
        var cost = amt * cryptoPrices[activeCoin].price;
        if (cost > MOCK_BALANCE_USD) { showToast('Nedovoljno sredstava!', 'error'); return; }
        MOCK_BALANCE_USD -= cost;
        MOCK_BALANCE_CRYPTO[activeCoin] = (MOCK_BALANCE_CRYPTO[activeCoin] || 0) + amt;
        showToast('✅ Kupljeno ' + amt.toFixed(4) + ' ' + activeCoin, 'success');
        document.getElementById('tradeAmount').value = '';
        renderAll();
      });
    }

    // Submit sell
    var sellBtn = document.getElementById('btnSell');
    if (sellBtn) {
      sellBtn.addEventListener('click', function () {
        var amtEl = document.getElementById('tradeAmountSell') || document.getElementById('tradeAmount');
        var amt = parseFloat(amtEl && amtEl.value);
        if (!amt || amt <= 0) { showToast('Unesite količinu!', 'error'); return; }
        var coinBal = MOCK_BALANCE_CRYPTO[activeCoin] || 0;
        if (amt > coinBal) { showToast('Nemate dovoljno ' + activeCoin + '!', 'error'); return; }
        var proceeds = amt * cryptoPrices[activeCoin].price;
        MOCK_BALANCE_USD += proceeds;
        MOCK_BALANCE_CRYPTO[activeCoin] -= amt;
        showToast('✅ Prodato ' + amt.toFixed(4) + ' ' + activeCoin, 'success');
        amtEl.value = '';
        renderAll();
      });
    }

    // Chart timeframe (visual only)
    document.querySelectorAll('.chart-timeframe').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.chart-timeframe').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    // Window resize redraws chart
    window.addEventListener('resize', drawChart);
  }

  /* ---------- HELPERS ---------- */
  function formatNum(n) {
    if (n >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (n >= 100)   return n.toFixed(2);
    if (n >= 1)     return n.toFixed(3);
    return n.toFixed(4);
  }

  /* ---------- BOOT ---------- */
  function init() {
    bindEvents();
    renderAll();
    setInterval(updatePrices, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
