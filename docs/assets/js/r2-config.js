// Raw R2 CDN origin (no trailing slash). Used for direct access and OG images.
window.R2_CDN_ORIGIN = "https://jacinteriorscdn.com";

// Cloudflare Image Transformations options.
// Served via /cdn-cgi/image/<opts>/<path> — resizes & converts to WebP/AVIF on the fly.
// width=1920 caps images at full-screen width; format=auto serves WebP/AVIF to supported browsers.
var R2_TRANSFORM_OPTS = "width=1920,quality=80,format=auto";

// R2_IMAGE_BASE is set to the transform URL so every script that builds image
// URLs as `${R2_IMAGE_BASE}/path/file.jpg` automatically gets optimised images.
// Requires Cloudflare Image Transformations to be enabled on jacinteriorscdn.com.
window.R2_IMAGE_BASE = "https://jacinteriorscdn.com/cdn-cgi/image/" + R2_TRANSFORM_OPTS;

// Videos bucket custom domain (R2 bucket: jac-videos)
// No trailing slash.
window.R2_VIDEO_BASE = "https://videos.jacinteriorscdn.com";
