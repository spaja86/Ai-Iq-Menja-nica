/* ===================================================
   Ai Iq Menjačnica — ticker.js
   Simulated crypto price ticker
   =================================================== */

(function () {
  'use strict';

  var prices = {
    BTC:   { price: 67420,   change: 2.3,   label: 'Bitcoin' },
    ETH:   { price: 3840,    change: 1.7,   label: 'Ethereum' },
    SOL:   { price: 145.80,  change: 3.1,   label: 'Solana' },
    BNB:   { price: 420.50,  change: -0.8,  label: 'BNB' },
    ADA:   { price: 0.6420,  change: 1.2,   label: 'Cardano' },
    DOT:   { price: 8.34,    change: -0.4,  label: 'Polkadot' },
    MATIC: { price: 0.89,    change: 2.7,   label: 'Polygon' },
    LINK:  { price: 18.42,   change: 1.5,   label: 'Chainlink' },
    AVAX:  { price: 38.60,   change: -1.2,  label: 'Avalanche' },
    XRP:   { price: 0.5840,  change: 0.9,   label: 'XRP' }
  };

  var fxRates = {
    'USD/RSD': { rate: 109.50, change: 0 },
    'EUR/USD': { rate: 1.0842, change: 0.1 },
    'EUR/RSD': { rate: 118.62, change: 0 }
  };

  function randomWalk(val, maxPctChange) {
    var pct = (Math.random() - 0.48) * maxPctChange;
    return val * (1 + pct / 100);
  }

  function formatPrice(price) {
    if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 100)   return '$' + price.toFixed(2);
    if (price >= 1)     return '$' + price.toFixed(3);
    return '$' + price.toFixed(4);
  }

  function formatChange(change) {
    var sign = change >= 0 ? '▲' : '▼';
    return sign + Math.abs(change).toFixed(2) + '%';
  }

  function buildTickerHTML() {
    var html = '';

    Object.keys(prices).forEach(function (sym) {
      var d = prices[sym];
      var cls = d.change >= 0 ? 'up' : 'down';
      html += '<span class="ticker-item"><strong>' + sym + '</strong> ' +
              formatPrice(d.price) +
              ' <span class="' + cls + '">' + formatChange(d.change) + '</span></span>';
    });

    Object.keys(fxRates).forEach(function (pair) {
      var d = fxRates[pair];
      var arrow = d.change >= 0 ? '▲' : (d.change < 0 ? '▼' : '→');
      var cls = d.change > 0 ? 'up' : (d.change < 0 ? 'down' : 'muted');
      html += '<span class="ticker-item"><strong>' + pair + '</strong> ' +
              d.rate.toFixed(4) +
              ' <span class="' + cls + '">' + arrow + '</span></span>';
    });

    return html;
  }

  function updateTicker() {
    // Update prices with small random walk
    Object.keys(prices).forEach(function (sym) {
      prices[sym].price = randomWalk(prices[sym].price, 0.4);
      // Slowly drift change % toward new direction
      var newChange = (Math.random() - 0.45) * 5;
      prices[sym].change = prices[sym].change * 0.85 + newChange * 0.15;
    });

    var newHTML = buildTickerHTML();
    // Duplicate for seamless loop
    var doubled = newHTML + newHTML;

    document.querySelectorAll('.ticker-track').forEach(function (track) {
      track.innerHTML = doubled;
    });
  }

  function init() {
    var tracks = document.querySelectorAll('.ticker-track');
    if (!tracks.length) return;

    // Initial build
    var initial = buildTickerHTML();
    tracks.forEach(function (track) {
      track.innerHTML = initial + initial;
    });

    // Update every 3 seconds
    setInterval(updateTicker, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose prices for other scripts
  window.TickerPrices = prices;

})();
