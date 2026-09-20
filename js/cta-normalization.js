(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.aiqCtaNormalization = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var intentByLanding = {
    'licensing.html': 'licensing',
    'institutional.html': 'institutional',
    'partner-onboarding.html': 'partnership',
    'contact.html': 'general'
  };

  function inferIntentForContact(href) {
    var query = (href.split('#')[0].split('?')[1] || '').toLowerCase();
    var params = new URLSearchParams(query);
    var profile = (params.get('profile') || '').toLowerCase();

    if (profile === 'licensing') return 'licensing';
    if (profile === 'institutional') return 'institutional';
    if (profile === 'partnership') return 'partnership';
    return 'general';
  }

  function parseInternalLandingHref(href) {
    var rawHref = (href || '').trim();
    if (!rawHref || rawHref.indexOf('#') === 0) return null;

    var isExternal = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(rawHref);
    var isNonPageAction = /^(mailto:|tel:|javascript:)/i.test(rawHref);
    if (isExternal || isNonPageAction) return null;

    var withoutHash = rawHref.split('#')[0];
    var pagePath = withoutHash.split('?')[0];
    var normalizedPath = pagePath.replace(/^\.\//, '').replace(/^\/+/, '');
    var page = normalizedPath.split('/').pop();
    if (!page) return null;

    var normalizedPage = page.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(intentByLanding, normalizedPage)) return null;

    return {
      page: normalizedPage,
      hrefWithoutHash: withoutHash
    };
  }

  function getTrackingDefaults(href) {
    var parsed = parseInternalLandingHref(href);
    if (!parsed) return null;

    var intent = parsed.page === 'contact.html'
      ? inferIntentForContact(parsed.hrefWithoutHash)
      : intentByLanding[parsed.page];

    return {
      track: 'intent_cta_click',
      trackIdPrefix: 'auto-' + parsed.page.replace('.html', ''),
      intent: intent,
      funnelStage: parsed.page === 'contact.html' ? 'qualification' : 'consideration'
    };
  }

  return {
    inferIntentForContact: inferIntentForContact,
    parseInternalLandingHref: parseInternalLandingHref,
    getTrackingDefaults: getTrackingDefaults
  };
});
