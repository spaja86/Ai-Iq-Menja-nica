# Decision Log

## 2026-09-27
- Formalno je odobren repo-wide program `MONTEZACIJA NAD MONTEZACIJAMA` kao nadređeni operativni sloj iznad pojedinačnih izmena.
- Program je definisan kao approval okvir koji povezuje development, content, trust, funnel i release disciplinu u jedan upravljački model.
- Potvrđeno je da `VRH PROGRAMSKOG EKVIVALENTA` označava ciljno stanje maksimalne usklađenosti kvaliteta, sigurnosti, konverzije i governance-a.
- Zaključan scope programa na tri centralna huba: `services.html`, `contact.html` i `trust-center.html`, uz zadržavanje marketing + lead-generation North Star okvira.
- Approval model je potvrđen samo za promene koje prolaze Plan → Implementacija → Validacija → Dokumentacija → Release bez regresije i sa green quality/security gate-ovima.
- Uveden je završni approval paket: jedan naziv programa, jedan repo-wide standard, jedan DoD i jedan KPI skup (qualified inbound, completion rate, intent CTR, local-vs-formal ratio, lead quality).
- Potvrđeno je da je `docs/vrh-programskog-ekvivalenta.md` jedini repo-wide operativni standard za DoD, razvojni ciklus i release kriterijume.
- Usklađeni su `docs/roadmap.md`, `docs/repository-architecture.md`, `docs/content-rules.md`, `docs/qa-strategy.md` i `docs/funnel-map.md` da ne postoji kontradikcija oko CTA discipline, formalnog kanala, demo signalizacije i dokumentacionog traga.
- Uveden je obavezni PR checklist template (`.github/pull_request_template.md`) koji mapira Plan → Implementacija → Validacija → Dokumentacija → Release i repo-wide DoD tačke.
- Potvrđeno hard pravilo: bez green CI quality/security gate-ova nema merge-a za javne izmene.
- Services, contact i trust sloj su dodatno usklađeni oko modela “Developer + Create = vrh programskog ekvivalenta” sa tri repo-wide izlaza: pouzdan proizvod, merljiv funnel i održiva monetizacija.
- Uveden je operating-model analytics helper koji iz postojećih događaja izvodi qualified inbound, completion rate, intent CTA CTR, local-vs-formal routing odnos i monetization tier pregled.
- Monetizacioni slojevi su zaključani kao `entry`, `growth`, `enterprise` i `strategic`, uz jasno mapiranje capability → qualification → formal deal toka.

## 2026-09-16
- Repo pozicioniran kao marketing + lead-generation platforma sa demo trading komponentama.
- KPI model zaključan na: qualified inquiries, contact conversion, high-intent CTA engagement.
- Kontakt tok unapređen lokalnom evidencijom, validacijom, anti-spam i rate-limit zaštitom.
- Uvedena politika označavanja demo/simulated podataka.
- Deploy workflow proširen validacijom i smoke check koracima.

## 2026-09-17
- Usluge su unapređene filterabilnim katalogom sa statusima spremnosti i jasnijim CTA putanjama.
- Contact intake je segmentiran po profilu razgovora i prioritetu uz zadržavanje direktnog formalnog email kanala.
- Trading i wallet stranice dodatno naglašavaju demo/API fallback prirodu prikaza, a javne stranice dobijaju canonical/OG baseline.

## 2026-09-18
- Dodate su namenske intent landing stranice za licensing, institutional i partner onboarding tokove.
- CTA funnel je standardizovan kroz `data-intent` i `data-funnel-stage` a analytics je proširen na conversion-path i page-view evente.
- CI merge gate je proširen da proverava canonical/OG metadata za sve javne stranice i governance signalizaciju za formalni kanal + demo sadržaj.
- Uvedena je podrška za višestruke post-deploy smoke URL provere preko `PRODUCTION_HEALTHCHECK_URLS` secreta.

## 2026-09-20
- `services.html` je potvrđen kao centralni capability hub sa vidljivim readiness, regulatory i integration signalima na karticama.
- `contact.html` je unapređen u qualification hub sa intent-routing summary panelom i lightweight intent score modelom.
- `trust-center.html` je proširen proof-architecture, claims matrix i escalation pravilima kako bi javne tvrdnje bile jasnije razdvojene.
- Analytics helperi sada podržavaju segmentaciju po intent-u i score-aware contact payload signalizaciju.
- Uveden je jedinstveni repo standard: `docs/vrh-programskog-ekvivalenta.md` sa zaključanim ciljevima kvaliteta, sigurnosti, funnel konverzije i trust/compliance signalizacije.
- Standardizovan je obavezni razvojni ciklus Plan → Implementacija → Validacija → Dokumentacija → Release i repo-wide Definition of Done.
- Deploy quality gate je proširen eksplicitnim secret scan korakom pre release-a.
- Shared runtime sloj je dopunjen automatskom CTA funnel normalizacijom za konzistentan tracking atribut model na javnim stranicama.
