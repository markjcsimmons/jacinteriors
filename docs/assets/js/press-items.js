// Press items for the "In the media" section.
// Add / edit items here (supports optional PDF link).
// Shape:
// { outlet: string, title: string, year?: string, href?: string, pdfHref?: string }

(function () {
  'use strict';

  window.JAC_PRESS_ITEMS = [
    {
      outlet: 'HBD',
      title: 'Editorial feature (April / May)',
      // PDF exists on the legacy site (Shopify CDN)
      pdfHref:
        'https://cdn.shopify.com/s/files/1/0511/7945/4662/files/22_HBD_April_May_EDITORIAL.pdf?v=1651454855',
    },
    {
      outlet: 'JAC Interiors',
      title: 'Press feature (PDF)',
      pdfHref:
        'https://cdn.shopify.com/s/files/1/0511/7945/4662/files/JAC_Interiors.pdf?v=1651454855',
    },
    {
      outlet: 'Pinterest',
      title: 'Check us out on Pinterest',
      href: 'https://www.pinterest.com/jacinteriordesign/',
    },
  ];
})();

