# PR Summary
- Scope:
- Impact:
- Risk:
- Central hub:
- KPI signal:
- Capability / Qualification / Governance mapping:

# Development Cycle (mandatory)
- [ ] Plan
- [ ] Implementation (small, focused changes)
- [ ] Validation
- [ ] Documentation
- [ ] Release readiness

# Repo-wide DoD Checklist (mandatory)
- [ ] Developer + Create remain one operating flow under `MONTEZACIJA NAD MONTEZACIJAMA`
- [ ] Change is mapped to capability, qualification, or governance and to the relevant central hub
- [ ] Shared/page-level boundary preserved (global behavior in shared layer, page logic isolated)
- [ ] Shared navigation/i18n consistency preserved (`data-i18n` + shared table updates where needed)
- [ ] New conversion CTA uses `data-track` + `data-track-id`
- [ ] Intent CTA (if any) uses `data-intent` + `data-funnel-stage`
- [ ] Demo/simulated signals are explicit where data is not live
- [ ] Formal/regulatory flow keeps direct `mailto:` channel where applicable
- [ ] Public pages keep canonical + OG metadata consistency
- [ ] CI quality/security gates are green (HTML, metadata/content governance, links, secret scan, smoke checks)
- [ ] Decision trace updated: `docs/decision-log.md` (odluka, uticaj, rizik, status)

# Verification
- Tests/checks run:
- Result:
- Final merge/release criterion met: quality, security, funnel measurement, trust signal, and documentation trace aligned

# Related Docs Updates
- [ ] `docs/decision-log.md`
- [ ] Relevant domain docs (`docs/qa-strategy.md`, `docs/content-rules.md`, `docs/funnel-map.md`, etc.)
