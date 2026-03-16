// Fox Hills Videos page: masonry video grid sourced from R2 folder.
(function () {
  "use strict";

  // Videos live in the `jac-videos` R2 bucket, exposed via a custom domain.
  // You can override by setting `window.R2_VIDEO_BASE`.
  const DEFAULT_VIDEO_BASE = "https://videos.jacinteriorscdn.com";
  const PROJECT_SLUG = "fox-hills";

  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  // Hide duplicate tiles if two videos share the same thumbnail.
  const seenThumbSrc = new Set();
  // Optional: hide specific video numbers if needed (e.g. duplicates).
  // Example: const SKIP_INDEXES = new Set([12]);
  const SKIP_INDEXES = new Set();

  function r2VideoBase() {
    // Prefer explicit video base; otherwise use the default videos domain.
    // (Do NOT fall back to R2_IMAGE_BASE — that points to the images bucket.)
    const raw = window.R2_VIDEO_BASE || DEFAULT_VIDEO_BASE;
    return String(raw || "").replace(/\/+$/, "");
  }

  function encodeName(name) {
    return encodeURIComponent(name).replace(/%2F/g, "/");
  }

  function buildVideoCandidates(index) {
    const base = r2VideoBase();
    const n = Math.max(1, Number(index) || 1);
    if (!base) return [];

    const urls = [];

    // Support both possible folder layouts:
    // - bucket root contains `fox-hills/...`
    // - bucket root contains `jac-videos/fox-hills/...` (older assumed layout)
    const dirs = [
      `${PROJECT_SLUG}`,
      `jac-videos/${PROJECT_SLUG}`,
    ];

    // Your current naming example:
    // - clean: `fox-hills/fox-hills-16.mp4`
    // - legacy: `fox-hills/Fox-Hills 25.mph.mp4`
    const n2 = String(n).padStart(2, "0");
    const fileNames = [
      // Common "clean" variants (if you rename later)
      `${PROJECT_SLUG}-${n}.mp4`,
      `${PROJECT_SLUG}-${n2}.mp4`,
      `${PROJECT_SLUG}-video-${n}.mp4`,
      `${PROJECT_SLUG}-clip-${n}.mp4`,
      `${n}.mp4`,
      `${n2}.mp4`,

      // Other containers just in case
      `${PROJECT_SLUG}-${n}.webm`,
      `${PROJECT_SLUG}-${n2}.webm`,
      `${PROJECT_SLUG}-${n}.mov`,
      `${PROJECT_SLUG}-${n2}.mov`,

      // Legacy patterns (keep last to minimize 404 churn)
      `Fox-Hills ${n}.mph.mp4`,
      `Fox-Hills ${n2}.mph.mp4`,
      `Fox Hills ${n}.mph.mp4`,
      `Fox Hills ${n2}.mph.mp4`,
    ];

    for (const dir of dirs) {
      for (const file of fileNames) {
        urls.push(`${base}/${dir}/${encodeName(file)}`);
      }
    }

    return urls;
  }

  function buildPosterCandidates(index) {
    const base = r2VideoBase();
    const n = Math.max(1, Number(index) || 1);
    if (!base) return [];

    const n2 = String(n).padStart(2, "0");
    // Thumbnails live at: fox-hills/fox-hills-thumbnails/fox-hills-N.jpg
    // Try the confirmed working path first to avoid unnecessary 404s.
    const dirs = [
      `${PROJECT_SLUG}/${PROJECT_SLUG}-thumbnails`,
      `${PROJECT_SLUG}`,
      `jac-videos/${PROJECT_SLUG}/${PROJECT_SLUG}-thumbnails`,
      `jac-videos/${PROJECT_SLUG}`,
    ];
    const exts = ["jpg", "jpeg", "webp", "png", "JPG", "JPEG", "WEBP", "PNG"];
    const stems = [
      `${PROJECT_SLUG}-${n}`,
      `${PROJECT_SLUG}-${n2}`,
      `${PROJECT_SLUG}-${n}-thumb`,
      `${PROJECT_SLUG}-${n2}-thumb`,
      `${n}`,
      `${n2}`,
    ];

    const out = [];
    for (const dir of dirs) {
      for (const stem of stems) {
        for (const ext of exts) {
          out.push(`${base}/${dir}/${encodeName(`${stem}.${ext}`)}`);
        }
      }
    }
    return out;
  }

  function trySetPoster(video, candidates) {
    const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    if (!video || !list.length) return;
    if (video.dataset.posterAttempted === "1") return;
    video.dataset.posterAttempted = "1";

    let i = 0;
    const probe = () => {
      if (i >= list.length) return;
      const url = list[i++];
      const img = new Image();
      img.onload = () => {
        // Setting poster to a cross-origin image is fine for <video>.
        video.poster = url;
      };
      img.onerror = () => probe();
      img.src = url;
    };
    probe();
  }

  function setVideoWithFallback(video, candidates) {
    const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    let idx = 0;

    function tryNext() {
      if (idx >= list.length) return false;
      const next = list[idx++];
      video.src = next;
      // Force reload attempt
      try {
        video.load();
      } catch (_) {}
      return true;
    }

    // IMPORTANT:
    // Many MP4s will fail `preload=metadata` if they're not "fast start" (moov atom at end),
    // or if the file is very large and the connection is slow. If we mark these as "final",
    // the masonry script may hide the entire tile after an error.
    //
    // So for videos: never set `data-r2-final="1"` here. We keep tiles visible even if
    // metadata fails, and we only try a small set of fallback filenames.
    video.addEventListener(
      "error",
      () => {
        const ok = tryNext();
        if (!ok) {
          video.dataset.r2Exhausted = "1";
          document.dispatchEvent(new Event("spaces:gallery-updated"));
        }
      },
      { passive: true }
    );

    // Relayout once we have intrinsic dimensions.
    video.addEventListener(
      "loadedmetadata",
      () => {
        video.dataset.r2Loaded = "1";
        document.dispatchEvent(new Event("spaces:gallery-updated"));
      },
      { once: true, passive: true }
    );

    tryNext();
  }

  function probeAspectRatio(index, candidates, onAspect) {
    const list = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
    if (!list.length) return;

    let i = 0;
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");

    const cleanup = () => {
      try {
        v.removeAttribute("src");
        v.load();
      } catch (_) {}
    };

    const tryNext = () => {
      if (i >= list.length) {
        cleanup();
        return;
      }
      v.src = list[i++];
      try {
        v.load();
      } catch (_) {}
    };

    v.addEventListener(
      "loadedmetadata",
      () => {
        const w = Number(v.videoWidth || 0);
        const h = Number(v.videoHeight || 0);
        if (w > 0 && h > 0) onAspect(w, h);
        cleanup();
      },
      { once: true, passive: true }
    );

    v.addEventListener(
      "error",
      () => {
        tryNext();
      },
      { passive: true }
    );

    tryNext();
  }

  function openVideoModal(label, index) {
    const idx = Number(index);
    if (!Number.isFinite(idx)) return;

    const overlay = document.createElement("div");
    overlay.className = "video-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", label || "Video player");

    const modal = document.createElement("div");
    modal.className = "video-modal";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "video-modal-close";
    closeBtn.setAttribute("aria-label", "Close video");
    closeBtn.textContent = "×";

    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", label || `Fox Hills video ${idx}`);
    video.dataset.r2Managed = "1";
    video.dataset.r2Space = "videos";
    video.dataset.r2Final = "0";

    const candidates = buildVideoCandidates(idx);
    if (candidates.length) setVideoWithFallback(video, candidates);

    const cleanup = () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch (_) {}
      overlay.remove();
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") cleanup();
    };

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup();
    });

    modal.appendChild(video);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);

    // Autoplay best-effort.
    try {
      video.play();
    } catch (_) {}
  }

  function createVideoTile(label, index) {
    const tile = document.createElement("div");
    tile.className = "scale-in-image hover-zoom-image video-tile";
    tile.classList.add("visible");

    const container = document.createElement("div");
    container.className = "image-container";

    // Frame that controls tile height (mosaic) using aspect-ratio.
    const frame = document.createElement("div");
    frame.className = "video-thumb-frame";
    frame.style.aspectRatio = "16 / 9";

    const thumb = document.createElement("img");
    thumb.alt = label;
    thumb.loading = "lazy";
    thumb.decoding = "async";
    thumb.src = PLACEHOLDER_SRC;
    thumb.className = "video-thumb";
    thumb.dataset.r2Managed = "1";
    thumb.dataset.r2Space = "videos";
    thumb.dataset.r2Final = "0";

    if (Number.isFinite(Number(index))) {
      // Set poster image via candidate probing.
      const candidates = buildPosterCandidates(Number(index));
      // Reuse the existing probe logic to pick the first available image.
      trySetPoster(
        /** @type {HTMLVideoElement} */ ({
          dataset: thumb.dataset,
          poster: "",
          set poster(url) {
            thumb.src = url;
            thumb.dataset.r2Final = "1";
            document.dispatchEvent(new Event("spaces:gallery-updated"));
          },
        }),
        candidates
      );
    }

    const overlay = document.createElement("button");
    overlay.type = "button";
    overlay.className = "video-play-overlay";
    overlay.setAttribute("aria-label", "Play video");
    overlay.innerHTML = `
      <span class="video-play-overlay__circle" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="video-play-overlay__icon" aria-hidden="true" focusable="false">
          <path d="M8 5v14l11-7L8 5z"></path>
        </svg>
      </span>
    `.trim();

    const showOverlay = () => {
      overlay.dataset.state = "shown";
    };
    const hideOverlay = () => {
      overlay.dataset.state = "hidden";
    };

    overlay.addEventListener("click", () => {
      // Keep the mosaic grid stable and open a near full-screen player.
      openVideoModal(label, index);
    });

    frame.appendChild(thumb);
    frame.appendChild(overlay);
    container.appendChild(frame);
    tile.appendChild(container);

    // Probe the real video aspect ratio to make the mosaic tiles match portrait/landscape.
    if (Number.isFinite(Number(index))) {
      const idx = Number(index);
      const candidates = buildVideoCandidates(idx);
      probeAspectRatio(idx, candidates.slice(0, 2), (w, h) => {
        frame.style.aspectRatio = `${w} / ${h}`;
        document.dispatchEvent(new Event("spaces:gallery-updated"));
      });
    }

    return { tile, thumb };
  }

  function hideTile(tile) {
    if (!tile) return;
    tile.dataset.masonryHidden = "1";
    tile.style.display = "none";
  }

  async function appendBatch(grid, startIndex, count) {
    const batchEnd = startIndex + count - 1;

    for (let i = startIndex; i <= batchEnd; i += 1) {
      if (SKIP_INDEXES.has(i)) continue;
      const { tile, thumb } = createVideoTile(`Fox Hills video ${i}`, i);
      grid.appendChild(tile);

      // De-dupe once a real thumbnail loads (not the placeholder).
      if (thumb) {
        thumb.addEventListener(
          "load",
          () => {
            const src = String(thumb.currentSrc || thumb.src || "");
            if (!src || src === PLACEHOLDER_SRC) return;
            if (seenThumbSrc.has(src)) {
              tile.dataset.masonryHidden = "1";
              tile.style.display = "none";
              document.dispatchEvent(new Event("spaces:gallery-updated"));
              return;
            }
            seenThumbSrc.add(src);
          },
          { once: true, passive: true }
        );
      }
    }

    document.dispatchEvent(new Event("spaces:gallery-updated"));
  }

  function boot() {
    const grid = document.getElementById("videosGrid");
    if (!grid) return;

    grid.innerHTML = "";

    const SHOW_INDEXES = [6, 8, 10, 13, 21];
    SHOW_INDEXES.forEach((i) => {
      const { tile, thumb } = createVideoTile(`Fox Hills video ${i}`, i);
      grid.appendChild(tile);

      if (thumb) {
        thumb.addEventListener(
          "load",
          () => {
            const src = String(thumb.currentSrc || thumb.src || "");
            if (!src || src === PLACEHOLDER_SRC) return;
            if (seenThumbSrc.has(src)) {
              tile.dataset.masonryHidden = "1";
              tile.style.display = "none";
              document.dispatchEvent(new Event("spaces:gallery-updated"));
              return;
            }
            seenThumbSrc.add(src);
          },
          { once: true, passive: true }
        );
      }
    });

    document.dispatchEvent(new Event("spaces:gallery-updated"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

