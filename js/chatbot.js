/* ===================================================
   Ai Iq Menjačnica — chatbot.js
   Floating AI chatbot widget — crypto-specific
   =================================================== */

(function () {
  'use strict';

  /* ---- MOCK RESPONSES ---- */
  var responses = [
    {
      patterns: ['bitcoin', 'btc', 'cena', 'price', 'koliko', 'vrednost'],
      reply: function () {
        var p = (67000 + Math.random() * 3000).toFixed(0);
        var t = Math.random() > 0.5 ? '▲' : '▼';
        var ch = (Math.random() * 4).toFixed(2);
        return '₿ Bitcoin (BTC)\n💲 Cena: $' + Number(p).toLocaleString() + '\n' + t + ' Promena (24h): ' + ch + '%\n\n⚠️ Simulirani podaci — ne finansijski savet.';
      }
    },
    {
      patterns: ['kupiti', 'kupi', 'kupovina', 'how to buy', 'kako', 'pocetak', 'početak'],
      reply: function () {
        return '📋 Kako kupiti kripto u 4 koraka:\n\n1️⃣ Registrujte se i verifikujte nalog\n2️⃣ Uplatite fiat (EUR/RSD) na vaš račun\n3️⃣ Odaberite kriptovalutu na /trade stranici\n4️⃣ Unesite iznos → kliknite Kupi!\n\n💡 Za početnike preporučujemo BTC ili ETH.';
      }
    },
    {
      patterns: ['podrzavate', 'podržavate', 'podrzava', 'podržava', 'lista', 'valute', 'altcoin', 'koje kripto'],
      reply: function () {
        return '🪙 Podržavamo 500+ kriptovaluta!\n\nNajpopularnije:\n• ₿ Bitcoin (BTC)\n• Ξ Ethereum (ETH)\n• ⬡ BNB\n• ◎ Solana (SOL)\n• ₳ Cardano (ADA)\n• ● Polkadot (DOT)\n• 🔷 XRP, DOGE, AVAX, MATIC...\n\nPotražite ih sve na /trade stranici!';
      }
    },
    {
      patterns: ['naknada', 'naknade', 'fee', 'fees', 'trosak', 'trošak', 'provizija'],
      reply: function () {
        return '💸 Naše naknade:\n\n• Trejding naknada: 0.1%\n• Uplata fiat: Besplatno\n• Isplata fiat: 0.5% (min €1)\n• Kripto prenos: mrežna naknada (gas)\n\n🎁 VIP korisnici dobijaju 50% popust na sve naknade!';
      }
    },
    {
      patterns: ['defi', 'decentralizovano', 'decentralized'],
      reply: function () {
        return '🏛️ DeFi (Decentralized Finance):\n\nDeFi je finansijski ekosistem baziran na blockchain-u koji funkcioniše BEZ banaka ili posrednika.\n\n🔹 Ključne karakteristike:\n• Pametni ugovori (Smart Contracts)\n• Yield Farming & Staking\n• Decentralizovane berze (DEX)\n• Permissionless — nema KYC\n\n⚡ Primeri: Uniswap, Aave, Compound';
      }
    },
    {
      patterns: ['portfolio', 'preporuka', 'preporuci', 'preporuči', 'investicija', 'ai predict', 'investirati'],
      reply: function () {
        return '🤖 AI Portfolio Predlog (Mock):\n\n📊 Konzervativni (niski rizik):\n• 60% BTC • 30% ETH • 10% Stable\n\n📈 Balansiran (srednji rizik):\n• 40% BTC • 30% ETH • 20% SOL/BNB • 10% Altcoini\n\n🚀 Agresivni (visoki rizik):\n• 25% BTC • 25% ETH • 50% Altkoini\n\n⚠️ Ovo su simulirani podaci, ne finansijski savet!';
      }
    },
    {
      patterns: ['staking', 'pasivno', 'zarada', 'prinos', 'yield'],
      reply: function () {
        return '💰 Pasivni prihod — Staking:\n\n🔹 Dostupni prethodno odobreni prinos:\n• ETH 2.0: ~4-5% godišnje\n• BNB: ~6-8% godišnje\n• SOL: ~7% godišnje\n• ADA: ~5% godišnje\n• USDC/USDT: ~8-12% godišnje\n\nAktivacija: Novčanik → Staking sekcija';
      }
    },
    {
      patterns: ['sigurnost', 'security', 'bezbedan', 'siguran', 'hakovati', 'hakovan'],
      reply: function () {
        return '🔒 Naša sigurnosna arhitektura:\n\n• ✅ 2FA autentifikacija (Google Auth)\n• ✅ Cold Storage za 95% aktive\n• ✅ 256-bit SSL enkripcija\n• ✅ Anti-phishing kod\n• ✅ Automatsko zaključavanje naloga\n• ✅ SOC2 Type II sertifikat\n\n🛡️ Još nikad nismo hakovani!';
      }
    }
  ];

  var defaultReply = '🤖 Pitajte me o kriptovalutama, trejdingu ili našim uslugama!\n\nNpr: "Cena Bitcoina", "Kako kupiti kripto", "Koje kripto podržavate", "Kakve su naknade", "Šta je DeFi", "Preporuči portfolio"';

  function getReply(msg) {
    var lower = msg.toLowerCase();
    for (var i = 0; i < responses.length; i++) {
      var r = responses[i];
      for (var j = 0; j < r.patterns.length; j++) {
        if (lower.indexOf(r.patterns[j]) !== -1) {
          return r.reply();
        }
      }
    }
    return defaultReply;
  }

  /* ---- DOM CREATION ---- */
  function buildWidget() {
    var html = '<div id="chatbot-widget">' +
      '<button id="chatbot-fab" aria-label="Otvori AI Chat">💬</button>' +
      '<div id="chatbot-panel" aria-live="polite">' +
        '<div id="chatbot-header">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<span style="font-size:1.4rem">🤖</span>' +
            '<div>' +
              '<div style="font-weight:700;font-size:0.92rem">AI Kripto Asistent</div>' +
              '<div style="font-size:0.7rem;color:var(--cb-online)">● Online</div>' +
            '</div>' +
          '</div>' +
          '<button id="chatbot-close" aria-label="Zatvori">✕</button>' +
        '</div>' +
        '<div id="chatbot-messages"></div>' +
        '<div id="chatbot-typing" style="display:none">' +
          '<span class="chatbot-dot"></span><span class="chatbot-dot"></span><span class="chatbot-dot"></span>' +
        '</div>' +
        '<div id="chatbot-input-row">' +
          '<input id="chatbot-input" type="text" placeholder="Pitajte o kriptu..." autocomplete="off">' +
          '<button id="chatbot-send" aria-label="Pošalji">➤</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstChild);
  }

  function injectStyles() {
    var css = ':root{--cb-bg:#111820;--cb-panel:#141e2a;--cb-border:#1e3040;--cb-green:#00ff88;--cb-online:#00e676;--cb-user-bg:#0d2535;--cb-bot-bg:#0a1820;}' +
      '[data-theme=light]{--cb-bg:#f0f4f8;--cb-panel:#fff;--cb-border:#dde3ea;--cb-green:#00a86b;--cb-online:#00a86b;--cb-user-bg:#e0f7ef;--cb-bot-bg:#f8f9fa;}' +
      '#chatbot-widget{position:fixed;bottom:24px;right:24px;z-index:9999;font-family:"Segoe UI",system-ui,sans-serif;}' +
      '#chatbot-fab{width:56px;height:56px;border-radius:50%;background:var(--cb-green);color:#000;font-size:1.5rem;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,255,136,0.4);transition:all 0.2s;display:flex;align-items:center;justify-content:center;}' +
      '#chatbot-fab:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,255,136,0.55);}' +
      '#chatbot-panel{position:absolute;bottom:68px;right:0;width:340px;max-height:500px;background:var(--cb-panel);border:1px solid var(--cb-border);border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,0.5);display:none;flex-direction:column;overflow:hidden;}' +
      '#chatbot-panel.open{display:flex;}' +
      '#chatbot-header{background:var(--cb-bg);border-bottom:1px solid var(--cb-border);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;}' +
      '#chatbot-close{background:none;border:none;color:#888;font-size:1rem;cursor:pointer;padding:4px 8px;border-radius:4px;}' +
      '#chatbot-close:hover{background:rgba(255,255,255,0.08);}' +
      '#chatbot-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;min-height:200px;max-height:320px;}' +
      '.cb-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:0.82rem;line-height:1.5;white-space:pre-wrap;word-break:break-word;}' +
      '.cb-msg.bot{background:var(--cb-bot-bg);border:1px solid var(--cb-border);color:inherit;border-bottom-left-radius:4px;}' +
      '.cb-msg.user{background:var(--cb-user-bg);border:1px solid rgba(0,255,136,0.2);align-self:flex-end;border-bottom-right-radius:4px;}' +
      '.cb-ts{font-size:0.65rem;color:#888;margin-top:3px;}' +
      '.cb-msg-wrap{display:flex;flex-direction:column;}' +
      '.cb-msg-wrap.user{align-items:flex-end;}' +
      '#chatbot-typing{padding:8px 16px;display:flex;gap:4px;align-items:center;}' +
      '.chatbot-dot{width:7px;height:7px;border-radius:50%;background:var(--cb-green);animation:cb-bounce 1.2s infinite;}' +
      '.chatbot-dot:nth-child(2){animation-delay:0.2s;}' +
      '.chatbot-dot:nth-child(3){animation-delay:0.4s;}' +
      '@keyframes cb-bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}' +
      '#chatbot-input-row{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--cb-border);}' +
      '#chatbot-input{flex:1;background:var(--cb-bg);border:1px solid var(--cb-border);border-radius:8px;padding:9px 12px;font-size:0.82rem;color:inherit;outline:none;}' +
      '#chatbot-input:focus{border-color:var(--cb-green);}' +
      '#chatbot-send{background:var(--cb-green);color:#000;border:none;border-radius:8px;padding:9px 14px;cursor:pointer;font-size:0.9rem;font-weight:700;transition:background 0.2s;}' +
      '#chatbot-send:hover{background:#00ffaa;}' +
      '@media(max-width:400px){#chatbot-panel{width:calc(100vw - 32px);right:-8px;}}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getCurrentTime() {
    var d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function addMessage(text, role) {
    var container = document.getElementById('chatbot-messages');
    if (!container) return;
    var wrap = document.createElement('div');
    wrap.className = 'cb-msg-wrap ' + role;
    var msg = document.createElement('div');
    msg.className = 'cb-msg ' + role;
    msg.textContent = text;
    var time = document.createElement('div');
    time.className = 'cb-ts';
    time.textContent = getCurrentTime();
    wrap.appendChild(msg);
    wrap.appendChild(time);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  }

  /* Simulated typing delay range in milliseconds */
  var MIN_TYPING_DELAY = 700;
  var TYPING_DELAY_RANGE = 800;

  function sendMessage() {
    var input = document.getElementById('chatbot-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';

    addMessage(text, 'user');

    // Show typing indicator
    var typing = document.getElementById('chatbot-typing');
    if (typing) typing.style.display = 'flex';

    var delay = MIN_TYPING_DELAY + Math.random() * TYPING_DELAY_RANGE;
    setTimeout(function () {
      if (typing) typing.style.display = 'none';
      addMessage(getReply(text), 'bot');
    }, delay);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    buildWidget();

    var fab = document.getElementById('chatbot-fab');
    var panel = document.getElementById('chatbot-panel');
    var closeBtn = document.getElementById('chatbot-close');
    var sendBtn = document.getElementById('chatbot-send');
    var input = document.getElementById('chatbot-input');

    // Welcome message
    setTimeout(function () {
      addMessage('👋 Zdravo! Ja sam vaš AI Kripto Asistent.\n\nMogu vam pomoći sa cenama, kupovinom, naknadama i svim o kriptovalutama!', 'bot');
    }, 500);

    if (fab) {
      fab.addEventListener('click', function () {
        if (panel) panel.classList.toggle('open');
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (panel) panel.classList.remove('open');
      });
    }
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') sendMessage();
      });
    }
  });
})();
