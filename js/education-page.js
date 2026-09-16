(function () {
  'use strict';

  window.toggleAccordion = function (header) {
    var item = header.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  };
})();
