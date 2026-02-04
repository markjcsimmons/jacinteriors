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
  const R2_BASE = (window.R2_IMAGE_BASE || DEFAULT_R2_BASE).replace(/\/+$/, '');

  // Fallback list in case navbar injection fails for any reason.
  // Keep in sync with the Portfolio dropdown in load-navbar.js.
  const FALLBACK_PROJECT_LINKS = [
    { title: '22nd Street', href: 'projects/22nd-street.html' },
    { title: 'JAMM Visual', href: 'projects/jamm-visual.html' },
    { title: 'Alpine', href: 'projects/alpine.html' },
    { title: 'Brown Deer Park', href: 'projects/brown-deer-park.html' },
    { title: 'Colby', href: 'projects/colby.html' },
    { title: 'Colette Way', href: 'projects/colette-way.html' },
    { title: 'Columbus Way', href: 'projects/columbus-way.html' },
    { title: 'Frances', href: 'projects/frances.html' },
    { title: 'Galewood', href: 'projects/galewood.html' },
    { title: 'Highland', href: 'projects/highland.html' },
    { title: 'Medio', href: 'projects/medio.html' },
    { title: 'Monaco', href: 'projects/monaco.html' },
    { title: 'Mulholland Drive', href: 'projects/mulholland-drive.html' },
    { title: 'Oakwood', href: 'projects/oakwood.html' },
    { title: 'Peary Way', href: 'projects/peary-way.html' },
    { title: 'Presson Place', href: 'projects/presson-place.html' },
    { title: 'River Homestead', href: 'projects/river-homestead.html' },
    { title: 'Ronda', href: 'projects/ronda.html' },
    { title: 'Sherbourne', href: 'projects/sherbourne.html' },
    { title: 'Sunnyside', href: 'projects/sunnyside.html' },
    { title: 'Vale Crest', href: 'projects/vale-crest.html' },
    { title: 'Valley Vista', href: 'projects/valley-vista.html' },
    { title: 'Via Pisa', href: 'projects/via-pisa.html' },
    { title: 'Wilshire', href: 'projects/wilshire.html' },
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
    if (!R2_BASE) return localSrc;
    return `${R2_BASE}/projects/${parsed.project}/${encodeName(parsed.name)}`;
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
      .filter((x) => x.title && x.href);
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

    return candidates.slice(0, 3);
  }

  function extractProjectCallouts(doc) {
    // Most project pages: <div class="project-callouts"><span class="project-callout">...</span>...</div>
    const callouts = Array.from(doc.querySelectorAll('.project-callouts .project-callout'))
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean);
    return callouts.slice(0, 4);
  }

  async function hydrateCardImages(cardEl) {
    const rawHref = cardEl.dataset.projectHref || '';
    const href = normalizeProjectHref(rawHref);
    if (!href) return;

    const primary = cardEl.querySelector('img.primary-img');
    const hover = cardEl.querySelector('img.hover-img');
    const secondary = cardEl.querySelector('.project-secondary-image img');
    if (!primary || !hover || !secondary) return;

    try {
      const images = await fetchProjectImages(href);
      const a = images[0]
        ? (images[0].startsWith('assets/images/projects/') ? toFinalSrc(images[0]) : images[0])
        : FALLBACK_PRIMARY;
      const b = images[1]
        ? (images[1].startsWith('assets/images/projects/') ? toFinalSrc(images[1]) : images[1])
        : a;
      const c = images[2]
        ? (images[2].startsWith('assets/images/projects/') ? toFinalSrc(images[2]) : images[2])
        : FALLBACK_SECONDARY;

      primary.src = a;
      hover.src = b;
      secondary.src = c;
    } catch (_) {
      primary.src = FALLBACK_PRIMARY;
      hover.src = FALLBACK_HOVER;
      secondary.src = FALLBACK_SECONDARY;
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
    // Hover effect for images (desktop)
    document.querySelectorAll('.project-list-item').forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const hoverImg = item.querySelector('.hover-img');
        if (hoverImg) hoverImg.style.opacity = '1';
      });
      item.addEventListener('mouseleave', () => {
        const hoverImg = item.querySelector('.hover-img');
        if (hoverImg) hoverImg.style.opacity = '0';
      });
    });

    // Scroll-based image switching - only one card active at a time
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    };

    let currentActiveCard = null;

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          if (currentActiveCard && currentActiveCard !== entry.target) {
            const prevHoverImg = currentActiveCard.querySelector('.hover-img');
            if (prevHoverImg) prevHoverImg.style.opacity = '0';
          }

          currentActiveCard = entry.target;
          const hoverImg = entry.target.querySelector('.hover-img');
          if (hoverImg) hoverImg.style.opacity = '1';
        } else if (entry.target === currentActiveCard) {
          const hoverImg = entry.target.querySelector('.hover-img');
          if (hoverImg) hoverImg.style.opacity = '0';
          currentActiveCard = null;
        }
      });
    }, observerOptions);

    document.querySelectorAll('.project-list-item').forEach((card) => cardObserver.observe(card));
  }

  function renderPortfolioFromNavbarDropdown() {
    const container = document.getElementById('projectsList');
    if (!container) return false;

    const links = getProjectLinksFromNavbar();
    const list = links.length ? links : FALLBACK_PROJECT_LINKS;
    if (!list.length) return false;

    container.innerHTML = '';
    list.forEach((x) => container.appendChild(buildProjectItem(x)));

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

  // Defer execution until deferred navbar script has had a chance to inject markup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryRender(0));
  } else {
    tryRender(0);
  }
})();

