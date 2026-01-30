// Home page: render first 3 project rows from navbar dropdown
(function () {
  'use strict';

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

  function extractProjectCallouts(doc) {
    const callouts = Array.from(doc.querySelectorAll('.project-callouts .project-callout'))
      .map((n) => (n.textContent || '').trim())
      .filter(Boolean);
    return callouts;
  }

  function extractProjectImages(doc) {
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

    return candidates;
  }

  function buildHomeRow({ href, title, imgSrc, meta, subline, reverse }) {
    const a = document.createElement('a');
    a.href = href;
    a.className = reverse ? 'project-row reverse' : 'project-row';
    a.innerHTML = `
      <div class="project-media">
        <img src="${imgSrc || PLACEHOLDER_SRC}" alt="${title}" loading="lazy">
      </div>
      <div class="project-info">
        <span class="project-meta">${meta || 'Project'}</span>
        <h3>${title}</h3>
        <p>${subline || ''}</p>
        <span style="text-decoration:underline; font-weight:600;">View Project</span>
      </div>
    `.trim();
    return a;
  }

  async function hydrateRowFromProject(link, idx) {
    const href = normalizeProjectHref(link.href);
    const title = link.title;
    const reverse = idx % 2 === 1;

    try {
      const res = await fetch(href, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`Failed to fetch ${href}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const callouts = extractProjectCallouts(doc);
      const images = extractProjectImages(doc);

      const img0 = images[0] || '';
      const imgSrc = img0
        ? img0.startsWith('assets/images/projects/')
          ? toFinalSrc(img0)
          : img0
        : '';

      // Match the existing home design: meta label + a subline.
      const meta = (callouts[3] || callouts[0] || 'Project').toUpperCase();
      const sublineLeft = callouts[2] || callouts[0] || '';
      const sublineRight = callouts[1] || '';
      const subline =
        sublineLeft && sublineRight
          ? `${sublineLeft} • ${sublineRight}`
          : sublineLeft || sublineRight || '';

      return buildHomeRow({ href: link.href, title, imgSrc, meta, subline, reverse });
    } catch (_) {
      return buildHomeRow({
        href: link.href,
        title,
        imgSrc: '',
        meta: 'PROJECT',
        subline: '',
        reverse,
      });
    }
  }

  async function renderHomeProjects() {
    const host = document.getElementById('homeProjectRows');
    if (!host) return false;

    const links = getProjectLinksFromNavbar().slice(0, 3);
    if (!links.length) return false;

    host.innerHTML = '';

    const rows = await Promise.all(links.map((l, i) => hydrateRowFromProject(l, i)));
    rows.forEach((r) => host.appendChild(r));
    return true;
  }

  function tryRender(attempt = 0) {
    renderHomeProjects().then((ok) => {
      if (ok) return;
      if (attempt >= 40) return; // ~4s
      setTimeout(() => tryRender(attempt + 1), 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tryRender(0));
  } else {
    tryRender(0);
  }
})();

