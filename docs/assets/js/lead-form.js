// Home lead form -> routes to Contact and pre-fills fields
(function () {
  'use strict';

  function setIfEmpty(el, value) {
    if (!el) return;
    const v = String(value || '').trim();
    if (!v) return;
    if (String(el.value || '').trim()) return;
    el.value = v;
  }

  function bootPrefill() {
    const form = document.querySelector('form[name="contact"]');
    if (!form) return;

    const params = new URLSearchParams(window.location.search || '');
    if (!params || Array.from(params.keys()).length === 0) return;

    setIfEmpty(document.getElementById('name'), params.get('name'));
    setIfEmpty(document.getElementById('email'), params.get('email'));
    setIfEmpty(document.getElementById('phone'), params.get('phone'));
    setIfEmpty(document.getElementById('location'), params.get('location'));
    setIfEmpty(document.getElementById('projectType'), params.get('projectType'));
    setIfEmpty(document.getElementById('budget'), params.get('budget'));

    // Never auto-fill the message body. (Users should start with a blank message.)
    // If a future flow needs message prefill, pass an explicit `message` query param.
    setIfEmpty(document.getElementById('message'), params.get('message'));

    // Ensure the form anchor is fully visible under the sticky navbar.
    if (window.location.hash === '#contactForm') {
      const scrollToForm = () => {
        const el = document.getElementById('contactForm');
        if (!el) return;

        const nav = document.querySelector('nav.navbar, .navbar');
        const navH = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;

        // Align the form's top just below the navbar, with a little breathing room.
        const top = el.getBoundingClientRect().top + window.scrollY;
        const targetY = Math.max(0, Math.round(top - navH - 16));
        window.scrollTo({ top: targetY, behavior: 'auto' });
      };

      // Run after layout settles (navbar injection, fonts).
      setTimeout(scrollToForm, 0);
      setTimeout(scrollToForm, 120);
    }
  }

  function applyIntentCopy() {
    const params = new URLSearchParams(window.location.search || '');
    const intent = String(params.get('intent') || '').trim().toLowerCase();
    if (!intent) return;

    const formCard = document.querySelector('.contact-card--form');
    if (!formCard) return;

    const h2 = formCard.querySelector('h2');
    const muted = formCard.querySelector('p.muted');
    const submitBtn = formCard.querySelector('button[type="submit"]');

    if (intent === 'call') {
      if (h2) h2.textContent = 'Book a 15‑minute intro call';
      if (muted) muted.textContent = 'Share a few details. We’ll reply within 1 business day and schedule a short intro call to align on scope, style, and timing.';
      if (submitBtn) submitBtn.textContent = 'Request intro call';
    }
  }

  function bootHomeLeadForm() {
    const leadForm = document.querySelector('form[data-lead-form="1"]');
    if (!leadForm) return;

    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(leadForm);

      const params = new URLSearchParams();
      params.set('source', 'home');
      params.set('intent', 'call');

      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const location = String(fd.get('location') || '').trim();
      const projectType = String(fd.get('projectType') || '').trim();

      if (name) params.set('name', name);
      if (email) params.set('email', email);
      if (location) params.set('location', location);
      if (projectType) params.set('projectType', projectType);

      if (typeof window.jacTrack === 'function') {
        window.jacTrack('lead_form_start', {
          source: 'home',
          intent: 'call',
          has_email: !!email,
          has_location: !!location,
          has_project_type: !!projectType,
        });
      }

      // Route to contact and focus the form.
      window.location.href = `contact.html?${params.toString()}#contactForm`;
    });
  }

  function boot() {
    bootHomeLeadForm();
    bootPrefill();
    applyIntentCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

