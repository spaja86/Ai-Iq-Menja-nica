# VRH Programskog Ekvivalenta — Repo Standard

## Svrha
Ovaj standard zaključava jedinstven operativni okvir za ceo repozitorijum kako bi kvalitet, sigurnost, sadržajna konzistentnost, funnel konverzija i trust/compliance signal ostali usklađeni u svakoj izmeni.

## Zaključani ciljevi (obavezni)
1. Kvalitet: bez regresije u ključnim korisničkim tokovima.
2. Sigurnost: bez novih ranjivosti i bez curenja tajni.
3. Konzistentnost sadržaja: bez kontradikcija između javnih stranica i `docs/*`.
4. Funnel konverzija: svaki novi konverzioni CTA je merljiv.
5. Trust/compliance signal: formalni i regulatorni tokovi imaju jasan direktni kanal.

## Jedinstveni razvojni takt (repo-wide)
Svaka promena mora pratiti isti ciklus:

1. **Plan** — scope, rizik i očekivani ishod.
2. **Implementacija** — male, fokusirane izmene.
3. **Validacija** — testovi i quality/security gate-ovi.
4. **Dokumentacija** — obavezan trag u `docs/*`.
5. **Release** — samo posle prolaska svih gate-ova.

## Obavezan trag promene u dokumentaciji
Svaka funkcionalna ili sadržajna izmena mora imati:
- odluku (šta je promenjeno),
- uticaj (na koji funnel/trust/sajt sloj utiče),
- rizik (šta može da krene loše),
- status (planirano/implementirano/verifikovano/released).

Minimalni trag ide u `docs/decision-log.md` i relevantni domen dokument (`docs/qa-strategy.md`, `docs/content-rules.md`, `docs/funnel-map.md`, itd).

## Repo-wide Definition of Done (DoD)
Promena je završena samo kada je sve ispunjeno:
- Shared i page-level granica nije narušena.
- Navigacija i i18n ostaju konzistentni.
- Novi ili izmenjeni conversion CTA imaju `data-track` i `data-track-id`.
- Intent CTA imaju i `data-intent` + `data-funnel-stage`.
- Demo/simulated signal je jasan gde podaci nisu live.
- Formalni/regulatorni tokovi zadržavaju direktni kanal (`mailto:`).
- CI quality/security gate-ovi prolaze.
- Dokumentacija je ažurirana.

## Usklađivanje sa operativnim modelom
Svaka javna izmena mora podržati makar jedan od tri centra bez kontradikcije:
- `services.html` (capability hub)
- `contact.html` (qualification hub)
- `trust-center.html` (governance hub)

## Governance ritam
- Nedeljno: pregled kvaliteta i roadmap prioriteta.
- Mesečno: revizija trust/compliance sadržaja i funnel performansi.
- Kontinuirano: održavanje decision log-a i rollback smernica.

## Prioritet realizacije
- **Faza A:** Konsolidacija standarda i konzistentnosti.
- **Faza B:** Jačanje quality/security gate-ova i observability discipline.
- **Faza C:** Optimizacija konverzije, trust signala i operativnog skaliranja.
