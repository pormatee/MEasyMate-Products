# MEasyMate Money

Project ID: `money`  
Project Display Name: `MEasyMate Money`

## Current Product

- App Version: `F2.1.12`
- Data Schema Version: `3`
- Source of Truth: `projects/money/index.html`
- Public URL: `https://app.measymate.com/money/`
- Deployment: GitHub Actions

## F2.1.12 Pre-Promo System Integration

Integrated:
- Information System V1
- Notice System V1
- Privacy-first Local + Central Analytics
- Local Usage Insights
- System Test Mode: `/money/?test=1`

Test Mode checks Information, Notice, Analytics, Usage Insights and local runtime-error counters without reading financial amounts or private user content.

### Privacy / production gate
- Financial data remains local-first.
- Central analytics transport: ON to verified endpoint `https://measymate-central-analytics.onrender.com/v1/events`.
- Production notices remain OFF by default.
- The test notice is visible only with `?test=1`.

## Verification status
- Static JavaScript syntax: PASS
- Information integration: PASS
- Notice integration: PASS
- Analytics local integration: PASS
- Central Analytics endpoint/security/privacy/allowlist verification: PASS
- Usage Insights integration: PASS
- Normal mode hides test notice/panel: PASS
- Automated Chromium System Test: PASS
- Data Schema compatibility: PASS (Schema 3 unchanged)
- Financial calculation logic: no intentional change
- GitHub live deployment F2.1.12: UNVERIFIED until pushed
- Real-device Android Test Mode: UNVERIFIED until tested after deployment


## Analytics Declaration — Central Pilot

- Analytics Mode: `CENTRAL`
- Shared Core: `shared/analytics/measymate-analytics.js`
- Project Config: `projects/money/analytics-config.js`
- Central Transport: `ON`
- Central Endpoint: `https://measymate-central-analytics.onrender.com/v1/events`
- Private / Financial Content Analytics: `FORBIDDEN`
- Raw Install / Session ID at rest: `NOT STORED` (HMAC hash only)
- Raw IP at rest: `NOT STORED`
- Central Event Retention: `90 days`
- Analytics Failure Mode: `NON-BLOCKING`
- Synthetic/System Test Event: `EXCLUDED FROM USER METRICS`

This project follows MEasyMate Analytics & Privacy Standard V1.1.


### Central transport field fix
- Central transport uses non-blocking `fetch()` for cross-origin JSON delivery.
- `?test=1` sends Central events with the synthetic marker and is excluded from User metrics.
- Analytics transport failure remains non-blocking and must never affect Money core behavior.
