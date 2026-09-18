(function () {
  'use strict';

  var STORAGE_KEY = 'aiq-analytics-events';
  var MAX_EVENTS = 1000;

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveEvent(event) {
    var events = loadEvents();
    events.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function pageType(pathname) {
    var path = (pathname || location.pathname || '/').split('/').pop() || 'index.html';
    var map = {
      'index.html': 'homepage',
      'services.html': 'services',
      'contact.html': 'contact',
      'trade.html': 'trade',
      'wallet.html': 'wallet',
      'education.html': 'education',
      'about.html': 'about',
      'licensing.html': 'intent-licensing',
      'institutional.html': 'intent-institutional',
      'partner-onboarding.html': 'intent-partnership',
      'trust-center.html': 'trust-center'
    };
    return map[path] || 'other';
  }

  function deriveIntentFromHref(href) {
    if (!href) return '';
    if (href.indexOf('licensing') !== -1) return 'licensing';
    if (href.indexOf('institutional') !== -1 || href.indexOf('public-ngo') !== -1) return 'institutional';
    if (href.indexOf('partner') !== -1 || href.indexOf('white-label') !== -1 || href.indexOf('country-partnership') !== -1) return 'partnership';
    return '';
  }

  function deriveStageFromHref(href) {
    if (!href) return '';
    if (href.indexOf('mailto:') === 0 || href.indexOf('inquiryType=formal') !== -1) return 'convert';
    if (href.indexOf('contact.html') !== -1) return 'engage';
    if (href.indexOf('services.html') !== -1 || href.indexOf('.html') !== -1) return 'consider';
    return '';
  }

  function intentMeta(target, href) {
    var intent = target.getAttribute('data-intent') || deriveIntentFromHref(href);
    var funnelStage = target.getAttribute('data-funnel-stage') || deriveStageFromHref(href);
    return {
      intent: intent || 'general',
      funnelStage: funnelStage || 'browse'
    };
  }

  function trackEvent(name, payload) {
    var event = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: name,
      payload: payload || {},
      page: location.pathname,
      pageType: pageType(location.pathname),
      ts: new Date().toISOString()
    };
    saveEvent(event);
  }

  window.aiqTrackEvent = trackEvent;

  window.aiqAnalyticsSummary = function () {
    var events = loadEvents();
    return events.reduce(function (acc, event) {
      acc.total += 1;
      acc.byName[event.name] = (acc.byName[event.name] || 0) + 1;
      return acc;
    }, { total: 0, byName: {} });
  };

  window.aiqAnalyticsKpis = function () {
    var events = loadEvents();
    return events.reduce(function (acc, event) {
      acc.totalEvents += 1;
      if (event.name === 'page_view') acc.pageViews += 1;
      if (event.name === 'conversion_path_click' || event.name === 'homepage_path_click' || event.name === 'intent_cta_click') acc.pathClicks += 1;
      if (event.name === 'service_cta_click' || event.name === 'services_hub_click') acc.serviceInterest += 1;
      if (event.name === 'form_submit_attempt') acc.formAttempts += 1;
      if (event.name === 'contact_general_submit') acc.generalSubmits += 1;
      if (event.name === 'contact_formal_redirect') acc.formalRedirects += 1;
      return acc;
    }, {
      totalEvents: 0,
      pageViews: 0,
      pathClicks: 0,
      serviceInterest: 0,
      formAttempts: 0,
      generalSubmits: 0,
      formalRedirects: 0
    });
  };

  window.aiqAnalyticsExport = function (format) {
    var events = loadEvents();
    if (format === 'csv') {
      var header = ['id', 'name', 'page', 'pageType', 'ts', 'payload'];
      var rows = events.map(function (event) {
        return [event.id, event.name, event.page, event.pageType, event.ts, JSON.stringify(event.payload || {})].map(function (value) {
          return '"' + String(value || '').replace(/"/g, '""') + '"';
        }).join(',');
      });
      return [header.join(','), rows.join('\n')].join('\n');
    }
    return JSON.stringify({ events: events, summary: window.aiqAnalyticsSummary(), kpis: window.aiqAnalyticsKpis() }, null, 2);
  };

  document.addEventListener('DOMContentLoaded', function () {
    trackEvent('page_view', {
      pageType: pageType(location.pathname),
      lang: document.documentElement.lang || 'sr'
    });
  });

  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-track], a, button');
    if (!target) return;

    var href = target.getAttribute('href') || '';
    var meta = intentMeta(target, href);

    if (target.hasAttribute('data-track')) {
      trackEvent(target.getAttribute('data-track'), {
        id: target.getAttribute('data-track-id') || '',
        text: (target.textContent || '').trim().slice(0, 80),
        intent: meta.intent,
        funnelStage: meta.funnelStage
      });
      return;
    }

    if (target.tagName === 'A') {
      var isExternal = href.indexOf('http') === 0 || href.indexOf('mailto:') === 0;
      var isInternalHtml = href.indexOf('.html') !== -1 || href === 'index.html';

      if (isExternal) {
        trackEvent('external_or_action_link_click', {
          href: href.slice(0, 200),
          intent: meta.intent,
          funnelStage: meta.funnelStage
        });
      } else if (isInternalHtml) {
        trackEvent('conversion_path_click', {
          href: href.slice(0, 200),
          intent: meta.intent,
          funnelStage: meta.funnelStage
        });
      }
      return;
    }

    if (target.tagName === 'BUTTON') {
      trackEvent('button_click', {
        id: target.id || '',
        text: (target.textContent || '').trim().slice(0, 80),
        intent: meta.intent,
        funnelStage: meta.funnelStage
      });
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.id) return;

    var meta = {
      intent: form.getAttribute('data-intent') || (form.id === 'contactForm' ? 'general' : 'general'),
      funnelStage: 'convert'
    };

    trackEvent('form_submit_attempt', {
      formId: form.id,
      intent: meta.intent,
      funnelStage: meta.funnelStage
    });
  }, true);
})();
