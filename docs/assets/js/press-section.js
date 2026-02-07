// Render "In the media" (Option 3): logo strip + featured items (supports optional PDF).
(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isExternal(href) {
    return /^https?:\/\//i.test(String(href || ''));
  }

  function renderAction(label, href, variant) {
    if (!href) return '';
    const safeHref = escapeHtml(href);
    const attrs = isExternal(href)
      ? ' target="_blank" rel="noopener"'
      : '';
    const cls = variant === 'secondary' ? 'press-action press-action--secondary' : 'press-action';
    const downloadAttr = safeHref.toLowerCase().endsWith('.pdf') ? ' download' : '';
    return `<a class="${cls}" href="${safeHref}"${attrs}${downloadAttr}>${escapeHtml(label)}</a>`;
  }

  function normalizeItems(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    return arr
      .map((item) => ({
        outlet: String(item?.outlet || '').trim(),
        logoLabel: String(item?.logoLabel || item?.outlet || '').trim(),
        title: String(item?.title || '').trim(),
        year: String(item?.year || '').trim(),
        href: item?.href ? String(item.href).trim() : '',
        pdfHref: item?.pdfHref ? String(item.pdfHref).trim() : '',
        featured: Boolean(item?.featured),
      }))
      .filter((x) => x.outlet && x.title && (x.href || x.pdfHref));
  }

  function renderLogos(root, items) {
    if (!root) return;
    if (!items.length) {
      root.innerHTML = '';
      return;
    }

    root.innerHTML = items
      .map((item) => {
        const href = item.href || item.pdfHref;
        if (!href) return '';
        const attrs = isExternal(href) ? ' target="_blank" rel="noopener"' : '';
        return `
          <a class="press-logo" href="${escapeHtml(href)}"${attrs} aria-label="${escapeHtml(item.outlet)}">
            <span class="press-logo-text">${escapeHtml(item.logoLabel || item.outlet)}</span>
          </a>
        `.trim();
      })
      .filter(Boolean)
      .join('\n');
  }

  function renderFeatured(root, items) {
    if (!root) return;
    if (!items.length) {
      root.innerHTML = '';
      return;
    }

    root.innerHTML = items
      .map((item) => {
        const primaryHref = item.href || item.pdfHref;
        const primaryLabel = item.href ? 'Read' : 'Open PDF';
        const secondary = item.href && item.pdfHref ? renderAction('PDF', item.pdfHref, 'secondary') : '';

        return `
          <article class="press-feature">
            <div class="press-feature-meta">
              <div class="press-outlet">${escapeHtml(item.outlet)}</div>
              ${item.year ? `<div class="press-year">${escapeHtml(item.year)}</div>` : ''}
            </div>
            <h3 class="press-title">${escapeHtml(item.title)}</h3>
            <div class="press-actions">
              ${renderAction(primaryLabel, primaryHref, 'primary')}
              ${secondary}
            </div>
          </article>
        `.trim();
      })
      .join('\n');
  }

  function init() {
    const featured = document.querySelector('[data-press-featured="1"]');
    if (!featured) return;

    const items = normalizeItems(window.JAC_PRESS_ITEMS);
    if (!items.length) {
      if (featured) featured.innerHTML = '';
      return;
    }

    const featuredItems = items.filter((x) => x.featured).slice(0, 3);

    if (featured) renderFeatured(featured, featuredItems.length ? featuredItems : items.slice(0, 3));
  }

  window.initializePressSection = init;

  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
})();

