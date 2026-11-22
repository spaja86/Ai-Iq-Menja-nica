/* ===================================================
   Ai Iq Menjačnica — chatbot.js
   Floating AI chatbot widget — crypto-specific
   =================================================== */

(function () {
  'use strict';

  var topics = [
    {
      matches: /soc[\s-]*2|sertifik|certif|revizij|audit/i,
      answer: 'U dokumentaciji ovog demoa nije naveden SOC 2 Type II izveštaj za Menjačnicu. Za proveru zatražite izveštaj sa nazivom pružaoca usluge, opisom sistema, periodom provere i mišljenjem nezavisnog revizora.'
    },
    {
      matches: /sigur|bezbed|security|2fa|dvofaktor|cold storage|hladn|hakovan|hakova|haker|hack|inciden|phishing|zaključav|zakljucav|enkripc|šifrov|sifrov|ssl|tls/i,
      answer: 'Ovaj demo ne potvrđuje koje su mere zaštite primenjene u produkciji, kako se čuvaju sredstva ili kakva je istorija incidenata. Za konkretnu uslugu tražite dokumentaciju operatera.'
    },
    {
      matches: /naknad|cenovnik|\bfees?\b|tro[šs](?:ak|k)|provizij|popust|vip/i,
      answer: 'Naknade u demo obrascu služe za primer obračuna. Za trošak stvarne trgovine, uplate ili isplate potreban je važeći cenovnik operatera.'
    },
    {
      matches: /staking|pasivn|zarad|prinos|yield/i,
      answer: 'Staking je tema edukativnog primera. Ovaj demo ne nudi aktivaciju stakinga niti potvrđuje dostupnost proizvoda ili stopu prinosa.'
    },
    {
      matches: /portfolio|preporu|investi|ulaganj|ai predict/i,
      answer: 'Portfolio prikazuje kako se udeo svake valute računa u ukupnoj vrednosti. Primer sa dve jednake pozicije daje po 50% svakoj. To je ilustracija obračuna, bez preporuke za ulaganje.'
    },
    {
      matches: /podr[žz]av|list[au]|valute|altcoin|koje kripto/i,
      answer: 'BTC i ETH su primeri valuta u demonstraciji. Ovaj prikaz ne potvrđuje listu valuta dostupnih za stvarnu trgovinu.'
    },
    {
      matches: /kup[io]|prodaj|how to buy|po[čc]etak|uplat|isplat|depozit|registr/i,
      answer: 'Na stranici Trading možete isprobati demo obrazac za kupovinu i prodaju. Za probu nije potrebna uplata novca. Chatbot ne otvara račun i ne izvršava naloge.'
    },
    {
      matches: /defi|decentrali/i,
      answer: 'DeFi je naziv za finansijske protokole koji koriste pametne ugovore. Uslovi pristupa zavise od protokola i interfejsa.'
    },
    {
      matches: /bitcoin|\bbtc\b|cen[au]|price|vrednost/i,
      answer: 'Primer za BTC: ako izmišljena cena poraste sa 100 na 102 dolara, promena je +2%. Ovaj chatbot ne preuzima tržišne kotacije.'
    }
  ];

  function getReply(message) {
    var topic = topics.find(function (item) { return item.matches.test(message); });
    var answer = topic ? topic.answer : 'Pitajte o SOC 2, bezbednosti, ceni BTC-a, naknadama ili demo trgovini.';
    return 'Demo · ' + answer;
  }

  /* ---- DOM CREATION ---- */
  function buildWidget() {
    var html = '<div id="chatbot-widget">' +
      '<button id="chatbot-fab" aria-label="Otvori demo čet">💬</button>' +
      '<div id="chatbot-panel" aria-live="polite">' +
        '<div id="chatbot-header">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<span style="font-size:1.4rem">🤖</span>' +
            '<div>' +
              '<div style="font-weight:700;font-size:0.92rem">Kripto asistent</div>' +
              '<div style="font-size:0.7rem;color:var(--cb-online)">Demo · unapred pripremljeni odgovori</div>' +
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
      addMessage('Dobro došli u demo. Mogu da objasnim prikaz cena, naknada i trgovine. Ovde se ne uplaćuje novac.', 'bot');
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
