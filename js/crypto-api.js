/* ===================================================
   Ai Iq Menjačnica — crypto-api.js
   Fear & Greed Index, Trending Coins, Market Data
   =================================================== */

(function () {
  'use strict';

  /* ---- MOCK FEAR & GREED ---- */
  window.FearGreed = {
    value: Math.floor(40 + Math.random() * 40),  // 40-80
    label: function (v) {
      if (v <= 20)  return { text: 'Ekstremni Strah',  color: '#ff1744' };
      if (v <= 40)  return { text: 'Strah',             color: '#ff5722' };
      if (v <= 60)  return { text: 'Neutralno',         color: '#ffd600' };
      if (v <= 80)  return { text: 'Pohlepa',           color: '#69f0ae' };
      return              { text: 'Ekstremna Pohlepa',  color: '#00e676' };
    },
    render: function (canvasId) {
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width  = 220;
      var H = canvas.height = 130;
      var cx = W / 2, cy = H - 10;
      var r = 88;
      var val = this.value;
      var info = this.label(val);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, 0, false);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Value arc
      var angle = Math.PI * (val / 100);
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI, Math.PI + angle, false);
      ctx.strokeStyle = info.color;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Value text
      ctx.fillStyle = info.color;
      ctx.font = 'bold 32px Segoe UI, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, cx, cy - 24);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '13px Segoe UI, system-ui, sans-serif';
      ctx.fillText(info.text, cx, cy - 4);

      // Needle
      var needleAngle = Math.PI + Math.PI * (val / 100);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(needleAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-r + 26, 0);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    },
    animate: function (canvasId) {
      var self = this;
      var current = 0;
      var target = self.value;
      var step = function () {
        self.value = current;
        self.render(canvasId);
        if (current < target) {
          current = Math.min(current + 2, target);
          requestAnimationFrame(step);
        }
      };
      step();
    }
  };

  /* ---- MOCK TRENDING COINS ---- */
  var trendingData = [
    { sym: 'BTC',  name: 'Bitcoin',  price: 67420, ch: +2.3,  vol: '24.3B' },
    { sym: 'ETH',  name: 'Ethereum', price: 3840,  ch: +1.7,  vol: '12.1B' },
    { sym: 'SOL',  name: 'Solana',   price: 145.8, ch: +5.4,  vol: '3.2B'  },
    { sym: 'BNB',  name: 'BNB',      price: 420.5, ch: -0.8,  vol: '1.9B'  },
    { sym: 'ADA',  name: 'Cardano',  price: 0.642, ch: +3.1,  vol: '800M'  },
    { sym: 'DOGE', name: 'Dogecoin', price: 0.128, ch: +8.2,  vol: '2.1B'  },
    { sym: 'XRP',  name: 'XRP',      price: 0.59,  ch: -1.2,  vol: '1.5B'  },
    { sym: 'AVAX', name: 'Avalanche',price: 32.4,  ch: +6.7,  vol: '700M'  },
    { sym: 'DOT',  name: 'Polkadot', price: 8.34,  ch: -2.1,  vol: '420M'  },
    { sym: 'MATIC',name: 'Polygon',  price: 0.71,  ch: +4.4,  vol: '650M'  }
  ];

  function fluctuate(data) {
    return data.map(function (c) {
      return Object.assign({}, c, {
        price: c.price * (1 + (Math.random() - 0.49) * 0.004),
        ch: c.ch + (Math.random() - 0.5) * 0.3
      });
    });
  }

  function renderTrending(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var data = fluctuate(trendingData);
    var gainers = data.slice().sort(function (a, b) { return b.ch - a.ch; }).slice(0, 5);
    var losers  = data.slice().sort(function (a, b) { return a.ch - b.ch; }).slice(0, 5);

    function fmt(p) {
      return p >= 1000 ? '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 })
           : p >= 1    ? '$' + p.toFixed(2)
                       : '$' + p.toFixed(4);
    }

    function rows(list) {
      return list.map(function (c) {
        var up = c.ch >= 0;
        return '<tr>' +
          '<td style="font-weight:700">' + c.sym + '<span style="font-size:0.72rem;color:#888;margin-left:6px">' + c.name + '</span></td>' +
          '<td style="font-family:monospace">' + fmt(c.price) + '</td>' +
          '<td class="' + (up ? 'up' : 'down') + '" style="font-weight:600">' + (up ? '▲' : '▼') + Math.abs(c.ch).toFixed(2) + '%</td>' +
          '<td style="color:#888;font-size:0.78rem">$' + c.vol + '</td>' +
        '</tr>';
      }).join('');
    }

    el.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
        '<div>' +
          '<div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--crypto-green);margin-bottom:10px">🚀 Top Gainers</div>' +
          '<table style="width:100%;border-collapse:collapse;font-size:0.82rem">' +
            '<thead><tr style="color:#888;font-size:0.72rem"><th style="text-align:left;padding:4px 0">Coin</th><th>Cena</th><th>24h</th><th>Vol</th></tr></thead>' +
            '<tbody>' + rows(gainers) + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--crypto-red);margin-bottom:10px">📉 Top Losers</div>' +
          '<table style="width:100%;border-collapse:collapse;font-size:0.82rem">' +
            '<thead><tr style="color:#888;font-size:0.72rem"><th style="text-align:left;padding:4px 0">Coin</th><th>Cena</th><th>24h</th><th>Vol</th></tr></thead>' +
            '<tbody>' + rows(losers) + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  window.CryptoAPI = {
    renderTrending: renderTrending,
    trendingData: trendingData
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Render trending on index page
    renderTrending('trendingCoins');
    // Fear & Greed gauge
    if (document.getElementById('fearGreedCanvas')) {
      window.FearGreed.animate('fearGreedCanvas');
    }
    // Update every 10s
    setInterval(function () {
      renderTrending('trendingCoins');
    }, 10000);
  });
})();
