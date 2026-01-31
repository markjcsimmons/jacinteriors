// Home page: render first 3 Portfolio-style project cards
(function () {
  'use strict';

  const FALLBACK_PRIMARY = 'assets/images/projects/bg-hero_2000x7e9e.jpg';
  const FALLBACK_HOVER = 'assets/images/projects/bohoheader_2000x0667.jpg';
  const FALLBACK_SECONDARY = 'assets/images/projects/livingroomsm-550x500_2000x0aaf.jpg';

  const PLACEHOLDER_SRC =
    'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  const R2_BASE = (window.R2_IMAGE_BASE || '').replace(/\/+$/, '');

  function encodeName(name) {
    return encodeURIComponent(name).replace(/%2F/g, '/');
  }

  function parseProjectLocalSrc(localSrc) {
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

    const portfolioDropdown = Array.from(nav.querySelectorAll('.nav-dropdown')).find((d) => {
      const a = d.querySelector('a[href*="portfolio.html"]');
      return Boolean(a);
    });
    if (!portfolioDropdown) return [];

    const links = Array.from(
      portfolioDropdown.querySelectorAll('.nav-dropdown-content a[href*="projects/"]')
    );

    return links
      .map((a) => ({
        title: (a.textContent || '').trim(),
        href: a.getAttribute('href') || '',
      }))
      .filter((x) => x.title && x.href);
  }

  function slugFromHref(href) {
    const m = (href || '').match(/projects\/([^/?#]+)\.html/i);
    return m ? m[1] : '';
  }

  function normalizeProjectHref(href) {
    let h = (href || '').trim();
    if (!h) return '';

    // Fix local-dev edge case where navbar basePath becomes "/index.html"
    // Example: "/index.html/projects/22nd-street.html" -> "/projects/22nd-street.html"
    h = h.replace(/^\/[^/]+\.html\/projects\//i, '/projects/');

    try {
      return new URL(h, window.location.href).toString();
    } catch (_) {
      return h;
    }
  }

  function normalizeLocalSrc(raw) {
    const s = (raw || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    const idx = s.indexOf('assets/images/projects/');
    if (idx >= 0) return s.slice(idx);
    return s;
  }

  async function fetchProjectImages(projectHref) {
    const res = await fetch(projectHref, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${projectHref}`);
    const html = await res.text();

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img'));

    const candidates = [];
    const seen = new Set();

    function push(rawSrc) {
      const src = normalizeLocalSrc(rawSrc);
      if (!src) return;
      if (!src.startsWith('assets/images/projects/') && !/\/projects\/[^/]+\//.test(src)) return;
      if (seen.has(src)) return;
      seen.add(src);
      candidates.push(src);
    }

    imgs.forEach((img) => push(img.getAttribute('data-r2-local-src') || ''));
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('data:')) return;
      push(src);
    });

    return candidates.slice(0, 3);
  }

  function extractProjectCallouts(doc) {
    const callouts = Array.from(doc.querySelectorAll('.project-callouts .project-callout'))
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean);
    return callouts.slice(0, 4);
  }

  async function fetchProjectCallouts(projectHref) {
    const res = await fetch(projectHref, { cache: 'force-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${projectHref}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return extractProjectCallouts(doc);
  }

  function buildCard({ title, href, reverse }) {
    const slug = slugFromHref(href);
    const el = document.createElement('div');
    el.className = reverse ? 'project-list-item reverse' : 'project-list-item';
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

    const primary = el.querySelector('img.primary-img');
    const hover = el.querySelector('img.hover-img');
    const secondary = el.querySelector('.project-secondary-image img');

    if (primary) primary.addEventListener('error', () => (primary.src = FALLBACK_PRIMARY), { once: true });
    if (hover) hover.addEventListener('error', () => (hover.src = FALLBACK_HOVER), { once: true });
    if (secondary) secondary.addEventListener('error', () => (secondary.src = FALLBACK_SECONDARY), { once: true });

    return el;
  }

  async function hydrateCard(cardEl) {
    const rawHref = cardEl.dataset.projectHref || '';
    const href = normalizeProjectHref(rawHref);
    if (!href) return;

    const primary = cardEl.querySelector('img.primary-img');
    const hover = cardEl.querySelector('img.hover-img');
    const secondary = cardEl.querySelector('.project-secondary-image img');
    const tagEls = Array.from(cardEl.querySelectorAll('[data-project-tag]'));

    // Images
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

      if (primary) primary.src = a;
      if (hover) hover.src = b;
      if (secondary) secondary.src = c;
    } catch (_) {
      if (primary) primary.src = FALLBACK_PRIMARY;
      if (hover) hover.src = FALLBACK_HOVER;
      if (secondary) secondary.src = FALLBACK_SECONDARY;
    }

    // Tags
    if (tagEls.length) {
      try {
        const tags = await fetchProjectCallouts(href);
        for (let i = 0; i < tagEls.length; i += 1) {
          tagEls[i].textContent = tags[i] || '\u00A0';
        }
      } catch (_) {
        // leave placeholders
      }
    }
  }

  function initHoverAndScrollEffects(scope) {
    const cards = Array.from(scope.querySelectorAll('.project-list-item'));

    cards.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const hoverImg = item.querySelector('.hover-img');
        if (hoverImg) hoverImg.style.opacity = '1';
      });
      item.addEventListener('mouseleave', () => {
        const hoverImg = item.querySelector('.hover-img');
        if (hoverImg) hoverImg.style.opacity = '0';
      });
    });

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

    cards.forEach((c) => cardObserver.observe(c));
  }

  async function renderHomeCards() {
    const host = document.getElementById('homeProjectCards');
    if (!host) return false;

    const links = getProjectLinksFromNavbar().slice(0, 3);
    if (!links.length) return false;

    host.innerHTML = '';

    const cards = links.map((l, i) => {
      // Home request: only the 2nd card has the large image on the right
      const reverse = i === 1;
      return buildCard({ title: l.title, href: l.href, reverse });
    });

    cards.forEach((c) => host.appendChild(c));
    initHoverAndScrollEffects(host);

    // Hydrate (limited concurrency)
    const queue = cards.slice();
    const CONCURRENCY = 3;
    let active = 0;

    const pump = () => {
      while (active < CONCURRENCY && queue.length) {
        const card = queue.shift();
        active += 1;
        hydrateCard(card)
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
    renderHomeCards().then((ok) => {
      if (ok) return;
      if (attempt >= 40) return;
      setTimeout(() => tryRender(attempt + 1), 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryRender(0));
  } else {
    tryRender(0);
  }
})();

