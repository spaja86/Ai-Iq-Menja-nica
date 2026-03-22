# 🔷 Ai IQ Menjačnica

> **Profesionalna kripto menjačnica sa AI uvidima** — trejduj 500+ kriptovaluta sa enterprise sigurnošću, real-time grafovima i personalizovanim AI preporukama.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-green?style=for-the-badge)](https://github.com/spaja86/Ai-Iq-Menja-nica)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Owner](https://img.shields.io/badge/Owner-Nikola%20Spajić-gold?style=for-the-badge)](https://www.facebook.com/Spaja86)

---

## 📸 Screenshots

| Stranica | Opis |
|----------|------|
| `index.html` | Landing page sa live ticker-om, hero sekcijom, coin kartama i AI sekcijom |
| `trade.html` | 3-kolumnski trejding interfejs: Order Book · Chart · Portfolio |
| `wallet.html` | Portfolio pregled sa pie chartom i istorijom transakcija |
| `education.html` | Kripto edukacija, interaktivni kviz i glosar |
| `services.html` | Usluge, planovi i tabela provizija |
| `about.html` | Priča o projektu, tim, misija i partnerske platforme |
| `contact.html` | Kontakt forma sa validacijom, social linkovi |

---

## ✨ Funkcionalnosti

### 🎨 Dizajn
- Ultra-tamna tema (`#070d1a`) sa zelenim neon akcentima (`#00ff88`)
- Responsive dizajn — radi savršeno na svim uređajima
- Animacije: ticker scroll, fadeInUp, neon pulse, sparkline shimmer
- Hamburger menu za mobilne uređaje

### 📊 Trejding Platforma
- **3-kolumnski layout**: Order Book | Price Chart + Trading Form | Portfolio
- Real-time order book sa zelenim bid/crvenim ask prikazom
- Canvas price chart sa timeframe gumbima (1H, 4H, 1D, 1W, 1M)
- Hover tooltip na grafovima
- Trading form sa Market/Limit/Stop-Loss tipovima naloga
- Fee kalkulacija (0.1%) u realnom vremenu
- % buttons (25/50/75/100) za brz unos iznosa

### 💰 Kripto API (Mock)
- 15+ kriptovaluta: BTC, ETH, BNB, SOL, ADA, DOT, MATIC, LINK, AVAX, DOGE, SHIB, XRP, USDT, UNI, ATOM
- Simulacija price update svakih 3 sekunde (±0.1% promena)
- CustomEvent `priceUpdate` za reactive UI
- Mock OHLCV generator za istorijske podatke

### 🤖 AI Funkcije
- AI signal kartica (Bullish/Bearish sa confidence procentom)
- Risk score vizualizacija
- Portfolio optimizacija preporuke

### 📚 Edukacija
- Detaljni članci o Bitcoin-u i kripto kupovini
- Interaktivni kviz sa 8 pitanja i objašnjenjima
- Glosar sa 12+ kripto pojmova i search filterom
- FAQ accordions

### 💼 Novčanik
- Portfolio pie chart (Canvas 2D)
- Balances tabela sa USD vrednostima i % alokacijom
- Historija 10 transakcija
- Deposit/Withdraw modal

### 🔒 Sigurnost
- CSP (Content Security Policy) headeri na svim stranicama
- `X-Frame-Options: DENY` i `X-Content-Type-Options: nosniff`
- XSS prevencija: `textContent` umesto `innerHTML` za korisnički input
- Sanitizacija svih form inputa
- Input validacija (regex, min/max vrednosti)

---

## 🗂️ Struktura projekta

```
Ai-Iq-Menja-nica/
│
├── index.html          # Landing page
├── trade.html          # Trejding platforma
├── wallet.html         # Kripto novčanik
├── education.html      # Edukativni centar
├── services.html       # Usluge i cene
├── about.html          # O nama
├── contact.html        # Kontakt
│
├── css/
│   ├── styles.css      # Globalni stilovi, varijable, responsive
│   ├── trading.css     # Trejding-specifični stilovi (3-col layout)
│   └── animations.css  # @keyframes, reveal klase
│
├── js/
│   ├── crypto-api.js   # Mock kripto podaci + price simulation
│   ├── main.js         # Nav, ticker, sparklines, counters
│   ├── charts.js       # Canvas: sparkline, price chart, pie chart
│   ├── trading.js      # Order book, trade form, portfolio
│   ├── wallet.js       # Balances, transactions, pie chart
│   └── education.js    # Quiz, glossary, accordions
│
├── README.md
└── SECURITY.md
```

---

## 🚀 Pokretanje

Projekat ne zahteva instalaciju. Otvoriti `index.html` u pregledaču:

```bash
# Klonirati repozitorijum
git clone https://github.com/spaja86/Ai-Iq-Menja-nica.git
cd Ai-Iq-Menja-nica

# Pokrenuti lokalni server (opciono)
python3 -m http.server 8000
# ili
npx serve .
```

Zatim posetiti: `http://localhost:8000`

---

## 🛠️ Tehnologije

| Tehnologija | Upotreba |
|-------------|----------|
| HTML5       | Semantičke stranice, ARIA accessibility |
| CSS3        | Variables, Grid, Flexbox, Animations |
| Vanilla JS  | ES6+, Canvas 2D API, CustomEvents |
| Google Fonts| Inter font porodica |

**Nema zavisnosti!** Projekat je čisti HTML/CSS/JS bez framework-a ili biblioteka.

---

## 🌐 Partnerske platforme

| Platforma | Link |
|-----------|------|
| 🏢 Kompanija SPAJA | [github.com/spaja86/Kompanija-SPAJA](https://github.com/spaja86/Kompanija-SPAJA) |
| 🏦 AI IQ World Bank | [github.com/spaja86/Ai-Iq-World-Bank](https://github.com/spaja86/Ai-Iq-World-Bank) |
| 🤖 IO-OPENUI-AO | [io-openui-ao.vercel.app](https://io-openui-ao.vercel.app) |

---

## 👤 Autor

**Nikola Spajić**

- 📧 spajicn@yahoo.com
- 📧 spajicn@gmail.com
- 📘 [facebook.com/Spaja86](https://www.facebook.com/Spaja86)
- 📷 [instagram.com/spaja.1986](https://www.instagram.com/spaja.1986)
- 🎵 [tiktok.com/@spaja.1986](https://www.tiktok.com/@spaja.1986)

---

## ⚠️ Disclaimer

Ai IQ Menjačnica je **demo/edukativna platforma**. Svi kripto podaci su mock/simulirani. Ova platforma ne vrši stvarne finansijske transakcije. Trejding kriptovalutama nosi visoki finansijski rizik — investiraj odgovorno.

---

© 2026 Nikola Spajić / Ai IQ Menjačnica. Sva prava zadržana.
