// Render "In the media" (Option 3): logo strip + compact downloads list.
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
    const cls =
      variant === 'secondary'
        ? 'press-action press-action--secondary'
        : variant === 'link'
          ? 'press-download-link'
          : 'press-action';
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
        coverSrc: item?.coverSrc ? String(item.coverSrc).trim() : '',
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

  function renderDownloads(root, items) {
    if (!root) return;
    if (!items.length) {
      root.innerHTML = '';
      return;
    }

    root.innerHTML = items
      .map((item) => {
        const pdfHref = item.pdfHref || '';
        const articleHref = item.href || '';
        const showPdf = !!pdfHref;
        const showRead = !!articleHref;
        const showCover = !!item.coverSrc;

        return `
          <div class="press-download-row">
            ${showCover ? `
              <a class="press-cover" href="${escapeHtml(pdfHref || articleHref)}" ${isExternal(pdfHref || articleHref) ? 'target="_blank" rel="noopener"' : ''} aria-label="${escapeHtml(item.outlet)} cover">
                <img src="${escapeHtml(item.coverSrc)}" alt="${escapeHtml(item.outlet)} cover" loading="lazy" decoding="async">
              </a>
            `.trim() : ''}
            <div class="press-download-meta">
              <div class="press-outlet">${escapeHtml(item.outlet)}</div>
              ${item.year ? `<div class="press-year">${escapeHtml(item.year)}</div>` : ''}
            </div>
            <div class="press-download-title">${escapeHtml(item.title)}</div>
            <div class="press-download-actions">
              ${showRead ? renderAction('Read', articleHref, 'link') : ''}
              ${showPdf ? renderAction('Download PDF', pdfHref, 'link') : ''}
            </div>
          </div>
        `.trim();
      })
      .join('\n');
  }

  function init() {
    const downloads = document.querySelector('[data-press-downloads="1"]');
    if (!downloads) return;

    const items = normalizeItems(window.JAC_PRESS_ITEMS);
    if (!items.length) {
      downloads.innerHTML = '';
      return;
    }

    // Keep it tight like the legacy site: show downloads first.
    const ordered = [
      ...items.filter((x) => x.pdfHref),
      ...items.filter((x) => !x.pdfHref),
    ];
    renderDownloads(downloads, ordered.slice(0, 6));
  }

  window.initializePressSection = init;

  document.addEventListener('DOMContentLoaded', () => {
    init();
  });
})();

