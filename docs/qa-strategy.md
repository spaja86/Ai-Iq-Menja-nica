# QA Strategija

## Obavezna checklista
- Cross-browser: Chrome, Edge, Safari, Firefox
- Mobile/responsive: kritične breakpoint provere
- Accessibility: fokus redosled, kontrast, semantičke oznake
- Content validacija: i18n konzistentnost i disclaimer prisutnost

## Regression set (ključni tokovi)
1. Navigacija + language toggle
2. Contact form validacija i submit flow
3. Trading/wallet prikaz demo statusa
4. Eksterni linkovi i CTA tracking
5. Intent landing tokovi (`licensing.html`, `institutional.html`, `partner-onboarding.html`)
6. Trust centar i docs linkovi (`trust-center.html`, `docs/*`)
7. Services filteri + contact qualification polja

## Release gates
- HTML validacija svih javnih stranica
- Metadata/canonical check za svaku javnu stranicu
- Content governance check za formalni kanal + demo signalizaciju
- Link validacija sa definisanim izuzecima
- Secret scan i security check pre release-a

## Definition of Done
- Funkcionalnost radi bez regresije u ključnim tokovima.
- Security i sadržajni disclaimer zahtevi su ispunjeni.
- Dokumentacija je ažurirana za promenu.
- CTA funnel tracking je prisutan za nove konverzione putanje.
- Promena ima dokumentovan trag: odluka, uticaj, rizik, status.
