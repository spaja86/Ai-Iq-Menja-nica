# Funnel Map

## Glavni funnel
1. Awareness — `index.html`, `about.html`, `education.html`
2. Consideration — `services.html`, `trust-center.html`, intent landing stranice
3. Qualification — `contact.html` sa profilom, prioritetom, company size, timeline, budget tier i delivery expectation
4. Formal contact — `mailto:` kanal za licensing, institutional i regulatorne zahteve

## Intent tokovi
- Licensing: `index.html` → `licensing.html` → `contact.html?profile=licensing...` → direktni email
- Institutional: `index.html` / `services.html` → `institutional.html` → `contact.html?profile=institutional...` → direktni email
- Partnership: `index.html` / `services.html` → `partner-onboarding.html` → `contact.html?profile=partnership...` → direktni email
- General business: `services.html` → `contact.html?profile=business...`

## Pravila kvalifikacije
- Web forma ostaje lead-qualification i lokalni audit sloj.
- Formalni/regulatorni tokovi moraju nuditi direktni email kanal.
- Novi CTA ka konverziji treba da nosi `data-track`, `data-track-id`, a za intent tokove i `data-intent` + `data-funnel-stage`.
- Services filtering i contact qualification moraju biti merljivi kroz lokalnu analytics taksonomiju.
