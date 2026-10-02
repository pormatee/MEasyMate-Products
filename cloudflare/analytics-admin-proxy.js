/* MEasyMate Analytics Admin Proxy V2 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {"allow":"GET","cache-control":"no-store"}
      });
    }

    if (url.pathname !== "/admin/api/analytics/summary") {
      return new Response("Not Found", {
        status: 404,
        headers: {"cache-control":"no-store"}
      });
    }

    if (!ctx.access) {
      return new Response("Access identity missing", {
        status: 403,
        headers: {"cache-control":"no-store"}
      });
    }

    let identity = null;
    try {
      identity = await ctx.access.getIdentity();
    } catch (_) {
      return new Response("Access identity invalid", {
        status: 403,
        headers: {"cache-control":"no-store"}
      });
    }

    const email = String(identity?.email || "").toLowerCase();
    const allowedEmail = String(env.ADMIN_EMAIL || "").toLowerCase();
    if (!email || !allowedEmail || email !== allowedEmail) {
      return new Response("Forbidden", {
        status: 403,
        headers: {"cache-control":"no-store"}
      });
    }

    const projects = new Set([
      "all",
      "caption-studio",
      "contact-shift",
      "hanasu",
      "horajarn",
      "money",
      "qingyun",
      "report-pro",
      "talknow"
    ]);
    const periods = new Set(["1d","7d","30d","90d","all"]);

    const projectId = url.searchParams.get("project_id") || "all";
    const period = url.searchParams.get("period") || "30d";

    if (!projects.has(projectId)) {
      return new Response(
        JSON.stringify({ok:false,error:"invalid_project"}),
        {
          status:400,
          headers:{
            "content-type":"application/json; charset=utf-8",
            "cache-control":"no-store",
            "x-content-type-options":"nosniff"
          }
        }
      );
    }

    if (!periods.has(period)) {
      return new Response(
        JSON.stringify({ok:false,error:"invalid_period"}),
        {
          status:400,
          headers:{
            "content-type":"application/json; charset=utf-8",
            "cache-control":"no-store",
            "x-content-type-options":"nosniff"
          }
        }
      );
    }

    const renderToken = String(env.RENDER_ADMIN_TOKEN || "").trim();
    if (!renderToken) {
      return new Response("Proxy secret not configured", {
        status: 503,
        headers: {"cache-control":"no-store"}
      });
    }

    const upstream = new URL(
      "https://measymate-central-analytics.onrender.com/v1/summary"
    );
    upstream.searchParams.set("project_id", projectId);
    upstream.searchParams.set("period", period);

    let response;
    try {
      response = await fetch(upstream.toString(), {
        method: "GET",
        headers: {
          "authorization": "Bearer " + renderToken,
          "accept": "application/json"
        },
        redirect: "follow"
      });
    } catch (_) {
      return new Response(
        JSON.stringify({ok:false,error:"central_analytics_unavailable"}),
        {
          status: 502,
          headers:{
            "content-type":"application/json; charset=utf-8",
            "cache-control":"no-store"
          }
        }
      );
    }

    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
      }
    });
  }
};
