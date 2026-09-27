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
- `window.aiqAnalyticsOperatingMetrics()` — qualified inbound inquiries, completion rate, intent CTA CTR, local-vs-formal ratio, lead segment quality i monetization tier counts
- `window.aiqAnalyticsExport()` — JSON eksport
- `window.aiqAnalyticsExport('csv')` — CSV eksport

## Operating-model metrike
- `qualifiedInboundInquiries` računa submit/redirect događaje sa `intentScore >= 40`.
- `contactFlowCompletionRate` poredi broj jedinstvenih završenih inquiry događaja (`contact_general_submit` + `contact_formal_redirect`, preko `inquiryId`) sa sirovim brojem `form_submit_attempt`.
- `ctaCtrByIntent` meri licensing, institutional i partnership CTA klikove u odnosu na page-view signal za isti intent.
- `localVsFormal` pokazuje odnos kvalifikovanih lokalnih submit-a (`contact_general_submit` sa `intentScore >= 40`) prema `contact_formal_redirect`.
- `leadSegmentQuality` daje prosečan intent score, qualified rate i high-intent rate po intent segmentu.
- `monetizationTiers` grupiše leadove u `entry`, `growth`, `enterprise` i `strategic` sloj prema intent-u, subject-u i delivery očekivanju.

## Kvalifikacioni payload standard
- `contact_intake_update`, `contact_general_submit` i `contact_formal_redirect` sada nose `intent` i `intentScore`.
- Završni inquiry događaji (`contact_general_submit`, `contact_formal_redirect`) nose i `inquiryId` za deduplikaciju completion metrike.
- `recommendedChannel` razlikuje `qualified-web-form` od `direct-formal` routinga.
- Intent score služi kao lightweight signal koliko je inquiry definisan za business ili formalni nastavak.
