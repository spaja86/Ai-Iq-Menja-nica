# Decision Log

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
