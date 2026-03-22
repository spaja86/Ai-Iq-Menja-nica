/* =========================================================
   Ai IQ Menjačnica — Wallet (wallet.js)
   ========================================================= */
(function () {
  'use strict';

  const mockBalances = [
    { sym: 'BTC',  name: 'Bitcoin',  amount: 0.5,  icon: '₿' },
    { sym: 'ETH',  name: 'Ethereum', amount: 2.0,  icon: 'Ξ' },
    { sym: 'USDT', name: 'Tether',   amount: 1000, icon: '₮' },
    { sym: 'SOL',  name: 'Solana',   amount: 5.0,  icon: '◎' },
    { sym: 'ADA',  name: 'Cardano',  amount: 1000, icon: '₳' },
  ];

  const mockTxHistory = [
    { date: '2025-06-10', type: 'buy',      sym: 'BTC',  amount:  0.05,  price: 94000,  status: 'completed' },
    { date: '2025-06-09', type: 'sell',     sym: 'ETH',  amount:  0.5,   price: 3380,   status: 'completed' },
    { date: '2025-06-08', type: 'deposit',  sym: 'USDT', amount:  500,   price: 1,      status: 'completed' },
    { date: '2025-06-07', type: 'buy',      sym: 'SOL',  amount:  2,     price: 175,    status: 'completed' },
    { date: '2025-06-06', type: 'withdraw', sym: 'USDT', amount:  200,   price: 1,      status: 'completed' },
    { date: '2025-06-05', type: 'buy',      sym: 'ADA',  amount:  500,   price: 0.63,   status: 'completed' },
    { date: '2025-06-04', type: 'sell',     sym: 'BTC',  amount:  0.02,  price: 92000,  status: 'completed' },
    { date: '2025-06-03', type: 'deposit',  sym: 'ETH',  amount:  1.0,   price: 3300,   status: 'completed' },
    { date: '2025-06-02', type: 'buy',      sym: 'SOL',  amount:  3,     price: 170,    status: 'completed' },
    { date: '2025-06-01', type: 'sell',     sym: 'ADA',  amount:  200,   price: 0.64,   status: 'completed' },
  ];

  function fmtUSD(v) {
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getTotalUSD() {
    let total = 0;
    if (!window.cryptoAPI) return 0;
    mockBalances.forEach(b => {
      const coin = window.cryptoAPI.get(b.sym);
      if (coin) total += coin.price * b.amount;
    });
    return total;
  }

  /* -------------------------------------------------------
     Render Total
  ------------------------------------------------------- */
  function renderTotal() {
    const el = document.getElementById('wallet-total');
    if (!el) return;
    el.textContent = fmtUSD(getTotalUSD());
  }

  /* -------------------------------------------------------
     Render Balances Table
  ------------------------------------------------------- */
  function renderBalances() {
    const tbody = document.getElementById('wallet-balances');
    if (!tbody || !window.cryptoAPI) return;
    tbody.innerHTML = '';

    mockBalances.forEach(b => {
      const coin = window.cryptoAPI.get(b.sym);
      if (!coin) return;
      const usd = coin.price * b.amount;
      const pct = (usd / getTotalUSD() * 100).toFixed(1);

      const tr = document.createElement('tr');

      const tdCoin = document.createElement('td');
      tdCoin.innerHTML = `<div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.3rem">${b.icon}</span>
        <div><div style="font-weight:700;color:#fff">${b.sym}</div><div style="font-size:0.78rem;color:var(--color-muted)">${b.name}</div></div>
      </div>`;

      const tdAmt = document.createElement('td');
      tdAmt.style.fontWeight = '600';
      tdAmt.textContent = b.amount + ' ' + b.sym;

      const tdPrice = document.createElement('td');
      tdPrice.textContent = window.cryptoAPI.formatPrice(coin.price);

      const tdVal = document.createElement('td');
      tdVal.style.color = 'var(--color-gold)';
      tdVal.style.fontWeight = '700';
      tdVal.textContent = fmtUSD(usd);

      const tdPct = document.createElement('td');
      tdPct.innerHTML = `<div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:4px;background:var(--border);border-radius:2px">
          <div style="width:${pct}%;height:100%;background:var(--color-green);border-radius:2px"></div>
        </div>
        <span style="font-size:0.78rem;color:var(--color-muted)">${pct}%</span>
      </div>`;

      const tdAction = document.createElement('td');
      const dBtn = document.createElement('button');
      dBtn.className = 'btn btn-secondary btn-sm';
      dBtn.textContent = 'Depozit';
      dBtn.addEventListener('click', () => showModal('deposit', b.sym));
      const wBtn = document.createElement('button');
      wBtn.className = 'btn btn-sm';
      wBtn.style.cssText = 'background:transparent;border:1px solid var(--border);color:var(--color-muted);margin-left:8px;padding:4px 10px;font-size:0.78rem;border-radius:6px;cursor:pointer';
      wBtn.textContent = 'Povuci';
      wBtn.addEventListener('click', () => showModal('withdraw', b.sym));
      tdAction.appendChild(dBtn);
      tdAction.appendChild(wBtn);

      tr.appendChild(tdCoin);
      tr.appendChild(tdAmt);
      tr.appendChild(tdPrice);
      tr.appendChild(tdVal);
      tr.appendChild(tdPct);
      tr.appendChild(tdAction);
      tbody.appendChild(tr);
    });
  }

  /* -------------------------------------------------------
     Render Transaction History
  ------------------------------------------------------- */
  function renderTransactions() {
    const tbody = document.getElementById('tx-history');
    if (!tbody) return;
    tbody.innerHTML = '';

    const typeLabels = { buy: 'Kupovina', sell: 'Prodaja', deposit: 'Depozit', withdraw: 'Povlačenje' };
    const typeColors = { buy: 'var(--color-green)', sell: 'var(--color-red)', deposit: 'var(--color-blue)', withdraw: 'var(--color-gold)' };

    mockTxHistory.forEach(tx => {
      const tr = document.createElement('tr');
      const total = tx.amount * tx.price;

      const tdDate = document.createElement('td');
      tdDate.style.color = 'var(--color-muted)';
      tdDate.textContent = tx.date;

      const tdType = document.createElement('td');
      const badge = document.createElement('span');
      badge.style.cssText = `color:${typeColors[tx.type]};background:${typeColors[tx.type]}18;padding:3px 10px;border-radius:4px;font-size:0.78rem;font-weight:700`;
      badge.textContent = typeLabels[tx.type] || tx.type;
      tdType.appendChild(badge);

      const tdSym = document.createElement('td');
      tdSym.style.fontWeight = '700';
      tdSym.textContent = tx.sym;

      const tdAmt = document.createElement('td');
      tdAmt.textContent = tx.amount + ' ' + tx.sym;

      const tdPrice = document.createElement('td');
      tdPrice.textContent = fmtUSD(tx.price);

      const tdTotal = document.createElement('td');
      tdTotal.style.fontWeight = '700';
      tdTotal.textContent = fmtUSD(total);

      const tdStatus = document.createElement('td');
      const st = document.createElement('span');
      st.style.cssText = 'color:var(--color-green);font-size:0.78rem;font-weight:700';
      st.textContent = '✓ Završeno';
      tdStatus.appendChild(st);

      tr.appendChild(tdDate); tr.appendChild(tdType); tr.appendChild(tdSym);
      tr.appendChild(tdAmt);  tr.appendChild(tdPrice); tr.appendChild(tdTotal);
      tr.appendChild(tdStatus);
      tbody.appendChild(tr);
    });
  }

  /* -------------------------------------------------------
     Portfolio Pie
  ------------------------------------------------------- */
  function renderPieChart() {
    const canvas = document.getElementById('portfolio-pie');
    if (!canvas || !window.Charts || !window.cryptoAPI) return;
    const holdings = mockBalances.map(b => {
      const coin = window.cryptoAPI.get(b.sym);
      return { sym: b.sym, usdValue: coin ? coin.price * b.amount : 0 };
    });
    window.Charts.drawPortfolioPieChart(canvas, holdings);
  }

  /* -------------------------------------------------------
     Pie Legend
  ------------------------------------------------------- */
  function renderPieLegend() {
    const el = document.getElementById('pie-legend');
    if (!el || !window.cryptoAPI) return;
    const COLORS = ['#00ff88','#f7b731','#00b4ff','#a78bfa','#ff4757'];
    const total = getTotalUSD();
    el.innerHTML = '';
    mockBalances.forEach((b, i) => {
      const coin = window.cryptoAPI.get(b.sym);
      const usd  = coin ? coin.price * b.amount : 0;
      const pct  = total > 0 ? (usd / total * 100).toFixed(1) : '0.0';

      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '8px';

      const dot = document.createElement('span');
      dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${COLORS[i]};display:inline-block`;

      const symEl = document.createElement('span');
      symEl.style.fontWeight = '700';
      symEl.textContent = b.sym;

      left.appendChild(dot);
      left.appendChild(symEl);

      const right = document.createElement('div');
      right.style.textAlign = 'right';
      const usdEl = document.createElement('div');
      usdEl.style.cssText = 'font-weight:700;color:#fff;font-size:0.88rem';
      usdEl.textContent = fmtUSD(usd);
      const pctEl = document.createElement('div');
      pctEl.style.cssText = 'font-size:0.72rem;color:var(--color-muted)';
      pctEl.textContent = pct + '%';
      right.appendChild(usdEl);
      right.appendChild(pctEl);

      item.appendChild(left);
      item.appendChild(right);
      el.appendChild(item);
    });
  }

  /* -------------------------------------------------------
     Deposit/Withdraw Modal
  ------------------------------------------------------- */
  function showModal(type, sym) {
    const modal = document.getElementById('dw-modal');
    const title = document.getElementById('modal-title');
    const body  = document.getElementById('modal-body');
    if (!modal) return;
    if (title) title.textContent = (type === 'deposit' ? 'Depozit' : 'Povlačenje') + ' ' + sym;
    if (body) {
      body.innerHTML = '';
      const msg = document.createElement('div');
      msg.style.cssText = 'text-align:center;padding:30px 0';
      const icon = document.createElement('div');
      icon.style.cssText = 'font-size:3rem;margin-bottom:16px';
      icon.textContent = type === 'deposit' ? '⬇️' : '⬆️';
      const txt = document.createElement('p');
      txt.style.color = 'var(--color-muted)';
      txt.textContent = (type === 'deposit' ? 'Depozit' : 'Povlačenje') + ' za ' + sym + ' — Uskoro dostupno! Ova funkcija će biti aktivirana u produkcijskoj verziji.';
      const closBtn = document.createElement('button');
      closBtn.className = 'btn btn-primary';
      closBtn.style.marginTop = '20px';
      closBtn.textContent = 'Razumem';
      closBtn.addEventListener('click', closeModal);
      msg.appendChild(icon);
      msg.appendChild(txt);
      msg.appendChild(closBtn);
      body.appendChild(msg);
    }
    modal.style.display = 'flex';
  }

  function closeModal() {
    const modal = document.getElementById('dw-modal');
    if (modal) modal.style.display = 'none';
  }

  /* -------------------------------------------------------
     Init
  ------------------------------------------------------- */
  function init() {
    renderTotal();
    renderBalances();
    renderTransactions();

    // Wait for Charts to init
    setTimeout(() => {
      renderPieChart();
      renderPieLegend();
    }, 100);

    // Modal close button
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modal = document.getElementById('dw-modal');
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // Live price updates
    window.addEventListener('priceUpdate', () => {
      renderTotal();
      renderBalances();
      renderPieChart();
      renderPieLegend();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
