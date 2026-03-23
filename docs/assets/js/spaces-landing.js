// Spaces landing page: render one card per space type.
(function () {
  'use strict';

  const PLACEHOLDER_SRC = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  const DEFAULT_R2_BASE = 'https://jacinteriorscdn.com';

  function getR2Base() {
    return (window.R2_IMAGE_BASE || DEFAULT_R2_BASE).replace(/\/+$/, '');
  }

  // Each space: title, page href, R2 folder path, and image filenames for [primary, hover, secondary].
  const SPACES = [
    {
      title: 'Kitchens',
      href: 'kitchens-gallery.html',
      folder: 'spaces/kitchens',
      images: ['kitchens-40.jpg', 'kitchens-41.jpg', 'kitchens-42.jpg'],
    },
    {
      title: 'Bathrooms',
      href: 'bathrooms.html',
      folder: 'spaces/bathrooms',
      images: ['bathrooms-1.jpg', 'bathrooms-2.jpg', 'bathrooms-3.jpg'],
    },
    {
      title: 'Bedrooms',
      href: 'bedrooms.html',
      folder: 'spaces/bedrooms',
      images: ['bedrooms-1.jpg', 'bedrooms-2.jpg', 'bedrooms-3.jpg'],
    },
    {
      title: 'Dining Rooms',
      href: 'dining-rooms.html',
      folder: 'spaces/dining-rooms',
      images: ['dining-rooms-1.jpg', 'dining-rooms-2.jpg', 'dining-rooms-3.jpg'],
    },
    {
      title: 'Living Spaces',
      href: 'living-spaces.html',
      folder: 'spaces/living-spaces',
      images: ['living-spaces-11.jpg', 'living-spaces-19.jpg', 'living-spaces-44.jpg'],
    },
    {
      title: 'Entryways',
      href: 'entryways.html',
      folder: 'spaces/entryways',
      images: ['entryways-28.jpg', 'entryways-1.jpg', 'entryways-4.jpg'],
    },
    {
      title: 'Bar Area',
      href: 'bar-area.html',
      folder: 'spaces/barareas',
      images: ['barareas-1.jpg', 'barareas-2.jpg', 'barareas-3.jpg'],
    },
    {
      title: 'Outdoor Spaces',
      href: 'outdoor-spaces.html',
      folder: 'spaces/outdoor-spaces',
      images: ['outdoor-spaces-8.jpg', 'outdoor-spaces-7.jpg', 'outdoor-spaces-11.jpg'],
    },
  ];

  function resolveHref(relHref) {
    // Resolve relative to current page so it works at any depth.
    try {
      return new URL(relHref, window.location.href).toString();
    } catch (_) {
      return relHref;
    }
  }

  const BUST = '?v=20260322';

  function buildCard(space, index) {
    const base = getR2Base();
    const primarySrc   = `${base}/${space.folder}/${space.images[0]}${BUST}`;
    const hoverSrc     = `${base}/${space.folder}/${space.images[1]}${BUST}`;
    const secondarySrc = `${base}/${space.folder}/${space.images[2]}${BUST}`;
    const href = resolveHref(space.href);
    // Eagerly load first 3 cards; lazy-load the rest.
    const loadingAttr = index < 3 ? 'eager' : 'lazy';

    const el = document.createElement('div');
    el.className = 'project-list-item spaces-card';
    el.dataset.spaceHref = href;
    el.innerHTML = `
      <div style="display: flex; width: 100%;">
        <div class="project-list-image">
          <img src="${PLACEHOLDER_SRC}" data-primary="${primarySrc}" alt="${space.title}" class="primary-img" loading="${loadingAttr}">
          <img src="${PLACEHOLDER_SRC}" data-hover="${hoverSrc}" alt="${space.title}" class="hover-img" loading="lazy" style="position: absolute; top: 0; left: 0; opacity: 0; transition: opacity 0.3s;">
        </div>
        <div class="project-list-content">
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 2.5rem; font-weight: 500; margin: 0 0 0.75rem 0; letter-spacing: -1px;">${space.title}</h3>
          </div>
          <div class="project-bottom-row" style="margin-top: auto;">
            <a href="${href}" class="view-project-btn">View Spaces</a>
            <div class="project-secondary-image">
              <img src="${PLACEHOLDER_SRC}" data-secondary="${secondarySrc}" alt="${space.title} Detail" loading="lazy">
            </div>
          </div>
        </div>
      </div>
    `.trim();

    return el;
  }

  function loadImages(card) {
    const primary   = card.querySelector('img.primary-img');
    const hover     = card.querySelector('img.hover-img');
    const secondary = card.querySelector('.project-secondary-image img');

    if (primary)   primary.src   = primary.dataset.primary   || primary.src;
    if (hover)     hover.src     = hover.dataset.hover       || hover.src;
    if (secondary) secondary.src = secondary.dataset.secondary || secondary.src;
  }

  function initHoverAndScroll(container) {
    container.querySelectorAll('.spaces-card').forEach((card, i) => {
      const hoverImg = card.querySelector('.hover-img');
      if (!hoverImg) return;

      let showingHover = false;
      let paused = false;

      // Stagger each card's cycle start by 150 ms so they don't all flip at once
      setTimeout(() => {
        setInterval(() => {
          if (paused) return;
          showingHover = !showingHover;
          hoverImg.style.opacity = showingHover ? '1' : '0';
        }, 1000);
      }, i * 150);

      // Pause on hover — hold the hover image while the cursor is over the card
      card.addEventListener('mouseenter', () => {
        paused = true;
        hoverImg.style.opacity = '1';
      });
      card.addEventListener('mouseleave', () => {
        paused = false;
      });
    });
  }

  function render() {
    const container = document.getElementById('spacesList');
    if (!container) return;

    container.innerHTML = '';
    SPACES.forEach((space, index) => {
      const card = buildCard(space, index);
      container.appendChild(card);
      loadImages(card);
    });

    initHoverAndScroll(container);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
