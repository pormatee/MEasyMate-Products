# MEasyMate Money

Project ID: `money`  
Project Display Name: `MEasyMate Money`

## Current Product

- App Version: `F2.1.10`
- Data Schema Version: `3`
- Source of Truth: `projects/money/index.html`
- Public URL: `https://app.measymate.com/money/`
- Deployment: GitHub Actions
- Source model: one main `index.html`

## Current Fix

F2.1.10 fixes Backup / Restore behavior on Android / Chrome / PWA:
- Backup download now uses an attached temporary anchor and shows success/error feedback.
- Restore opens the file picker through an explicit `pickRestoreFile()` function instead of relying on an implicit element-id global.
- Restore shows file-checking and cancel feedback.
- Data Schema remains `3`.
- Financial calculation logic is unchanged.
- Analytics privacy allowlist remains unchanged.

## Verification Status

- JavaScript syntax: PASS
- Backup button wiring: PASS
- Restore button wiring: PASS
- Data Schema compatibility: PASS
- Financial calculation logic: no intentional change
- Real-device Android Backup / Restore: UNVERIFIED until tested after deployment
- GitHub Actions deployment for F2.1.10: UNVERIFIED until pushed
