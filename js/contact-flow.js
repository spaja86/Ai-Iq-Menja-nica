(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  var feedback = document.getElementById('formFeedback');
  if (!form || !feedback) return;

  var STORAGE_KEY = 'aiq-contact-submissions';
  var LAST_SUBMIT_KEY = 'aiq-contact-last-submit';
  var RATE_LIMIT_MS = 60 * 1000;

  function setFeedback(message, type) {
    feedback.style.display = 'block';
    if (type === 'error') {
      feedback.style.background = 'rgba(255,82,82,0.12)';
      feedback.style.border = '1px solid rgba(255,82,82,0.35)';
      feedback.style.color = '#ff7070';
    } else if (type === 'warn') {
      feedback.style.background = 'rgba(255,193,7,0.12)';
      feedback.style.border = '1px solid rgba(255,193,7,0.35)';
      feedback.style.color = '#ffd54f';
    } else {
      feedback.style.background = 'rgba(0,212,170,0.12)';
      feedback.style.border = '1px solid rgba(0,212,170,0.3)';
      feedback.style.color = '#00d4aa';
    }
    feedback.textContent = message;
  }

  function sanitize(input) {
    return String(input || '').replace(/[<>]/g, '').trim();
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveSubmission(entry) {
    var history = getHistory();
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 200)));
  }

  function makeId() {
    return 'inq-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function isRateLimited() {
    var last = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
    return Date.now() - last < RATE_LIMIT_MS;
  }

  function setSubmittedNow() {
    localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
  }

  function serializeForm() {
    var inquiryType = sanitize(form.querySelector('#contactInquiryType').value || 'general');
    return {
      id: makeId(),
      ts: new Date().toISOString(),
      source: 'contact.html',
      inquiryType: inquiryType,
      name: sanitize(form.querySelector('#contactName').value),
      email: sanitize(form.querySelector('#contactEmail').value),
      company: sanitize(form.querySelector('#contactCompany').value),
      jurisdiction: sanitize(form.querySelector('#contactJurisdiction').value),
      subject: sanitize(form.querySelector('#contactSubject').value),
      message: sanitize(form.querySelector('#contactMessage').value),
      status: inquiryType === 'formal' ? 'redirected-to-direct-channel' : 'captured-local',
      channel: inquiryType === 'formal' ? 'mailto-direct' : 'web-form-local'
    };
  }

  function buildMailto(entry) {
    var subject = encodeURIComponent('AI IQ World Bank - Formal Request - ' + (entry.subject || 'general'));
    var body = encodeURIComponent(
      'Formal request details:\n' +
      'Name: ' + entry.name + '\n' +
      'Email: ' + entry.email + '\n' +
      'Company: ' + entry.company + '\n' +
      'Jurisdiction: ' + entry.jurisdiction + '\n' +
      'Topic: ' + entry.subject + '\n\n' +
      entry.message
    );
    return 'mailto:spajicn@yahoo.com?subject=' + subject + '&body=' + body;
  }

  function validate(entry) {
    if (!entry.name || entry.name.length < 2) return 'Unesite validno ime (minimum 2 karaktera).';
    if (!validEmail(entry.email)) return 'Unesite validnu email adresu.';
    if (!entry.subject) return 'Izaberite temu upita.';
    if (!entry.message || entry.message.length < 20) return 'Poruka mora imati minimum 20 karaktera.';
    if (!entry.company || entry.company.length < 2) return 'Unesite naziv kompanije/organizacije.';
    if (!entry.jurisdiction || entry.jurisdiction.length < 2) return 'Unesite tržište/jurisdikciju.';
    if (entry.inquiryType === 'formal' && entry.subject === 'other') return 'Za formalni zahtev izaberite preciznu poslovnu temu.';
    return '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var honeypot = form.querySelector('#contactWebsite');
    if (honeypot && honeypot.value) {
      setFeedback('Spam zaštita je aktivirana. Zahtev nije prihvaćen.', 'error');
      return;
    }

    if (isRateLimited()) {
      setFeedback('Sačekajte oko 60 sekundi pre sledećeg slanja.', 'warn');
      return;
    }

    var entry = serializeForm();
    var error = validate(entry);
    if (error) {
      setFeedback(error, 'error');
      return;
    }

    saveSubmission(entry);
    setSubmittedNow();

    if (entry.inquiryType === 'formal') {
      setFeedback('Formalni/regulatorni zahtev je evidentiran i sada se otvara direktni email kanal ka spajicn@yahoo.com.', 'warn');
      if (window.aiqTrackEvent) {
        window.aiqTrackEvent('contact_formal_redirect', { subject: entry.subject, jurisdiction: entry.jurisdiction });
      }
      setTimeout(function () {
        window.location.href = buildMailto(entry);
      }, 400);
    } else {
      setFeedback('✅ Hvala! Vaš upit je evidentiran lokalno sa audit tragom. Naš tim će odgovoriti preko navedenog kanala.', 'success');
      if (window.aiqTrackEvent) {
        window.aiqTrackEvent('contact_general_submit', { subject: entry.subject, jurisdiction: entry.jurisdiction });
      }
      form.reset();
    }
  });
})();
