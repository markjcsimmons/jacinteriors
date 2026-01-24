/**
 * Load Spaces and Projects page images from Cloudflare R2.
 *
 * Spaces – HTML local paths: assets/images/spaces/<space>/<filename>
 *   R2: spaces/<space>/<filename>
 *
 * Projects – HTML local paths: assets/images/projects/<project>/<filename>
 *   R2: projects/<project>/<filename>
 *   e.g. assets/images/projects/22nd-street/22nd-street-1.jpg
 *        → https://jacinteriorscdn.com/projects/22nd-street/22nd-street-1.jpg
 *
 * If the direct path 404s (Spaces only), we try:
 *   spaces/<space>/<H1>/<filename>
 *
 * This avoids requiring any manifest.json (and avoids CORS fetch issues).
 */

(function () {
  const base = (window.R2_IMAGE_BASE || "").replace(/\/+$/, "");
  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  // Spaces and Projects
  const selector =
    'img[data-r2-local-src^="assets/images/spaces/"], img[src^="assets/images/spaces/"], ' +
    'img[data-r2-local-src^="assets/images/projects/"], img[src^="assets/images/projects/"]';
  const imgs = Array.from(document.querySelectorAll(selector));
  if (!imgs.length) return;

  /** @returns {{ type: 'spaces'|'projects', key: string, name: string }|null} */
  function parseLocalSrc(localSrc) {
    const spaceM = localSrc.match(/^assets\/images\/spaces\/([^/]+)\/(.+)$/);
    if (spaceM) return { type: "spaces", key: spaceM[1], name: spaceM[2] };
    const projM = localSrc.match(/^assets\/images\/projects\/([^/]+)\/(.+)$/);
    if (projM) return { type: "projects", key: projM[1], name: projM[2] };
    return null;
  }

  function encodeName(name) {
    // Encode spaces and special chars safely; keep slashes if any (shouldn't be).
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  // Group images by space or project
  const bySpace = new Map();   // space -> [{ img, localSrc, originalName }]
  const byProject = new Map(); // project -> [{ img, localSrc, originalName }]

  imgs.forEach((img) => {
    const localSrc =
      img.getAttribute("data-r2-local-src") || img.getAttribute("src") || "";
    const parsed = parseLocalSrc(localSrc);
    if (!parsed) return;

    // Avoid double-wiring
    if (img.dataset.r2Wired === "1") return;
    img.dataset.r2Wired = "1";

    img.dataset.r2LocalSrc = localSrc;
    if (!img.getAttribute("data-r2-local-src")) {
      img.setAttribute("data-r2-local-src", localSrc);
    }
    img.dataset.r2OriginalName = parsed.name;
    img.dataset.r2Managed = "1";
    img.dataset.r2Final = "0";
    if (parsed.type === "spaces") img.dataset.r2Space = parsed.key;

    if (parsed.type === "spaces") {
      if (!bySpace.has(parsed.key)) bySpace.set(parsed.key, []);
      bySpace.get(parsed.key).push({ img, localSrc, originalName: parsed.name });
    } else {
      if (!byProject.has(parsed.key)) byProject.set(parsed.key, []);
      byProject.get(parsed.key).push({ img, localSrc, originalName: parsed.name });
    }

    // If R2 is not configured, fall back to local.
    if (!base) {
      img.setAttribute("src", localSrc);
      return;
    }

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
        // If R2 fails, optionally try one nested folder based on the page H1 (Spaces only)
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

        // Projects: no nested retry; local path would resolve wrong from /projects/.
        // Mark final so masonry hides the tile; do not set a bad local src.
        if (!space) {
          img.dataset.r2Final = "1";
          return;
        }

        // Spaces: fall back to local
        const localSrc = img.dataset.r2LocalSrc;
        if (localSrc) img.setAttribute("src", localSrc);
      },
      { once: true }
    );
    img.setAttribute("src", url);
  }

  // Apply per space (direct mapping only)
  if (!base) return;
  bySpace.forEach((entries, space) => {
    entries.forEach(({ img, originalName }) => {
      img.dataset.r2TargetName = originalName;
      const url = `${base}/spaces/${space}/${encodeName(originalName)}`;
      setFinalSrc(img, url);
    });
  });

  // Apply per project: R2 path projects/<project>/<filename>
  byProject.forEach((entries, project) => {
    entries.forEach(({ img, originalName }) => {
      img.dataset.r2TargetName = originalName;
      const url = `${base}/projects/${project}/${encodeName(originalName)}`;
      setFinalSrc(img, url);
    });
  });

  // Tell masonry to re-wire and relayout (if it's listening)
  document.dispatchEvent(new CustomEvent("spaces:gallery-updated"));
})();

