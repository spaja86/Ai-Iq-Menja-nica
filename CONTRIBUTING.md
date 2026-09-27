# Contributing

## Workflow
1. Otvori issue ili usaglasi scope promene.
2. Prati dokumente u `docs/` (north-star, architecture, content, data policy).
3. Prati program `MONTEZACIJA NAD MONTEZACIJAMA` kao nadređeni approval okvir za repo-wide promene.
4. Prati obavezni ciklus: **Plan → Implementacija → Validacija → Dokumentacija → Release**.
5. Tretiraj developer i create kao jedan operativni tok sa istim DoD-om, istim KPI skupom i istim approval gate-om.
6. Mapiraj svaku novu inicijativu na capability, qualification ili governance cilj.
7. Potvrdi da promena podržava makar jedan centralni hub: `services.html`, `contact.html` ili `trust-center.html`.
8. U planu i PR opisu eksplicitno zabeleži koji hub je pogođen i koji KPI signal se očekuje.
9. Potvrdi da su green quality/security gate-ovi i dokumentacioni trag deo approval paketa.
10. Napravi male, fokusirane promene.
11. Potvrdi da su demo podaci jasno označeni i da su disclaimers prisutni.
12. Ažuriraj dokumentaciju kada menjaš ponašanje.
13. Zabeleži trag promene (odluka, uticaj, rizik, status) u `docs/decision-log.md`.
14. PR opis mora koristiti obavezni checklist template i eksplicitno potvrditi DoD tačke.

## Standards
- `MONTEZACIJA NAD MONTEZACIJAMA` je nadređeni program, a `docs/vrh-programskog-ekvivalenta.md` ostaje jedini repo-wide standard.
- Repo-wide approval paket je jedinstven: jedan naziv programa, jedan standard, jedan DoD i jedan KPI skup.
- Kebab-case za fajlove.
- Shared logika u `js/main.js` ili `js/shared/*`, page logika u `js/pages/*` (ili postojeći page fajlovi dok traje migracija).
- Koristi `data-i18n` ključeve za deljene tekstove.
- Koristi `data-track` za CTA/form događaje.
- Za intent funnel CTA koristi i `data-intent` + `data-funnel-stage`.
- Dodaj canonical/OG metapodatke na svaku novu javnu stranicu.
- Demo, simulated i roadmap tvrdnje moraju ostati jasno označene u sadržaju.
- Za nove CTA tokove koristi postojeći contact intake model i direktni formalni kanal kada je zahtev regulatorni ili institucionalni.

## Merge gate (obavezno)
- Approval paket ostaje jedinstven: naziv programa, repo-wide standard, DoD i KPI skup.
- I18n konzistentnost za shared navigaciju.
- Demo/simulated signalizacija bez "live" zavaravanja.
- Formalni kanal (`mailto:spajicn@yahoo.com`) prisutan za regulatorne/institucionalne tokove.
- Canonical i OG metadata na svim javnim stranicama.
- Relevantna docs sekcija ažurirana.
- Security i secret gate-ovi prošli pre release-a.
- Bez potpuno zelenih gate-ova PR ne sme biti mergovan.

## Repo-wide Definition of Done (DoD)
- Promena nema regresiju u ključnim tokovima (navigacija, contact, trust, services).
- Nova inicijativa je mapirana na capability, qualification ili governance cilj i na relevantni hub.
- Shared/page-level granica ostaje očuvana.
- Konverzioni CTA ostaju merljivi (`data-track`, `data-track-id`; za intent i `data-intent`, `data-funnel-stage`).
- Javne tvrdnje, funnel logika i `docs/*` ostaju bez kontradikcije.
- Dokumentacija i decision log su ažurirani.
