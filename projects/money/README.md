# MEasyMate Money

Project ID: `money`  
Project Display Name: `MEasyMate Money`

## Current Product

- App Version: `F2.1.9`
- Data Schema Version: `3`
- Source of Truth: `projects/money/index.html`
- Public URL: `https://app.measymate.com/money/`
- Deployment: GitHub Actions
- Source model: one main `index.html`

## Migration / Standard Status

- Source migration: PASS
- GitHub Actions deployment: PASS for F2.1.9
- Clean public URL: PASS
- Single source of truth: PASS
- Shortcut / PWA identity: PASS
- MEasyMate.com link: PASS
- LINE contact: PASS
- Financial calculation logic regression: no intentional change
- Analytics instrumentation + event allowlist: PASS (local QA)
- Analytics production transport: UNVERIFIED / fail-closed until verified endpoint is configured
- Real-device old-data + refresh/reopen validation after F2.1.9: UNVERIFIED

## Analytics & Privacy

MEasyMate Money follows the rule:

**Measure behavior, not private content.**

Allowed analytics are usage signals only, for example:
- app open
- navigation / feature use
- backup / restore actions
- dream update action
- weekly close action
- anonymous device/browser/app-version signals
- runtime error count without error text

Analytics MUST NOT include:
- income / expense / balance / bill amounts
- transaction details
- notes or free text
- dream names
- uploaded images
- backup contents
- name, email, account or other direct identity

Files:
- `shared/analytics/measymate-analytics.js`
- `projects/money/analytics-config.js`

The transport gate is fail-closed. With no verified endpoint configured, events are counted locally in the browser only and are not sent to a central server.

## Data Safety

MEasyMate Money stores user financial data locally in the browser.

Important:
- Browser storage belongs to the browser/origin.
- LINE in-app browser and Chrome/Safari may keep separate local data.
- Backup / Restore should be used when moving data between browser environments.
- Schema migration must remain backward compatible before future release.

## Current Dream System

Built-in dream presets:
- Home
- Wedding
- Family
- Car
- Business
- Travel
- Security

Each dream uses one image with 5 clarity levels:
- less than 25%
- 25–49%
- 50–74%
- 75–99%
- 100%

Custom dreams support a user-selected image.

## Release Rule

Before the next customer release:

1. Inspect current source first.
2. Keep `APP_VERSION` and `DATA_SCHEMA_VERSION` explicit.
3. Test old data → new version.
4. Test refresh / reopen.
5. Test Backup / Restore.
6. Test Android browser.
7. Verify Analytics allowlist and confirm no private financial content is emitted.
8. Run syntax / regression checks.
9. Push only after PASS evidence.
