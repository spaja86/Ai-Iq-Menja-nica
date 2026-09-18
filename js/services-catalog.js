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
    count: document.getElementById('serviceResultsCount')
  };
  var trackTimer = 0;

  var cards = Array.prototype.slice.call(catalog.querySelectorAll('.service-card[data-category]'));
  if (!cards.length) return;

  function matches(card, name, value) {
    if (!value) return true;
    var attr = card.getAttribute('data-' + name) || '';
    return attr.split(/\s+/).indexOf(value) !== -1;
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
      if (show) visible += 1;
    });

    if (controls.count) {
      controls.count.textContent = visible + ' / ' + cards.length + ' usluga prikazano';
    }

    if (controls.count) controls.count.setAttribute('aria-label', controls.count.textContent);
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

  applyFilters(false);
})();
