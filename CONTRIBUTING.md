# Contributing

## Workflow
1. Otvori issue ili usaglasi scope promene.
2. Prati dokumente u `docs/` (north-star, architecture, content, data policy).
3. Prati obavezni ciklus: **Plan → Implementacija → Validacija → Dokumentacija → Release**.
4. Napravi male, fokusirane promene.
5. Potvrdi da su demo podaci jasno označeni i da su disclaimers prisutni.
6. Ažuriraj dokumentaciju kada menjaš ponašanje.
7. Zabeleži trag promene (odluka, uticaj, rizik, status) u `docs/decision-log.md`.

## Standards
- Kebab-case za fajlove.
- Shared logika u `js/main.js` ili `js/shared/*`, page logika u `js/pages/*` (ili postojeći page fajlovi dok traje migracija).
- Koristi `data-i18n` ključeve za deljene tekstove.
- Koristi `data-track` za CTA/form događaje.
- Za intent funnel CTA koristi i `data-intent` + `data-funnel-stage`.
- Dodaj canonical/OG metapodatke na svaku novu javnu stranicu.
- Demo, simulated i roadmap tvrdnje moraju ostati jasno označene u sadržaju.
- Za nove CTA tokove koristi postojeći contact intake model i direktni formalni kanal kada je zahtev regulatorni ili institucionalni.

## Merge gate (obavezno)
- I18n konzistentnost za shared navigaciju.
- Demo/simulated signalizacija bez "live" zavaravanja.
- Formalni kanal (`mailto:spajicn@yahoo.com`) prisutan za regulatorne/institucionalne tokove.
- Canonical i OG metadata na svim javnim stranicama.
- Relevantna docs sekcija ažurirana.
- Security i secret gate-ovi prošli pre release-a.

## Repo-wide Definition of Done (DoD)
- Promena nema regresiju u ključnim tokovima (navigacija, contact, trust, services).
- Shared/page-level granica ostaje očuvana.
- Konverzioni CTA ostaju merljivi (`data-track`, `data-track-id`; za intent i `data-intent`, `data-funnel-stage`).
- Dokumentacija i decision log su ažurirani.
