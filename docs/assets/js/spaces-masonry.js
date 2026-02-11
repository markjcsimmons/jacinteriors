/*
 * Shared masonry layout for Spaces pages.
 * - 3 columns on desktop (>=1200px), 2 columns tablet, 1 column mobile (<=768px)
 * - Relayouts on image load/error and on resize
 * - Hides broken images and reflows to avoid gaps
 */

(function () {
  const GAP = 16;
  const MOBILE_MAX = 768;
  const DESKTOP_MIN = 1200;

  let relayoutTimer = null;

  function getColumnsForGrid(grid) {
    // Default behavior for images/spaces/gallery: 3 desktop, 2 tablet, 1 mobile.
    // Videos page requests 2 across on desktop.
    const prefersTwoDesktop = !!grid?.classList?.contains("masonry--two-desktop");
    if (window.innerWidth <= MOBILE_MAX) return 1;
    if (window.innerWidth >= DESKTOP_MIN) return prefersTwoDesktop ? 2 : 3;
    return 2;
  }

  function getGrids() {
    return Array.from(document.querySelectorAll(".image-gallery-grid"));
  }

  function prepareItem(item, columnWidth) {
    item.style.position = "absolute";
    item.style.display = "block";
    item.style.width = columnWidth + "px";
    item.style.maxWidth = columnWidth + "px";
    item.style.margin = "0";
    item.style.boxSizing = "border-box";

    // If tiles are links (e.g. Gallery), remove default link styles.
    if (item.tagName === "A") {
      item.style.textDecoration = "none";
      item.style.color = "inherit";
    }

    const container = item.querySelector(".image-container");
    if (container) {
      container.style.width = "100%";
      container.style.maxWidth = "100%";
      container.style.overflow = "hidden";
      container.style.display = "block";
      container.style.boxSizing = "border-box";
    }

    // Special-case video mosaic tiles: their media lives inside a fixed aspect-ratio frame.
    const videoFrame = item.querySelector(".video-thumb-frame");
    if (videoFrame) {
      const img = videoFrame.querySelector("img");
      if (img) {
        img.style.setProperty("width", "100%", "important");
        img.style.setProperty("max-width", "100%", "important");
        img.style.setProperty("height", "100%", "important");
        img.style.setProperty("display", "block", "important");
        img.style.setProperty("object-fit", "cover", "important");
        img.style.setProperty("box-sizing", "border-box", "important");
      }
      const vid = videoFrame.querySelector("video");
      if (vid) {
        vid.style.setProperty("width", "100%", "important");
        vid.style.setProperty("max-width", "100%", "important");
        vid.style.setProperty("height", "100%", "important");
        vid.style.setProperty("display", "block", "important");
        vid.style.setProperty("object-fit", "contain", "important");
        vid.style.setProperty("box-sizing", "border-box", "important");
      }
      return;
    }

    const media = item.querySelector("img, video");
    if (media) {
      media.style.setProperty("width", "100%", "important");
      media.style.setProperty("max-width", "100%", "important");
      media.style.setProperty("height", "auto", "important");
      media.style.setProperty("display", "block", "important");
      media.style.setProperty("object-fit", "contain", "important");
      media.style.setProperty("box-sizing", "border-box", "important");
    }
  }

  function layoutGrid(grid) {
    if (!grid) return;

    // If hidden (e.g. width 0), skip; we'll be called again on load/resize.
    const containerWidth = grid.offsetWidth;
    if (!containerWidth) return;

    const columns = getColumnsForGrid(grid);
    const columnWidth = (containerWidth - GAP * (columns - 1)) / columns;

    grid.style.position = "relative";
    grid.style.width = "100%";
    grid.style.boxSizing = "border-box";

    const items = Array.from(grid.children).filter(
      (el) => el && el.nodeType === 1 && el.style.display !== "none" && el.dataset.masonryHidden !== "1"
    );

    const columnHeights = new Array(columns).fill(0);

    items.forEach((item) => {
      prepareItem(item, columnWidth);

      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const left = shortestColumnIndex * (columnWidth + GAP);
      const top = columnHeights[shortestColumnIndex];

      item.style.left = left + "px";
      item.style.top = top + "px";

      // Measure after positioning; fall back to a reasonable estimate.
      const measured = item.offsetHeight || 0;
      const height = measured > 0 ? measured : 300;
      columnHeights[shortestColumnIndex] += height + GAP;
    });

    grid.style.height = (Math.max(...columnHeights) || 0) + "px";
  }

  function layoutAll() {
    getGrids().forEach(layoutGrid);
  }

  function scheduleRelayout() {
    if (relayoutTimer) clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      layoutAll();
      // One more pass after paint/layout settle.
      setTimeout(layoutAll, 200);
    }, 50);
  }

  function shouldDelayHide(el) {
    return el?.dataset?.r2Managed === "1" && el.dataset.r2Final !== "1" && el.dataset.r2Space;
  }

  function hideTileFor(el) {
    const tile = el.closest(".parallax-image") || el.closest("a") || el.parentElement;
    if (tile && tile.dataset) tile.dataset.masonryHidden = "1";
    if (tile && tile.style) tile.style.display = "none";
  }

  function wireMediaHandlers(grid) {
    const mediaEls = Array.from(grid.querySelectorAll("img, video"));
    mediaEls.forEach((el) => {
      if (el.dataset.masonryWired === "1") return;
      el.dataset.masonryWired = "1";

      el.addEventListener(
        "error",
        () => {
          if (shouldDelayHide(el)) {
            scheduleRelayout();
            return;
          }
          hideTileFor(el);
          scheduleRelayout();
        },
        { once: true }
      );

      // Images fire "load"; videos fire "loadedmetadata"/"loadeddata"
      if (el.tagName === "IMG") {
        el.addEventListener("load", () => scheduleRelayout(), { once: true });
      } else {
        el.addEventListener("loadedmetadata", () => scheduleRelayout(), { once: true });
        el.addEventListener("loadeddata", () => scheduleRelayout(), { once: true });
      }
    });
  }

  function init() {
    const grids = getGrids();
    if (!grids.length) return;

    grids.forEach((grid) => {
      wireMediaHandlers(grid);
    });

    scheduleRelayout();
  }

  // Allow other scripts (like R2 manifest loaders) to trigger a rewire/relayout.
  document.addEventListener("spaces:gallery-updated", init);

  // Init on DOM ready + on full load (fonts/layout might shift)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("load", init);
  window.addEventListener("resize", scheduleRelayout);
})();

