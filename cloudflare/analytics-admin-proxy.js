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

    const periods = new Set(["1d","7d","30d","90d","all"]);
    const requested = url.searchParams.get("period");
    const period = periods.has(requested) ? requested : "30d";

    if (!env.RENDER_ADMIN_TOKEN) {
      return new Response("Proxy secret not configured", {
        status: 503,
        headers: {"cache-control":"no-store"}
      });
    }

    const upstream = new URL(
      "https://measymate-central-analytics.onrender.com/v1/summary"
    );
    upstream.searchParams.set("project_id", "money");
    upstream.searchParams.set("period", period);

    let response;
    try {
      response = await fetch(upstream.toString(), {
        method: "GET",
        headers: {
          "authorization": "Bearer " + env.RENDER_ADMIN_TOKEN,
          "accept": "application/json"
        },
        redirect: "error"
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
