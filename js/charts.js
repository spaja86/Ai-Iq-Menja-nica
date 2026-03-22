/* =========================================================
   Ai IQ Menjačnica — Charts (charts.js)
   ========================================================= */
(function () {
  'use strict';

  const GRID_COLOR   = 'rgba(26,48,80,0.8)';
  const TEXT_COLOR   = '#6b7fa8';
  const GREEN        = '#00ff88';
  const RED          = '#ff4757';
  const GOLD         = '#f7b731';

  /* -------------------------------------------------------
     drawSparkline — small 50px tall inline chart
  ------------------------------------------------------- */
  function drawSparkline(canvas, data, color) {
    if (!canvas || !data || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 120;
    const H = canvas.offsetHeight || 50;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const prices = data.map(d => typeof d === 'object' ? d.c : d);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const xStep = W / (prices.length - 1);
    const yFor  = v => H - ((v - min) / range) * H * 0.85 - H * 0.075;

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color.replace(')', ', 0.25)').replace('rgb', 'rgba').replace('#', 'rgba(').replace(/[^rgba(0-9,. )]/g,''));
    // Simple approach:
    const gc = hexToRgb(color);
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    fillGrad.addColorStop(0, `rgba(${gc},0.22)`);
    fillGrad.addColorStop(1, `rgba(${gc},0)`);

    ctx.clearRect(0, 0, W, H);

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, yFor(prices[0]));
    for (let i = 1; i < prices.length; i++) {
      ctx.lineTo(i * xStep, yFor(prices[i]));
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(0, yFor(prices[0]));
    for (let i = 1; i < prices.length; i++) {
      ctx.lineTo(i * xStep, yFor(prices[i]));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.8;
    ctx.lineJoin    = 'round';
    ctx.stroke();
  }

  /* -------------------------------------------------------
     drawPriceChart — full chart with grid, labels, volume
  ------------------------------------------------------- */
  function drawPriceChart(canvas, data, options) {
    if (!canvas || !data || data.length < 2) return;
    const opts = options || {};
    const ctx  = canvas.getContext('2d');
    const W = canvas.offsetWidth  || 600;
    const H = canvas.offsetHeight || 320;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const PAD_L = 70, PAD_R = 20, PAD_T = 20, PAD_B = 50;
    const CHART_H = H - PAD_T - PAD_B;
    const VOL_H   = CHART_H * 0.18;
    const PRICE_H = CHART_H - VOL_H - 8;
    const CHART_W = W - PAD_L - PAD_R;

    const closes  = data.map(d => d.c);
    const volumes = data.map(d => d.v || 0);
    const highs   = data.map(d => d.h);
    const lows    = data.map(d => d.l);
    const priceMin = Math.min(...lows);
    const priceMax = Math.max(...highs);
    const priceRange = priceMax - priceMin || 1;
    const volMax  = Math.max(...volumes) || 1;

    const xFor = i => PAD_L + (i / (data.length - 1)) * CHART_W;
    const yFor = v => PAD_T + PRICE_H - ((v - priceMin) / priceRange) * PRICE_H;

    ctx.clearRect(0, 0, W, H);

    // Grid
    const gridLines = 5;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= gridLines; i++) {
      const y = PAD_T + (i / gridLines) * PRICE_H;
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
      const val = priceMax - (i / gridLines) * priceRange;
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(fmtAxisPrice(val), PAD_L - 6, y + 4);
    }

    // Vertical grid
    const vGridCount = Math.min(6, data.length - 1);
    for (let i = 0; i <= vGridCount; i++) {
      const x = PAD_L + (i / vGridCount) * CHART_W;
      ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, PAD_T + PRICE_H); ctx.stroke();
      const idx = Math.floor((i / vGridCount) * (data.length - 1));
      if (data[idx]) {
        const d = new Date(data[idx].t);
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(d.toLocaleDateString('sr-RS', { month:'2-digit', day:'2-digit' }), x, PAD_T + PRICE_H + 16);
      }
    }

    // Gradient fill under price line
    const isUp = closes[closes.length - 1] >= closes[0];
    const lineColor = isUp ? GREEN : RED;
    const gc = hexToRgb(lineColor);
    const fillGrad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + PRICE_H);
    fillGrad.addColorStop(0, `rgba(${gc},0.18)`);
    fillGrad.addColorStop(1, `rgba(${gc},0)`);

    ctx.beginPath();
    ctx.moveTo(xFor(0), yFor(closes[0]));
    for (let i = 1; i < closes.length; i++) ctx.lineTo(xFor(i), yFor(closes[i]));
    ctx.lineTo(xFor(data.length - 1), PAD_T + PRICE_H);
    ctx.lineTo(xFor(0), PAD_T + PRICE_H);
    ctx.closePath();
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Price line
    ctx.beginPath();
    ctx.moveTo(xFor(0), yFor(closes[0]));
    for (let i = 1; i < closes.length; i++) ctx.lineTo(xFor(i), yFor(closes[i]));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth   = 1.8;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Volume bars
    const volBaseY = PAD_T + PRICE_H + 8;
    const barW     = Math.max(1, CHART_W / data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const bh = (volumes[i] / volMax) * VOL_H;
      const bx = xFor(i) - barW / 2;
      const by = volBaseY + VOL_H - bh;
      const up = i === 0 || closes[i] >= closes[i - 1];
      ctx.fillStyle = up ? `rgba(0,255,136,0.35)` : `rgba(255,71,87,0.35)`;
      ctx.fillRect(bx, by, barW, bh);
    }

    // Hover handler (stored on canvas element)
    canvas._chartData = { data, PAD_L, PAD_R, PAD_T, CHART_W, CHART_H, PRICE_H, xFor, yFor, closes, priceMin, priceRange, W, H };
    if (!canvas._hoverBound) {
      canvas.addEventListener('mousemove', handleChartHover);
      canvas.addEventListener('mouseleave', () => {
        const c = canvas._chartData;
        if (!c) return;
        drawPriceChart(canvas, c.data, options); // redraw clean
      });
      canvas._hoverBound = true;
    }
  }

  function handleChartHover(e) {
    const canvas = e.target;
    const c = canvas._chartData;
    if (!c) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left);
    const idx = Math.round(((mx - c.PAD_L) / c.CHART_W) * (c.data.length - 1));
    if (idx < 0 || idx >= c.data.length) return;
    const d = c.data[idx];

    // redraw then draw tooltip
    const ctx = canvas.getContext('2d');
    drawPriceChart(canvas, c.data, {}); // clean redraw
    // crosshair
    const cx = c.xFor(idx);
    const cy = c.yFor(d.c);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx, c.PAD_T); ctx.lineTo(cx, c.PAD_T + c.PRICE_H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c.PAD_L, cy); ctx.lineTo(c.W - c.PAD_R, cy); ctx.stroke();
    ctx.setLineDash([]);

    // Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();

    // Tooltip box
    const ttW = 130, ttH = 70;
    let tx = cx + 12;
    let ty = cy - 35;
    if (tx + ttW > c.W - c.PAD_R) tx = cx - ttW - 12;
    if (ty < c.PAD_T) ty = c.PAD_T;

    ctx.fillStyle = 'rgba(13,27,42,0.95)';
    ctx.strokeStyle = 'rgba(0,255,136,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, tx, ty, ttW, ttH, 6);
    ctx.fill(); ctx.stroke();

    const date = new Date(d.t);
    ctx.fillStyle = '#6b7fa8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(date.toLocaleString('sr-RS'), tx + 8, ty + 16);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(fmtAxisPrice(d.c), tx + 8, ty + 33);

    ctx.fillStyle = '#6b7fa8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('O: ' + fmtAxisPrice(d.o) + '  H: ' + fmtAxisPrice(d.h), tx + 8, ty + 48);
    ctx.fillText('L: ' + fmtAxisPrice(d.l), tx + 8, ty + 62);
  }

  /* -------------------------------------------------------
     drawPortfolioPieChart
  ------------------------------------------------------- */
  function drawPortfolioPieChart(canvas, holdings) {
    if (!canvas || !holdings || holdings.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W   = canvas.offsetWidth  || 200;
    const H   = canvas.offsetHeight || 200;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cx = W / 2, cy = H / 2;
    const R  = Math.min(W, H) / 2 - 20;
    const INNER_R = R * 0.55;

    const COLORS = [GREEN, GOLD, '#00b4ff', '#a78bfa', RED, '#fb923c', '#34d399', '#f472b6'];
    const total  = holdings.reduce((s, h) => s + h.usdValue, 0) || 1;

    let startAngle = -Math.PI / 2;

    holdings.forEach((h, i) => {
      const slice = (h.usdValue / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // Subtle separator
      ctx.strokeStyle = '#070d1a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      startAngle += slice;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, INNER_R, 0, Math.PI * 2);
    ctx.fillStyle = '#0f2537';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#fff';
    ctx.font = `bold 13px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Portfolio', cx, cy - 8);
    ctx.fillStyle = GREEN;
    ctx.font = `bold 11px Inter, sans-serif`;
    ctx.fillText(fmtUSD(total), cx, cy + 10);
  }

  /* -------------------------------------------------------
     Helper utils
  ------------------------------------------------------- */
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r},${g},${b}`;
  }

  function fmtAxisPrice(v) {
    if (v >= 10000) return '$' + Math.round(v).toLocaleString();
    if (v >= 100)   return '$' + v.toFixed(1);
    if (v >= 1)     return '$' + v.toFixed(2);
    if (v >= 0.001) return '$' + v.toFixed(4);
    return '$' + v.toFixed(8);
  }

  function fmtUSD(v) {
    if (v >= 1000) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return '$' + v.toFixed(2);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* --- Expose --- */
  window.Charts = { drawSparkline, drawPriceChart, drawPortfolioPieChart };
})();
