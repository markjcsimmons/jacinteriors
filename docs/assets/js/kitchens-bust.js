// Apply a cache-busting suffix to kitchen images so R2/CDN refreshes after replacements.
// This MUST run before `r2-images.js` wires images (so it can include the bust in initial URLs).
(function () {
  "use strict";

  const BUST = "20260213-kitchens";

  function apply() {
    const imgs = document.querySelectorAll(
      'img[data-r2-local-src*="assets/images/spaces/kitchens/"]'
    );
    imgs.forEach((img) => {
      if (!img.getAttribute("data-r2-bust")) img.setAttribute("data-r2-bust", BUST);
    });
  }

  // `defer` guarantees this runs after parsing but before deferred scripts after it.
  // Still, run `apply()` immediately (DOM is parsed at this point).
  try {
    apply();
  } catch (_) {}
})();

