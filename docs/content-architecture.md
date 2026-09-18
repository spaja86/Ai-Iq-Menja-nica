# Content Architecture

## Standardni model sekcija
1. **Hero** — jasna vrednost i primarni CTA
2. **Trust/Compliance** — transparentnost, rizik, disclaimers
3. **Services/Capabilities** — strukturiran katalog delatnosti
4. **Conversion CTA** — kontakt i partner onboarding
5. **Footer** — ekosistem, bezbednost, formalni kanal

## Pravila konzistentnosti
- Izbegavati kontradiktorne tvrdnje između stranica.
- Demo i simulirani podaci moraju biti eksplicitno označeni.
- Formalni/regulatorni zahtevi uvek imaju prioritetni direktni kanal.

## Intent landing standard
- Namenske landing stranice moraju biti fokusirane na jedan intent (licensing, institutional, partner onboarding).
- Svaka intent landing stranica mora imati tri CTA nivoa: consider (informisanje), engage (intake), convert (formalni kanal).
- CTA elementi na tim stranicama moraju imati `data-intent` i `data-funnel-stage`.

## Status mapiranja (obavezne stranice)
- `index.html`
- `services.html`
- `about.html`
- `contact.html`
- `trade.html`
- `wallet.html`
- `education.html`
- `licensing.html`
- `institutional.html`
- `partner-onboarding.html`
