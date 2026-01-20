/**
 * Use Cloudflare R2 as the image origin for Spaces pages without renaming files.
 *
 * This supports two modes:
 *
 * 1) Direct mapping (default):
 *    - HTML references `assets/images/spaces/<space>/<filename>`
 *    - R2 contains the same `<filename>` at `spaces/<space>/<filename>`
 *
 * 2) Manifest mapping (recommended when filenames differ):
 *    - Keep the HTML using numbered filenames (e.g. `bedrooms-1.jpg`, `bedrooms-2.jpg`)
 *    - Upload a manifest to R2 at: `spaces/<space>/manifest.json`
 *      with either:
 *        { "files": ["0E9A1642.jpg", "Annie Meisel Photography -10.jpg", ...] }
 *      or:
 *        ["0E9A1642.jpg", "Annie Meisel Photography -10.jpg", ...]
 *    - We map `<space>-N.*` to `files[N-1]` (1-indexed)
 *
 * Notes:
 * - We set a 1x1 placeholder src first to prevent GitHub Pages 404s.
 * - We mark images as R2-managed so masonry doesn't permanently hide them
 *   during the initial swap.
 */

(function () {
  const base = (window.R2_IMAGE_BASE || "").replace(/\/+$/, "");
  if (!base) return;

  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  const selector = 'img[src^="assets/images/spaces/"]';
  const imgs = Array.from(document.querySelectorAll(selector));
  if (!imgs.length) return;

  function parseSpaceAndName(localSrc) {
    // assets/images/spaces/<space>/<name>
    const m = localSrc.match(/^assets\/images\/spaces\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { space: m[1], name: m[2] };
  }

  function encodeName(name) {
    // Encode spaces and special chars safely; keep slashes if any (shouldn't be).
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  // Group images by space and keep their original local src.
  const bySpace = new Map(); // space -> [{ img, localSrc, originalName }]

  imgs.forEach((img) => {
    const localSrc = img.getAttribute("src") || "";
    const parsed = parseSpaceAndName(localSrc);
    if (!parsed) return;

    // Avoid double-wiring
    if (img.dataset.r2Wired === "1") return;
    img.dataset.r2Wired = "1";

    img.dataset.r2LocalSrc = localSrc;
    img.dataset.r2Space = parsed.space;
    img.dataset.r2OriginalName = parsed.name;
    img.dataset.r2Managed = "1";
    img.dataset.r2Final = "0";

    if (!bySpace.has(parsed.space)) bySpace.set(parsed.space, []);
    bySpace.get(parsed.space).push({ img, localSrc, originalName: parsed.name });

    // Prevent immediate GitHub Pages 404s by using a placeholder until we know the final URL.
    img.setAttribute("src", PLACEHOLDER_SRC);
  });

  async function fetchManifest(space) {
    const url = `${base}/spaces/${space}/manifest.json`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      const files = Array.isArray(data) ? data : Array.isArray(data?.files) ? data.files : null;
      if (!files) return null;
      return files.filter((x) => typeof x === "string" && x.trim().length);
    } catch {
      return null;
    }
  }

  function numericIndexFromName(space, name) {
    // bedrooms-12.jpg OR bedrooms-12-anything.jpg etc.
    const re = new RegExp(`^${space}-(\\\\d+)`, "i");
    const m = name.match(re);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : null;
  }

  function setFinalSrc(img, url) {
    if (!url) return;
    img.addEventListener(
      "error",
      () => {
        // If R2 fails, fall back to local
        const localSrc = img.dataset.r2LocalSrc;
        if (localSrc) img.setAttribute("src", localSrc);
      },
      { once: true }
    );
    img.dataset.r2Final = "1";
    img.setAttribute("src", url);
  }

  async function applyForSpace(space, entries) {
    const manifestFiles = await fetchManifest(space);

    // Map existing images
    entries.forEach(({ img, originalName }) => {
      let targetName = originalName;

      // If manifest exists and image uses numbered naming, map it.
      if (manifestFiles) {
        const idx = numericIndexFromName(space, originalName);
        if (idx && manifestFiles[idx - 1]) {
          targetName = manifestFiles[idx - 1];
        }
      }

      const url = `${base}/spaces/${space}/${encodeName(targetName)}`;
      setFinalSrc(img, url);
    });

    // If manifest has MORE images than the HTML, append the rest to the masonry grid.
    if (manifestFiles) {
      const grid = document.querySelector(".image-gallery-grid");
      if (grid) {
        const existingCount = entries.length;
        const extra = manifestFiles.slice(existingCount);
        extra.forEach((file) => {
          const item = document.createElement("div");
          item.className = "parallax-image scale-in-image hover-zoom-image";

          const container = document.createElement("div");
          container.className = "image-container";

          const img = document.createElement("img");
          img.alt = space.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          img.loading = "lazy";
          img.decoding = "async";
          img.dataset.r2Wired = "1";
          img.dataset.r2Managed = "1";
          img.dataset.r2Final = "1";
          img.setAttribute("src", `${base}/spaces/${space}/${encodeName(file)}`);

          container.appendChild(img);
          item.appendChild(container);
          grid.appendChild(item);
        });
      }
    }

    // Tell masonry to re-wire and relayout (if it's listening)
    document.dispatchEvent(new CustomEvent("spaces:gallery-updated"));
  }

  // Apply per space
  bySpace.forEach((entries, space) => {
    applyForSpace(space, entries);
  });
})();

