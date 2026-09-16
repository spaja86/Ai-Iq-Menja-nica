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
