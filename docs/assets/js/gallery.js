// Gallery page: project-page mosaic tiles, one image per project (dropdown order).
(function () {
  "use strict";

  const DEFAULT_R2_BASE = "https://jacinteriorscdn.com";
  const FALLBACK_PRIMARY = "assets/images/projects/bg-hero_2000x7e9e.jpg";
  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  function r2Base() {
    return String(window.R2_IMAGE_BASE || DEFAULT_R2_BASE).replace(/\/+$/, "");
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function humanize(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function findPortfolioProjectLinks() {
    const nav = document.querySelector("nav.navbar");
    if (!nav) return [];

    const portfolioLink = nav.querySelector('a.nav-link[href*="portfolio.html"]');
    const portfolioDropdown = portfolioLink ? portfolioLink.closest(".nav-dropdown") : null;
    if (!portfolioDropdown) return [];

    return Array.from(
      portfolioDropdown.querySelectorAll('.nav-dropdown-content a[href*="projects/"]')
    );
  }

  function normalizeProjectHref(href) {
    let h = String(href || "").trim();
    if (!h) return "";
    h = h.replace(/^\/[^/]+\.html\/projects\//i, "/projects/");
    try {
      return new URL(h, window.location.href).toString();
    } catch (_) {
      return h;
    }
  }

  function slugFromHref(href) {
    const h = String(href || "");
    const m = h.match(/projects\/([^/?#]+)\.html/i);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function parseProjectLocalSrc(localSrc) {
    // assets/images/projects/<project>/<filename>
    const m = String(localSrc || "").match(/^assets\/images\/projects\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { project: m[1], name: m[2] };
  }

  function encodeName(name) {
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  function toFinalSrc(localSrc) {
    const parsed = parseProjectLocalSrc(localSrc);
    if (!parsed) return localSrc;
    const base = r2Base();
    if (!base) return localSrc;
    return `${base}/projects/${parsed.project}/${encodeName(parsed.name)}`;
  }

  function normalizeLocalSrc(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    const idx = s.indexOf("assets/images/projects/");
    if (idx >= 0) return s.slice(idx);
    return s;
  }

  async function fetchPrimaryProjectImage(projectHref) {
    const res = await fetch(projectHref, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${projectHref}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");

    function push(raw) {
      const norm = normalizeLocalSrc(raw);
      if (!norm) return;

      const isLocal = norm.startsWith("assets/images/projects/");
      const isCdnProject = /^https?:\/\//i.test(norm) && /\/projects\/[^/]+\//.test(norm);
      if (!isLocal && !isCdnProject) return;

      return norm;
    }

    // Primary image should match project pages: the first-row hero image.
    const hero = doc.querySelector(".first-row-grid img");
    if (hero) {
      const a = push(hero.getAttribute("data-r2-local-src") || "");
      if (a) return a;
      const src = hero.getAttribute("src") || "";
      if (src && !src.startsWith("data:")) {
        const b = push(src);
        if (b) return b;
      }
    }

    // Fallback: first project image we can find.
    const any = doc.querySelector("img[data-r2-local-src], .image-gallery-grid img, img");
    if (any) {
      const a = push(any.getAttribute("data-r2-local-src") || "");
      if (a) return a;
      const src = any.getAttribute("src") || "";
      if (src && !src.startsWith("data:")) {
        const b = push(src);
        if (b) return b;
      }
    }

    return "";
  }

  function createMasonryTile({ href, label, altSuffix, eager }) {
    // Match project pages: tiles are blocks in the masonry grid.
    // Still make them navigable like a tile (click + keyboard).
    const tile = document.createElement("div");
    tile.className = "parallax-image scale-in-image hover-zoom-image";
    tile.setAttribute("role", "link");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", `View project: ${label}`);
    tile.dataset.href = href;

    const container = document.createElement("div");
    container.className = "image-container";

    const img = document.createElement("img");
    const suffix = altSuffix ? ` — ${altSuffix}` : "";
    img.alt = label ? `${label}${suffix} — JAC Interiors project` : "JAC Interiors project";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    img.src = PLACEHOLDER_SRC;

    container.appendChild(img);
    tile.appendChild(container);

    function go() {
      const h = tile.dataset.href || "";
      if (!h) return;
      window.location.href = h;
    }

    tile.addEventListener("click", go);
    tile.addEventListener("keydown", (e) => {
      const k = e && e.key;
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        go();
      }
    });

    return { tile, img };
  }

  function buildCdnCandidatesFromSlug(slug) {
    const s = String(slug || "").trim();
    if (!s) return [];
    const base = r2Base();
    if (!base) return [];

    // Prefer smaller-ish filenames if you add them later (e.g. "-1200").
    // For now: try typical primary filenames first.
    const stems = [
      `${s}-1-1200`,
      `${s}-1-900`,
      `${s}-1-600`,
      `${s}-1`,
      `${s}-primary`,
    ];
    const exts = ["webp", "jpg", "jpeg", "png"];
    const urls = [];
    for (const stem of stems) {
      for (const ext of exts) {
        urls.push(`${base}/projects/${encodeURIComponent(s)}/${encodeURIComponent(stem)}.${ext}`);
      }
    }
    return urls;
  }

  function setImgWithFallback(img, candidates, onExhausted) {
    const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    let idx = 0;

    function tryNext() {
      if (idx >= list.length) {
        if (typeof onExhausted === "function") onExhausted();
        return;
      }
      img.src = list[idx++];
    }

    img.addEventListener(
      "error",
      () => {
        tryNext();
      },
      { passive: true }
    );

    tryNext();
  }

  async function boot() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    // Wait for navbar injection so dropdown links exist.
    for (let i = 0; i < 80; i += 1) {
      if (findPortfolioProjectLinks().length) break;
      await sleep(50);
    }

    const links = findPortfolioProjectLinks();
    if (!links.length) {
      grid.innerHTML =
        '<p style="color: rgba(34, 42, 38, 0.75); font-size: 1rem; line-height: 1.6">Gallery is loading. Please refresh if it does not appear.</p>';
      return;
    }

    grid.innerHTML = "";

    const projects = links
      .map((link) => {
      const rawHref = link.getAttribute("href") || "";
      const slug = slugFromHref(rawHref);
      if (!slug) return null;

      const label = humanize(link.textContent) || humanize(slug.replace(/-/g, " "));
      const absHref = normalizeProjectHref(rawHref);
      return { rawHref, absHref, label, slug };
    })
      .filter(Boolean);

    const frag = document.createDocumentFragment();
    const tiles = [];
    projects.forEach((p, idx) => {
      const { tile, img } = createMasonryTile({
        href: p.rawHref,
        label: p.label,
        altSuffix: "Project",
        eager: idx < 6,
      });

      // Ensure the injected tiles aren’t hidden by scroll-animation CSS.
      tile.classList.add("visible");

      // Prefer predictable CDN path first; if not found, fall back to parsing the project page.
      const cdnCandidates = buildCdnCandidatesFromSlug(p.slug);
      setImgWithFallback(img, cdnCandidates, async () => {
        try {
          const primary = await fetchPrimaryProjectImage(p.absHref);
          if (!primary) {
            img.src = FALLBACK_PRIMARY;
            return;
          }

          if (primary.startsWith("assets/images/projects/")) {
            const final = toFinalSrc(primary);
            img.addEventListener(
              "error",
              () => {
                img.src = primary;
              },
              { once: true }
            );
            img.src = final;
          } else {
            img.src = primary;
          }
        } catch (_) {
          img.src = FALLBACK_PRIMARY;
        }
      });

      // Hint for the first couple tiles.
      if (idx < 3) {
        img.setAttribute("fetchpriority", "high");
      }

      tiles.push({ tile, img });
      frag.appendChild(tile);
    });

    grid.appendChild(frag);

    // Let the shared masonry script wire up relayout + load/error listeners.
    document.dispatchEvent(new Event("spaces:gallery-updated"));

    // Extra: as images lazy-load, trigger relayout.
    tiles.forEach(({ img }) => {
      img.addEventListener(
        "load",
        () => {
          document.dispatchEvent(new Event("spaces:gallery-updated"));
        },
        { once: true, passive: true }
      );
      img.addEventListener(
        "error",
        () => {
          document.dispatchEvent(new Event("spaces:gallery-updated"));
        },
        { once: true, passive: true }
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

