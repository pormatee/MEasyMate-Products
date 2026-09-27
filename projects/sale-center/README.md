# MEasyMate Sale Center V1

Private seller web for MEasyMate. V1 makes Caption Studio activation issuance usable from a browser without opening Termux for each sale.

## Current live product adapter
Caption Studio RC25 / entitlementVersion 1 / code prefix `MMCSA1`.

The signer defaults to key ID `cs-prod-2026-00`, matching the existing production verification public key already present in Caption Studio.

## Security
- Private signing JWK is NEVER stored in HTML/JS or Git.
- Private key is read only from Render environment variable `CAPTION_SIGNING_KEY_JWK_B64`.
- Server verifies that the private key's public x/y matches `cs-prod-2026-00` before signing.
- Login uses `ADMIN_PASSWORD`.
- Sessions are HMAC-signed HttpOnly + Secure + SameSite=Strict cookies.
- Same-origin POST check.
- Login rate limit (memory, 8 failed attempts / 10 min).
- Strict CSP; no third-party JS/CSS.

## Required Render environment variables
- `ADMIN_PASSWORD` = private admin login password
- `SESSION_SECRET` = long random secret (32+ bytes)
- `CAPTION_SIGNING_KEY_JWK_B64` = Base64 of the existing Termux private JWK
- `CAPTION_KEY_ID` = `cs-prod-2026-00` (optional; default is already 00)

## One-time key preparation on Termux
Do NOT paste the private JWK into chat or Git.

Run this on your phone to produce the value to paste directly into Render Environment:
```sh
base64 -w0 ~/.measymate-caption-studio-offline/private.jwk
echo
```

Paste that result only into Render's `CAPTION_SIGNING_KEY_JWK_B64` secret field.

## Render deployment from MEasyMate-Products
Put this directory at:
`projects/sale-center/`

Build command:
`cd projects/sale-center && npm run check`

Start command:
`cd projects/sale-center && npm start`

Recommended region: Singapore.

## Sale flow
Login → customer → Installation ID → 2 Pack / 3 Pack / Full → select categories → Create Activation Code → Copy to customer.

2 Pack requires exactly 2 categories.
3 Pack requires exactly 3 categories.
Full automatically grants all 5 categories.

A newly issued activation is a complete entitlement snapshot, so an Upgrade should include all categories the customer must own after the upgrade.
