# 💱 Ai Iq Menjačnica — Svetska Kripto Menjačnica

> **Profesionalna AI-powered kripto menjačnica sa 500+ kriptovaluta, real-time trading platformom i enterprise sigurnošću.**

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-green?style=flat-square)](https://github.com/spaja86/Ai-Iq-Menja-nica)
[![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)]()

---

## 🚀 Live Demo

**[→ Otvorite sajt](https://spaja86.github.io/Ai-Iq-Menja-nica/)**

---

## 📋 Stranice

| Stranica | Opis |
|---|---|
| `index.html` | Naslovna — hero, live ticker, features, stats |
| `trade.html` | Trading platforma — order book, canvas chart, buy/sell |
| `wallet.html` | Novčanik — portfolio, pie chart, historija transakcija |
| `education.html` | Edukacija — blockchain osnove + AI kviz |
| `services.html` | Usluge — planovi i cene |
| `about.html` | O nama — tim i vrednosti |
| `contact.html` | Kontakt — Nikola Spajić + socijalne mreže |

---

## ✨ Funkcionalnosti

### 💱 Kripto Trading
- 🔴🟢 **Live ticker bar** — kripto cene koje se ažuriraju svakih 3 sekunde
- 📊 **Canvas price chart** — simulirani real-time grafikon cena
- 📖 **Order Book** — prikaz asks/bids sa vizuelnim bar indikatorima
- 🛒 **Buy/Sell forma** — limit narudžbine sa kalkulacijom ukupne cene i naknade
- ⏱️ **Trade History** — istorija transakcija u realnom vremenu
- 🌐 **Real Market integration** — CoinGecko API za realne cene (EUR/RSD)

### 🤖 AI Inteligencija
- 🔮 Prediktivna analiza cena
- 🔄 Automatski rebalansing portfolia
- 😊 Analiza sentimenta tržišta
- 🛡️ AI otkrivanje prevara
- 📈 Smart DCA Bot

### 🔒 Enterprise Security
- ✌️ 2FA autentifikacija
- 🔐 End-to-end enkripcija
- 🧊 Cold storage zaštita
- 🛡️ Zaštita od phishing napada

### 💼 Novčanik
- 📊 Portfolio pregled sa pie chart alokacijom (Canvas)
- 💰 Praćenje vrednosti u realnom vremenu
- 📋 Historija transakcija
- 🔄 Automatsko ažuriranje cena svakih 5 sekundi

### 🎓 Edukacija
- 📚 Ekspandabilne sekcije: Bitcoin, Ethereum, DeFi, Blockchain, AI
- 🧠 **Interaktivni kviz** — 8 pitanja o kriptu sa instant feedbackom
- 🔐 Saveti za sigurnost novčanika

---

## 🎨 Tehnologije

```
Frontend: HTML5, CSS3, Vanilla JavaScript
Dizajn:   Dark crypto theme (vlastiti CSS)
Charts:   HTML5 Canvas API
Data:     Simulirani podaci + CoinGecko API (opciono)
```

### 🎨 CSS Varijable (Dark Crypto Theme)

```css
:root {
  --crypto-dark:   #0d0d0d;
  --crypto-panel:  #141414;
  --crypto-card:   #1a1a1a;
  --crypto-border: #2a2a2a;
  --crypto-green:  #00d4aa;
  --crypto-red:    #ff4d4d;
  --crypto-gold:   #f0b90b;
  --crypto-blue:   #3498db;
  --crypto-text:   #e0e0e0;
  --crypto-muted:  #888;
}
```

---

## 📁 Struktura Projekta

```
Ai-Iq-Menja-nica/
├── index.html          ← Naslovna strana
├── trade.html          ← Trading platforma
├── wallet.html         ← Portfolio novčanik
├── education.html      ← Edukacija + AI kviz
├── services.html       ← Usluge i cenovnik
├── about.html          ← O nama + Tim
├── contact.html        ← Kontakt podaci
├── css/
│   ├── styles.css      ← Globalni CSS (dark theme)
│   └── trading.css     ← Trading UI CSS
├── js/
│   ├── main.js         ← Header, ticker, hamburger, animacije
│   ├── ticker.js       ← Live kripto ticker
│   ├── trading.js      ← Trading platforma logika
│   ├── wallet.js       ← Portfolio kalkulacije
│   ├── quiz.js         ← Edukativni kviz
│   └── trade.js        ← Real market (CoinGecko API)
├── README.md
└── SECURITY.md
```

---

## ⚡ Operativni Plan: "Ekstremno da počne sa radom"

### 1) Tačan cilj (merljivi rezultati)
- Prvi aktivni korisnik koji izvrši bar 1 simulirani trade.
- Prvi javno potvrđen feedback korisnika (issue, kontakt forma ili poruka).
- Prvi kompletan isporučen modul: Trading + Wallet + Education dostupni bez kritične greške.

### 2) Rokovi po sprintovima
- **T+24h:** Finalni MVP scope zaključen, vlasništvo dodeljeno, kritični blokeri evidentirani.
- **T+72h:** Ključni korisnički tokovi rade end-to-end (ulaz na sajt → trading ekran → wallet pregled).
- **T+7 dana:** Stabilan go-live kandidat sa quality gate proverama i rollback planom.
- **T+14 dana:** Post go-live iteracije završene na osnovu realnog feedback-a i KPI merenja.

### 3) MVP (minimalni obim)
- Funkcionalna naslovna i navigacija.
- Trade stranica sa prikazom cena i osnovnom buy/sell simulacijom.
- Wallet stranica sa prikazom portfolia i istorije.
- Education sadržaj i kviz.
- Kontakt kanal za prijavu problema i feedback.

### 4) Vlasništvo zadataka
- **Owner/Decision:** Nikola Spajić (prioriteti, odluke, odobrenje puštanja).
- **Implementacija:** Frontend razvoj (HTML/CSS/JS izmene i integracije).
- **Test/Verifikacija:** Funkcionalna provera ključnih tokova i regresija glavnih stranica.
- **Release/Go-live:** Odobrenje i finalno puštanje nakon prolaska quality gate-a.

### 5) "Blockers first" režim
- Svaki blocker se označava odmah po otkrivanju.
- Novi zadaci se ne otvaraju dok aktivni blocker nema vlasnika i plan rešavanja.
- Prioritet je uklanjanje prepreka koje blokiraju go-live tok.

### 6) Dnevni operativni ritam
- **Jutro (15 min):** Fokus dana + top 3 isporuke.
- **Sredina dana:** Provera statusa, blokera i odstupanja od sprint cilja.
- **Veče:** Kratak status, šta je završeno i prvi sledeći korak za naredni dan.

### 7) Paralelizacija rada
- Razvoj funkcionalnosti paralelno sa test proverama.
- Priprema deploy-a i produkcionih parametara paralelno sa finalnim bugfix-evima.
- Brze povratne petlje: kratke iteracije umesto velikih batch izmena.

### 8) Stroga kontrola kvaliteta (quality gate)
- Provera svih ključnih stranica: `index.html`, `trade.html`, `wallet.html`, `education.html`, `contact.html`.
- Provera osnovnih korisničkih tokova bez kritičnih grešaka u konzoli.
- Sigurnosna provera: bez tajni u kodu, bez novih rizičnih promena.

### 9) Produkcioni readiness
- Monitoring osnovnih grešaka i dostupnosti kroz GitHub Actions deploy pipeline (`.github/workflows/deploy.yml`) i ručnu proveru javnog URL-a nakon svakog deploy-a.
- Alerting kanal za kritične incidente: GitHub Issue sa prefiksom `INCIDENT:` + direktna eskalacija na kontakt iz sekcije **Kontakt** (email).
- Dokumentovan rollback korak za brzo vraćanje stabilne verzije.
- Jasno imenovana odgovorna osoba za incident response.

### 10) Go-live i iteracija
- Go-live se pokreće odmah po prolasku MVP i quality gate kriterijuma.
- Nakon puštanja: prioritetno rešavanje realnih korisničkih prijava.
- Iteracije se vode po uticaju na korisnika i stabilnost sistema.

### 11) Krizni plan (prva 72h nakon puštanja)
- Dežurstvo sa jasnim kontaktom za hitne situacije.
- Prioritetizacija grešaka: kritične > visoke > srednje > niske.
- Definisan maksimalni cilj reakcije na kritičan incident: potvrda incidenta u roku od **15 minuta**, početak mitigacije u roku od **30 minuta**.

### 12) Dnevni KPI (3 ključne metrike)
- **Brzina isporuke:** broj završenih prioritetnih zadataka po danu.
- **Stabilnost sistema:** broj kritičnih problema i vreme oporavka.
- **Vrednost za korisnika:** broj korisničkih interakcija i validiran feedback.

---

## 📊 Statistike Platforme

| Metrika | Vrednost |
|---|---|
| 💱 Kripto valuta | 500+ |
| 👥 Aktivnih korisnika | 10M+ |
| 💰 Obim trgovine | $100B+ |
| 🌍 Zemalja | 190+ |
| ⏰ Uptime | 99.9% |
| 📞 Podrška | 24/7 |

---

## 🔗 Ekosistem Platformi

Ai Iq Menjačnica je deo globalnog IT ekosistema koji uključuje:

| Platforma | Opis | Link |
|---|---|---|
| 🌐 **IO-OPENUI-AO** | Platforma za saradnju i igrice | [io-openui-ao.vercel.app](https://io-openui-ao.vercel.app) |
| 🏦 **Ai Iq World Bank** | Svetska banka | [GitHub](https://github.com/spaja86/Ai-Iq-World-Bank) |
| 🏢 **Kompanija SPAJA** | Matična IT kompanija | [GitHub](https://github.com/spaja86/Kompanija-SPAJA) |
| 💱 **Ai Iq Menjačnica** | Kripto menjačnica | Ovaj repozitorijum |

---

## 📞 Kontakt

**Nikola Spajić** — Osnivač & CEO

| Kanal | Link |
|---|---|
| 📧 Email (Yahoo) | [spajicn@yahoo.com](mailto:spajicn@yahoo.com) |
| 📧 Email (Gmail) | [spajicn@gmail.com](mailto:spajicn@gmail.com) |
| 📘 Facebook | [facebook.com/Spaja86](https://www.facebook.com/Spaja86) |
| 📘 FB Platforma | [facebook.com/profile.php?id=61583240952997](https://www.facebook.com/profile.php?id=61583240952997) |
| 📸 Instagram | [@spaja.1986](https://www.instagram.com/spaja.1986) |
| 🎵 TikTok | [@spaja.1986](https://www.tiktok.com/@spaja.1986) |
| ▶️ YouTube | [SpajaNikopenEvolution](https://www.youtube.com/@spajanikopenevolution) |

---

## ⚠️ Disclaimer

> Kripto trading nosi značajan finansijski rizik. Platformi su prikazani simulirani podaci za demonstracione svrhe. Uvek istražite pre investiranja. **Trgujte odgovorno.**

---

© 2026 Ai Iq Menjačnica — Nikola Spajić
