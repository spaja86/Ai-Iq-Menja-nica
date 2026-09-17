(function () {
  'use strict';

  function setExpanded(item, expanded) {
    var header = item.querySelector('.accordion-header');
    var body = item.querySelector('.accordion-body');
    if (header) header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (body) body.hidden = !expanded;
  }

  window.toggleAccordion = function (header) {
    var item = header.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item').forEach(function (i) {
      i.classList.remove('open');
      setExpanded(i, false);
    });
    if (!isOpen) {
      item.classList.add('open');
      setExpanded(item, true);
    }
  };

  function initAccordionAccessibility() {
    document.querySelectorAll('.accordion-item').forEach(function (item, index) {
      var header = item.querySelector('.accordion-header');
      var body = item.querySelector('.accordion-body');
      if (!header || !body) return;

      if (!body.id) body.id = 'accordion-panel-' + index;
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-controls', body.id);
      setExpanded(item, item.classList.contains('open'));

      header.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.toggleAccordion(header);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordionAccessibility);
  } else {
    initAccordionAccessibility();
  }
})();
