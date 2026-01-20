/**
 * Load Spaces page images from Cloudflare R2.
 *
 * HTML uses local paths:
 *   assets/images/spaces/<space>/<filename>
 *
 * R2 contains objects:
 *   spaces/<space>/<filename>
 *
 * We rewrite src to:
 *   `${R2_IMAGE_BASE}/spaces/<space>/<filename>`
 *
 * If the direct path 404s, we try one common upload pattern where a folder
 * named after the page title was uploaded into the prefix:
 *   `${R2_IMAGE_BASE}/spaces/<space>/<H1>/<filename>`
 *
 * This avoids requiring any `manifest.json` (and avoids CORS fetch issues).
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

  function setFinalSrc(img, url) {
    if (!url) return;
    // Only mark as final once we've successfully loaded.
    // This prevents masonry from permanently hiding tiles while we're still iterating on mapping.
    img.addEventListener(
      "load",
      () => {
        img.dataset.r2Final = "1";
      },
      { once: true }
    );
    img.addEventListener(
      "error",
      () => {
        // If R2 fails, optionally try one nested folder based on the page H1 (common when uploading a folder)
        // e.g. spaces/bedrooms/Bedrooms/bedrooms-1.jpg
        const space = img.dataset.r2Space || "";
        const name = img.dataset.r2TargetName || img.dataset.r2OriginalName || "";
        const triedNested = img.dataset.r2TriedNested === "1";

        const h1Text = (document.querySelector("h1")?.textContent || "").trim();
        const nestedFolder = h1Text ? encodeName(h1Text) : "";
        const nestedUrl =
          space && name && nestedFolder
            ? `${base}/spaces/${space}/${nestedFolder}/${encodeName(name)}`
            : "";

        if (!triedNested && nestedUrl && img.getAttribute("src") !== nestedUrl) {
          img.dataset.r2TriedNested = "1";
          img.setAttribute("src", nestedUrl);
          return;
        }

        // Otherwise fall back to local
        const localSrc = img.dataset.r2LocalSrc;
        if (localSrc) img.setAttribute("src", localSrc);
      },
      { once: true }
    );
    img.setAttribute("src", url);
  }

  // Apply per space (direct mapping only)
  bySpace.forEach((entries, space) => {
    entries.forEach(({ img, originalName }) => {
      img.dataset.r2TargetName = originalName;
      const url = `${base}/spaces/${space}/${encodeName(originalName)}`;
      setFinalSrc(img, url);
    });
  });

  // Tell masonry to re-wire and relayout (if it's listening)
  document.dispatchEvent(new CustomEvent("spaces:gallery-updated"));
})();

