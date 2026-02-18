/**
 * Load Spaces, Projects, and Cities images from Cloudflare R2.
 *
 * Supported HTML local paths (relative or ../relative):
 * - assets/images/spaces/<space>/<filename>   → {base}/jac-images/spaces/<space>/<filename>
 * - assets/images/projects/<project>/<filename> → {base}/projects/<project>/<filename>
 * - assets/images/cities/<filename>           → {base}/cities/<filename>
 *
 * Notes:
 * - Safe to call multiple times; images are "wired" once via data-r2-wired.
 * - Exposes a global `window.applyR2Images(root=document)` so SPA-like navigation can re-run it.
 * - This avoids requiring any manifest.json (and avoids CORS fetch issues).
 */

(function () {
  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  function normalizeLocalSrc(localSrc) {
    let s = (localSrc || "").trim();
    // Convert absolute-path to relative-path for matching.
    if (s.startsWith("/")) s = s.slice(1);
    while (s.startsWith("../")) s = s.slice(3);
    if (s.startsWith("./")) s = s.slice(2);
    return s;
  }

  /** @returns {{ type: 'spaces'|'projects'|'cities', key: string, name: string, normalizedSrc: string, fallbackSrc: string }|null} */
  function parseLocalSrc(rawLocalSrc) {
    const normalizedSrc = normalizeLocalSrc(rawLocalSrc);
    const fallbackSrc = (rawLocalSrc || "").trim();
    const spaceM = normalizedSrc.match(/^assets\/images\/spaces\/([^/]+)\/(.+)$/);
    if (spaceM) return { type: "spaces", key: spaceM[1], name: spaceM[2], normalizedSrc, fallbackSrc };
    const projM = normalizedSrc.match(/^assets\/images\/projects\/([^/]+)\/(.+)$/);
    if (projM) return { type: "projects", key: projM[1], name: projM[2], normalizedSrc, fallbackSrc };
    const cityM = normalizedSrc.match(/^assets\/images\/cities\/(.+)$/);
    if (cityM) return { type: "cities", key: "", name: cityM[1], normalizedSrc, fallbackSrc };
    return null;
  }

  function getAltNameVariants(name) {
    // Try common extension and case variants. (R2 keys are case-sensitive.)
    const m = name.match(/^(.*)\.(jpe?g|png|webp)$/i);
    if (!m) return [];
    const stem = m[1];
    const ext = m[2].toLowerCase();

    const orderedExts = [];
    if (ext === "jpg" || ext === "jpeg") {
      orderedExts.push("jpg", "JPG", "jpeg", "JPEG", "webp", "WEBP", "png", "PNG");
    } else if (ext === "png") {
      orderedExts.push("png", "PNG", "webp", "WEBP", "jpg", "JPG", "jpeg", "JPEG");
    } else if (ext === "webp") {
      orderedExts.push("webp", "WEBP", "jpg", "JPG", "jpeg", "JPEG", "png", "PNG");
    } else {
      orderedExts.push(ext, ext.toUpperCase());
    }

    // Remove the original ext (in its original casing) from the list
    const original = name;
    const variants = orderedExts.map((e) => `${stem}.${e}`);
    return variants.filter((v) => v !== original);
  }

  function getNumericNameVariants(name, maxSteps) {
    const steps = Math.max(1, Math.min(30, Number(maxSteps) || 10));
    const m = String(name || "").match(/^(.*?)(\d+)(\.[a-z0-9]+)$/i);
    if (!m) return [];
    const prefix = m[1];
    const numStr = m[2];
    const suffix = m[3];
    const width = numStr.length;
    const n = Number(numStr);
    if (!Number.isFinite(n)) return [];

    const out = [];
    for (let d = 1; d <= steps; d++) {
      const up = n + d;
      const down = n - d;
      if (up > 0) out.push(`${prefix}${String(up).padStart(width, "0")}${suffix}`);
      if (down > 0) out.push(`${prefix}${String(down).padStart(width, "0")}${suffix}`);
    }
    return out;
  }

  function encodeName(name) {
    // Encode spaces and special chars safely; keep slashes if any (shouldn't be).
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  /**
   * Optional cache-busting suffix for R2 URLs.
   * Usage:
   *   <img ... data-r2-bust="20260123" />
   * → appends "?v=20260123"
   *
   * If you pass a value that already starts with "?" or "&", we append it as-is.
   * This is intentionally not URL-encoded since it's a querystring, not part of the object key.
   */
  function getBustSuffix(img) {
    const raw = (img.getAttribute("data-r2-bust") || "").trim();
    if (!raw) return "";
    if (raw.startsWith("?") || raw.startsWith("&")) return raw;
    return `?v=${raw}`;
  }

  function encodeName(name) {
    // Encode spaces and special chars safely; keep slashes if any (shouldn't be).
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  /**
   * Optional cache-busting suffix for R2 URLs.
   * Usage:
   *   <img ... data-r2-bust="20260123" />
   * → appends "?v=20260123"
   */
  function getBustSuffix(img) {
    const raw = (img.getAttribute("data-r2-bust") || "").trim();
    if (!raw) return "";
    if (raw.startsWith("?") || raw.startsWith("&")) return raw;
    return `?v=${raw}`;
  }

  function getBase() {
    return (window.R2_IMAGE_BASE || "").toString().replace(/\/+$/, "");
  }

  function selectImages(root) {
    const selector =
      'img[data-r2-local-src*="assets/images/spaces/"], img[src*="assets/images/spaces/"], ' +
      'img[data-r2-local-src*="assets/images/projects/"], img[src*="assets/images/projects/"], ' +
      'img[data-r2-local-src*="assets/images/cities/"], img[src*="assets/images/cities/"]';
    return Array.from((root || document).querySelectorAll(selector));
  }

  // Group images by space or project, plus cities as a flat list.
  const bySpace = new Map(); // space -> [{ img, originalName }]
  const byProject = new Map(); // project -> [{ img, originalName }]
  const cityImgs = []; // [{ img, originalName }]

  function wireImages(root) {
    const base = getBase();
    const imgs = selectImages(root);
    if (!imgs.length) return;

    imgs.forEach((img) => {
      const rawLocalSrc = img.getAttribute("data-r2-local-src") || img.getAttribute("src") || "";
      const parsed = parseLocalSrc(rawLocalSrc);
      if (!parsed) return;

      // Avoid double-wiring
      if (img.dataset.r2Wired === "1") return;
      img.dataset.r2Wired = "1";

      img.dataset.r2LocalSrc = parsed.fallbackSrc;
      if (!img.getAttribute("data-r2-local-src")) {
        img.setAttribute("data-r2-local-src", parsed.fallbackSrc);
      }
      img.dataset.r2OriginalName = parsed.name;
      img.dataset.r2Managed = "1";
      img.dataset.r2Final = "0";
      img.dataset.r2Type = parsed.type;
      img.dataset.r2Key = parsed.key;
      if (parsed.type === "spaces") img.dataset.r2Space = parsed.key;

      if (parsed.type === "spaces") {
        if (!bySpace.has(parsed.key)) bySpace.set(parsed.key, []);
        bySpace.get(parsed.key).push({ img, originalName: parsed.name });
      } else if (parsed.type === "projects") {
        if (!byProject.has(parsed.key)) byProject.set(parsed.key, []);
        byProject.get(parsed.key).push({ img, originalName: parsed.name });
      } else {
        cityImgs.push({ img, originalName: parsed.name });
      }

      // If R2 is not configured, fall back to local.
      if (!base) {
        img.setAttribute("src", parsed.fallbackSrc);
        return;
      }

      img.setAttribute("src", PLACEHOLDER_SRC);
    });

    function setFinalSrc(img, url) {
      if (!url) return;
      const baseNow = getBase();

      img.addEventListener(
        "load",
        () => {
          img.dataset.r2Final = "1";
        },
        { once: true }
      );

      function handleError() {
        // Prevent infinite loops once we've given up.
        if (img.dataset.r2Final === "1") return;
        // Avoid re-entrancy if setting src triggers immediate errors synchronously.
        if (img.dataset.r2HandlingError === "1") return;
        img.dataset.r2HandlingError = "1";
        try {
          const type = img.dataset.r2Type || "";
          const key = img.dataset.r2Key || "";
          const name = img.dataset.r2TargetName || img.dataset.r2OriginalName || "";

          // 1) Try extension/case variants first (spaces + projects + cities)
          const tried = new Set((img.dataset.r2TriedNames || "").split("|").filter(Boolean));
          const variants = getAltNameVariants(name);
          for (const v of variants) {
            if (tried.has(v)) continue;
            tried.add(name);
            tried.add(v);
            img.dataset.r2TriedNames = Array.from(tried).join("|");
            img.dataset.r2TargetName = v;
            const bust = getBustSuffix(img);

            let altUrl = "";
            if (type === "cities") altUrl = `${baseNow}/cities/${encodeName(v)}${bust}`;
            else if (type === "spaces" && key) altUrl = `${baseNow}/jac-images/spaces/${key}/${encodeName(v)}${bust}`;
            else if (type && key) altUrl = `${baseNow}/${type}/${key}/${encodeName(v)}${bust}`;
            else altUrl = "";

            if (altUrl && img.getAttribute("src") !== altUrl) {
              img.setAttribute("src", altUrl);
              return;
            }
          }

          // 1b) Known missing keys: allow explicit alias fallback for specific images.
          // This keeps gallery pages resilient when a single numbered asset is missing in R2.
          if (type === "spaces" && key) {
            /** @type {Record<string, string[]>} */
            const aliasMap =
              key === "kitchens"
                ? {
                    // kitchens-22 is missing in R2; use the next available set.
                    "kitchens-22.jpg": ["kitchens-35.jpg", "kitchens-36.jpg", "kitchens-37.jpg"],
                  }
                : {};

            const aliases = aliasMap[name] || [];
            if (aliases.length) {
              const triedAliases = new Set(
                (img.dataset.r2TriedAliases || "").split("|").filter(Boolean)
              );
              for (const a of aliases) {
                if (triedAliases.has(a)) continue;
                triedAliases.add(a);
                img.dataset.r2TriedAliases = Array.from(triedAliases).join("|");
                img.dataset.r2TargetName = a;
                const aliasUrl = `${baseNow}/jac-images/spaces/${key}/${encodeName(a)}${getBustSuffix(img)}`;
                if (aliasUrl && img.getAttribute("src") !== aliasUrl) {
                  img.setAttribute("src", aliasUrl);
                  return;
                }
              }
            }
          }

          // 2) Spaces only: optionally try one nested folder based on the page H1
          if (type === "spaces") {
            const space = img.dataset.r2Space || "";
            const triedNested = img.dataset.r2TriedNested === "1";
            const h1Text = (document.querySelector("h1")?.textContent || "").trim();
            const nestedFolder = h1Text ? encodeName(h1Text) : "";
            const nestedUrl =
              space && name && nestedFolder
                ? `${baseNow}/jac-images/spaces/${space}/${nestedFolder}/${encodeName(name)}${getBustSuffix(img)}`
                : "";

            if (!triedNested && nestedUrl && img.getAttribute("src") !== nestedUrl) {
              img.dataset.r2TriedNested = "1";
              img.setAttribute("src", nestedUrl);
              return;
            }
          }

          // 3) Numeric fallback for spaces/projects/cities (e.g. kitchens-22.jpg → kitchens-23.jpg).
          // This prevents blank tiles when a single numbered asset is missing from R2.
          const triedNumeric = new Set(
            (img.dataset.r2TriedNumeric || "").split("|").filter(Boolean)
          );
          const numeric = getNumericNameVariants(name, 12);
          for (const v of numeric) {
            if (triedNumeric.has(v)) continue;
            triedNumeric.add(v);
            img.dataset.r2TriedNumeric = Array.from(triedNumeric).join("|");
            img.dataset.r2TargetName = v;
            const bust = getBustSuffix(img);

            let altUrl = "";
            if (type === "cities") altUrl = `${baseNow}/cities/${encodeName(v)}${bust}`;
            else if (type === "spaces" && key) altUrl = `${baseNow}/jac-images/spaces/${key}/${encodeName(v)}${bust}`;
            else if (type && key) altUrl = `${baseNow}/${type}/${key}/${encodeName(v)}${bust}`;
            else altUrl = "";

            if (altUrl && img.getAttribute("src") !== altUrl) {
              img.setAttribute("src", altUrl);
              return;
            }
          }

          // Fall back to local for all types (projects/spaces/cities).
          // This prevents blank tiles when an asset is missing from R2/CDN but present locally.
          const localSrc = img.dataset.r2LocalSrc;
          if (localSrc) {
            img.setAttribute("src", localSrc);
            img.dataset.r2Final = "1";
            img.removeEventListener("error", handleError);
            return;
          }

          // If we have nothing to fall back to, mark as final so grids can handle it.
          img.dataset.r2Final = "1";
          img.removeEventListener("error", handleError);
        } finally {
          img.dataset.r2HandlingError = "0";
        }
      }

      // IMPORTANT: do not use { once: true } here — we may need multiple fallback attempts.
      img.addEventListener("error", handleError);

      img.setAttribute("src", url);
    }

    if (!base) return;

    // Apply per space (R2 path: jac-images/spaces/<space>/)
    bySpace.forEach((entries, space) => {
      entries.forEach(({ img, originalName }) => {
        img.dataset.r2TargetName = originalName;
        const url = `${base}/jac-images/spaces/${space}/${encodeName(originalName)}${getBustSuffix(img)}`;
        setFinalSrc(img, url);
      });
    });

    // Apply per project
    byProject.forEach((entries, project) => {
      entries.forEach(({ img, originalName }) => {
        img.dataset.r2TargetName = originalName;
        const url = `${base}/projects/${project}/${encodeName(originalName)}${getBustSuffix(img)}`;
        setFinalSrc(img, url);
      });
    });

    // Apply cities
    cityImgs.forEach(({ img, originalName }) => {
      img.dataset.r2TargetName = originalName;
      const url = `${base}/cities/${encodeName(originalName)}${getBustSuffix(img)}`;
      setFinalSrc(img, url);
    });

    // Tell masonry to re-wire and relayout (if it's listening)
    document.dispatchEvent(new CustomEvent("spaces:gallery-updated"));
  }

  // Expose globally for SPA / dynamic content updates.
  window.applyR2Images = function (root) {
    // Clear per-call containers to avoid growing across calls.
    bySpace.clear();
    byProject.clear();
    cityImgs.length = 0;
    wireImages(root || document);
  };

  // Run once on initial load.
  window.applyR2Images(document);
})();

