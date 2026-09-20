# Repository Architecture i Konvencije

## Trenutni runtime model
- Static-first HTML/CSS/JS sa PWA support-om.
- Shared behavior je u `js/main.js`, a page-specifična logika je u zasebnim JS fajlovima.

## Ciljana organizacija (standard)
- Trust/governance hub je javni HTML sloj (`trust-center.html`) koji povezuje policy, data-source, disclaimer i funnel pravila.
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
- Shared: navigacija, jezik, tema, analytics, bezbednosni bannery/disclaimeri i trust/governance signalizacija.
- Page-specific: trading simulacija, wallet prikaz, edukativni kalkulatori, contact tok, intent landing logika i capability-hub detalji.

## Operativni model javnog sajta
- `services.html` je capability hub: discovery, comparison i routing po readiness/regulatory signalima.
- `contact.html` je qualification hub: profilisanje upita, intent routing i formal escalation odluka.
- `trust-center.html` je governance hub: claims policy, proof architecture, data-source posture i escalation pravila.
- Sve nove javne izmene treba da podrže makar jedan od ova tri centra bez kontradikcije sa ostalima.

## Pravila za nove fajlove
1. Novi javni page ide kao root HTML dok traje migracija i mora imati canonical + OG metadata.
2. Svaki novi CTA koji vodi ka konverziji mora imati `data-track` i `data-track-id`.
3. Ako CTA pripada intent funnel-u, obavezni su `data-intent` i `data-funnel-stage`.
4. Svaka promena javnog ponašanja mora biti dokumentovana u relevantnom `docs/*` fajlu.
5. Ako promena utiče na capability, qualification ili governance logiku, proveriti da li zahteva paralelni update na `services.html`, `contact.html` ili `trust-center.html`.

## Obavezni merge gate (minimum)
- I18n konzistentnost za shared navigaciju (`data-i18n`).
- Jasna demo/simulated oznaka gde podaci nisu live.
- Formalni/regulatorni tokovi moraju imati direktni email kanal.
- Canonical/OG prisutnost na svim javnim stranicama.
