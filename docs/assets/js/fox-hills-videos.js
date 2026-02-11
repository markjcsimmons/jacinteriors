// Fox Hills Videos page: masonry video grid sourced from R2 folder.
(function () {
  "use strict";

  // Videos live in the `jac-videos` R2 bucket, exposed via a custom domain.
  // You can override by setting `window.R2_VIDEO_BASE`.
  const DEFAULT_VIDEO_BASE = "https://videos.jacinteriorscdn.com";
  const PROJECT_SLUG = "fox-hills";

  const PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

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
    const dirs = [`${PROJECT_SLUG}`, `jac-videos/${PROJECT_SLUG}`];
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

  function createVideoTile(label, index) {
    const tile = document.createElement("div");
    tile.className = "scale-in-image hover-zoom-image video-tile";
    tile.classList.add("visible");

    const container = document.createElement("div");
    container.className = "image-container";

    const video = document.createElement("video");
    video.controls = true;
    // Avoid large network pulls on initial render; users will click play.
    // This also avoids "metadata load failed" behavior on non-faststart MP4s.
    video.preload = "none";
    video.playsInline = true;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", label);

    // Treat as managed so masonry doesn't hide while we cycle fallbacks.
    video.dataset.r2Managed = "1";
    video.dataset.r2Space = "videos";
    // Keep r2Final unset/falsey so masonry doesn't hide on transient errors.
    video.dataset.r2Final = "0";

    // A tiny placeholder "poster" so the element has size early.
    video.poster = PLACEHOLDER_SRC;

    // Prefer poster thumbnails (upload alongside videos):
    // `fox-hills/fox-hills-16.jpg` or `fox-hills/fox-hills-16-thumb.jpg` etc.
    if (Number.isFinite(Number(index))) {
      trySetPoster(video, buildPosterCandidates(Number(index)));
    }

    container.appendChild(video);
    tile.appendChild(container);
    return { tile, video };
  }

  function hideTile(tile) {
    if (!tile) return;
    tile.dataset.masonryHidden = "1";
    tile.style.display = "none";
  }

  async function appendBatch(grid, startIndex, count) {
    const batchEnd = startIndex + count - 1;

    for (let i = startIndex; i <= batchEnd; i += 1) {
      const { tile, video } = createVideoTile(`Fox Hills video ${i}`, i);
      grid.appendChild(tile);

      const candidates = buildVideoCandidates(i);
      if (!candidates.length) {
        // Keep placeholder visible; nothing to load.
        continue;
      }

      setVideoWithFallback(video, candidates);
    }

    document.dispatchEvent(new Event("spaces:gallery-updated"));
  }

  function boot() {
    const grid = document.getElementById("videosGrid");
    if (!grid) return;

    grid.innerHTML = "";

    const loadMoreBtn = document.getElementById("videosLoadMore");
    const statusEl = document.getElementById("videosStatus");

    let nextIndex = 1;
    const BATCH_SIZE = 12;
    const MAX_INDEX = 25;

    async function loadMore() {
      if (!loadMoreBtn) return;
      const start = nextIndex;
      if (start > MAX_INDEX) {
        loadMoreBtn.disabled = true;
        if (statusEl) statusEl.textContent = "No more videos to load.";
        return;
      }

      loadMoreBtn.disabled = true;
      const prevLabel = loadMoreBtn.textContent;
      loadMoreBtn.textContent = "Loading…";
      if (statusEl) statusEl.textContent = "";

      await appendBatch(grid, start, BATCH_SIZE);
      nextIndex = start + BATCH_SIZE;

      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = prevLabel || "Load more";
    }

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", loadMore);
    }

    // Initial load
    loadMore().catch(() => {
      if (statusEl) {
        statusEl.textContent =
          "We couldn’t load videos yet. If you just connected the custom domain, wait for it to become Active, then refresh.";
      }
      if (loadMoreBtn) loadMoreBtn.disabled = false;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

