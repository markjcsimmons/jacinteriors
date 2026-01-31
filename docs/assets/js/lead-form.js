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
    const form = document.getElementById('contactForm');
    if (!form) return;

    const params = new URLSearchParams(window.location.search || '');
    if (!params || Array.from(params.keys()).length === 0) return;

    setIfEmpty(document.getElementById('name'), params.get('name'));
    setIfEmpty(document.getElementById('email'), params.get('email'));
    setIfEmpty(document.getElementById('phone'), params.get('phone'));
    setIfEmpty(document.getElementById('location'), params.get('location'));
    setIfEmpty(document.getElementById('projectType'), params.get('projectType'));
    setIfEmpty(document.getElementById('budget'), params.get('budget'));

    const message = document.getElementById('message');
    const intent = params.get('intent') || '';
    const source = params.get('source') || '';
    const noteBits = [];
    if (intent) noteBits.push(`Intent: ${intent}`);
    if (source) noteBits.push(`Source: ${source}`);
    const noteLine = noteBits.length ? `\n\n(${noteBits.join(' | ')})` : '';

    // Provide a helpful default message if empty.
    setIfEmpty(
      message,
      `Hi JAC Interiors — I’d like to discuss a potential design project. Please reach out to schedule a call.${noteLine}`.trim()
    );
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

      // Route to contact and focus the form.
      window.location.href = `contact.html?${params.toString()}#contactForm`;
    });
  }

  function boot() {
    bootHomeLeadForm();
    bootPrefill();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

