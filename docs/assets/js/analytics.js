// JAC Interiors - lightweight conversion tracking (no hard dependency on a provider)
// Supports (if present): GA4 gtag(), GTM dataLayer, Plausible.
(function () {
  "use strict";

  function safeString(v) {
    return String(v == null ? "" : v).trim();
  }

  function getPathnameFromHref(href) {
    try {
      const u = new URL(href, window.location.href);
      return u.pathname;
    } catch (e) {
      return safeString(href);
    }
  }

  function sendToProviders(eventName, props) {
    const name = safeString(eventName);
    const p = props && typeof props === "object" ? props : {};

    // 1) GA4 gtag
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, p);
      }
    } catch (e) {}

    // 2) GTM dataLayer
    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: name, ...p });
      }
    } catch (e) {}

    // 3) Plausible
    try {
      if (typeof window.plausible === "function") {
        window.plausible(name, { props: p });
      }
    } catch (e) {}

    // 4) Internal hook for debugging / custom listeners
    try {
      window.dispatchEvent(
        new CustomEvent("jac:track", { detail: { event: name, props: p } })
      );
    } catch (e) {}
  }

  // Public API
  window.jacTrack = function (eventName, props) {
    sendToProviders(eventName, props);
  };

  function detectBookCallClick(anchor) {
    if (!anchor) return null;
    const href = safeString(anchor.getAttribute("href"));
    const text = safeString(anchor.textContent).toLowerCase();

    const isIntentCall =
      href.includes("contact.html") && href.includes("intent=call");
    const isBookText = text === "book a call" || text === "book";
    const isKnownClass =
      anchor.classList.contains("nav-cta") ||
      anchor.classList.contains("site-cta-button") ||
      anchor.classList.contains("footer-cta");

    if (!isIntentCall && !isBookText && !isKnownClass) return null;

    let placement = "inline";
    if (anchor.classList.contains("nav-cta")) placement = "nav";
    else if (anchor.classList.contains("site-cta-button")) placement = "site_cta";
    else if (anchor.classList.contains("footer-cta")) placement = "footer_cta";
    else if (anchor.closest("footer")) placement = "footer";
    else if (anchor.closest("nav")) placement = "nav";

    return {
      placement,
      href: getPathnameFromHref(href),
    };
  }

  document.addEventListener(
    "click",
    function (e) {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      const book = detectBookCallClick(a);
      if (book) {
        window.jacTrack("book_call_click", book);
      }
    },
    true
  );
})();

