# MEasyMate Analytics Admin Proxy V0.1

Purpose:
- Keep Render ADMIN_TOKEN out of public HTML/JS.
- Let the private Admin page read aggregate Central Analytics.
- Reuse the existing Cloudflare Access gate on app.measymate.com/admin.

Required Cloudflare Worker configuration:
- Route: app.measymate.com/admin/api/analytics/*
- Variable: ADMIN_EMAIL = the allowed owner email
- Secret: RENDER_ADMIN_TOKEN = same value as Render service ADMIN_TOKEN

Security:
- Worker fails closed if Cloudflare Access identity is unavailable.
- Worker only permits the configured owner email.
- Browser never receives the Render admin secret.
- Only GET /admin/api/analytics/summary is proxied.
- No financial/private content is returned by the Central Analytics API.
- Response caching is disabled.

Do not enable Money Central Transport until privacy/security/release gates pass.
