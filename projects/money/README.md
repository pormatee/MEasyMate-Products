# MEasyMate Money

Project ID: `money`  
Project Display Name: `MEasyMate Money`

## Current Product

- App Version: `F2.1.11`
- Data Schema Version: `3`
- Source of Truth: `projects/money/index.html`
- Public URL: `https://app.measymate.com/money/`
- Deployment: GitHub Actions
- Source model: one main `index.html`

## F2.1.11 Backup UX

- Backup filename now starts with `MEasyMate_Money_BACKUP_`.
- Backup filename includes local date and time.
- UI tells users to look in Downloads.
- The latest backup filename is shown in the app.
- Restore picker remains limited to JSON files where the browser supports filtering.
- Added `Share backup file` using Web Share when supported, with download fallback.
- Data Schema remains `3`.
- Financial calculation logic is unchanged.
- Analytics remains privacy-first; `backup_shared` records only the action, never backup contents.

## Verification

- JavaScript syntax: PASS
- Backup filename format: PASS
- Restore JSON filter: PASS
- Last-backup filename display: PASS
- Share fallback: PASS
- Financial logic: no intentional change
- Real-device Android Backup / Restore UX: UNVERIFIED until tested after deploy
- GitHub Actions deployment for F2.1.11: UNVERIFIED until pushed
