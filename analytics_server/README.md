# MEasyMate Central Analytics Backend V0.1

Anonymous behavior-only analytics backend.

Stored:
- project/version/event/timestamps
- HMAC-hashed anonymous install/session IDs
- coarse device/browser/OS

Never stored:
- financial values
- free text / metadata
- names, phone, email
- images, backups, files
- raw install/session IDs
- IP address

Endpoints:
- GET /health
- POST /v1/events
- GET /v1/summary (Bearer ADMIN_TOKEN)

Render:
- Build: pip install -r analytics_server/requirements.txt
- Start: uvicorn analytics_server.app:app --host 0.0.0.0 --port $PORT --no-access-log

Required env:
- DATABASE_URL
- INSTALL_HASH_SALT
- ADMIN_TOKEN
- ALLOWED_ORIGINS=https://app.measymate.com

Money CENTRAL_TRANSPORT must remain OFF until endpoint/security/privacy tests pass.
