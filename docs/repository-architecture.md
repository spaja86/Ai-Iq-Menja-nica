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
- Fajlovi: kebab-case (`contact-flow.js`, `partner-onboarding.html`)
- I18n ključevi: `domain-section-key` (`nav-home`, `cta-contact-primary`)
- Data atributi za tracking: `data-track`, `data-track-id`, `data-intent`, `data-funnel-stage`
- Sekcije na strani: Hero → Trust → Services → CTA → Footer

## Shared vs page-specific granica
- Shared: navigacija, jezik, tema, analytics, bezbednosni bannery/disclaimeri.
- Page-specific: trading simulacija, wallet prikaz, edukativni kalkulatori, contact tok, intent landing logika.

## Pravila za nove fajlove
1. Novi javni page ide kao root HTML dok traje migracija i mora imati canonical + OG metadata.
2. Svaki novi CTA koji vodi ka konverziji mora imati `data-track` i `data-track-id`.
3. Ako CTA pripada intent funnel-u, obavezni su `data-intent` i `data-funnel-stage`.
4. Svaka promena javnog ponašanja mora biti dokumentovana u relevantnom `docs/*` fajlu.

## Obavezni merge gate (minimum)
- I18n konzistentnost za shared navigaciju (`data-i18n`).
- Jasna demo/simulated oznaka gde podaci nisu live.
- Formalni/regulatorni tokovi moraju imati direktni email kanal.
- Canonical/OG prisutnost na svim javnim stranicama.
