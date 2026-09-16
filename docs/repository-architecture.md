# Repository Architecture i Konvencije

## Trenutni runtime model
- Static-first HTML/CSS/JS sa PWA support-om.
- Shared behavior je u `js/main.js`, a page-specifična logika je u zasebnim JS fajlovima.

## Ciljana organizacija (standard)
- `pages/` — HTML stranice (faza migracije)
- `assets/` — statički asseti (ikone, slike, media)
- `css/` — stilovi
- `js/` — skripte
  - `js/shared/` — zajedničke komponente/logika
  - `js/pages/` — page-level logika
- `docs/` — tehnička i produkt dokumentacija

## Naming konvencije
- Fajlovi: kebab-case (`contact-flow.js`, `data-sources-policy.md`)
- I18n ključevi: `domain-section-key` (`nav-home`, `cta-contact-primary`)
- Data atributi za tracking: `data-track`, `data-track-id`
- Sekcije na strani: Hero → Trust → Services → CTA → Footer

## Shared vs page-specific granica
- Shared: navigacija, jezik, tema, analytics, bezbednosni bannery/disclaimeri.
- Page-specific: trading simulacija, wallet prikaz, edukativni kalkulatori, contact tok.
