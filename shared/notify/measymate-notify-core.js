/*
 * MEasyMate Notify Core V1
 * Safe shared notification renderer.
 * It does not modify project user data.
 */
(() => {
  "use strict";

  const GLOBAL = Array.isArray(window.MEasyMateGlobalNotices)
    ? window.MEasyMateGlobalNotices
    : [];
  const PROJECT = Array.isArray(window.MEasyMateProjectNotices)
    ? window.MEasyMateProjectNotices
    : [];

  const priorityRank = {
    urgent: 600,
    maintenance: 500,
    warning: 400,
    promotion: 300,
    news: 200,
    info: 100
  };

  function projectId() {
    const meta = document.querySelector('meta[name="measymate-project-id"]');
    return meta?.content?.trim() || "unknown";
  }

  function nowMs() {
    return Date.now();
  }

  function validDate(value, fallback) {
    if (!value) return fallback;
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : fallback;
  }

  function isActive(item, pid) {
    if (!item || item.enabled !== true || !item.id) return false;

    const scope = String(item.scope || "all");
    if (scope !== "all" && scope !== pid) return false;

    const now = nowMs();
    const start = validDate(item.start_at, -Infinity);
    const end = validDate(item.end_at, Infinity);
    if (now < start || now > end) return false;

    try {
      if (localStorage.getItem(`measymate_notice_dismissed_${item.id}`) === "1") {
        return false;
      }
    } catch (_) {
      // Storage failure must never block the app.
    }

    return true;
  }

  function rank(item) {
    const explicit = Number(item.priority);
    const typeRank = priorityRank[String(item.type || "info")] || 0;
    return (Number.isFinite(explicit) ? explicit : 0) * 1000 + typeRank;
  }

  function dismiss(id, node) {
    try {
      localStorage.setItem(`measymate_notice_dismissed_${id}`, "1");
    } catch (_) {
      // Ignore storage failure.
    }
    node?.remove();
  }

  function ensureStyles() {
    if (document.getElementById("measymate-notify-style")) return;
    const style = document.createElement("style");
    style.id = "measymate-notify-style";
    style.textContent = `
      #measymate-notify-container{
        position:relative;z-index:9999;width:100%;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      .mm-notice{
        box-sizing:border-box;margin:0 auto 8px;padding:12px 14px;
        max-width:980px;border-radius:12px;background:#fff;
        box-shadow:0 4px 18px rgba(12,30,49,.12);
        border:1px solid rgba(41,154,199,.22);color:#0C1E31;
        display:flex;gap:12px;align-items:flex-start;
      }
      .mm-notice-main{flex:1;min-width:0}
      .mm-notice-title{font-weight:700;margin:0 0 3px}
      .mm-notice-message{margin:0;line-height:1.45;white-space:pre-wrap}
      .mm-notice-close{
        border:0;background:transparent;font-size:22px;line-height:1;
        cursor:pointer;color:#0C1E31;padding:0 2px;
      }
      .mm-notice[data-type="urgent"],
      .mm-notice[data-type="maintenance"],
      .mm-notice[data-type="warning"]{border-width:2px}
    `;
    document.head.appendChild(style);
  }

  function renderItem(item, container) {
    const card = document.createElement("section");
    card.className = "mm-notice";
    card.dataset.type = String(item.type || "info");
    card.setAttribute("role", item.type === "urgent" ? "alert" : "status");

    const main = document.createElement("div");
    main.className = "mm-notice-main";

    const title = document.createElement("div");
    title.className = "mm-notice-title";
    title.textContent = String(item.title || "MEasyMate");

    const message = document.createElement("p");
    message.className = "mm-notice-message";
    message.textContent = String(item.message || "");

    main.append(title, message);
    card.appendChild(main);

    if (item.dismissible !== false) {
      const close = document.createElement("button");
      close.className = "mm-notice-close";
      close.type = "button";
      close.setAttribute("aria-label", "ปิดประกาศ");
      close.textContent = "×";
      close.addEventListener("click", () => dismiss(item.id, card));
      card.appendChild(close);
    }

    container.appendChild(card);
  }

  function render() {
    const pid = projectId();
    const items = [...GLOBAL, ...PROJECT]
      .filter(item => isActive(item, pid))
      .sort((a, b) => rank(b) - rank(a))
      .slice(0, 3);

    let container = document.getElementById("measymate-notify-container");

    if (!items.length) {
      container?.remove();
      return;
    }

    ensureStyles();

    if (!container) {
      container = document.createElement("div");
      container.id = "measymate-notify-container";
      container.setAttribute("aria-live", "polite");
      document.body.prepend(container);
    } else {
      container.replaceChildren();
    }

    items.forEach(item => renderItem(item, container));
  }

  window.MEasyMateNotify = Object.freeze({ render });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render, { once: true });
  } else {
    render();
  }
})();
