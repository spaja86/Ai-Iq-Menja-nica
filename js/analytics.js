(function () {
  'use strict';

  var STORAGE_KEY = 'aiq-analytics-events';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-1000)));
  }

  function trackEvent(name, payload) {
    var event = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: name,
      payload: payload || {},
      page: location.pathname,
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

  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-track], a, button');
    if (!target) return;

    if (target.hasAttribute('data-track')) {
      trackEvent(target.getAttribute('data-track'), {
        id: target.getAttribute('data-track-id') || '',
        text: (target.textContent || '').trim().slice(0, 80)
      });
      return;
    }

    if (target.tagName === 'A') {
      var href = target.getAttribute('href') || '';
      if (href.startsWith('http') || href.startsWith('mailto:')) {
        trackEvent('external_or_action_link_click', { href: href.slice(0, 200) });
      }
      return;
    }

    if (target.tagName === 'BUTTON') {
      trackEvent('button_click', {
        id: target.id || '',
        text: (target.textContent || '').trim().slice(0, 80)
      });
    }
  }, true);

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.id) return;
    trackEvent('form_submit_attempt', { formId: form.id });
  }, true);
})();
