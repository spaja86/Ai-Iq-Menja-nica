# Data Sources i Fallback politika

## Kategorije podataka
- **Real-time**: tržišne cene i order-book podaci (gde je izvodljivo)
- **Delayed**: agregati, trendovi, periodične metrike
- **Static**: opisne poslovne informacije, roadmap i institucionalni sadržaj
- **Demo/Simulated**: placeholder ili edukativne vrednosti

## Obavezna pravila
- Svaki demo element mora imati jasno vizuelno označavanje.
- Ako eksterni izvor padne, prikazati fallback stanje + jasnu poruku korisniku.
- Ne prikazivati simulirane vrednosti kao “live” bez napomene.

## Fallback ponašanje
1. API uspešan → prikaži normalno.
2. API timeout/error → koristi poslednju poznatu vrednost ako postoji.
3. Bez poslednje vrednosti → prikaži neutralni placeholder i status poruku.

## Page-level data mapa
- `index.html`: demo/simulated market snapshot (nije live feed).
- `trade.html`: mešoviti režim (demo blokovi + API quote fallback gde je dostupno).
- `wallet.html`: demo wallet/custody UX prikaz.
- `services.html`, `about.html`, `contact.html`, `education.html`: static sadržaj + CTA/funnel podaci.
- `licensing.html`, `institutional.html`, `partner-onboarding.html`: static intent landing sadržaj.

## Status transparency standard
- Svaki data blok koji nije live mora imati vidljivu oznaku (npr. demo banner, status note, ili card-level disclaimer).
- Fallback status mora biti objašnjen korisniku bez skrivanja degradiranog stanja.
- CTA copy ne sme sugerisati da demo prikazi predstavljaju izvršenje transakcija.
