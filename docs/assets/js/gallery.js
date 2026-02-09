// Gallery page: masonry grid sourced from Portfolio dropdown order.
(function () {
  "use strict";

  const DEFAULT_R2 = "https://jacinteriorscdn.com";

  function getR2Base() {
    return String(window.R2_IMAGE_BASE || DEFAULT_R2).replace(/\/+$/, "");
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function humanize(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function extractProjectSlugFromHref(href) {
    const h = String(href || "");
    const m = h.match(/projects\/([^/?#]+)\.html/i);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function findPortfolioProjectLinks() {
    const nav = document.querySelector("nav.navbar");
    if (!nav) return [];

    const portfolioLink = nav.querySelector('a.nav-link[href*="portfolio.html"]');
    const portfolioDropdown = portfolioLink ? portfolioLink.closest(".nav-dropdown") : null;
    if (!portfolioDropdown) return [];

    const links = Array.from(
      portfolioDropdown.querySelectorAll('.nav-dropdown-content a[href*="projects/"]')
    );
    return links;
  }

  function buildImageCandidates(slug) {
    const base = getR2Base();
    const s = String(slug || "").trim();
    if (!s) return [];

    const exts = ["jpg", "jpeg", "png", "webp"];
    const stems = [`${s}-1`, `${s}-2`, `${s}-primary`, `${s}-hover`];
    const urls = [];
    for (const stem of stems) {
      for (const ext of exts) {
        urls.push(`${base}/projects/${encodeURIComponent(s)}/${encodeURIComponent(stem)}.${ext}`);
      }
    }
    return urls;
  }

  function setImgWithFallback(img, candidates) {
    const list = Array.isArray(candidates) ? candidates : [];
    let idx = 0;

    function tryNext() {
      if (idx >= list.length) return;
      const next = list[idx++];
      img.src = next;
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

  function createTile({ href, label, slug }) {
    const a = document.createElement("a");
    a.className = "gallery-tile";
    a.href = href;
    a.setAttribute("aria-label", `View project: ${label}`);

    const media = document.createElement("div");
    media.className = "gallery-media";

    const img = document.createElement("img");
    img.alt = label ? `${label} — JAC Interiors project` : "JAC Interiors project";
    img.loading = "lazy";
    img.decoding = "async";

    // Start from R2, fall back across common variants.
    setImgWithFallback(img, buildImageCandidates(slug));

    media.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "gallery-caption";
    caption.innerHTML = `
      <div class="gallery-name">${label || "Project"}</div>
      <div class="gallery-cta">View project <span aria-hidden="true">→</span></div>
    `.trim();

    a.appendChild(media);
    a.appendChild(caption);
    return { tile: a, img };
  }

  function initMasonry(grid) {
    if (!grid) return () => {};

    function resizeOne(item) {
      const rowHeight = parseFloat(getComputedStyle(grid).getPropertyValue("grid-auto-rows")) || 10;
      const rowGap = parseFloat(getComputedStyle(grid).getPropertyValue("gap")) || 24;
      const media = item.querySelector(".gallery-media");
      const caption = item.querySelector(".gallery-caption");
      if (!media || !caption) return;

      const h = media.getBoundingClientRect().height + caption.getBoundingClientRect().height;
      const span = Math.ceil((h + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = `span ${span}`;
    }

    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        Array.from(grid.children).forEach((child) => {
          if (child && child.classList && child.classList.contains("gallery-tile")) {
            resizeOne(child);
          }
        });
      });
    };

    const onResize = () => schedule();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }

  async function boot() {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    // Wait for navbar injection to complete so dropdown links exist.
    for (let i = 0; i < 60; i += 1) {
      const links = findPortfolioProjectLinks();
      if (links.length) break;
      await sleep(50);
    }

    const links = findPortfolioProjectLinks();
    if (!links.length) {
      grid.innerHTML =
        '<p style="color: rgba(34, 42, 38, 0.75); font-size: 1rem; line-height: 1.6">Gallery is loading. Please refresh if it does not appear.</p>';
      return;
    }

    grid.innerHTML = "";
    const cleanupMasonry = initMasonry(grid);

    const tiles = [];
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const slug = extractProjectSlugFromHref(href);
      if (!slug) return;
      const label = humanize(link.textContent) || humanize(slug.replace(/-/g, " "));
      const { tile, img } = createTile({ href, label, slug });
      tiles.push({ tile, img });
      grid.appendChild(tile);
    });

    // Reflow masonry after images load.
    tiles.forEach(({ img }) => {
      img.addEventListener(
        "load",
        () => {
          try {
            // Trigger a resize pass
            window.dispatchEvent(new Event("resize"));
          } catch (e) {}
        },
        { passive: true }
      );
    });

    // Initial pass
    try {
      window.dispatchEvent(new Event("resize"));
    } catch (e) {}

    // If the page is later torn down, we at least keep reference to cleanup.
    window.__galleryCleanup = cleanupMasonry;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

