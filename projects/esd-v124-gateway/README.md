# ESD API Gateway (V1.2.4 candidate)

Node >=20. No external npm dependencies. Keeps GAS URL & shared gateway secret on SERVER only.

Variables: `ESD_GAS_DEPLOYMENT_URL` (the **new** GAS deployment version with `doPost`), `ESD_GATEWAY_SECRET` (must match GAS Script Property, >=32 chars), `ESD_ALLOWED_ORIGINS` (default https://app.measymate.com), `PORT`.

Do not deploy production until the read-only endpoint and role-permission tests pass. Never store an Admin password or PIN in environment variables, config.js, logs, or GitHub. Never log request bodies.

The Apps Script `doPost` ContentService output redirects to `script.googleusercontent.com`; Node fetch follows redirects.
