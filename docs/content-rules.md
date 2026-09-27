# Content Rules

## Operativni standard
- `docs/vrh-programskog-ekvivalenta.md` je nadređeni repo-wide standard za DoD i release kriterijume.

## Tone of voice
- Poslovan, ozbiljan i compliance-first.
- Bez apsolutnih regulatornih tvrdnji bez potvrde.
- Jasno razdvajanje holding narativa i operativnog exchange sloja.

## Trust i disclaimer pravila
- Licensing status se opisuje kao roadmap, readiness ili potvrđen status.
- Demo/simulirani podaci moraju biti jasno označeni.
- Formalni i regulatorni zahtevi moraju imati direktni kanal.

## Copy governance
- Shared navigacija ide kroz `data-i18n` i `js/main.js`.
- Svaki novi conversion CTA mora imati `data-track` + `data-track-id`.
- Intent conversion CTA mora imati i `data-intent` + `data-funnel-stage`.
- Novi conversion CTA treba da bude konzistentan sa awareness → consideration → qualification → formal contact tokom.
- Trust, policy i data-source reference usmeravati ka `trust-center.html` i relevantnim `docs/*` dokumentima kada je potrebno.

## Dokumentacioni trag (obavezno)
- Svaka funkcionalna ili sadržajna izmena mora upisati odluku, uticaj, rizik i status.
- Minimalni trag: `docs/decision-log.md` + relevantni domen dokument.
