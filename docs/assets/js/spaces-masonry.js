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

  function getColumns() {
    if (window.innerWidth <= MOBILE_MAX) return 1;
    if (window.innerWidth >= DESKTOP_MIN) return 3;
    return 2;
  }

  function getGrids() {
    return Array.from(document.querySelectorAll(".image-gallery-grid"));
  }

  function prepareItem(item, columnWidth) {
    item.style.position = "absolute";
    item.style.width = columnWidth + "px";
    item.style.maxWidth = columnWidth + "px";
    item.style.margin = "0";
    item.style.boxSizing = "border-box";

    const container = item.querySelector(".image-container");
    if (container) {
      container.style.width = "100%";
      container.style.maxWidth = "100%";
      container.style.overflow = "hidden";
      container.style.display = "block";
      container.style.boxSizing = "border-box";
    }

    const img = item.querySelector("img");
    if (img) {
      img.style.setProperty("width", "100%", "important");
      img.style.setProperty("max-width", "100%", "important");
      img.style.setProperty("height", "auto", "important");
      img.style.setProperty("display", "block", "important");
      img.style.setProperty("object-fit", "contain", "important");
      img.style.setProperty("box-sizing", "border-box", "important");
    }
  }

  function layoutGrid(grid) {
    if (!grid) return;

    // If hidden (e.g. width 0), skip; we'll be called again on load/resize.
    const containerWidth = grid.offsetWidth;
    if (!containerWidth) return;

    const columns = getColumns();
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

  function wireImageHandlers(grid) {
    const imgs = Array.from(grid.querySelectorAll("img"));
    imgs.forEach((img) => {
      if (img.dataset.masonryWired === "1") return;
      img.dataset.masonryWired = "1";

      // If the image fails, hide the tile and reflow.
      img.addEventListener(
        "error",
        () => {
          // If R2 is managing this image and hasn't finalized the src yet,
          // do NOT permanently hide the tile (we may swap src shortly).
          if (img.dataset && img.dataset.r2Managed === "1" && img.dataset.r2Final !== "1") {
            scheduleRelayout();
            return;
          }
          const tile = img.closest(".parallax-image") || img.parentElement;
          if (tile && tile.dataset) tile.dataset.masonryHidden = "1";
          if (tile && tile.style) tile.style.display = "none";
          scheduleRelayout();
        },
        { once: true }
      );

      img.addEventListener(
        "load",
        () => {
          scheduleRelayout();
        },
        { once: true }
      );
    });
  }

  function init() {
    const grids = getGrids();
    if (!grids.length) return;

    grids.forEach((grid) => {
      wireImageHandlers(grid);
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

