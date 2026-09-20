(function () {
  'use strict';

  var catalog = document.getElementById('serviceCatalog');
  if (!catalog) return;

  var controls = {
    category: document.getElementById('serviceCategoryFilter'),
    client: document.getElementById('serviceClientFilter'),
    region: document.getElementById('serviceRegionFilter'),
    delivery: document.getElementById('serviceDeliveryFilter'),
    status: document.getElementById('serviceStatusFilter'),
    readiness: document.getElementById('serviceReadinessFilter'),
    regulatory: document.getElementById('serviceRegulatoryFilter'),
    integration: document.getElementById('serviceIntegrationFilter'),
    reset: document.getElementById('servicesFilterReset'),
    count: document.getElementById('serviceResultsCount'),
    guidanceText: document.getElementById('serviceFilterGuidanceText'),
    guidanceMeta: document.getElementById('serviceFilterGuidanceMeta')
  };
  var trackTimer = 0;
  var SIGNAL_LABELS = {
    readiness: {
      'phase-1': 'Phase 1 / discovery-ready',
      'phase-2': 'Phase 2 / partner + documentation',
      'phase-3': 'Phase 3 / rollout preparation'
    },
    regulatory: {
      low: 'Low regulatory dependency',
      medium: 'Medium regulatory dependency',
      elevated: 'Elevated regulatory dependency',
      critical: 'Critical regulatory dependency'
    },
    integration: {
      low: 'Low integration complexity',
      medium: 'Medium integration complexity',
      high: 'High integration complexity'
    }
  };

  var cards = Array.prototype.slice.call(catalog.querySelectorAll('.service-card[data-category]'));
  if (!cards.length) return;

  function signalLabel(type, value) {
    return SIGNAL_LABELS[type] && SIGNAL_LABELS[type][value] ? SIGNAL_LABELS[type][value] : value;
  }

  function createSignal(text, className) {
    var signal = document.createElement('div');
    signal.className = 'service-signal ' + className;
    signal.textContent = text;
    return signal;
  }

  function decorateCard(card) {
    if (!card || card.getAttribute('data-decorated') === 'true') return;

    var actions = card.querySelector('.service-actions');
    if (!actions) return;

    var signalGrid = document.createElement('div');
    signalGrid.className = 'service-signal-grid';
    signalGrid.appendChild(createSignal('Readiness: ' + signalLabel('readiness', card.getAttribute('data-readiness') || ''), 'service-signal-readiness'));
    signalGrid.appendChild(createSignal('Regulatory: ' + signalLabel('regulatory', card.getAttribute('data-regulatory') || ''), 'service-signal-regulatory'));
    signalGrid.appendChild(createSignal('Integration: ' + signalLabel('integration', card.getAttribute('data-integration') || ''), 'service-signal-integration'));

    var bestFit = card.getAttribute('data-best-fit');
    if (bestFit) {
      signalGrid.appendChild(createSignal('Best fit: ' + bestFit, 'service-signal-fit'));
    }

    card.insertBefore(signalGrid, actions);

    var trustNote = card.getAttribute('data-trust-note');
    if (trustNote) {
      var note = document.createElement('p');
      note.className = 'compact-note service-trust-note';
      note.textContent = 'Trust note: ' + trustNote;
      card.insertBefore(note, actions);
    }

    card.setAttribute('data-decorated', 'true');
  }

  function matches(card, name, value) {
    if (!value) return true;
    var attr = card.getAttribute('data-' + name) || '';
    return attr.split(/\s+/).indexOf(value) !== -1;
  }

  function updateGuidance(visibleCards) {
    if (!controls.guidanceText || !controls.guidanceMeta) return;

    if (!visibleCards.length) {
      controls.guidanceText.textContent = 'Nema rezultata za izabranu kombinaciju filtera. Resetujte filtere ili proširite region/status/readiness opseg.';
      controls.guidanceMeta.textContent = 'Ako ciljate regulatory-heavy capability, proverite trust centar i formalni desk pre nastavka.';
      return;
    }

    if (visibleCards.length === 1) {
      var single = visibleCards[0];
      var title = single.querySelector('h3');
      controls.guidanceText.textContent = (title ? title.textContent : 'Izabrana usluga') + ' je trenutno najbolji match za izabrane kriterijume.';
      controls.guidanceMeta.textContent = single.getAttribute('data-trust-note') || 'Sledeći korak: pregledajte trust pravila i otvorite odgovarajući intake tok.';
      return;
    }

    if ((controls.regulatory && controls.regulatory.value === 'critical') || (controls.status && controls.status.value === 'roadmap')) {
      controls.guidanceText.textContent = 'Izabrali ste capability-je sa formalnijim governance i readiness zahtevima.';
      controls.guidanceMeta.textContent = 'Prioritetni sledeći korak je trust centar, licensing desk ili formalni intake sa jasnim tržištem i partner modelom.';
      return;
    }

    if ((controls.delivery && controls.delivery.value === 'white-label') || (controls.client && controls.client.value === 'fintech')) {
      controls.guidanceText.textContent = 'Vidljivi rezultati odgovaraju partner-led i white-label scenarijima.';
      controls.guidanceMeta.textContent = 'Najviše vrednosti dobijate ako nastavite kroz partner onboarding desk i kvalifikujete distribucioni model.';
      return;
    }

    controls.guidanceText.textContent = 'Vidljivi capability set je pogodan za discovery, comparison i rani qualification razgovor.';
    controls.guidanceMeta.textContent = 'Za svaki rezultat proverite readiness, regulatory dependency i integration complexity pre nego što otvorite komercijalni ili formalni kanal.';
  }

  function queueTracking(visible) {
    if (!window.aiqTrackEvent) return;
    window.clearTimeout(trackTimer);
    trackTimer = window.setTimeout(function () {
      window.aiqTrackEvent('services_catalog_filter', {
        category: controls.category ? controls.category.value : '',
        client: controls.client ? controls.client.value : '',
        region: controls.region ? controls.region.value : '',
        delivery: controls.delivery ? controls.delivery.value : '',
        status: controls.status ? controls.status.value : '',
        readiness: controls.readiness ? controls.readiness.value : '',
        regulatory: controls.regulatory ? controls.regulatory.value : '',
        integration: controls.integration ? controls.integration.value : '',
        visible: visible
      });
    }, 180);
  }

  function applyFilters(shouldTrack) {
    var visible = 0;
    var visibleCards = [];

    cards.forEach(function (card) {
      var show =
        matches(card, 'category', controls.category && controls.category.value) &&
        matches(card, 'client', controls.client && controls.client.value) &&
        matches(card, 'region', controls.region && controls.region.value) &&
        matches(card, 'delivery', controls.delivery && controls.delivery.value) &&
        matches(card, 'status', controls.status && controls.status.value) &&
        matches(card, 'readiness', controls.readiness && controls.readiness.value) &&
        matches(card, 'regulatory', controls.regulatory && controls.regulatory.value) &&
        matches(card, 'integration', controls.integration && controls.integration.value);

      card.hidden = !show;
      if (show) {
        visible += 1;
        visibleCards.push(card);
      }
    });

    if (controls.count) {
      controls.count.textContent = visible + ' / ' + cards.length + ' usluga prikazano';
    }

    if (controls.count) controls.count.setAttribute('aria-label', controls.count.textContent);
    updateGuidance(visibleCards);
    if (shouldTrack) queueTracking(visible);
  }

  ['category', 'client', 'region', 'delivery', 'status', 'readiness', 'regulatory', 'integration'].forEach(function (key) {
    var control = controls[key];
    if (!control) return;
    control.addEventListener('change', function () {
      applyFilters(true);
    });
  });

  if (controls.reset) {
    controls.reset.addEventListener('click', function () {
      ['category', 'client', 'region', 'delivery', 'status', 'readiness', 'regulatory', 'integration'].forEach(function (key) {
        if (controls[key]) controls[key].value = '';
      });
      applyFilters(true);
    });
  }

  cards.forEach(decorateCard);
  applyFilters(false);
})();
