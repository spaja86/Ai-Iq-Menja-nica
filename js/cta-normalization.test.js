const test = require('node:test');
const assert = require('node:assert/strict');

const {
  inferIntentForContact,
  parseInternalLandingHref,
  getTrackingDefaults
} = require('./cta-normalization.js');

test('supports relative and absolute same-site landing links', function () {
  assert.deepEqual(parseInternalLandingHref('./contact.html?profile=licensing'), {
    page: 'contact.html',
    hrefWithoutHash: './contact.html?profile=licensing'
  });

  assert.deepEqual(parseInternalLandingHref('/institutional.html'), {
    page: 'institutional.html',
    hrefWithoutHash: '/institutional.html'
  });
});

test('ignores external and non-page href values', function () {
  assert.equal(parseInternalLandingHref('https://example.com/contact.html'), null);
  assert.equal(parseInternalLandingHref('//example.com/contact.html'), null);
  assert.equal(parseInternalLandingHref('mailto:test@example.com'), null);
  assert.equal(parseInternalLandingHref('#section'), null);
});

test('infers contact intent from profile query parameter', function () {
  assert.equal(inferIntentForContact('contact.html?profile=licensing'), 'licensing');
  assert.equal(inferIntentForContact('contact.html?profile=institutional'), 'institutional');
  assert.equal(inferIntentForContact('contact.html?profile=partnership'), 'partnership');
  assert.equal(inferIntentForContact('contact.html?profile=business'), 'general');
});

test('builds tracking defaults for supported landing pages', function () {
  assert.deepEqual(getTrackingDefaults('contact.html?profile=licensing'), {
    track: 'intent_cta_click',
    trackIdPrefix: 'auto-contact',
    intent: 'licensing',
    funnelStage: 'qualification'
  });

  assert.deepEqual(getTrackingDefaults('/partner-onboarding.html'), {
    track: 'intent_cta_click',
    trackIdPrefix: 'auto-partner-onboarding',
    intent: 'partnership',
    funnelStage: 'consideration'
  });
});

test('handles case-insensitive page names and hash fragments', function () {
  assert.deepEqual(getTrackingDefaults('CONTACT.HTML?profile=licensing#jump'), {
    track: 'intent_cta_click',
    trackIdPrefix: 'auto-contact',
    intent: 'licensing',
    funnelStage: 'qualification'
  });
});
