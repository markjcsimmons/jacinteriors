// Portfolio page: render project list from navbar dropdown
(function () {
  'use strict';

  const FALLBACK_PRIMARY = 'assets/images/projects/bg-hero_2000x7e9e.jpg';
  const FALLBACK_HOVER = 'assets/images/projects/bohoheader_2000x0667.jpg';
  const FALLBACK_SECONDARY = 'assets/images/projects/livingroomsm-550x500_2000x0aaf.jpg';

  const PLACEHOLDER_SRC =
    'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // Default to production CDN even if r2-config.js fails to load.
  const DEFAULT_R2_BASE = 'https://jacinteriorscdn.com';
  function getR2Base() {
    return (window.R2_IMAGE_BASE || DEFAULT_R2_BASE).toString().replace(/\/+$/, '');
  }

  // Manual image overrides per project slug.
  // Format: slug -> [mainImageN, smallImage1N, smallImage2N]
  // Images are loaded from R2: projects/{slug}/{filenamePrefix}-{N}.jpg
  // Use FILENAME_PREFIX when R2 filenames differ from slug (e.g. jamm-visual -> jamm-visual-1.jpg).
  const FILENAME_PREFIX = { 'jamm-visual': 'JAMM-visual', 'colette-way': 'collette-way' };
  // R2 path may differ (e.g. jamm-visual -> projects/JAMM-visual).
  const R2_PROJECT_PATH = { 'jamm-visual': 'projects/JAMM-visual' };

  function getR2ProjectPath(projectSlug) {
    return R2_PROJECT_PATH[projectSlug] || 'projects/' + projectSlug;
  }
  const IMAGE_OVERRIDES = {
    '22nd-street':  [ 5,  1,  3],
    'sunnyside':    [11,  3, 10],
    'frances':      [ 1,  6, 14],
    'columbus-way': [ 6,  3,  5],
    'colette-way':      [ 5,  1, 17],
    'river-homestead':  [ 1,  4, 17],
    'oakwood':      [ 3,  8,  5],
    'wilshire':         [ 4,  3, 10],
    'mulholland-drive': [ 5,  4, 12],
    'via-pisa':         [ 1,  2,  5],
    'galewood':         [ 1,  9,  2],
    'ronda':            [ 8,  9,  3],
    'alpine':           [ 1,  5,  3],
    'peary-way':        [ 1,  7,  8],
    'monaco':           [ 4,  2,  6],
    'valley-vista':     [ 1,  2,  5],
    'colby':            [ 1,  5,  7],
    'brown-deer-park':  [ 7,  9,  8],
    'sherbourne':       [ 1,  2,  8],
    'jamm-visual':      [ 1,  8,  4],
  };

  // Projects hidden from the portfolio page cards (still appear in navbar dropdown).
  const PORTFOLIO_CARD_EXCLUDE = new Set([
    'projects/presson-place.html',
    'projects/highland.html',
    'projects/medio.html',
  ]);

  // Fallback list in case navbar injection fails for any reason.
  // Keep in sync with the Portfolio dropdown in load-navbar.js.
  const FALLBACK_PROJECT_LINKS = [
    { title: 'Fox Hills', href: 'projects/fox-hills.html' },
    { title: '22nd Street', href: 'projects/22nd-street.html' },
    { title: 'Sunnyside', href: 'projects/sunnyside.html' },
    { title: 'Frances', href: 'projects/frances.html' },
    { title: 'Columbus Way', href: 'projects/columbus-way.html' },
    { title: 'Colette Way', href: 'projects/colette-way.html' },
    { title: 'River Homestead', href: 'projects/river-homestead.html' },
    { title: 'Oakwood', href: 'projects/oakwood.html' },
    { title: 'Wilshire', href: 'projects/wilshire.html' },
    { title: 'Mulholland Drive', href: 'projects/mulholland-drive.html' },
    { title: 'Via Pisa', href: 'projects/via-pisa.html' },
    { title: 'Galewood', href: 'projects/galewood.html' },
    { title: 'Ronda', href: 'projects/ronda.html' },
    { title: 'Alpine', href: 'projects/alpine.html' },
    { title: 'Peary Place', href: 'projects/peary-way.html' },
    { title: 'Monaco', href: 'projects/monaco.html' },
    { title: 'Valley Vista', href: 'projects/valley-vista.html' },
    { title: 'Colby', href: 'projects/colby.html' },
    { title: 'Sherbourne', href: 'projects/sherbourne.html' },
    { title: 'Highland', href: 'projects/highland.html' },
    { title: 'Vale Crest', href: 'projects/vale-crest.html' },
    { title: 'Presson Place', href: 'projects/presson-place.html' },
    { title: 'Medio', href: 'projects/medio.html' },
    { title: 'Brown Deer Park', href: 'projects/brown-deer-park.html' },
    { title: 'JAMM Agency Office', href: 'projects/jamm-visual.html' },
  ];

  function encodeName(name) {
    return encodeURIComponent(name).replace(/%2F/g, '/');
  }

  function parseProjectLocalSrc(localSrc) {
    // assets/images/projects/<project>/<filename>
    const m = (localSrc || '').match(/^assets\/images\/projects\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { project: m[1], name: m[2] };
  }

  function toFinalSrc(localSrc) {
    const parsed = parseProjectLocalSrc(localSrc);
    if (!parsed) return localSrc;
    const base = getR2Base();
    if (!base) return localSrc;
    const path = getR2ProjectPath(parsed.project);
    return `${base}/${path}/${encodeName(parsed.name)}`;
  }

  function getProjectLinksFromNavbar() {
    const nav = document.querySelector('nav.navbar');
    if (!nav) return [];

    // Portfolio dropdown: anchor to portfolio.html + adjacent dropdown content
    const portfolioDropdown = Array.from(nav.querySelectorAll('.nav-dropdown')).find((d) => {
      const a = d.querySelector('a[href*="portfolio.html"]');
      return Boolean(a);
    });

    if (!portfolioDropdown) return [];

    const links = Array.from(portfolioDropdown.querySelectorAll('.nav-dropdown-content a[href*="projects/"]'));
    return links
      .map((a) => ({
        title: (a.textContent || '').trim(),
        href: a.getAttribute('href') || '',
      }))
      .filter((x) => x.title && x.href)
      .filter((x) => !PORTFOLIO_CARD_EXCLUDE.has(x.href.replace(/^.*projects\//, 'projects/')));
  }

  function slugFromHref(href) {
    // href examples:
    // - /jacinteriors/projects/beverly-hills-alpine.html
    // - projects/beverly-hills-alpine.html
    const m = href.match(/projects\/([^/?#]+)\.html/i);
    return m ? m[1] : '';
  }

  function normalizeProjectHref(href) {
    let h = (href || '').trim();
    if (!h) return '';

    // Fix local-dev edge case where navbar basePath becomes "/portfolio.html"
    // Example: "/portfolio.html/projects/22nd-street.html" -> "/projects/22nd-street.html"
    h = h.replace(/^\/[^/]+\.html\/projects\//i, '/projects/');

    try {
      return new URL(h, window.location.href).toString();
    } catch (_) {
      return h;
    }
  }

  function buildProjectItem({ title, href }) {
    const slug = slugFromHref(href);
    const el = document.createElement('div');
    el.className = 'project-list-item';
    el.dataset.projectSlug = slug || '';
    el.dataset.projectHref = href || '';
    el.innerHTML = `
      <div style="display: flex; width: 100%;">
        <div class="project-list-image">
          <img src="${PLACEHOLDER_SRC}" alt="${title}" class="primary-img" loading="lazy">
          <img src="${PLACEHOLDER_SRC}" alt="${title}" class="hover-img" loading="lazy" style="position: absolute; top: 0; left: 0; opacity: 0; transition: opacity 0.3s;">
        </div>
        <div class="project-list-content">
          <div style="margin-bottom: 2rem;">
            <div class="project-tags-top" aria-label="Project details">
              <span class="tag-gray" data-project-tag="0">…</span>
              <span class="tag-gray" data-project-tag="1">…</span>
              <span class="tag-gray" data-project-tag="2">…</span>
              <span class="tag-gray" data-project-tag="3">…</span>
            </div>
            <h3 style="font-size: 2.5rem; font-weight: 500; margin: 0.5rem 0 0.75rem 0; letter-spacing: -1px;">${title}</h3>
          </div>
          <div class="project-bottom-row" style="margin-top: auto;">
            <a href="${href}" class="view-project-btn">View project</a>
            <div class="project-secondary-image">
              <img src="${PLACEHOLDER_SRC}" alt="${title} Detail" loading="lazy">
            </div>
          </div>
        </div>
      </div>
    `.trim();

    // Fallback images if we can't resolve project images
    const primary = el.querySelector('img.primary-img');
    const hover = el.querySelector('img.hover-img');
    const secondary = el.querySelector('.project-secondary-image img');

    if (primary) primary.addEventListener('error', () => (primary.src = FALLBACK_PRIMARY), { once: true });
    if (hover) hover.addEventListener('error', () => (hover.src = FALLBACK_HOVER), { once: true });
    if (secondary) secondary.addEventListener('error', () => (secondary.src = FALLBACK_SECONDARY), { once: true });

    return el;
  }

  async function fetchProjectImages(projectHref) {
    // Fetch project page HTML and extract first 3 project image paths.
    // Avoid stale HTML when project pages change (callouts/images).
    const res = await fetch(projectHref, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${projectHref}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img'));

    const candidates = [];
    const seen = new Set();

    function normalizeLocalSrc(raw) {
      const s = (raw || '').trim();
      if (!s) return '';
      // Keep direct CDN URLs as-is
      if (/^https?:\/\//i.test(s)) return s;
      // Normalize any relative prefixes, e.g. "../assets/images/projects/..."
      const idx = s.indexOf('assets/images/projects/');
      if (idx >= 0) return s.slice(idx);
      return s;
    }

    function push(rawSrc) {
      const src = normalizeLocalSrc(rawSrc);
      if (!src) return;
      // Only accept project images (local path or CDN project path)
      if (!src.startsWith('assets/images/projects/') && !/\/projects\/[^/]+\//.test(src)) return;
      if (seen.has(src)) return;
      seen.add(src);
      candidates.push(src);
    }

    imgs.forEach((img) => {
      push(img.getAttribute('data-r2-local-src') || '');
    });
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('data:')) return;
      push(src);
    });

    return candidates; // all images, not just first 3
  }

  // Cycle cardEl through all urls, crossfading every 2 seconds.
  // urls[0] is shown first. Staggered by card index so cards don't all flip together.
  function startImageCycle(cardEl, urls) {
    if (!urls || urls.length < 2) return;
    const primary = cardEl.querySelector('img.primary-img');
    if (!primary) return;

    let cur    = 0;
    let paused = false;
    const cardIndex = parseInt(cardEl.dataset.cardIndex || '0');

    primary.src = urls[0];

    // Preload all images so transitions are instant
    urls.forEach(u => { const img = new Image(); img.src = u; });

    setTimeout(() => {
      setInterval(() => {
        if (paused) return;
        cur = (cur + 1) % urls.length;
        primary.src = urls[cur];
      }, 2000);
    }, cardIndex * 75);

    cardEl.addEventListener('mouseenter', () => { paused = true; });
    cardEl.addEventListener('mouseleave', () => { paused = false; });
  }

  function extractProjectCallouts(doc) {
    // Most project pages: <div class="project-callouts"><span class="project-callout">...</span>...</div>
    const callouts = Array.from(doc.querySelectorAll('.project-callouts .project-callout'))
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean);
    return callouts.slice(0, 4);
  }

  function defaultFirstImageUrl(slug) {
    const base = getR2Base();
    if (!base) return FALLBACK_PRIMARY;
    const path = getR2ProjectPath(slug);
    const prefix = FILENAME_PREFIX[slug] || slug;
    return `${base}/${path}/${prefix}-1.jpg`;
  }

  async function hydrateCardImages(cardEl) {
    const rawHref = cardEl.dataset.projectHref || '';
    const href = normalizeProjectHref(rawHref);
    if (!href) return;

    const primary   = cardEl.querySelector('img.primary-img');
    const hover     = cardEl.querySelector('img.hover-img');
    const secondary = cardEl.querySelector('.project-secondary-image img');
    if (!primary || !hover || !secondary) return;

    const slug     = cardEl.dataset.projectSlug || '';
    const override = IMAGE_OVERRIDES[slug];
    const base     = getR2Base();
    const prefix   = FILENAME_PREFIX[slug] || slug;
    const path     = getR2ProjectPath(slug);

    // Set initial images immediately so card is never blank while fetch runs
    if (override) {
      const [n1, n2, n3] = override;
      primary.src   = `${base}/${path}/${prefix}-${n1}.jpg`;
      hover.src     = `${base}/${path}/${prefix}-${n2}.jpg`;
      secondary.src = `${base}/${path}/${prefix}-${n3}.jpg`;
    } else {
      primary.src = defaultFirstImageUrl(slug);
    }

    // Fetch ALL images from the project page for full cycling
    try {
      const images = await fetchProjectImages(href);
      if (!images.length) return;

      const allUrls = images.map(src =>
        src.startsWith('assets/images/projects/') ? toFinalSrc(src) : src
      );

      if (!override) {
        if (allUrls[0]) primary.src   = allUrls[0];
        if (allUrls[1]) hover.src     = allUrls[1];
        if (allUrls[2]) secondary.src = allUrls[2];
        startImageCycle(cardEl, allUrls);
        return;
      }

      // Rotate allUrls to start at the override's n1 image
      const n1Url = `${base}/${path}/${prefix}-${override[0]}.jpg`;
      const n1Idx = allUrls.findIndex(u => u === n1Url);
      let cycleUrls;

      if (n1Idx === -1) {
        // n1 not in page HTML (uploaded directly to R2): lead with override images
        const overrideUrls = override.map(n => `${base}/${path}/${prefix}-${n}.jpg`);
        const rest = allUrls.filter(u => !overrideUrls.includes(u));
        cycleUrls = [...overrideUrls, ...rest];
      } else {
        cycleUrls = n1Idx > 0
          ? [...allUrls.slice(n1Idx), ...allUrls.slice(0, n1Idx)]
          : allUrls;
        // Append any override images not in the page HTML (e.g. manually uploaded to R2)
        override.forEach(n => {
          const url = `${base}/${path}/${prefix}-${n}.jpg`;
          if (!cycleUrls.includes(url)) cycleUrls.push(url);
        });
      }

      startImageCycle(cardEl, cycleUrls);
    } catch (_) {
      // Fallback: cycle through just the override images
      if (override) {
        const overrideUrls = override.map(n => `${base}/${path}/${prefix}-${n}.jpg`);
        startImageCycle(cardEl, overrideUrls);
      }
    }
  }

  async function hydrateCardTags(cardEl) {
    const rawHref = cardEl.dataset.projectHref || '';
    const href = normalizeProjectHref(rawHref);
    if (!href) return;

    const tagEls = Array.from(cardEl.querySelectorAll('[data-project-tag]'));
    if (!tagEls.length) return;

    try {
      // Avoid stale HTML when project callouts change.
      const res = await fetch(href, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to fetch ${href}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const tags = extractProjectCallouts(doc);

      for (let i = 0; i < tagEls.length; i += 1) {
        const t = tags[i] || '\u00A0';
        tagEls[i].textContent = t;
      }
    } catch (_) {
      // Keep placeholders if fetch fails
    }
  }

  function initHoverAndScrollEffects() {
    // Cycling is now set up per-card inside hydrateCardImages via startImageCycle.
  }

  function renderPortfolioFromNavbarDropdown() {
    const container = document.getElementById('projectsList');
    if (!container) return false;

    const links = getProjectLinksFromNavbar();
    const list = (links.length ? links : FALLBACK_PROJECT_LINKS)
      .filter((x) => !PORTFOLIO_CARD_EXCLUDE.has(x.href.replace(/^.*projects\//, 'projects/')));
    if (!list.length) return false;

    container.innerHTML = '';
    list.forEach((x, i) => {
      const card = buildProjectItem(x);
      card.dataset.cardIndex = i;
      container.appendChild(card);
    });

    initHoverAndScrollEffects();

    // Hydrate images from each project page (3 images per card)
    // Limit concurrency to keep the page responsive.
    const cards = Array.from(container.querySelectorAll('.project-list-item'));
    const queue = cards.slice();
    const CONCURRENCY = 6;
    let active = 0;

    const pump = () => {
      while (active < CONCURRENCY && queue.length) {
        const card = queue.shift();
        active += 1;
        Promise.allSettled([hydrateCardImages(card), hydrateCardTags(card)])
          .catch(() => {})
          .finally(() => {
            active -= 1;
            pump();
          });
      }
    };
    pump();

    return true;
  }

  function tryRender(attempt = 0) {
    if (renderPortfolioFromNavbarDropdown()) return;
    if (attempt >= 40) return; // ~4s total
    setTimeout(() => tryRender(attempt + 1), 100);
  }

  // Wait for DOM so #projectsList exists; retry so we run after load-navbar has injected the nav (when using fallback list)
  function boot() {
    if (!document.getElementById('projectsList')) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => tryRender(0));
      } else {
        setTimeout(() => tryRender(0), 0);
      }
      return;
    }
    tryRender(0);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

