/**
 * Cities We Serve: on-card hover rotate images pulled from linked city pages.
 *
 * Behavior:
 * - For each region card (".project-list-item"), gather linked city pages (href starting with "cities/").
 * - On first hover, fetch those pages (cached), extract a representative image per city (prefer hero).
 * - While hovered, rotate the card's visible image through the collected URLs.
 * - On mouse leave, stop rotation and restore the original image.
 */
(() => {
  /** @type {WeakMap<Element, Promise<string[]>>} */
  const urlsPromiseByCard = new WeakMap();
  /** @type {WeakMap<Element, {timer: number | null, idx: number, active: boolean, urls: string[]}>} */
  const rotationStateByCard = new WeakMap();

  const ROTATE_EVERY_MS = 1400;
  const FADE_MS = 220;
  const MAX_URLS = 30;
  const PER_CITY_MAX = 3;
  const FETCH_CONCURRENCY = 4;
  const DEBUG = new URLSearchParams(window.location.search).has("debugCities");

  const R2_BASE = (() => {
    const base = (window.R2_IMAGE_BASE || "https://jacinteriorscdn.com").toString().replace(/\/+$/, "");
    try {
      return new URL(base);
    } catch {
      return null;
    }
  })();

  // Handy in case you want to confirm load in DevTools.
  window.__citiesWeServeHoverRotatorLoaded = true;

  function debugLog(...args) {
    if (!DEBUG) return;
    // eslint-disable-next-line no-console
    console.warn("[cities-we-serve-rotator]", ...args);
  }

  function isLikelyRealPhotoUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    if (lower.includes("jac-logo")) return false;
    if (lower.includes("logo")) return false;
    if (lower.includes("icon")) return false;
    if (lower.includes("favicon")) return false;
    if (lower.includes("navbar")) return false;
    if (lower.includes("sprite")) return false;
    return /\.(avif|webp|png|jpe?g)(\?|#|$)/i.test(lower) || lower.startsWith("http");
  }

  function uniqueCompact(list) {
    const seen = new Set();
    const out = [];
    for (const item of list) {
      if (!item) continue;
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
    return out;
  }

  function isR2Url(url) {
    if (!url) return false;
    try {
      const u = new URL(url, window.location.href);
      if (R2_BASE && u.host === R2_BASE.host) return true;
      // Fallback: handle hardcoded domain even if R2_BASE isn't set/parseable.
      return u.host === "jacinteriorscdn.com";
    } catch {
      return false;
    }
  }

  function extractCandidateImageUrls(doc, baseUrl) {
    /** @type {string[]} */
    const urls = [];

    const pickFromSelector = (selector, limit) => {
      const els = Array.from(doc.querySelectorAll(selector));
      for (const el of els) {
        const src = el.getAttribute("src") || "";
        if (!src) continue;
        const abs = new URL(src, baseUrl).toString();
        if (!isLikelyRealPhotoUrl(abs)) continue;
        urls.push(abs);
        if (urls.length >= limit) return true;
      }
      return false;
    };

    // Prefer explicit city hero image (newer city template).
    pickFromSelector(".city-hero-media img[src]", 4);

    // Older city pages: parallax/section images.
    pickFromSelector(".parallax-image img[src]", 4);

    // Additional: allow project/space images embedded on the city page.
    pickFromSelector('img[src*="assets/images/projects/"], img[src*="assets/images/spaces/"]', 6);

    // Fallback: any non-logo images in the main content.
    pickFromSelector("main img[src], section img[src]", 8);

    const uniq = uniqueCompact(urls);
    const r2Only = uniq.filter(isR2Url);
    return r2Only.length ? r2Only : uniq;
  }

  async function fetchCityPageImageUrls(href) {
    const pageUrl = new URL(href, window.location.href);
    const res = await fetch(pageUrl.toString(), { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Failed to fetch ${pageUrl} (${res.status})`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return extractCandidateImageUrls(doc, pageUrl);
  }

  async function mapLimit(items, limit, mapper) {
    /** @type {any[]} */
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
      while (true) {
        const idx = nextIndex;
        nextIndex += 1;
        if (idx >= items.length) return;
        try {
          results[idx] = await mapper(items[idx], idx);
        } catch (e) {
          results[idx] = null;
        }
      }
    }

    const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
  }

  function getCityLinksForCard(card) {
    const links = Array.from(card.querySelectorAll(".city-tags-container a[href]"));
    return links
      .map((a) => a.getAttribute("href") || "")
      .map((href) => href.trim())
      .filter(Boolean)
      .filter((href) => href.startsWith("cities/")); // ignore project links, etc.
  }

  function getFallbackUrlsFromExistingCardImages(card) {
    const imgs = Array.from(card.querySelectorAll(".project-list-image img[src]"));
    const urls = imgs
      .map((img) => img.getAttribute("src") || "")
      .map((src) => new URL(src, window.location.href).toString())
      .filter(isLikelyRealPhotoUrl);
    return uniqueCompact(urls).slice(0, MAX_URLS);
  }

  function getDisplayImageEl(card) {
    const container = card.querySelector(".project-list-image");
    if (!container) return null;
    // Use the first image as the single display surface.
    const firstImg = container.querySelector("img");
    if (!firstImg) return null;
    firstImg.style.position = "absolute";
    firstImg.style.top = "0";
    firstImg.style.left = "0";
    firstImg.style.width = "100%";
    firstImg.style.height = "100%";
    firstImg.style.objectFit = "cover";
    firstImg.style.transition = `opacity ${FADE_MS}ms ease`;
    firstImg.style.opacity = "1";

    // Hide any other images already present in the markup to avoid stacking conflicts.
    const rest = Array.from(container.querySelectorAll("img")).slice(1);
    for (const img of rest) {
      img.style.display = "none";
    }
    return firstImg;
  }

  function ensureUrlsPromise(card) {
    const existing = urlsPromiseByCard.get(card);
    if (existing) return existing;

    const promise = (async () => {
      const cityLinks = getCityLinksForCard(card);
      if (cityLinks.length === 0) return getFallbackUrlsFromExistingCardImages(card);

      const lists = await mapLimit(cityLinks, FETCH_CONCURRENCY, async (href) => {
        try {
          return await fetchCityPageImageUrls(href);
        } catch (e) {
          return null;
        }
      });

      /** @type {string[]} */
      const flattened = [];
      let sawR2 = false;
      for (const list of lists) {
        if (!list || !list.length) continue;
        const r2InCity = list.filter(isR2Url);
        const usable = r2InCity.length ? r2InCity : list;
        if (r2InCity.length) sawR2 = true;
        flattened.push(...usable.slice(0, PER_CITY_MAX));
        if (flattened.length >= MAX_URLS) break;
      }

      let urls = uniqueCompact(flattened).slice(0, MAX_URLS);

      // If any linked city yields R2 images, only rotate through R2 images (no local mixes).
      if (sawR2) {
        const r2Only = urls.filter(isR2Url);
        if (r2Only.length) urls = r2Only;
      }
      return urls.length ? urls : getFallbackUrlsFromExistingCardImages(card);
    })();

    urlsPromiseByCard.set(card, promise);
    return promise;
  }

  function getRotationState(card) {
    let st = rotationStateByCard.get(card);
    if (!st) {
      st = { timer: null, idx: 0, active: false, urls: [] };
      rotationStateByCard.set(card, st);
    }
    return st;
  }

  function fadeSwap(img, nextSrc) {
    img.style.opacity = "0";
    window.setTimeout(() => {
      img.src = nextSrc;
      img.style.opacity = "1";
    }, FADE_MS);
  }

  function ensureInterval(img, state) {
    if (state.timer) return;
    if (!state.urls || state.urls.length < 2) return;
    state.timer = window.setInterval(() => {
      if (!state.active) return;
      if (!state.urls || state.urls.length < 2) return;
      state.idx = (state.idx + 1) % state.urls.length;
      fadeSwap(img, state.urls[state.idx]);
    }, ROTATE_EVERY_MS);
  }

  async function startRotation(card) {
    const state = getRotationState(card);
    if (state.active) return;
    state.active = true;

    const img = getDisplayImageEl(card);
    if (!img) return;

    const originalSrc = img.getAttribute("data-original-src") || img.src;
    if (!img.getAttribute("data-original-src")) {
      img.setAttribute("data-original-src", originalSrc);
    }

    // Start quickly with existing card images (so hover feels instant),
    // then swap to city-page-derived images once fetched.
    const fallbackUrls = getFallbackUrlsFromExistingCardImages(card);
    if (fallbackUrls.length >= 2) {
      state.urls = fallbackUrls;
      state.idx = (Math.floor(Date.now() / 1000) + state.urls.length) % state.urls.length;
      fadeSwap(img, state.urls[state.idx]);
      ensureInterval(img, state);
      debugLog("started fallback rotation", { count: state.urls.length });
    }

    try {
      const urls = await ensureUrlsPromise(card);
      if (!state.active) return; // hover ended while loading
      if (!urls || urls.length < 2) return;

      state.urls = urls;
      state.idx = (Math.floor(Date.now() / 1000) + state.urls.length) % state.urls.length;
      fadeSwap(img, state.urls[state.idx]);
      ensureInterval(img, state);
      debugLog("switched to city-page rotation", { count: state.urls.length });
    } catch (err) {
      debugLog("failed to load city-page images", err);
    }
  }

  function stopRotation(card) {
    const state = getRotationState(card);
    state.active = false;
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }

    const img = card.querySelector(".project-list-image img");
    if (!img) return;
    const originalSrc = img.getAttribute("data-original-src");
    if (originalSrc) {
      img.style.opacity = "1";
      img.src = originalSrc;
    }
  }

  function init() {
    const cards = Array.from(document.querySelectorAll(".project-list-item"));
    debugLog("init", { cards: cards.length });
    for (const card of cards) {
      // Prime display image styling and hide any stacked images.
      getDisplayImageEl(card);

      // Use pointer events where available; keep mouse events as fallback.
      card.addEventListener("pointerenter", () => startRotation(card));
      card.addEventListener("pointerleave", () => stopRotation(card));
      card.addEventListener("mouseenter", () => startRotation(card));
      card.addEventListener("mouseleave", () => stopRotation(card));

      // Keyboard accessibility: rotate on focus too.
      card.addEventListener("focusin", () => startRotation(card));
      card.addEventListener("focusout", () => stopRotation(card));
    }

    // Robust delegation: if something prevents pointerenter on the card itself,
    // this still triggers when hovering any child inside the card.
    /** @type {Element | null} */
    let activeCard = null;

    document.addEventListener(
      "pointerover",
      (e) => {
        const target = e.target && /** @type {any} */ (e.target);
        const card = target && typeof target.closest === "function" ? target.closest(".project-list-item") : null;
        if (!card) return;
        if (activeCard === card) return;
        if (activeCard) stopRotation(activeCard);
        activeCard = card;
        startRotation(card);
      },
      true
    );

    document.addEventListener(
      "pointerout",
      (e) => {
        if (!activeCard) return;
        const related = e.relatedTarget;
        if (related && activeCard.contains(related)) return;
        const target = e.target && /** @type {any} */ (e.target);
        const fromCard = target && typeof target.closest === "function" ? target.closest(".project-list-item") : null;
        if (fromCard !== activeCard) return;
        stopRotation(activeCard);
        activeCard = null;
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

