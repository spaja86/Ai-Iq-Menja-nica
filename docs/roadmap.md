# Product Roadmap

## V1 — Foundation
- Struktura i konvencije
- I18n i content baseline
- Security/compliance baseline
- Contact flow hardening
- Shared SEO/accessibility baseline
- Demo signaling i intake clarity

## V2 — Data + Quality
- Real data integracije gde je moguće
- Observability i KPI event model
- CI quality gates + smoke checks
- Service catalog filtering i stronger conversion paths

## V3 — Platform Growth
- Partner/admin operativni sloj
- White-label readiness
- Jurisdiction readiness matrix
- Enterprise/compliance ekspanzija
- Dedicated landing stranice po nameri i dublji knowledge hub

## V2.5 — Intent Growth Layer
- Licensing, institutional i partner onboarding landing stranice
- Funnel-level analytics (`data-intent`, `data-funnel-stage`)
- CI merge-gate proširen na sve javne stranice
- Multi-endpoint post-deploy smoke checks

## V2.6 — Trust + Qualification Layer
- `trust-center.html` kao governance/data-source/policy hub
- Dublji services filteri: readiness, regulatory dependency, integration complexity
- Kvalifikovani intake podaci: company size, timeline, budget tier, delivery expectation
- KPI/export helperi za lokalnu funnel analitiku

## V2.7 — Capability + Trust Operating Model
- `services.html` kao centralni capability hub sa decision-assist logikom i vidljivim readiness/regulatory/integration signalima
- `contact.html` kao qualification hub sa intent routing i lightweight scoring modelom
- `trust-center.html` kao claims-policy, proof-architecture i escalation centar
- Analytics segmentacija po intent-u (`general`, `licensing`, `partnership`, `institutional`, `education`)
- Jača veza između javnih trust sekcija i `docs/*` operativnog sloja

## Operativne faze realizacije (repo-wide)

### Faza A — Konsolidacija standarda i konzistentnosti
- Zaključavanje jedinstvenog standarda (`docs/vrh-programskog-ekvivalenta.md`)
- Ujednačen razvojni ciklus i repo-wide DoD
- Usklađivanje javnog sadržaja sa North Star i scope pravilima

### Faza B — Quality/Security gate i observability disciplina
- Obavezni quality gate-ovi pre deploy-a (HTML/link/metadata/content)
- Obavezni security i secret gate pre release-a
- Jedinstvena taksonomija funnel i intent događaja za KPI praćenje

### Faza C — Konverzija, trust signal i operativno skaliranje
- Optimizacija conversion putanja na osnovu KPI signala
- Dalje jačanje trust/compliance sadržaja i formal escalation jasnoće
- Kontinuirani governance ritam (nedeljni kvalitet + mesečna trust revizija)
