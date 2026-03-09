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
    // Use a real link so click + open-in-new-tab works.
    const tile = document.createElement("a");
    // Avoid `.parallax-image` on Gallery: it can shift some wide images out of view.
    tile.className = "scale-in-image hover-zoom-image";
    tile.href = href;
    tile.setAttribute("aria-label", `View project: ${label}`);

    const container = document.createElement("div");
    container.className = "image-container";

    const img = document.createElement("img");
    const suffix = altSuffix ? ` — ${altSuffix}` : "";
    img.alt = label ? `${label}${suffix} — JAC Interiors project` : "JAC Interiors project";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    img.src = PLACEHOLDER_SRC;
    // Prevent the shared masonry script from hiding tiles on the first 404
    // while we cycle through candidate URLs.
    img.dataset.r2Managed = "1";
    img.dataset.r2Space = "gallery";
    img.dataset.r2Final = "0";

    container.appendChild(img);
    tile.appendChild(container);

    return { tile, img };
  }

  // R2 filenames differ from slug for some projects (e.g. jamm-visual -> jamm-1.jpg).
  const GALLERY_FILENAME_PREFIX = { "jamm-visual": "jamm" };

  function buildCdnCandidatesFromSlugAndIndex(slug, index) {
    const s = String(slug || "").trim();
    if (!s) return [];
    const base = r2Base();
    if (!base) return [];

    const n = Math.max(1, Number(index) || 1);
    const prefix = GALLERY_FILENAME_PREFIX[s] || s;

    // Try base filename first (matches R2), then size variants.
    // Typical R2 convention: "<prefix>-<n>.*"
    const stems = [`${prefix}-${n}`, `${prefix}-${n}-1200`, `${prefix}-${n}-900`, `${prefix}-${n}-600`];

    // First image can also exist as "primary" in some buckets.
    if (n === 1) stems.push(`${prefix}-primary`);

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
      "load",
      () => {
        // We’ve landed on a working candidate.
        img.dataset.r2Final = "1";
      },
      { once: true, passive: true }
    );

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

    const loadMoreBtn = document.getElementById("galleryLoadMore");

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

    let currentIndex = 0;

    function hideTile(tile) {
      if (!tile) return;
      tile.dataset.masonryHidden = "1";
      tile.style.display = "none";
    }

    function wireRelayoutOnImg(img) {
      if (!img) return;
      img.addEventListener(
        "load",
        () => document.dispatchEvent(new Event("spaces:gallery-updated")),
        { once: true, passive: true }
      );
      img.addEventListener(
        "error",
        () => document.dispatchEvent(new Event("spaces:gallery-updated")),
        { once: true, passive: true }
      );
    }

    async function appendNextIndex() {
      currentIndex += 1;
      const idxToLoad = currentIndex;

      const frag = document.createDocumentFragment();
      let added = 0;

      projects.forEach((p, pIdx) => {
        const { tile, img } = createMasonryTile({
          href: p.rawHref,
          label: p.label,
          altSuffix: `Image ${idxToLoad}`,
          eager: idxToLoad === 1 && pIdx < 6,
        });

        // Ensure injected tiles aren’t hidden by scroll-animation CSS.
        tile.classList.add("visible");

        // Hint for the first couple tiles on first load only.
        if (idxToLoad === 1 && pIdx < 3) img.setAttribute("fetchpriority", "high");

        const cdnCandidates = buildCdnCandidatesFromSlugAndIndex(p.slug, idxToLoad);
        setImgWithFallback(img, cdnCandidates, async () => {
          // For the initial index, fall back to parsing the project page hero image.
          if (idxToLoad === 1) {
            try {
              const primary = await fetchPrimaryProjectImage(p.absHref);
              if (!primary) {
                img.dataset.r2Final = "1";
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
                img.dataset.r2Final = "1";
                img.src = final;
              } else {
                img.dataset.r2Final = "1";
                img.src = primary;
              }
            } catch (_) {
              img.dataset.r2Final = "1";
              img.src = FALLBACK_PRIMARY;
            }
            return;
          }

          // For subsequent indices, only show what exists in R2/CDN.
          hideTile(tile);
          document.dispatchEvent(new Event("spaces:gallery-updated"));
        });

        wireRelayoutOnImg(img);
        frag.appendChild(tile);
        added += 1;
      });

      grid.appendChild(frag);
      document.dispatchEvent(new Event("spaces:gallery-updated"));

      // Disable only if this is a non-primary round and it yields no visible tiles.
      // Allow a short delay for 404 cycling.
      setTimeout(() => {
        if (idxToLoad === 1) return;
        const newlyAdded = Array.from(grid.children).slice(-projects.length).filter(
          (el) => el && el.nodeType === 1 && el.style && el.style.display !== "none" && el.dataset?.masonryHidden !== "1"
        );
        if (newlyAdded.length === 0 && loadMoreBtn) {
          loadMoreBtn.disabled = true;
          loadMoreBtn.textContent = "No more images";
        }
      }, 1200);

      return added;
    }

    // Initial render (image #1 per project)
    await appendNextIndex();

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", async () => {
        loadMoreBtn.disabled = true;
        const prevText = loadMoreBtn.textContent;
        loadMoreBtn.textContent = "Loading…";
        try {
          await appendNextIndex();
        } finally {
          if (loadMoreBtn.textContent !== "No more images") {
            loadMoreBtn.textContent = prevText || "Load more";
            loadMoreBtn.disabled = false;
          }
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

