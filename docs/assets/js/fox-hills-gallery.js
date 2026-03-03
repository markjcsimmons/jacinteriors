/**
 * Fox Hills project page: load and display all images from R2 jac-images/projects/fox-hills/
 * Probes numbered filenames (fox-hills-1.jpg, fox-hills-2.jpg, ...) and appends each
 * successful load to the gallery grid. Stops after CONSECUTIVE_FAILURES consecutive 404s.
 */
(function () {
  "use strict";

  const PROJECT_SLUG = "fox-hills";
  // R2 bucket path jac-images/projects/fox-hills/. Try both URL shapes for CDN flexibility.
  const R2_PATHS = [
    "jac-images/projects/" + PROJECT_SLUG + "/",
    "projects/" + PROJECT_SLUG + "/"
  ];
  const BUST = "?v=20260218";
  const MAX_IMAGES = 120;
  const CONSECUTIVE_FAILURES = 5;
  const EXTS = ["jpg", "jpeg", "webp", "png", "JPG", "JPEG", "WEBP", "PNG"];

  function getBase() {
    const base = (window.R2_IMAGE_BASE || "https://jacinteriorscdn.com").toString().replace(/\/+$/, "");
    return base;
  }

  function buildUrls(filename) {
    const base = getBase();
    const encoded = encodeURIComponent(filename) + BUST;
    return R2_PATHS.map(function (p) {
      return base + "/" + p + encoded;
    });
  }

  function createTile(src, alt, index) {
    const wrap = document.createElement("div");
    wrap.className = "parallax-image scale-in-image hover-zoom-image";
    const container = document.createElement("div");
    container.className = "image-container";
    const img = document.createElement("img");
    img.alt = alt || "Fox Hills — " + (index + 1);
    img.loading = "lazy";
    img.decoding = "async";
    img.src = src;
    container.appendChild(img);
    wrap.appendChild(container);
    return wrap;
  }

  function tryNext(index, grid, consecutiveFails, done) {
    if (index > MAX_IMAGES || consecutiveFails >= CONSECUTIVE_FAILURES) {
      if (typeof done === "function") done();
      return;
    }

    const baseName = PROJECT_SLUG + "-" + index;
    const candidates = [];
    EXTS.forEach(function (ext) {
      const filename = baseName + "." + ext;
      buildUrls(filename).forEach(function (url) {
        candidates.push({ filename: filename, url: url });
      });
    });

    function attempt(ci) {
      if (ci >= candidates.length) {
        tryNext(index + 1, grid, consecutiveFails + 1, done);
        return;
      }
      const cand = candidates[ci];
      const img = new Image();
      img.onload = function () {
        const tile = createTile(cand.url, "Fox Hills", index - 1);
        grid.appendChild(tile);
        document.dispatchEvent(new CustomEvent("spaces:gallery-updated"));
        tryNext(index + 1, grid, 0, done);
      };
      img.onerror = function () {
        attempt(ci + 1);
      };
      img.src = cand.url;
    }

    attempt(0);
  }

  function run() {
    const grid = document.querySelector(".image-gallery-grid");
    if (!grid) return;
    // Clear any static placeholder tiles so we only show R2-loaded images
    grid.innerHTML = "";
    tryNext(1, grid, 0, function () {
      document.dispatchEvent(new CustomEvent("spaces:gallery-updated"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
