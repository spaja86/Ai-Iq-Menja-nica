(function () {
  'use strict';

  var cards = document.querySelectorAll('.price-card');
  cards.forEach(function (c) { c.classList.add('skeleton', 'skeleton-card'); });
  setTimeout(function () {
    cards.forEach(function (c) { c.classList.remove('skeleton', 'skeleton-card'); });
  }, 1000);

  var prices = {
    BTC: { p: 67420, c: 2.3 }, ETH: { p: 3840, c: 1.7 }, SOL: { p: 145.80, c: 3.1 },
    BNB: { p: 420.50, c: -0.8 }, ADA: { p: 0.6420, c: 1.2 }, DOT: { p: 8.34, c: -0.4 }
  };
  var PRICE_VOLATILITY = 0.003;

  function fmt(n) {
    return n >= 1000
      ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : n >= 1 ? '$' + n.toFixed(2) : '$' + n.toFixed(4);
  }

  function update() {
    Object.keys(prices).forEach(function (s) {
      var d = prices[s];
      var prev = d.p;
      d.p *= (1 + (Math.random() - 0.49) * PRICE_VOLATILITY);
      var el = document.getElementById('pc-' + s);
      if (el) {
        el.textContent = fmt(d.p);
        el.classList.remove('price-flash-up', 'price-flash-down');
        void el.offsetWidth;
        el.classList.add(d.p >= prev ? 'price-flash-up' : 'price-flash-down');
      }
      var cel = document.getElementById('pcc-' + s);
      if (cel) {
        var sign = d.c >= 0 ? '▲' : '▼';
        cel.textContent = sign + Math.abs(d.c).toFixed(2) + '%';
        cel.className = 'coin-change ' + (d.c >= 0 ? 'up' : 'down');
      }
    });
  }

  setTimeout(function () { setInterval(update, 3000); }, 1000);
})();
