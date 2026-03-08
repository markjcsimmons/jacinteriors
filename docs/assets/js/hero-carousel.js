/**
 * Home page hero carousel — simple crossfade rotation.
 * Image src values are set directly in the HTML; this script only handles
 * the timing, crossfade, and dot navigation.
 */
(function () {
  "use strict";

  const INTERVAL_MS = 2000;

  function init() {
    const carousel = document.getElementById("heroCarousel");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".hero-carousel-slide"));
    const dots   = Array.from(carousel.querySelectorAll(".hero-carousel-dot"));
    if (slides.length < 2) return;

    let current = 0;

    function goTo(index) {
      slides[current].classList.remove("active");
      if (dots[current]) dots[current].classList.remove("active");

      current = ((index % slides.length) + slides.length) % slides.length;

      slides[current].classList.add("active");
      if (dots[current]) dots[current].classList.add("active");

      // Keep #heroZoomImg pointing at the visible slide for the scroll-parallax effect.
      const activeImg = slides[current].querySelector("img");
      const oldZoom   = document.getElementById("heroZoomImg");
      if (activeImg && oldZoom && activeImg !== oldZoom) {
        oldZoom.removeAttribute("id");
        activeImg.id = "heroZoomImg";
      }
    }

    // Dot click navigation
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        clearTimeout(timer);
        goTo(i);
        scheduleNext();
      });
    });

    function advance() { goTo(current + 1); }

    function scheduleNext() {
      timer = setTimeout(function () {
        advance();
        scheduleNext();
      }, INTERVAL_MS);
    }

    var timer;
    scheduleNext();

    // Pause on hover
    carousel.addEventListener("mouseenter", function () { clearTimeout(timer); });
    carousel.addEventListener("mouseleave", function () { scheduleNext(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
