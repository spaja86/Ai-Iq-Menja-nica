/* =========================================================
   Ai IQ Menjačnica — Mock Crypto API (crypto-api.js)
   ========================================================= */
(function () {
  'use strict';

  /* --- Base Data --- */
  const cryptoData = {
    BTC:  { name: 'Bitcoin',    price: 95000,    change24h:  2.3,  symbol: '₿',    marketCap: '1.8T',  volume: '45B',   rank: 1 },
    ETH:  { name: 'Ethereum',   price: 3400,     change24h: -0.5,  symbol: 'Ξ',    marketCap: '408B',  volume: '18B',   rank: 2 },
    BNB:  { name: 'BNB',        price: 580,      change24h:  1.2,  symbol: 'BNB',  marketCap: '84B',   volume: '2.1B',  rank: 3 },
    SOL:  { name: 'Solana',     price: 180,      change24h:  3.7,  symbol: '◎',    marketCap: '85B',   volume: '4.2B',  rank: 4 },
    ADA:  { name: 'Cardano',    price: 0.65,     change24h: -1.1,  symbol: '₳',    marketCap: '23B',   volume: '580M',  rank: 5 },
    DOT:  { name: 'Polkadot',   price: 8.5,      change24h:  0.8,  symbol: '●',    marketCap: '12B',   volume: '320M',  rank: 6 },
    MATIC:{ name: 'Polygon',    price: 1.1,      change24h:  2.1,  symbol: 'MATIC',marketCap: '10B',   volume: '410M',  rank: 7 },
    LINK: { name: 'Chainlink',  price: 18.5,     change24h: -0.3,  symbol: '⬡',    marketCap: '10B',   volume: '560M',  rank: 8 },
    AVAX: { name: 'Avalanche',  price: 42,       change24h:  1.8,  symbol: 'AVAX', marketCap: '17B',   volume: '720M',  rank: 9 },
    DOGE: { name: 'Dogecoin',   price: 0.18,     change24h:  5.2,  symbol: 'Ð',    marketCap: '26B',   volume: '1.8B',  rank: 10 },
    SHIB: { name: 'Shiba Inu',  price: 0.000025, change24h: -2.3,  symbol: 'SHIB', marketCap: '15B',   volume: '820M',  rank: 11 },
    XRP:  { name: 'Ripple',     price: 0.72,     change24h:  0.9,  symbol: 'XRP',  marketCap: '38B',   volume: '1.2B',  rank: 12 },
    USDT: { name: 'Tether',     price: 1.0,      change24h:  0.01, symbol: '₮',    marketCap: '95B',   volume: '65B',   rank: 13 },
    UNI:  { name: 'Uniswap',    price: 12.3,     change24h: -1.7,  symbol: 'UNI',  marketCap: '7.4B',  volume: '290M',  rank: 14 },
    ATOM: { name: 'Cosmos',     price: 11.2,     change24h:  2.5,  symbol: 'ATOM', marketCap: '4.3B',  volume: '180M',  rank: 15 },
  };

  /* --- Historical OHLCV generator --- */
  function generateOHLCV(basePrice, points, volatility) {
    const data = [];
    let price = basePrice;
    const now = Date.now();
    for (let i = points; i >= 0; i--) {
      const open  = price;
      const move  = (Math.random() - 0.49) * volatility;
      const close = Math.max(open * (1 + move), 0.000001);
      const high  = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
      const low   = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
      const vol   = Math.random() * basePrice * 500000;
      data.push({ t: now - i * 3600000, o: open, h: high, l: low, c: close, v: vol });
      price = close;
    }
    return data;
  }

  function getHistorical(symbol, timeframe) {
    const d = cryptoData[symbol];
    if (!d) return [];
    const vols = { '1H': 0.003, '4H': 0.006, '1D': 0.012, '1W': 0.025, '1M': 0.05 };
    const pts  = { '1H': 60,    '4H': 96,     '1D': 90,    '1W': 52,    '1M': 60  };
    return generateOHLCV(d.price, pts[timeframe] || 90, vols[timeframe] || 0.012);
  }

  /* --- Price Simulation --- */
  function simulatePriceUpdate() {
    for (const sym in cryptoData) {
      const coin = cryptoData[sym];
      if (sym === 'USDT') continue; // stablecoin
      const delta = (Math.random() - 0.495) * 0.001; // ±0.1%
      coin.price = Math.max(coin.price * (1 + delta), 0.000001);
      // Drift change24h slightly
      coin.change24h = Math.max(-99, Math.min(99, coin.change24h + (Math.random() - 0.5) * 0.05));
    }
    window.dispatchEvent(new CustomEvent('priceUpdate', { detail: cryptoData }));
  }

  /* --- Formatters --- */
  function formatPrice(price) {
    if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (price >= 1)     return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 0.001) return '$' + price.toFixed(4);
    return '$' + price.toFixed(8);
  }

  function formatChange(change) {
    const sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
  }

  function formatVolume(vol) {
    if (vol >= 1e12) return '$' + (vol / 1e12).toFixed(2) + 'T';
    if (vol >= 1e9)  return '$' + (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6)  return '$' + (vol / 1e6).toFixed(2) + 'M';
    return '$' + vol.toFixed(0);
  }

  /* --- Public API --- */
  window.cryptoAPI = {
    getAll: () => cryptoData,
    get:    (sym) => cryptoData[sym.toUpperCase()] || null,
    formatPrice,
    formatChange,
    formatVolume,
    getHistorical,
    symbols: () => Object.keys(cryptoData),
  };

  /* --- Start simulation --- */
  setInterval(simulatePriceUpdate, 3000);

})();
