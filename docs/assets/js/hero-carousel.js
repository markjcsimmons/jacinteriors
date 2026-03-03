/**
 * Home page hero carousel.
 *
 * Loads 3 images from R2 bucket path: jac-images/carousel/
 * Probes common filename patterns (carousel-1.jpg, 1.jpg, hero-1.jpg, etc.)
 * and uses the first 3 that resolve successfully.
 *
 * Slides rotate every 3 seconds with a 1s crossfade.
 */

(function () {
  "use strict";

  const R2_FOLDER  = "jac-images/carousel/";
  const SLIDE_COUNT = 3;
  const INTERVAL_MS = 3000;
  const EXTS = ["jpg", "jpeg", "webp", "png", "JPG", "JPEG", "WEBP", "PNG"];

  // Candidate filename stems to probe for each numbered slot.
  // They are tried in order; the first that loads wins.
  function stemCandidates(n) {
    const n2 = String(n).padStart(2, "0");
    return [
      "carousel-" + n,
      "carousel-" + n2,
      "hero-" + n,
      "hero-" + n2,
      "slide-" + n,
      "slide-" + n2,
      String(n),
      n2,
    ];
  }

  function getBase() {
    return (window.R2_IMAGE_BASE || "https://jacinteriorscdn.com")
      .toString()
      .replace(/\/+$/, "");
  }

  function buildCandidateUrls(n) {
    const base = getBase();
    const urls = [];
    stemCandidates(n).forEach(function (stem) {
      EXTS.forEach(function (ext) {
        urls.push(base + "/" + R2_FOLDER + encodeURIComponent(stem + "." + ext));
      });
    });
    return urls;
  }

  function probeUrl(urls, index, callback) {
    if (index >= urls.length) { callback(null); return; }
    const img = new Image();
    img.onload  = function () { callback(urls[index]); };
    img.onerror = function () { probeUrl(urls, index + 1, callback); };
    img.src = urls[index];
  }

  function resolveSlot(n, callback) {
    probeUrl(buildCandidateUrls(n), 0, callback);
  }

  // ── Carousel logic ──────────────────────────────────────────────────────────

  function startCarousel(resolvedUrls) {
    const carousel = document.getElementById("heroCarousel");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".hero-carousel-slide"));
    const dots   = Array.from(carousel.querySelectorAll(".hero-carousel-dot"));
    if (!slides.length) return;

    // Set resolved R2 URLs on each slide's img.
    resolvedUrls.forEach(function (url, i) {
      if (!url) return;
      const img = slides[i] && slides[i].querySelector("img");
      if (img) img.src = url;
    });

    let current = 0;

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current] && dots[current].classList.remove("active");
      current = ((index % slides.length) + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current] && dots[current].classList.add("active");

      // Keep #heroZoomImg pointing at the visible slide (for scroll-parallax in main.js).
      const activeImg = slides[current].querySelector("img");
      const oldZoom   = document.getElementById("heroZoomImg");
      if (activeImg && oldZoom && activeImg !== oldZoom) {
        oldZoom.removeAttribute("id");
        activeImg.id = "heroZoomImg";
      }
    }

    // Dot click navigation.
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        clearInterval(timer);
        goTo(i);
        timer = setInterval(advance, INTERVAL_MS);
      });
    });

    function advance() { goTo(current + 1); }

    // Skip autoplay if we couldn't load any R2 images.
    if (!resolvedUrls.some(Boolean)) return;

    var timer = setInterval(advance, INTERVAL_MS);

    // Pause on hover for accessibility.
    carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
    carousel.addEventListener("mouseleave", function () {
      timer = setInterval(advance, INTERVAL_MS);
    });
  }

  // ── Entry point ─────────────────────────────────────────────────────────────

  function init() {
    const urls = new Array(SLIDE_COUNT).fill(null);
    let remaining = SLIDE_COUNT;

    for (let i = 0; i < SLIDE_COUNT; i++) {
      (function (slotIndex) {
        resolveSlot(slotIndex + 1, function (url) {
          urls[slotIndex] = url || null;
          remaining--;
          if (remaining === 0) startCarousel(urls);
        });
      })(i);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
