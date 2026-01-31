// Shared: reviews rendering + carousel behavior (Home + About)
(function () {
  'use strict';

  function getReviewsFromGlobal() {
    const arr = window.JAC_REVIEWS;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((r) => ({
        quote: String(r?.quote || '').trim(),
        meta: String(r?.meta || '').trim(),
        stars: Number.isFinite(r?.stars) ? r.stars : 5,
      }))
      .filter((r) => r.quote && r.meta);
  }

  function starsText(stars) {
    const n = Math.max(0, Math.min(5, Math.round(Number(stars) || 5)));
    return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
  }

  function renderProminent(root, reviews) {
    const slidesWrap = root.querySelector('.reviews-slides');
    if (!slidesWrap) return;
    slidesWrap.innerHTML = reviews
      .map(
        (r, i) => `
          <article class="review-slide${i === 0 ? ' is-active' : ''}">
            <div class="review-stars">${starsText(r.stars)}</div>
            <p class="review-quote">"${r.quote.replace(/"/g, '&quot;')}"</p>
            <div class="review-meta">${r.meta.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </article>
        `.trim()
      )
      .join('');
  }

  function initProminent(root) {
    const slides = Array.from(root.querySelectorAll('.review-slide'));
    const dotsWrap = root.querySelector('.reviews-dots');
    const prevBtn = root.querySelector('.reviews-arrow.prev');
    const nextBtn = root.querySelector('.reviews-arrow.next');

    if (!slides.length) return;

    // Build dots dynamically so it stays in sync with slide count
    if (dotsWrap) {
      dotsWrap.innerHTML = slides
        .map(
          (_, i) =>
            `<button class="review-dot${i === 0 ? ' is-active' : ''}" type="button" aria-label="Go to review ${i + 1}"></button>`
        )
        .join('');
    }
    const dots = Array.from(root.querySelectorAll('.review-dot'));

    let idx = 0;
    let timer = null;

    function setActive(nextIdx) {
      idx = (nextIdx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      timer = window.setInterval(() => setActive(idx + 1), 5000);
    }

    prevBtn?.addEventListener('click', () => {
      setActive(idx - 1);
      start();
    });
    nextBtn?.addEventListener('click', () => {
      setActive(idx + 1);
      start();
    });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        setActive(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    setActive(0);
    start();
  }

  function renderCompact(root, reviews) {
    const slidesWrap = root.querySelector('.testimonial-carousel');
    const dotsWrap = root.querySelector('.carousel-dots');
    if (!slidesWrap || !dotsWrap) return;

    slidesWrap.innerHTML = reviews
      .map(
        (r, i) => `
          <div class="testimonial-slide${i === 0 ? ' active' : ''}">
            <p class="testimonial-text">"${r.quote.replace(/"/g, '&quot;')}"</p>
            <div class="testimonial-author">${r.meta.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
        `.trim()
      )
      .join('');

    dotsWrap.innerHTML = reviews
      .map((_, i) => `<span class="carousel-dot${i === 0 ? ' active' : ''}" data-slide="${i}"></span>`)
      .join('');
  }

  function initCompact(root) {
    const slides = Array.from(root.querySelectorAll('.testimonial-slide'));
    const dots = Array.from(root.querySelectorAll('.carousel-dot'));
    if (!slides.length) return;

    let currentSlide = 0;
    let autoRotateInterval = null;

    // Click to expand/collapse quote
    slides.forEach((slide) => {
      slide.addEventListener('click', () => {
        const textElement = slide.querySelector('.testimonial-text');
        if (textElement) textElement.classList.toggle('expanded');
      });
    });

    function showSlide(index) {
      slides.forEach((slide) => {
        slide.classList.remove('active');
        const textElement = slide.querySelector('.testimonial-text');
        if (textElement) textElement.classList.remove('expanded');
      });
      dots.forEach((dot) => dot.classList.remove('active'));

      slides[index]?.classList.add('active');
      dots[index]?.classList.add('active');
      currentSlide = index;
    }

    function nextSlide() {
      const next = (currentSlide + 1) % slides.length;
      showSlide(next);
    }

    function startAutoRotate() {
      if (autoRotateInterval) window.clearInterval(autoRotateInterval);
      autoRotateInterval = window.setInterval(nextSlide, 4000);
    }

    function stopAutoRotate() {
      if (autoRotateInterval) window.clearInterval(autoRotateInterval);
      autoRotateInterval = null;
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        stopAutoRotate();
        startAutoRotate();
      });
    });

    root.addEventListener('mouseenter', stopAutoRotate);
    root.addEventListener('mouseleave', startAutoRotate);

    showSlide(0);
    startAutoRotate();
  }

  function boot() {
    const reviews = getReviewsFromGlobal();
    if (!reviews.length) return;

    // Prominent carousel(s)
    const prominentRoots = Array.from(document.querySelectorAll('[data-reviews-carousel="1"]'));
    prominentRoots.forEach((root) => {
      const limitAttr = Number(root.getAttribute('data-reviews-limit') || '');
      const limited = Number.isFinite(limitAttr) && limitAttr > 0 ? reviews.slice(0, limitAttr) : reviews;
      renderProminent(root, limited);
      initProminent(root);
    });

    // Compact carousel(s)
    const compactRoots = Array.from(document.querySelectorAll('[data-reviews-compact-carousel="1"]'));
    compactRoots.forEach((root) => {
      const limitAttr = Number(root.getAttribute('data-reviews-limit') || '');
      const limited = Number.isFinite(limitAttr) && limitAttr > 0 ? reviews.slice(0, limitAttr) : reviews;
      renderCompact(root, limited);
      initCompact(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

