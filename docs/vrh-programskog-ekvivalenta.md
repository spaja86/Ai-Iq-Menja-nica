# VRH Programskog Ekvivalenta — Repo Standard

## Svrha
Ovaj standard zaključava jedinstven operativni okvir za ceo repozitorijum kako bi kvalitet, sigurnost, sadržajna konzistentnost, funnel konverzija i trust/compliance signal ostali usklađeni u svakoj izmeni.

## Nadređeni program
- `MONTEZACIJA NAD MONTEZACIJAMA` je naziv nadređenog repo-wide operativnog sloja.
- Program povezuje development, content, trust, funnel i release disciplinu u jedan approval model.
- `VRH PROGRAMSKOG EKVIVALENTA` je ciljno stanje programa: maksimalna usklađenost kvaliteta, sigurnosti, konverzije i governance-a.

## Zaključani scope programa
- Program obavezno pokriva tri centralna huba: `services.html`, `contact.html` i `trust-center.html`.
- Repo ostaje u okviru marketing + lead-generation platforme sa demo prikazima, bez širenja u full backend ili neproverene regulatorne tvrdnje.
- Svaka nova inicijativa mora biti mapirana makar na jedan od tri cilja: capability, qualification ili governance.

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

PR opis mora koristiti obavezni checklist template (`.github/pull_request_template.md`) koji potvrđuje ovaj ciklus i DoD.

## Approval model programa
- Odobrenje postoji samo za promene koje prolaze ceo ciklus Plan → Implementacija → Validacija → Dokumentacija → Release.
- Ne odobravaju se izmene koje uvode regresiju u ključnim tokovima, trust signalizaciji ili funnel merenju.
- Approval zahteva green quality/security gate-ove i ažuran dokumentacioni trag u `docs/*`.

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

## Merila za odobrenje programa
- Svaki conversion CTA mora biti merljiv.
- Formalni/regulatorni tokovi moraju ostati jasno odvojeni i direktni.
- Demo i simulirani podaci moraju ostati jasno označeni.
- Javne tvrdnje i `docs/*` dokumenti ne smeju biti u kontradikciji.
- Approval paket mora zadržati jedan naziv programa, jedan repo-wide standard, jedan DoD i jedan KPI skup.

## Usklađivanje sa operativnim modelom
Svaka javna izmena mora podržati makar jedan od tri centra bez kontradikcije:
- `services.html` (capability hub)
- `contact.html` (qualification hub)
- `trust-center.html` (governance hub)

## Governance ritam
- Nedeljno: pregled kvaliteta i roadmap prioriteta.
- Mesečno: revizija trust/compliance sadržaja i funnel performansi.
- Kontinuirano: održavanje decision log-a i rollback smernica.

## Developer + Create operativni režim
- Developer sloj nosi stabilnost, testabilnost, security i shared konvencije.
- Create sloj nosi jasnu poruku, trust signal, funnel CTA disciplinu i intent segmentaciju.
- Oba sloja rade po istom DoD-u i istom approval gate-u; nisu odvojeni tokovi.

## Prioritet realizacije
- **Faza A:** Konsolidacija standarda i konzistentnosti.
- **Faza B:** Jačanje quality/security gate-ova i observability discipline.
- **Faza C:** Optimizacija konverzije, trust signala i operativnog skaliranja.
- **Faza D:** Monetizaciona paketizacija i rollout readiness.
