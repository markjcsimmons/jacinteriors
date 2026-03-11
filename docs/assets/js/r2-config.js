// Cloudflare R2 public image base URL (no trailing slash).
window.R2_IMAGE_BASE = "https://jacinteriorscdn.com";

// Videos bucket custom domain (R2 bucket: jac-videos)
// No trailing slash.
window.R2_VIDEO_BASE = "https://videos.jacinteriorscdn.com";

// Preconnect + preload project hero for faster LCP (project pages only).
(function () {
  try {
    var p = (document.location.pathname || "");
    var m = p.match(/projects\/([^/]+)\.html$/);
    if (!m || !document.head) return;
    var slug = m[1];
    var base = "https://jacinteriorscdn.com";
    var preconnect = document.querySelector('link[rel="preconnect"][href="' + base + '"]');
    if (!preconnect) {
      var pc = document.createElement("link");
      pc.rel = "preconnect";
      pc.href = base;
      pc.setAttribute("crossorigin", "");
      document.head.appendChild(pc);
    }
    var file = (slug === "jamm-visual") ? "jamm-1.jpg" : slug + "-1.jpg";
    var pathSegment = (slug === "jamm-visual") ? "jamm" : slug;
    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = base + "/projects/" + encodeURIComponent(pathSegment) + "/" + encodeURIComponent(file);
    document.head.appendChild(link);
  } catch (_) {}
})();
