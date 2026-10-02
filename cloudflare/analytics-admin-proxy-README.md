# MEasyMate Analytics Admin Proxy V2

Purpose:
- Keep Render `ADMIN_TOKEN` out of public HTML/JS.
- Let the private Admin page read aggregate Central Analytics V2.
- Reuse the existing Cloudflare Access gate on `app.measymate.com/admin`.
- Support `All Products` and per-product summaries.

Required Cloudflare Worker configuration:
- Route: `app.measymate.com/admin/api/analytics/*`
- Variable: `ADMIN_EMAIL` = the allowed owner email
- Secret: `RENDER_ADMIN_TOKEN` = same value as Render service `ADMIN_TOKEN`

Supported scopes:
- all
- caption-studio
- contact-shift
- hanasu
- horajarn
- money
- qingyun
- report-pro

Security:
- Cloudflare Access identity is required.
- Only the configured owner email is allowed.
- Browser never receives the Render admin secret.
- Only GET `/admin/api/analytics/summary` is proxied.
- Project and period use strict allowlists.
- Response caching is disabled.
- No financial/private/free-text content is returned.

Release verification:
- A GitHub commit proves only that the Worker source is updated.
- Verify the live Worker accepts `project_id=all` and `project_id=hanasu` before calling Admin V2 live.
