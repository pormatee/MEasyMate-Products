# MEasyMate Caption Studio

Project ID: `caption-studio`
Source of Truth: `pormatee/MEasyMate-Products/projects/caption-studio/`
Sale candidate: `V2.13.37 SALE RC23`

## Official support

- Android + Google Chrome
- Customer delivery target: `https://app.measymate.com/caption-studio/`
- Local HTML / `content://` is not the customer release path
- Local-first core with HTTPS service-worker offline cache

## Product

- 1–3 images
- Beginner / Standard / Advance
- Caption Library / Favorite / Hide / Restore / My Caption
- Caption Pack Manager
- Backup / Restore
- Signed Activation + License Passport
- 2 Pack = 59 THB
- 3 Pack = 69 THB
- Full = 99 THB
- V1 has no AI

## Activation security

Customer source contains public verification keys only. Seller private signing key is external and must never be committed or shipped with the customer app.

Supported verification key IDs:
- `cs-prod-2026-00`
- `cs-prod-2026-01`
- `cs-prod-2026-02`
- `cs-prod-2026-03`

## Release gate

`PRE_GIT_AUDIT`: PASS only after the release script completes its checks.

`PRE_RELEASE_AUDIT`: PENDING LIVE FINAL TEST.

Do not label this build `SALE CURRENT` until the live HTTPS URL passes:
1. load/version check
2. FULL signed activation on the live origin
3. restart persistence
4. share to LINE on Chrome
5. License Passport export/import
6. offline reload after one online load

After those pass, promote `V2.13.37` to `SALE CURRENT`.
