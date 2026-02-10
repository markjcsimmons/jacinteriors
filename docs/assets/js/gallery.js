// Gallery page: project-page masonry look, one image per project (dropdown order).
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

  async function fetchProjectImages(projectHref) {
    const res = await fetch(projectHref, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${projectHref}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const seen = new Set();
    const out = [];

    function push(raw) {
      const norm = normalizeLocalSrc(raw);
      if (!norm) return;
      if (seen.has(norm)) return;

      const isLocal = norm.startsWith("assets/images/projects/");
      const isCdnProject = /^https?:\/\//i.test(norm) && /\/projects\/[^/]+\//.test(norm);
      if (!isLocal && !isCdnProject) return;

      seen.add(norm);
      out.push(norm);
    }

    // Choose + order images like a project page:
    // 1) first-row image (hero) first
    // 2) then masonry grid images in DOM order
    const firstRowImgs = Array.from(doc.querySelectorAll(".first-row-grid img"));
    const gridImgs = Array.from(doc.querySelectorAll(".image-gallery-grid img"));

    firstRowImgs.forEach((img) => {
      push(img.getAttribute("data-r2-local-src") || "");
      const src = img.getAttribute("src") || "";
      if (!src.startsWith("data:")) push(src);
    });

    gridImgs.forEach((img) => {
      push(img.getAttribute("data-r2-local-src") || "");
      const src = img.getAttribute("src") || "";
      if (!src.startsWith("data:")) push(src);
    });

    // Fallback: if markup doesn't match, scan all images.
    if (!out.length) {
      Array.from(doc.querySelectorAll("img")).forEach((img) => {
        push(img.getAttribute("data-r2-local-src") || "");
        const src = img.getAttribute("src") || "";
        if (!src.startsWith("data:")) push(src);
      });
    }

    return out;
  }

  function createMasonryTile({ href, label, altSuffix }) {
    const a = document.createElement("a");
    a.className = "parallax-image scale-in-image hover-zoom-image";
    a.href = href;
    a.setAttribute("aria-label", `View project: ${label}`);

    const container = document.createElement("div");
    container.className = "image-container";

    const img = document.createElement("img");
    const suffix = altSuffix ? ` — ${altSuffix}` : "";
    img.alt = label ? `${label}${suffix} — JAC Interiors project` : "JAC Interiors project";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = PLACEHOLDER_SRC;

    container.appendChild(img);
    a.appendChild(container);
    return { tile: a, img };
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

    const projects = [];
    links.forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      const slug = slugFromHref(rawHref);
      if (!slug) return;

      const label = humanize(link.textContent) || humanize(slug.replace(/-/g, " "));
      const absHref = normalizeProjectHref(rawHref);
      projects.push({ rawHref, absHref, label, images: [] });
    });

    // Fetch image lists per project (concurrency-limited).
    const concurrency = 4;
    let i = 0;
    async function fetchOne(p) {
      try {
        const images = await fetchProjectImages(p.absHref);
        p.images = Array.isArray(images) ? images : [];
      } catch (_) {
        p.images = [];
      }
      if (!p.images.length) p.images = [FALLBACK_PRIMARY];
    }
    async function fetchWorker() {
      while (i < projects.length) {
        const idx = i++;
        await fetchOne(projects[idx]);
      }
    }
    await Promise.all(new Array(concurrency).fill(0).map(() => fetchWorker()));

    // Interleave images across projects in dropdown order:
    // project1 img1, project2 img1, ... then project1 img2, project2 img2, ...
    const maxLen = projects.reduce((m, p) => Math.max(m, p.images.length || 0), 0);
    const frag = document.createDocumentFragment();
    const tiles = [];

    for (let round = 0; round < maxLen; round += 1) {
      for (let pIdx = 0; pIdx < projects.length; pIdx += 1) {
        const p = projects[pIdx];
        const src = (p.images && p.images[round]) || "";
        if (!src) continue;

        const { tile, img } = createMasonryTile({
          href: p.rawHref,
          label: p.label,
          altSuffix: `Image ${round + 1}`,
        });

        // Local project image: load from CDN with local fallback.
        if (src.startsWith("assets/images/projects/")) {
          const final = toFinalSrc(src);
          img.addEventListener(
            "error",
            () => {
              img.src = src;
            },
            { once: true }
          );
          img.src = final;
        } else {
          img.src = src;
        }

        tiles.push({ tile, img });
        frag.appendChild(tile);
      }
    }

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

