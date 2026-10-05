# QingYun Commercial V1 — Sale Policy

TRIAL: 7 days full access
LAUNCH_PRICE: 79 THB one-time
V1_LICENSE: permanent after activation
V2_UPGRADE: free for LAUNCH_79 entitlement
BUY_CHANNEL: LINE https://lin.ee/T80LRHU
ACTIVATION: Installation ID + ECDSA P-256 signed activation code
KEY_ID: 5cfd0fb222332b17

## Customer flow
1. Open Commercial V1; 7-day full trial starts on first use.
2. Trial exposes all 27 Missions / 4 Levels / Work Chinese.
3. Customer taps Unlock, copies the order message and Installation ID, and contacts LINE.
4. Seller confirms payment, generates a signed code, and sends it to the customer.
5. Customer pastes the code once; V1 becomes permanent and V2-free entitlement is stored.
6. Trial expiry never deletes learning progress.

## Security boundary
- Private signing key is outside Git: `/data/data/com.termux/files/home/.measymate/keys/qingyun-commercial-v1-private.pem`.
- Public P-256 key only is embedded in the app.
- License verification works offline after activation.
- The first commercial release uses a local trial clock. Clearing all site data can restart a local-only trial; server-backed trial registry is deferred because it adds backend risk and is not required for the 79 THB launch.
- Static-web licensing is a commercial deterrent, not tamper-proof DRM.
- Trial override query parameters are accepted only on localhost / 127.0.0.1 field-test hosts; production URLs ignore them.

## Release rule
Branch push is not Customer Release.
The sale/license UI must pass a fresh Android field test and PRE_RELEASE_AUDIT before promotion to customer production.
