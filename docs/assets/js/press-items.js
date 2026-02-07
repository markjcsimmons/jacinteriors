// Press items for the "In the media" section.
// Add / edit items here (supports optional PDF link).
// Shape:
// {
//   outlet: string,
//   title: string,
//   year?: string,
//   href?: string,
//   pdfHref?: string,
//   coverSrc?: string,       // optional cover thumbnail image
//   featured?: boolean,      // show in the featured list
//   logoLabel?: string       // label for the logo strip (defaults to outlet)
// }

(function () {
  'use strict';

  window.JAC_PRESS_ITEMS = [
    {
      outlet: 'HBD',
      title: 'Editorial feature (April / May)',
      featured: true,
      logoLabel: 'HBD',
      // PDF exists on the legacy site (Shopify CDN)
      pdfHref: 'assets/pdfs/press/22_HBD_April_May_EDITORIAL.pdf',
      coverSrc: 'assets/images/press/covers/hbd-editorial-cover.png',
    },
    {
      outlet: 'JAC Interiors',
      title: 'Press feature (PDF)',
      featured: true,
      logoLabel: 'JAC Interiors',
      pdfHref: 'assets/pdfs/press/JAC_Interiors.pdf',
      coverSrc: 'assets/images/press/covers/jac-interiors-press-cover.png',
    },
    {
      outlet: 'Pinterest',
      title: 'Check us out on Pinterest',
      logoLabel: 'Pinterest',
      href: 'https://www.pinterest.com/jacinteriordesign/',
    },
  ];
})();

