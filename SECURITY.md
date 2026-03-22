# 🔒 Security Policy — Ai IQ Menjačnica

## Podržane verzije

| Verzija | Podržana |
|---------|----------|
| 1.x (Latest) | ✅ Aktivno |
| 0.x (Beta) | ❌ Nije podržana |

---

## 📋 Prijavljivanje ranjivosti

Ako pronađete sigurnosnu ranjivost u Ai IQ Menjačnici, **NE otvarajte javni GitHub issue**.

Umesto toga, kontaktirajte nas na:

- 📧 **spajicn@yahoo.com** (primarni kontakt)
- 📧 **spajicn@gmail.com** (backup kontakt)

### Šta treba uključiti u izveštaj:
1. Opis ranjivosti
2. Koraci za reprodukovanje
3. Potencijalni uticaj
4. Vaš predlog za rešenje (opciono)

**Odgovorićemo u roku od 48 sati.** Za kritične ranjivosti — u roku od 24 sata.

---

## 🛡️ Implementirane sigurnosne mere

### HTTP Security Headers (na svim stranicama)

```html
<!-- Sprečava MIME type sniffing -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">

<!-- Sprečava clickjacking napade -->
<meta http-equiv="X-Frame-Options" content="DENY">

<!-- Content Security Policy -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self';
           script-src 'self' 'unsafe-inline';
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
           font-src 'self' https://fonts.gstatic.com;
           img-src 'self' data:;">
```

### XSS (Cross-Site Scripting) Zaštita

- **`textContent` umesto `innerHTML`** za sve korisnički generisane podatke
- Centralizovana `sanitize()` funkcija u svim JS fajlovima:
  ```javascript
  function sanitize(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  }
  ```
- Input validacija pre svake obrade (regex, tip, dužina)

### Input Validacija

- Validacija email adrese regex patternima
- Numerički inputi se validiraju sa `isFinite()` i `parseFloat()`
- Maksimalne dužine na svim tekstualnim inputima (`maxlength` atribut)
- Maksimalni iznos naloga: $1,000,000 (API limit)
- Whitelist validacija za numeričke vrednosti: `/^[0-9]*\.?[0-9]*$/`

### CSRF Prevencija

- Platforma je statički sajt bez server-side sekcija
- Svi "trades" su lokalni demo bez stvarnih API poziva
- Nema session cookija ili autentifikacionih tokena koji bi mogli biti meta CSRF napada

### Dependency Security

- **Nula eksternih JavaScript zavisnosti** — nema npm paketa, nema CDN skripti
- Jedina eksterna zavisnost: Google Fonts (CSS only, ne JavaScript)
- Svi Google Fonts linkovi koriste `crossorigin` atribut

---

## 🔐 Politika za Fondove (produkcijska verzija)

Za produkcijsku implementaciju, sledeće mere MORAJU biti implementirane:

### Čuvanje Fondova
- **95% Cold Storage**: Sredstva čuvana u air-gapped hardware novčanicima
- **5% Hot Wallet**: Za operativne potrebe, uz strict spending limits
- **Multi-signature**: Minimalno 3-od-5 potpisa za povlačenje iz cold storage-a

### Autentifikacija
- 2FA obavezna za sve korisnike (TOTP)
- Hardware security key podrška (FIDO2/WebAuthn)
- IP whitelisting za API pristup
- Session timeout: 30 minuta neaktivnosti

### Monitoring & Audit
- Real-time anomaly detection za sumnjive transakcije
- Svi pristupni logovi čuvani 90 dana
- Godišnji penetration test od ovlašćene firme
- Smart contract audit pre produkcijskog deployments-a

---

## 🚦 Rate Limiting Politika

Za produkcijsku verziju:

| Endpoint | Limit | Period |
|----------|-------|--------|
| Trade API | 100 req | 1 minuta |
| Price API | 1000 req | 1 minuta |
| Auth API | 10 req | 15 minuta |
| Withdraw | 5 req | 1 sat |

Prekoračenje limita vraća HTTP `429 Too Many Requests`.

---

## 📊 Upravljanje Podacima

- Korisnički podaci se **ne čuvaju lokalno** u ovoj demo verziji
- `localStorage` se koristi isključivo za UI preferencije (ne za osetljive podatke)
- Platforma ne koristi kolačiće (cookies)
- Nema analitike trećih strana

---

## 🏆 Zahvale za Otkrivanje

Zahvaljujemo security istraživačima koji odgovorno prijavljuju ranjivosti. Za značajne ranjivosti, nudimo javno pominjanje u SECURITY.md (Hall of Fame).

---

## 📅 Istorija promena

| Datum | Promena |
|-------|---------|
| 2026-01-01 | Inicijalna security politika |
| 2026-01-01 | CSP headers na svim stranicama |
| 2026-01-01 | XSS prevencija implementirana |

---

**Kontakt:** spajicn@yahoo.com | spajicn@gmail.com  
**Vlasnik:** Nikola Spajić / Ai IQ Menjačnica  
**Poslednje ažuriranje:** 2026-01-01
