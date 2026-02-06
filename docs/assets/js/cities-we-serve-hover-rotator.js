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

  const ROTATE_EVERY_MS = 1600;
  const FADE_MS = 260;
  const MAX_URLS = 80;
  const PER_CITY_MAX = 12;
  const FETCH_CONCURRENCY = 4;
  const PRELOAD_AHEAD = 4;
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

  function encodeName(name) {
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  function expandProjectSequence(url, max = 16) {
    // https://.../projects/<folder>/<stem>-<n>.jpg  -> expand in same folder
    try {
      const u = new URL(url, window.location.href);
      const m = u.pathname.match(/^\/projects\/([^/]+)\/(.+)-(\d+)\.(jpe?g|png|webp)$/i);
      if (!m) return [url];
      const folder = m[1];
      const stem = m[2];
      const n = Number(m[3]);
      const ext = m[4];
      const base = `${u.origin}/projects/${folder}/`;
      const out = [];
      for (let i = 1; i <= max; i += 1) {
        out.push(`${base}${encodeName(`${stem}-${i}.${ext}`)}`);
      }
      // Keep original near the front
      if (Number.isFinite(n) && n >= 1 && n <= max) {
        const originalIdx = n - 1;
        const originalUrl = out[originalIdx];
        out.splice(originalIdx, 1);
        out.unshift(originalUrl);
      }
      return out;
    } catch {
      return [url];
    }
  }

  function toR2UrlIfPossible(absUrl) {
    if (!absUrl) return absUrl;
    if (isR2Url(absUrl)) return absUrl;
    if (!R2_BASE) return absUrl;
    try {
      const u = new URL(absUrl, window.location.href);
      const m = u.pathname.match(/\/assets\/images\/(projects|spaces)\/([^/]+)\/([^?#]+)$/);
      if (m) {
        const type = m[1];
        const key = m[2];
        const filename = m[3];
        return `${R2_BASE.origin}/${type}/${key}/${encodeName(filename)}`;
      }

      const c = u.pathname.match(/\/assets\/images\/cities\/([^?#]+)$/);
      if (c) {
        const filename = c[1];
        return `${R2_BASE.origin}/cities/${encodeName(filename)}`;
      }

      return absUrl;
    } catch {
      return absUrl;
    }
  }

  function extractCandidateImageUrls(doc, baseUrl) {
    /** @type {string[]} */
    const urls = [];

    const pickFromSelector = (selector, limit) => {
      const els = Array.from(doc.querySelectorAll(selector));
      for (const el of els) {
        const localSrc = (el.getAttribute("data-r2-local-src") || "").trim();
        const src = localSrc || (el.getAttribute("src") || "").trim();
        if (!src) continue;
        const abs = localSrc ? new URL(src, window.location.href).toString() : new URL(src, baseUrl).toString();
        if (!isLikelyRealPhotoUrl(abs)) continue;
        urls.push(toR2UrlIfPossible(abs));
        if (urls.length >= limit) return true;
      }
      return false;
    };

    // Prefer explicit city hero image (newer city template).
    pickFromSelector(".city-hero-media img[src]", 40);

    // Older city pages: parallax/section images.
    pickFromSelector(".parallax-image img[src]", 60);

    // Fallback: any non-logo images in the main content.
    pickFromSelector("main img[src], section img[src]", 120);

    const uniq = uniqueCompact(urls);
    const r2Only = uniq.filter(isR2Url);
    // If this city yields any R2-mapped URLs, only return those.
    const baseList = r2Only.length ? r2Only : uniq;

    // If we only have 1 image for this city, try to expand a projects/<...>/<...>-N.ext sequence.
    if (baseList.length === 1 && isR2Url(baseList[0]) && baseList[0].includes("/projects/")) {
      return uniqueCompact(expandProjectSequence(baseList[0], 16));
    }

    return baseList;
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

  async function validateUrls(urls, limit = MAX_URLS) {
    const sliced = urls.slice(0, limit);
    const results = await mapLimit(sliced, 6, async (u) => {
      try {
        const ok = await preload(u);
        return ok ? u : null;
      } catch {
        return null;
      }
    });
    return results.filter(Boolean);
  }

  function getCityLinksForCard(card) {
    const links = Array.from(card.querySelectorAll(".city-tags-container a[href]"));
    return links
      .map((a) => a.getAttribute("href") || "")
      .map((href) => href.trim())
      .filter(Boolean)
      .filter((href) => href.startsWith("cities/")); // ignore project links, etc.
  }

  function getProjectLinksForCard(card) {
    const links = Array.from(card.querySelectorAll(".city-tags-container a[href]"));
    return links
      .map((a) => a.getAttribute("href") || "")
      .map((href) => href.trim())
      .filter(Boolean)
      .filter((href) => href.startsWith("projects/"));
  }

  function getFallbackUrlsFromExistingCardImages(card) {
    const imgs = Array.from(card.querySelectorAll(".project-list-image img[src]"));
    const urls = imgs
      .map((img) => img.getAttribute("src") || "")
      .map((src) => new URL(src, window.location.href).toString())
      .filter(isLikelyRealPhotoUrl);
    return uniqueCompact(urls).map(toR2UrlIfPossible).slice(0, MAX_URLS);
  }

  function getImagePair(card) {
    const container = card.querySelector(".project-list-image");
    if (!container) return null;

    // Use the first existing image as layer A.
    const firstImg = container.querySelector("img");
    if (!firstImg) return null;

    // Ensure layer B exists (swap layer)
    let swapImg = container.querySelector("img.cws-rotator-swap");
    if (!swapImg) {
      swapImg = document.createElement("img");
      swapImg.className = "cws-rotator-swap";
      swapImg.alt = firstImg.getAttribute("alt") || "";
      container.appendChild(swapImg);
    }

    const styleLayer = (img, opacity) => {
      img.style.position = "absolute";
      img.style.top = "0";
      img.style.left = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.transition = `opacity ${FADE_MS}ms ease`;
      img.style.opacity = opacity;
      img.style.willChange = "opacity";
    };

    styleLayer(firstImg, "1");
    styleLayer(swapImg, "0");

    // Hide any other images already present in the markup to avoid stacking conflicts.
    const rest = Array.from(container.querySelectorAll("img")).filter((img) => img !== firstImg && img !== swapImg);
    for (const img of rest) img.style.display = "none";

    return { container, a: firstImg, b: swapImg };
  }

  function ensureUrlsPromise(card) {
    const existing = urlsPromiseByCard.get(card);
    if (existing) return existing;

    const promise = (async () => {
      const cityLinks = getCityLinksForCard(card);
      const sourceLinks = cityLinks.length ? cityLinks : getProjectLinksForCard(card);
      if (sourceLinks.length === 0) return getFallbackUrlsFromExistingCardImages(card);

      const lists = await mapLimit(sourceLinks, FETCH_CONCURRENCY, async (href) => {
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

      // Validate URLs so we don't stall on missing images.
      let validated = await validateUrls(urls, MAX_URLS);

      // If we ended up with <2 images, try expanding a project sequence (common on city pages).
      if (validated.length < 2) {
        const firstProject = urls.find((u) => typeof u === "string" && u.includes("/projects/") && isR2Url(u));
        if (firstProject) {
          const expanded = uniqueCompact(expandProjectSequence(firstProject, 16));
          const expandedValidated = await validateUrls(expanded, 16);
          validated = uniqueCompact([...validated, ...expandedValidated]).slice(0, MAX_URLS);
        }
      }

      return validated.length ? validated : getFallbackUrlsFromExistingCardImages(card);
    })();

    urlsPromiseByCard.set(card, promise);
    return promise;
  }

  function getRotationState(card) {
    let st = rotationStateByCard.get(card);
    if (!st) {
      st = { timer: null, idx: 0, active: false, urls: [], token: 0, swapping: false, front: "a" };
      rotationStateByCard.set(card, st);
    }
    return st;
  }

  /** @type {Map<string, Promise<boolean>>} */
  const preloadCache = new Map();

  function preload(src) {
    if (!src) return Promise.resolve(false);
    const key = src;
    const existing = preloadCache.get(key);
    if (existing) return existing;
    const p = new Promise((resolve) => {
      const i = new Image();
      i.onload = () => resolve(true);
      i.onerror = () => resolve(false);
      i.src = src;
    });
    preloadCache.set(key, p);
    return p;
  }

  async function crossfadeTo(pair, state, nextSrc) {
    if (!pair) return false;
    if (!nextSrc) return false;
    if (!state.active) return false;
    if (state.swapping) return false;
    state.swapping = true;
    const myToken = ++state.token;

    const ok = await preload(nextSrc);
    if (!ok || !state.active || myToken !== state.token) {
      state.swapping = false;
      return false;
    }

    const frontEl = state.front === "a" ? pair.a : pair.b;
    const backEl = state.front === "a" ? pair.b : pair.a;

    backEl.src = nextSrc;
    backEl.style.opacity = "1";
    frontEl.style.opacity = "0";

    window.setTimeout(() => {
      // If the card stopped or another swap began, don't flip state.
      if (!state.active || myToken !== state.token) return;
      state.front = state.front === "a" ? "b" : "a";
      const newBack = state.front === "a" ? pair.b : pair.a;
      newBack.style.opacity = "0";
      state.swapping = false;
    }, FADE_MS + 30);

    return true;
  }

  function preloadAhead(state) {
    if (!state.urls || state.urls.length < 2) return;
    for (let i = 1; i <= PRELOAD_AHEAD; i += 1) {
      const idx = (state.idx + i) % state.urls.length;
      preload(state.urls[idx]);
    }
  }

  function ensureInterval(pair, state) {
    if (state.timer) return;
    if (!state.urls || state.urls.length < 2) return;
    state.timer = window.setInterval(() => {
      if (!state.active) return;
      if (!state.urls || state.urls.length < 2) return;
      if (state.swapping) return;
      state.idx = (state.idx + 1) % state.urls.length;
      crossfadeTo(pair, state, state.urls[state.idx]);
      preloadAhead(state);
    }, ROTATE_EVERY_MS);
  }

  async function startRotation(card) {
    const state = getRotationState(card);
    if (state.active) return;
    state.active = true;

    const pair = getImagePair(card);
    if (!pair) return;

    const originalSrc = pair.a.getAttribute("data-original-src") || pair.a.src;
    if (!pair.a.getAttribute("data-original-src")) {
      pair.a.setAttribute("data-original-src", originalSrc);
    }
    // Reset visual state at start
    state.front = "a";
    pair.a.style.opacity = "1";
    pair.b.style.opacity = "0";
    state.swapping = false;

    // Start quickly with existing card images (so hover feels instant),
    // then swap to city-page-derived images once fetched.
    const fallbackUrls = getFallbackUrlsFromExistingCardImages(card);
    if (fallbackUrls.length >= 2) {
      state.urls = fallbackUrls;
      state.idx = (Math.floor(Date.now() / 1000) + state.urls.length) % state.urls.length;
      crossfadeTo(pair, state, state.urls[state.idx]);
      preloadAhead(state);
      ensureInterval(pair, state);
      debugLog("started fallback rotation", { count: state.urls.length });
    }

    try {
      const urls = await ensureUrlsPromise(card);
      if (!state.active) return; // hover ended while loading
      if (!urls || urls.length < 2) return;

      state.urls = urls;
      state.idx = (Math.floor(Date.now() / 1000) + state.urls.length) % state.urls.length;
      crossfadeTo(pair, state, state.urls[state.idx]);
      preloadAhead(state);
      ensureInterval(pair, state);
      debugLog("switched to city-page rotation", { count: state.urls.length });
    } catch (err) {
      debugLog("failed to load city-page images", err);
    }
  }

  function stopRotation(card) {
    const state = getRotationState(card);
    state.active = false;
    state.token += 1;
    state.swapping = false;
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }

    const pair = getImagePair(card);
    if (!pair) return;
    const originalSrc = pair.a.getAttribute("data-original-src");
    if (originalSrc) {
      pair.a.style.opacity = "1";
      pair.b.style.opacity = "0";
      pair.a.src = originalSrc;
      pair.b.removeAttribute("src");
      state.front = "a";
    }
  }

  function init() {
    const cards = Array.from(document.querySelectorAll(".project-list-item"));
    debugLog("init", { cards: cards.length });
    for (const card of cards) {
      // Prime display image styling and hide any stacked images.
      getImagePair(card);

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

