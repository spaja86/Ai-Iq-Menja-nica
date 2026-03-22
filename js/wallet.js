/* ===================================================
   Ai Iq Menjačnica — wallet.js
   Portfolio calculations & pie chart
   =================================================== */

(function () {
  'use strict';

  var portfolio = [
    { symbol: 'BTC', name: 'Bitcoin',  icon: '₿',  amount: 0.1234, price: 67420,  color: '#f0b90b' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ',  amount: 1.0000, price: 3840,   color: '#3498db' },
    { symbol: 'SOL', name: 'Solana',   icon: '◎',  amount: 5.0000, price: 145.80, color: '#9945ff' },
    { symbol: 'BNB', name: 'BNB',      icon: '⬡',  amount: 2.0000, price: 420.50, color: '#f0b90b' },
    { symbol: 'ADA', name: 'Cardano',  icon: '₳',  amount: 500,    price: 0.6420, color: '#0033ad' }
  ];

  var transactions = [
    { type: 'buy',  coin: 'BTC', amount: 0.05,   value: 3371.00,  date: '22.03.2026', status: 'completed' },
    { type: 'sell', coin: 'ETH', amount: 0.5,    value: 1920.00,  date: '21.03.2026', status: 'completed' },
    { type: 'buy',  coin: 'SOL', amount: 5.0,    value: 729.00,   date: '20.03.2026', status: 'completed' },
    { type: 'buy',  coin: 'BNB', amount: 2.0,    value: 841.00,   date: '19.03.2026', status: 'completed' },
    { type: 'sell', coin: 'BTC', amount: 0.01,   value: 674.20,   date: '18.03.2026', status: 'completed' },
    { type: 'buy',  coin: 'ADA', amount: 500,    value: 321.00,   date: '17.03.2026', status: 'completed' }
  ];

  function calcTotals() {
    var total = 0;
    portfolio.forEach(function (a) {
      a.value = a.amount * a.price;
      total += a.value;
    });
    portfolio.forEach(function (a) { a.pct = (a.value / total * 100); });
    return total;
  }

  function renderSummary(total) {
    var totalEl = document.getElementById('portfolioTotal');
    var changeEl = document.getElementById('portfolioChange');
    if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    if (changeEl) {
      var mockChange = total * 0.0192;
      changeEl.textContent = '+$' + mockChange.toFixed(2) + ' (▲1.92%)';
      changeEl.className = 'portfolio-change up';
    }
  }

  function renderAssets() {
    var list = document.getElementById('assetList');
    if (!list) return;
    var html = '';
    portfolio.forEach(function (a) {
      var chg = (Math.random() * 6 - 1).toFixed(2);
      var cls = parseFloat(chg) >= 0 ? 'up' : 'down';
      html += '<div class="asset-row">' +
              '<div style="display:flex;align-items:center;gap:8px">' +
              '<span class="asset-icon" style="color:' + a.color + '">' + a.icon + '</span>' +
              '<div><div class="asset-name">' + a.symbol + '</div><div class="asset-symbol">' + a.name + '</div></div>' +
              '</div>' +
              '<div class="asset-amount">' + a.amount.toLocaleString() + ' ' + a.symbol + '</div>' +
              '<div class="asset-value">$' + a.value.toFixed(2) + '</div>' +
              '<div class="asset-pct"><span class="' + cls + '">' + (parseFloat(chg) >= 0 ? '▲' : '▼') + Math.abs(chg) + '%</span></div>' +
              '</div>';
    });
    list.innerHTML = html;
  }

  function renderTransactions() {
    var table = document.getElementById('txTableBody');
    if (!table) return;
    var html = '';
    transactions.forEach(function (tx) {
      html += '<tr>' +
              '<td><span class="tx-type ' + tx.type + '">' + (tx.type === 'buy' ? 'Kupovina' : 'Prodaja') + '</span></td>' +
              '<td>' + tx.coin + '</td>' +
              '<td style="font-family:var(--font-mono)">' + tx.amount + ' ' + tx.coin + '</td>' +
              '<td style="font-family:var(--font-mono)">$' + tx.value.toFixed(2) + '</td>' +
              '<td class="muted">' + tx.date + '</td>' +
              '<td><span class="badge badge-green">✓</span></td>' +
              '</tr>';
    });
    table.innerHTML = html;
  }

  /* ---------- PIE CHART ---------- */
  function drawPieChartOn(canvas, total) {
    if (!canvas) return;
    var size = Math.min(canvas.parentElement ? canvas.parentElement.clientWidth : 200, 200);
    if (size < 50) size = 200;
    canvas.width  = size;
    canvas.height = size;

    var ctx = canvas.getContext('2d');
    var cx = size / 2, cy = size / 2;
    var r  = size / 2 - 10;
    var ri = r * 0.55;

    ctx.clearRect(0, 0, size, size);

    var startAngle = -Math.PI / 2;
    portfolio.forEach(function (a) {
      var slice = (a.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = a.color;
      ctx.fill();
      startAngle += slice;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, ri, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
  }

  function drawPieChart(total) {
    drawPieChartOn(document.getElementById('portfolioChart'), total);
    drawPieChartOn(document.getElementById('portfolioChartSidebar'), total);
  }

  /* ---------- PRICE SIMULATION ---------- */
  function updatePrices() {
    portfolio.forEach(function (a) {
      a.price *= (1 + (Math.random() - 0.49) * 0.004);
    });
    var total = calcTotals();
    renderSummary(total);
    renderAssets();
    drawPieChart(total);
  }

  /* ---------- BOOT ---------- */
  function init() {
    var total = calcTotals();
    renderSummary(total);
    renderAssets();
    renderTransactions();
    drawPieChart(total);
    window.addEventListener('resize', function () { drawPieChart(calcTotals()); });
    setInterval(updatePrices, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
