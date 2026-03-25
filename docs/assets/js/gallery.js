// Gallery page: project-page mosaic tiles, one image per project (dropdown order).
// Image order per project matches the project page (hero first, then grid in DOM order).
(function () {
  "use strict";

  const DEFAULT_R2_BASE = "https://jacinteriorscdn.com";
  const FALLBACK_PRIMARY = "assets/images/projects/bg-hero_2000x7e9e.jpg";
  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  // Fallback when Portfolio is a direct link (no dropdown) — e.g. mobile or simplified nav.
  const FALLBACK_PROJECT_LINKS = [
    { title: "Fox Hills", href: "projects/fox-hills.html" },
    { title: "22nd Street", href: "projects/22nd-street.html" },
    { title: "Sunnyside", href: "projects/sunnyside.html" },
    { title: "Frances", href: "projects/frances.html" },
    { title: "Columbus Way", href: "projects/columbus-way.html" },
    { title: "Colette Way", href: "projects/colette-way.html" },
    { title: "River Homestead", href: "projects/river-homestead.html" },
    { title: "Oakwood", href: "projects/oakwood.html" },
    { title: "Wilshire", href: "projects/wilshire.html" },
    { title: "Mulholland Drive", href: "projects/mulholland-drive.html" },
    { title: "Via Pisa", href: "projects/via-pisa.html" },
    { title: "Galewood", href: "projects/galewood.html" },
    { title: "Monaco", href: "projects/monaco.html" },
    { title: "Ronda", href: "projects/ronda.html" },
    { title: "Sherbourne", href: "projects/sherbourne.html" },
    { title: "Alpine", href: "projects/alpine.html" },
    { title: "Peary Place", href: "projects/peary-way.html" },
    { title: "Valley Vista", href: "projects/valley-vista.html" },
    { title: "Colby", href: "projects/colby.html" },
    { title: "Vale Crest", href: "projects/vale-crest.html" },
    { title: "Brown Deer Park", href: "projects/brown-deer-park.html" },
    { title: "JAMM Agency Office", href: "projects/jamm-visual.html" },
  ];

  function r2Base() {
    return String(window.R2_IMAGE_BASE || DEFAULT_R2_BASE).replace(/\/+$/, "");
  }

  function humanize(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function findPortfolioProjectLinks() {
    const nav = document.querySelector("nav.navbar");
    if (!nav) return [];

    const portfolioLink = nav.querySelector('a.nav-link[href*="portfolio.html"]');
    const portfolioDropdown = portfolioLink ? portfolioLink.closest(".nav-dropdown") : null;
    if (portfolioDropdown) {
      return Array.from(
        portfolioDropdown.querySelectorAll('.nav-dropdown-content a[href*="projects/"]')
      );
    }
    return [];
  }

  function getGalleryProjectList() {
    const links = findPortfolioProjectLinks();
    if (links.length) {
      return links.map((link) => ({
        label: humanize(link.textContent),
        rawHref: link.getAttribute("href") || "",
      }));
    }
    const pathPrefix = (() => {
      const path = window.location.pathname || "";
      const parts = path.split("/").filter(Boolean);
      const depth = parts.length > 1 ? parts.length - 2 : 0;
      return depth > 0 ? "../".repeat(depth) : "";
    })();
    return FALLBACK_PROJECT_LINKS.map((p) => ({
      label: p.title,
      rawHref: pathPrefix + p.href,
    }));
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

  // ── Fetch the full ordered image list from a project page ──────────
  // Returns an array of normalised local-src strings (hero first, then
  // grid images in DOM order) — the exact order shown on the project page.
  const projectImageCache = new Map();

  async function fetchProjectImageList(projectHref) {
    const res = await fetch(projectHref, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${projectHref}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const images = [];
    const seen = new Set();

    function addImg(el) {
      if (!el) return;
      const raw = el.getAttribute("data-r2-local-src") || "";
      const norm = normalizeLocalSrc(raw);
      if (!norm || seen.has(norm)) return;
      const isLocal = norm.startsWith("assets/images/projects/");
      const isCdn = /^https?:\/\//i.test(norm) && /\/projects\/[^/]+\//.test(norm);
      if (!isLocal && !isCdn) return;
      seen.add(norm);
      images.push(norm);
    }

    // Hero image (first-row-grid) — always first
    const hero = doc.querySelector(".first-row-grid img");
    addImg(hero);

    // Grid images in DOM order
    doc.querySelectorAll(".image-gallery-grid img").forEach(addImg);

    return images;
  }

  function createMasonryTile({ href, label, altSuffix, eager }) {
    const tile = document.createElement("a");
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
    img.dataset.r2Managed = "1";
    img.dataset.r2Space = "gallery";
    img.dataset.r2Final = "0";

    container.appendChild(img);
    tile.appendChild(container);

    return { tile, img };
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

  // Build a CDN + local fallback chain for a single local-src path.
  function buildCandidatesForLocalSrc(localSrc) {
    const candidates = [];
    const isLocal = localSrc.startsWith("assets/images/projects/");
    if (isLocal) {
      candidates.push(toFinalSrc(localSrc));
      candidates.push(localSrc);
    } else {
      candidates.push(localSrc);
    }
    return candidates;
  }

  async function boot() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const loadMoreBtn = document.getElementById("galleryLoadMore");

    const projectList = getGalleryProjectList();
    if (!projectList.length) {
      grid.innerHTML =
        '<p style="color: rgba(34, 42, 38, 0.75); font-size: 1rem; line-height: 1.6">Gallery is loading. Please refresh if it does not appear.</p>';
      return;
    }

    grid.innerHTML = "";

    const projects = projectList
      .map((item) => {
        const rawHref = item.rawHref || "";
        const slug = slugFromHref(rawHref);
        if (!slug) return null;
        const label = humanize(item.label) || humanize(slug.replace(/-/g, " "));
        const absHref = normalizeProjectHref(rawHref);
        return { rawHref, absHref, label, slug };
      })
      .filter(Boolean);

    if (!projects.length) {
      grid.innerHTML =
        '<p style="color: rgba(34, 42, 38, 0.75); font-size: 1rem; line-height: 1.6">No projects to show. Please refresh.</p>';
      return;
    }

    // Pre-fetch all project pages in parallel to get their image orders.
    await Promise.allSettled(
      projects.map(async (p) => {
        try {
          const images = await fetchProjectImageList(p.absHref);
          projectImageCache.set(p.slug, images);
        } catch (_) {
          projectImageCache.set(p.slug, []);
        }
      })
    );

    let currentIndex = 0;
    const maxImages = Math.max(
      ...projects.map((p) => (projectImageCache.get(p.slug) || []).length),
      0
    );

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
      const imgArrayIdx = idxToLoad - 1;

      if (imgArrayIdx >= maxImages) {
        if (loadMoreBtn) {
          loadMoreBtn.disabled = true;
          loadMoreBtn.textContent = "No more images";
        }
        return 0;
      }

      const frag = document.createDocumentFragment();
      let added = 0;

      projects.forEach((p, pIdx) => {
        const imageList = projectImageCache.get(p.slug) || [];
        const localSrc = imageList[imgArrayIdx];

        const { tile, img } = createMasonryTile({
          href: p.rawHref,
          label: p.label,
          altSuffix: `Image ${idxToLoad}`,
          eager: idxToLoad === 1 && pIdx < 6,
        });

        tile.classList.add("visible");

        if (idxToLoad === 1 && pIdx < 8) img.setAttribute("fetchpriority", "high");

        if (!localSrc) {
          hideTile(tile);
          frag.appendChild(tile);
          return;
        }

        const candidates = buildCandidatesForLocalSrc(localSrc);
        setImgWithFallback(img, candidates, () => {
          img.dataset.r2Final = "1";
          if (idxToLoad === 1) {
            img.src = FALLBACK_PRIMARY;
          } else {
            hideTile(tile);
            document.dispatchEvent(new Event("spaces:gallery-updated"));
          }
        });

        wireRelayoutOnImg(img);
        frag.appendChild(tile);
        added += 1;
      });

      grid.appendChild(frag);
      document.dispatchEvent(new Event("spaces:gallery-updated"));

      // Disable "Load more" when all projects have shown all images.
      if (idxToLoad >= maxImages && loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = "No more images";
      }

      return added;
    }

    // Initial render (image #1 per project — the hero from each project page)
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
