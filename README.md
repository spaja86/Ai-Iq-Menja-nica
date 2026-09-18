# 💱 Ai Iq Menjačnica x AI IQ World Bank

> **Ai Iq Menjačnica je kripto, exchange i liquidity kanal unutar AI IQ World Bank ekosistema za globalne finansije, licenciranje, partnerstva i AI finansijsku infrastrukturu.**

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-green?style=flat-square)](https://github.com/spaja86/Ai-Iq-Menja-nica)
[![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)]()
[![Direction](https://img.shields.io/badge/Direction-AI%20IQ%20World%20Bank-gold?style=flat-square)]()

---

## 🚀 Live Demo

**[→ Otvorite sajt](https://spaja86.github.io/Ai-Iq-Menja-nica/)**

---

## 🧭 Novi pravac projekta

Repozitorijum više ne predstavlja samo kripto menjačnicu.

Sajt sada komunicira širi pravac u kome:
- **AI IQ World Bank** nosi finansijski, licencni i partnerski stub
- **Ai Iq Menjačnica** služi kao operativni kripto i exchange sloj
- fokus se širi na **globalne delatnosti, enterprise tokove, compliance okvir i međunarodnu poslovnu spremnost**

Važno: poruka o „licenci za celu planetu za rad” predstavljena je kao **globalni licensing/compliance roadmap**, a ne kao neproverena apsolutna tvrdnja.

---

## 📋 Stranice

| Stranica | Novi fokus |
|---|---|
| `index.html` | AI IQ World Bank ekosistem, globalne delatnosti, trust sekcija, licensing roadmap |
| `services.html` | Prošireni katalog delatnosti: banking, payments, treasury, licensing, partnerships, AI finance |
| `about.html` | Misija i vrednosti ekosistema; World Bank kao glavni finansijski i poslovni stub |
| `contact.html` | Kontakt tokovi za licence, partnerstva, predstavništva, enterprise onboarding i institucije |
| `trade.html` | Trading i exchange operativa unutar šireg ekosistema |
| `wallet.html` | Wallet/custody iskustvo povezano sa globalnim finansijskim narativom |
| `education.html` | Edukacija i akreditacioni pravac u okviru ekosistema |
| `licensing.html` | Namenski licensing/compliance landing sa formalnim intake tokom |
| `institutional.html` | Namenski institutional/public desk landing za audit-ready tokove |
| `partner-onboarding.html` | Namenski partner onboarding landing za white-label/API/country modele |
| `trust-center.html` | Trust, policy, data-source i governance hub za ceo javni sajt |

---

## 🏦 AI IQ World Bank delatnosti

### Finansijska infrastruktura
- Digitalno bankarstvo
- Global accounts
- Virtual cards
- Merchant processing
- Cross-border payments
- Remittance
- B2B i enterprise treasury
- Payroll i isplate za globalne timove

### Digital asset i exchange tokovi
- Devizne i kripto razmene
- Stablecoin settlement
- Custody i čuvanje sredstava
- Tokenization usluge
- Liquidity i settlement tokovi
- Escrow modeli

### Poslovni i investicioni pravci
- Kreditiranje i poslovno finansiranje
- Venture i startup banking
- Wealth management
- Family office podrška
- Trade finance
- Public sector / NGO payment solutions

### Rast, partnerstva i licence
- Fintech licence i partnerstva
- Partnerstva po državama
- White-label i API usluge
- Franchising modeli
- Digital identity / KYC / AML podrška
- Educational licensing i AI akreditacije
- Konsulting i sertifikacija

---

## 🔐 Sekcija poverenja

Na naslovnoj strani je dodat ozbiljniji trust okvir:
- Global coverage
- Compliance framework
- Partner network
- Enterprise support
- Risk controls
- Business verification

Ovi elementi služe da priča o svetskom radu i međunarodnom licenciranju bude konzistentnija i poslovno ozbiljnija.

---

## 🌍 Globalni rad i licenciranje

Formulacija „licence za celu planetu za rad” sada je prevedena u sledeći okvir:
- globalna operativna vizija
- compliance i licensing roadmap
- pregled tržišta i jurisdikcija
- status pripreme po regionima
- poslovna spremnost za međunarodni rad
- partner model za odgovorno širenje

---

## 🎨 Tehnologije

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages / Vercel deploy tokovi

---

## 📞 Kontakt

**Nikola Spajić**
- Email: [spajicn@yahoo.com](mailto:spajicn@yahoo.com)
- Poslovni/regulatorni kanal: koristite direktne mailto linkove sa `contact.html`

---

## 🔗 Ekosistem

- 🏦 **AI IQ World Bank** — finansije, licence i partnerstva
- 💱 **Ai Iq Menjačnica** — kripto i exchange operativa
- 🌐 **IO-OPENUI-AO** — saradnja i digitalni proizvodi
- 🏢 **Kompanija SPAJA** — strategija i razvoj

---

## 🧩 North Star i governance dokumenti

- [`docs/north-star-scope.md`](docs/north-star-scope.md)
- [`docs/repository-architecture.md`](docs/repository-architecture.md)
- [`docs/content-architecture.md`](docs/content-architecture.md)
- [`docs/data-sources-policy.md`](docs/data-sources-policy.md)
- [`docs/qa-strategy.md`](docs/qa-strategy.md)
- [`docs/roadmap.md`](docs/roadmap.md)
- [`docs/decision-log.md`](docs/decision-log.md)
- [`docs/funnel-map.md`](docs/funnel-map.md)
- [`docs/content-rules.md`](docs/content-rules.md)
- [`docs/analytics-events.md`](docs/analytics-events.md)

---

## 🛠️ Local run

Projekat je static-first. Pokretanje lokalno:

```bash
python3 -m http.server 8080
```

Zatim otvorite `http://localhost:8080`.

---

## 🚀 Deployment flow i rollback smernice

- Deploy pipeline: `.github/workflows/deploy.yml`
- Pre-deploy: HTML validacija + link validacija
- Deploy: Vercel CLI (`vercel --prod`)
- Post-deploy: opcioni smoke check preko `PRODUCTION_HEALTHCHECK_URL` secreta

Rollback smernica:
1. Re-deploy poslednji stabilni commit preko Vercel workflow-a.
2. Potvrdi smoke check i ključne stranice (`index`, `services`, `contact`).
3. Zabeleži incident i odluku u `docs/decision-log.md`.

---

## 📈 Observability (lightweight)

- Frontend event tracking je u `js/analytics.js`.
- Eventi se čuvaju lokalno u `localStorage` (ključ: `aiq-analytics-events`) i spremni su za kasniji dashboard izvoz.

---

## 🤝 Contributing i changelog

- Pravila doprinosa: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Istorija izmena: [`CHANGELOG.md`](CHANGELOG.md)
