(function () {
  'use strict';

  var STORAGE_KEY = 'aiq-contact-submissions';
  var LAST_SUBMIT_KEY = 'aiq-contact-last-submit';
  var RATE_LIMIT_MS = 60 * 1000;
  var SUBJECT_LABELS = {
    licensing: 'Licenciranje i compliance',
    'country-partnership': 'Partnerstvo po državi',
    'white-label-api': 'White-label i API integracije',
    'institutional-onboarding': 'Institutional onboarding',
    'investor-relations': 'Investor relations',
    'public-ngo': 'Public sector / NGO desk',
    'trade-finance': 'Trade finance',
    'custody-wallet': 'Custody / wallet support',
    'education-certification': 'Education / certification',
    'representative-office': 'Representative office request',
    trading: 'Trading i exchange pitanje',
    other: 'Ostalo'
  };
  var COMPANY_SIZE_LABELS = {
    solo: 'Solo / founder-led',
    small: '2-10 ljudi',
    sme: '11-50 ljudi',
    growth: '51-250 ljudi',
    enterprise: '250+ ljudi',
    institutional: 'Institution / NGO / public body'
  };
  var TIMELINE_LABELS = {
    immediate: '0-30 dana',
    quarter: '1 kvartal',
    'half-year': '3-6 meseci',
    strategic: '6+ meseci'
  };
  var BUDGET_LABELS = {
    exploratory: 'Exploratory / not fixed',
    pilot: 'Pilot budget',
    growth: 'Growth budget',
    enterprise: 'Enterprise budget',
    institutional: 'Institutional program budget'
  };
  var DELIVERY_LABELS = {
    direct: 'Direktan servis',
    partner: 'Partner-led model',
    'white-label': 'White-label / branded model',
    advisory: 'Advisory / roadmap support',
    institutional: 'Institutional collaboration'
  };
  var PROFILE_CONFIG = {
    general: {
      message: 'Najbolje za opšta pitanja, osnovni pregled usluga i početni kontakt preko web forme.',
      channel: 'Web forma je dovoljna za prvi kontakt. Za formalni zahtev prebacite Tip upita na direktni kanal.',
      subject: '',
      intent: 'general',
      route: 'Discovery i početni qualification razgovor.',
      nextStep: 'Pošaljite web intake i nastavite ka services ili trust centru ako vam treba dublji pregled.'
    },
    business: {
      message: 'Koristite za enterprise, treasury, payments, API i operativne razgovore koji traže kvalifikaciju lead-a.',
      channel: 'Za ozbiljan poslovni onboarding preporučen je potpuni unos kompanije, tržišta i željenog modela saradnje.',
      subject: 'institutional-onboarding',
      intent: 'general',
      route: 'Business / enterprise qualification tok.',
      nextStep: 'Kvalifikujte use-case, tržište i delivery model pre komercijalnog razgovora.'
    },
    licensing: {
      message: 'Najbolje za licensing roadmap, compliance pripremu, regulatorne i višejurisdikcijske razgovore.',
      channel: 'Za ovaj profil preporučen je formalni/direktni kanal kako bi zahtev stigao na pravi intake tok.',
      subject: 'licensing',
      intent: 'licensing',
      route: 'Compliance-first i formalni licensing tok.',
      nextStep: 'Posle validacije otvorite direktni mail kanal i po potrebi pregledajte trust center i documentation standarde.'
    },
    partnership: {
      message: 'Koristite za country partnership, white-label, franchise, local operator i partner-led ekspanziju.',
      channel: 'Ako imate konkretan model partnerstva, uključite tržište, ulogu partnera i očekivani delivery model.',
      subject: 'country-partnership',
      intent: 'partnership',
      route: 'Partner-led onboarding i expansion qualification.',
      nextStep: 'Definišite tržište, partner ulogu i delivery očekivanje pre daljeg partner desk razgovora.'
    },
    institutional: {
      message: 'Koristite za NGO, javni sektor, donor programe, audit-friendly modele i institucionalne tokove.',
      channel: 'Za institucionalne zahteve preporučen je formalni/direktni kanal sa jasnim opisom jurisdikcije i obima.',
      subject: 'public-ngo',
      intent: 'institutional',
      route: 'Institutional / NGO / public-sector escalation tok.',
      nextStep: 'Pripremite audit-ready obim, tržište i formalni kanal za nastavak razgovora.'
    },
    education: {
      message: 'Koristite za certification, academy, partner training i educational licensing razgovore.',
      channel: 'Za partnerske edukativne programe unesite ciljnu grupu, tržište i željeni format programa.',
      subject: 'education-certification',
      intent: 'education',
      route: 'Education i partner-enablement qualification tok.',
      nextStep: 'Opišite ciljnu grupu i format programa pre certification ili partner training nastavka.'
    }
  };
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

  function humanizeSubject(value) {
    return SUBJECT_LABELS[value] || value || 'general';
  }

  function humanizeLabel(value, labels) {
    return labels[value] || value || 'n/a';
  }

  function setSelectValue(field, value) {
    if (!field || !value) return;
    var hasOption = Array.prototype.some.call(field.options || [], function (option) {
      return option.value === value;
    });
    if (hasOption) field.value = value;
  }

  function scoreBand(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  function computeIntentScore(data) {
    var score = 12;
    if ((data.inquiryType || 'general') === 'formal') score += 22;

    if (data.priority === 'urgent') score += 18;
    else if (data.priority === 'high') score += 12;
    else score += 4;

    if (data.companySize === 'institutional' || data.companySize === 'enterprise') score += 14;
    else if (data.companySize === 'growth') score += 10;
    else if (data.companySize === 'sme') score += 7;
    else if (data.companySize === 'small') score += 4;

    if (data.timeline === 'immediate') score += 12;
    else if (data.timeline === 'quarter') score += 9;
    else if (data.timeline === 'half-year') score += 6;
    else if (data.timeline === 'strategic') score += 4;

    if (data.budgetTier === 'institutional' || data.budgetTier === 'enterprise') score += 14;
    else if (data.budgetTier === 'growth') score += 10;
    else if (data.budgetTier === 'pilot') score += 6;
    else if (data.budgetTier === 'exploratory') score += 3;

    if (data.deliveryExpectation === 'institutional' || data.deliveryExpectation === 'white-label') score += 10;
    else if (data.deliveryExpectation === 'partner') score += 8;
    else if (data.deliveryExpectation === 'advisory') score += 6;
    else if (data.deliveryExpectation === 'direct') score += 5;

    if (data.subject && data.subject !== 'other') score += 6;

    return Math.min(100, score);
  }

  function buildRouteSummary(data) {
    var profile = PROFILE_CONFIG[data.profile] || PROFILE_CONFIG.general;
    var score = computeIntentScore(data);
    var band = scoreBand(score);
    var recommendedChannelKey = data.inquiryType === 'formal' || profile.intent === 'licensing' || profile.intent === 'institutional'
      ? 'direct-formal'
      : 'qualified-web-form';

    return {
      intent: profile.intent || 'general',
      route: profile.route,
      channel: recommendedChannelKey === 'direct-formal'
        ? 'Direktan formalni kanal + validirani intake. ' + profile.channel
        : 'Web qualification forma + sledeći discovery korak. ' + profile.channel,
      nextStep: profile.nextStep,
      score: score,
      band: band,
      recommendedChannelKey: recommendedChannelKey,
      scoreNote: band === 'high'
        ? 'Visok score znači da je zahtev dovoljno definisan za formalni ili ubrzani poslovni nastavak.'
        : band === 'medium'
          ? 'Srednji score znači da je zahtev blizu ozbiljnijeg business razgovora, ali i dalje traži qualification detalje.'
          : 'Niži score znači discovery fazu i potrebu za dodatnim qualification informacijama pre formalnog nastavka.'
    };
  }

  function resolveSubmissionRouting(data) {
    var summary = buildRouteSummary(data);
    var shouldRedirect = summary.recommendedChannelKey === 'direct-formal';

    return {
      intent: summary.intent,
      intentScore: summary.score,
      recommendedChannel: summary.recommendedChannelKey,
      channel: shouldRedirect ? 'mailto-direct' : 'web-form-local',
      status: shouldRedirect ? 'redirected-to-direct-channel' : 'captured-local',
      shouldRedirect: shouldRedirect
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      computeIntentScore: computeIntentScore,
      scoreBand: scoreBand,
      buildRouteSummary: buildRouteSummary,
      resolveSubmissionRouting: resolveSubmissionRouting
    };
  }

  var doc = typeof document !== 'undefined' ? document : null;
  var form = doc ? doc.getElementById('contactForm') : null;
  var feedback = doc ? doc.getElementById('formFeedback') : null;
  if (!form || !feedback) return;

  var inquiryTypeField = form.querySelector('#contactInquiryType');
  var subjectField = form.querySelector('#contactSubject');
  var profileField = form.querySelector('#contactProfile');
  var priorityField = form.querySelector('#contactPriority');
  var expectationField = doc.getElementById('contactExpectation');
  var channelField = doc.getElementById('contactChannelNotice');
  var routeProfileField = doc.getElementById('contactRouteProfile');
  var routeChannelField = doc.getElementById('contactRouteChannel');
  var routeNextField = doc.getElementById('contactRouteNext');
  var routeScoreField = doc.getElementById('contactRouteScore');
  var routeScoreNoteField = doc.getElementById('contactRouteScoreNote');

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

  function currentEntryPreview() {
    return {
      inquiryType: sanitize(inquiryTypeField && inquiryTypeField.value || 'general'),
      priority: sanitize(priorityField && priorityField.value || 'standard'),
      profile: sanitize(profileField && profileField.value || 'general'),
      companySize: sanitize(form.querySelector('#contactCompanySize') && form.querySelector('#contactCompanySize').value),
      timeline: sanitize(form.querySelector('#contactTimeline') && form.querySelector('#contactTimeline').value),
      budgetTier: sanitize(form.querySelector('#contactBudgetTier') && form.querySelector('#contactBudgetTier').value),
      deliveryExpectation: sanitize(form.querySelector('#contactDeliveryExpectation') && form.querySelector('#contactDeliveryExpectation').value),
      subject: sanitize(subjectField && subjectField.value)
    };
  }

  function syncExperience() {
    if (!profileField) return;

    var profile = PROFILE_CONFIG[profileField.value] || PROFILE_CONFIG.general;
    var inquiryType = inquiryTypeField ? inquiryTypeField.value : 'general';
    var priority = priorityField ? priorityField.value : 'standard';
    var preview = currentEntryPreview();
    var summary = buildRouteSummary(preview);

    if (channelField) {
      channelField.textContent = inquiryType === 'formal'
        ? 'Odabrali ste direktni kanal: posle validacije forma otvara email prema formalnom prijemnom kanalu.'
        : profile.channel;
    }

    if (expectationField) {
      var priorityText = priority === 'urgent'
        ? 'Prioritet je označen kao urgentan.'
        : priority === 'high'
          ? 'Prioritet je označen kao visok.'
          : 'Prioritet je standardan.';
      expectationField.textContent = profile.message + ' ' + priorityText + ' Uključite veličinu organizacije, timeline, budget tier i željeni delivery model.';
    }

    if (routeProfileField) routeProfileField.textContent = profile.route;
    if (routeChannelField) routeChannelField.textContent = summary.channel;
    if (routeNextField) routeNextField.textContent = summary.nextStep;
    if (routeScoreField) {
      routeScoreField.textContent = 'Score ' + summary.score + ' / 100';
      routeScoreField.className = 'score-badge score-badge-' + summary.band;
    }
    if (routeScoreNoteField) routeScoreNoteField.textContent = summary.scoreNote;

    form.setAttribute('data-intent', summary.intent || 'general');

    if (profile.subject && subjectField && !subjectField.value) {
      subjectField.value = profile.subject;
    }
  }

  function applyQueryPrefill() {
    var params = new URLSearchParams(window.location.search);
    if (params.has('profile')) setSelectValue(profileField, params.get('profile'));
    if (params.has('subject')) setSelectValue(subjectField, params.get('subject'));
    if (params.has('priority')) setSelectValue(priorityField, params.get('priority'));
    if (params.has('inquiryType')) setSelectValue(inquiryTypeField, params.get('inquiryType'));
    syncExperience();
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
    var entry = {
      id: makeId(),
      ts: new Date().toISOString(),
      source: 'contact.html',
      profile: sanitize(profileField && profileField.value || 'general'),
      priority: sanitize(priorityField && priorityField.value || 'standard'),
      inquiryType: inquiryType,
      name: sanitize(form.querySelector('#contactName').value),
      email: sanitize(form.querySelector('#contactEmail').value),
      company: sanitize(form.querySelector('#contactCompany').value),
      jurisdiction: sanitize(form.querySelector('#contactJurisdiction').value),
      companySize: sanitize(form.querySelector('#contactCompanySize').value),
      timeline: sanitize(form.querySelector('#contactTimeline').value),
      budgetTier: sanitize(form.querySelector('#contactBudgetTier').value),
      deliveryExpectation: sanitize(form.querySelector('#contactDeliveryExpectation').value),
      subject: sanitize(form.querySelector('#contactSubject').value),
      message: sanitize(form.querySelector('#contactMessage').value)
    };
    var routing = resolveSubmissionRouting(entry);
    entry.intent = routing.intent;
    entry.intentScore = routing.intentScore;
    entry.recommendedChannel = routing.recommendedChannel;
    entry.status = routing.status;
    entry.channel = routing.channel;
    return entry;
  }

  function buildMailto(entry) {
    var subject = encodeURIComponent('AI IQ World Bank - Formal Request - ' + humanizeSubject(entry.subject));
    var body = encodeURIComponent(
      'Formal request details:\n' +
      'Profile: ' + entry.profile + '\n' +
      'Priority: ' + entry.priority + '\n' +
      'Name: ' + entry.name + '\n' +
      'Email: ' + entry.email + '\n' +
      'Company: ' + entry.company + '\n' +
      'Jurisdiction: ' + entry.jurisdiction + '\n' +
      'Company size: ' + humanizeLabel(entry.companySize, COMPANY_SIZE_LABELS) + '\n' +
      'Timeline: ' + humanizeLabel(entry.timeline, TIMELINE_LABELS) + '\n' +
      'Budget tier: ' + humanizeLabel(entry.budgetTier, BUDGET_LABELS) + '\n' +
      'Delivery expectation: ' + humanizeLabel(entry.deliveryExpectation, DELIVERY_LABELS) + '\n' +
      'Topic: ' + humanizeSubject(entry.subject) + '\n\n' +
      entry.message
    );
    return 'mailto:spajicn@yahoo.com?subject=' + subject + '&body=' + body;
  }

  function validate(entry) {
    if (!entry.profile) return 'Izaberite profil razgovora.';
    if (!entry.name || entry.name.length < 2) return 'Unesite validno ime (minimum 2 karaktera).';
    if (!validEmail(entry.email)) return 'Unesite validnu email adresu.';
    if (!entry.company || entry.company.length < 2) return 'Unesite naziv kompanije/organizacije.';
    if (!entry.jurisdiction || entry.jurisdiction.length < 2) return 'Unesite tržište/jurisdikciju.';
    if (!entry.companySize) return 'Izaberite veličinu organizacije.';
    if (!entry.timeline) return 'Izaberite očekivani timeline.';
    if (!entry.budgetTier) return 'Izaberite budget tier.';
    if (!entry.deliveryExpectation) return 'Izaberite očekivani delivery model.';
    if (!entry.subject) return 'Izaberite temu upita.';
    if (!entry.message || entry.message.length < 20) return 'Poruka mora imati minimum 20 karaktera.';
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

    if (entry.recommendedChannel === 'direct-formal') {
      setFeedback('Formalni/regulatorni zahtev je evidentiran i sada se otvara direktni email kanal ka spajicn@yahoo.com.', 'warn');
      if (window.aiqTrackEvent) {
        window.aiqTrackEvent('contact_formal_redirect', { subject: entry.subject, jurisdiction: entry.jurisdiction, profile: entry.profile, priority: entry.priority, companySize: entry.companySize, timeline: entry.timeline, budgetTier: entry.budgetTier, deliveryExpectation: entry.deliveryExpectation, intent: entry.intent, intentScore: entry.intentScore, recommendedChannel: entry.recommendedChannel });
      }
      setTimeout(function () {
        window.location.href = buildMailto(entry);
      }, 400);
    } else {
      setFeedback('✅ Hvala! Vaš upit je evidentiran lokalno sa audit tragom. Ako bude potreban formalni nastavak, nastavite kroz direktni email kanal.', 'success');
      if (window.aiqTrackEvent) {
        window.aiqTrackEvent('contact_general_submit', { subject: entry.subject, jurisdiction: entry.jurisdiction, profile: entry.profile, priority: entry.priority, companySize: entry.companySize, timeline: entry.timeline, budgetTier: entry.budgetTier, deliveryExpectation: entry.deliveryExpectation, intent: entry.intent, intentScore: entry.intentScore, recommendedChannel: entry.recommendedChannel });
      }
      form.reset();
      syncExperience();
    }
  });

  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');

  [inquiryTypeField, profileField, priorityField].forEach(function (field) {
    if (!field) return;
    field.addEventListener('change', function () {
      syncExperience();
      if (window.aiqTrackEvent) {
        var preview = currentEntryPreview();
        var profileConfig = PROFILE_CONFIG[preview.profile] || PROFILE_CONFIG.general;
        window.aiqTrackEvent('contact_intake_update', {
          profile: profileField ? profileField.value : '',
          inquiryType: inquiryTypeField ? inquiryTypeField.value : '',
          priority: priorityField ? priorityField.value : '',
          intent: profileConfig.intent || 'general',
          intentScore: computeIntentScore(preview)
        });
      }
    });
  });

  [subjectField, form.querySelector('#contactCompanySize'), form.querySelector('#contactTimeline'), form.querySelector('#contactBudgetTier'), form.querySelector('#contactDeliveryExpectation')].forEach(function (field) {
    if (!field) return;
    field.addEventListener('change', syncExperience);
  });

  applyQueryPrefill();
  syncExperience();
})();
