(function () {
  'use strict';

  function refreshPredictions() {
    var tfs = [
      { pId: 'pred1h', cId: 'pred1hConf', base: 0.8 },
      { pId: 'pred4h', cId: 'pred4hConf', base: 2.1 },
      { pId: 'pred24h', cId: 'pred24hConf', base: 4.5 }
    ];

    tfs.forEach(function (tf) {
      var up = Math.random() > 0.35;
      var pct = (tf.base * (0.6 + Math.random() * 0.8)).toFixed(1);
      var conf = Math.floor(55 + Math.random() * 30);
      var el = document.getElementById(tf.pId);
      var ce = document.getElementById(tf.cId);

      if (el) {
        el.textContent = (up ? '▲' : '▼') + ' ' + (up ? '+' : '-') + pct + '%';
        el.className = 'pred-direction ' + (up ? 'up' : 'down');
      }
      if (ce) ce.textContent = conf + '% sigurno';
    });
  }

  window.calcPL = function () {
    var buy = parseFloat(document.getElementById('plBuyPrice').value);
    var sell = parseFloat(document.getElementById('plSellPrice').value);
    var amt = parseFloat(document.getElementById('plAmount').value);

    if (isNaN(buy) || isNaN(sell) || isNaN(amt) || buy <= 0 || amt <= 0) {
      if (window.toastError) window.toastError('❌ Greška', 'Unesite ispravne vrednosti!');
      return;
    }

    var invest = buy * amt;
    var proceeds = sell * amt;
    var pl = proceeds - invest;
    var pct = ((pl / invest) * 100).toFixed(2);
    var res = document.getElementById('plResult');
    var valEl = document.getElementById('plValue');
    var pctEl = document.getElementById('plPct');
    var invEl = document.getElementById('plInvest');

    res.style.display = 'block';
    res.style.borderColor = pl >= 0 ? 'var(--crypto-green)' : 'var(--crypto-red)';
    valEl.style.color = pl >= 0 ? 'var(--crypto-green)' : 'var(--crypto-red)';
    valEl.textContent = (pl >= 0 ? '+' : '') + '$' + pl.toFixed(2);
    pctEl.textContent = (pl >= 0 ? '▲' : '▼') + ' ' + Math.abs(pct) + '%';
    pctEl.style.color = pl >= 0 ? 'var(--crypto-green)' : 'var(--crypto-red)';
    invEl.textContent = 'Investicija: $' + invest.toFixed(2) + ' → Prihod: $' + proceeds.toFixed(2);

    if (window.toastSuccess && pl >= 0) window.toastSuccess('💰 Profit!', '+$' + pl.toFixed(2) + ' (' + pct + '%)');
    if (window.toastError && pl < 0) window.toastError('📉 Gubitak', '$' + pl.toFixed(2) + ' (' + pct + '%)');
  };

  ['btnBuy', 'btnSell'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('click', function () {
      var orig = btn.textContent;
      btn.classList.add('btn-loading');
      btn.disabled = true;
      setTimeout(function () {
        btn.classList.remove('btn-loading');
        btn.disabled = false;
        btn.textContent = orig;
        if (window.toastSuccess) {
          window.toastSuccess('✅ Nalog izvršen', 'Vaš ' + (id === 'btnBuy' ? 'nalog za kupovinu' : 'nalog za prodaju') + ' je uspešno obrađen!');
        }
      }, 2000);
    });
  });

  setInterval(refreshPredictions, 8000);
})();
