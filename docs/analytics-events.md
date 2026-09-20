# Analytics Events

## Core događaji
- `page_view`
- `conversion_path_click`
- `external_or_action_link_click`
- `button_click`
- `form_submit_attempt`

## Intent / funnel događaji
- `homepage_path_click`
- `homepage_hero_click`
- `homepage_trust_click`
- `intent_cta_click`
- `service_cta_click`
- `services_catalog_filter`
- `services_hub_click`
- `contact_intent_navigation`
- `contact_support_navigation`
- `contact_intake_update`
- `contact_general_submit`
- `contact_formal_redirect`

## KPI helperi
- `window.aiqAnalyticsSummary()` — broj događaja po imenu
- `window.aiqAnalyticsKpis()` — page views, path clicks, service interest, form attempts, general submits, formal redirects
- `window.aiqAnalyticsIntentKpis()` — KPI pregled po intent-u (`general`, `licensing`, `partnership`, `institutional`, `education`)
- `window.aiqAnalyticsIntentScore(intent)` — ponderisani engagement score za konkretan intent
- `window.aiqAnalyticsExport()` — JSON eksport
- `window.aiqAnalyticsExport('csv')` — CSV eksport

## Kvalifikacioni payload standard
- `contact_intake_update`, `contact_general_submit` i `contact_formal_redirect` sada nose `intent` i `intentScore`.
- `recommendedChannel` razlikuje `qualified-web-form` od `direct-formal` routinga.
- Intent score služi kao lightweight signal koliko je inquiry definisan za business ili formalni nastavak.
