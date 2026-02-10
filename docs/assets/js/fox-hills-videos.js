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
    // Prefer explicit video base, then fall back to image base (older config), then default.
    const raw = window.R2_VIDEO_BASE || window.R2_IMAGE_BASE || DEFAULT_VIDEO_BASE;
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

    return new Promise((resolve) => {
      video.addEventListener(
        "error",
        () => {
          const ok = tryNext();
          if (!ok) {
            // Exhausted: mark final and let caller decide to hide tile.
            video.dataset.r2Final = "1";
            resolve(false);
          }
        },
        { passive: true }
      );

      // Mark final once metadata loads.
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.dataset.r2Final = "1";
          document.dispatchEvent(new Event("spaces:gallery-updated"));
          resolve(true);
        },
        { once: true, passive: true }
      );

      tryNext();
    });

  }

  function createVideoTile(label) {
    const tile = document.createElement("div");
    tile.className = "scale-in-image hover-zoom-image";
    tile.classList.add("visible");

    const container = document.createElement("div");
    container.className = "image-container";

    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("aria-label", label);

    // Treat as managed so masonry doesn't hide while we cycle fallbacks.
    video.dataset.r2Managed = "1";
    video.dataset.r2Space = "videos";
    video.dataset.r2Final = "0";

    // A tiny placeholder "poster" so the element has size early.
    video.poster = PLACEHOLDER_SRC;

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
    const tasks = [];

    for (let i = startIndex; i <= batchEnd; i += 1) {
      const { tile, video } = createVideoTile(`Fox Hills video ${i}`);
      grid.appendChild(tile);

      const candidates = buildVideoCandidates(i);
      if (!candidates.length) {
        video.dataset.r2Final = "1";
        hideTile(tile);
        continue;
      }

      tasks.push(
        setVideoWithFallback(video, candidates).then((ok) => {
          if (!ok) hideTile(tile);
        })
      );
    }

    // Wait for the batch to settle so masonry can lay out predictably.
    await Promise.allSettled(tasks);
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

