const test = require('node:test');
const assert = require('node:assert/strict');

const {
  computeIntentScore,
  scoreBand,
  buildRouteSummary
} = require('./contact-flow.js');

test('formal institutional routing produces direct high-intent summary', function () {
  const summary = buildRouteSummary({
    profile: 'institutional',
    inquiryType: 'formal',
    priority: 'urgent',
    companySize: 'institutional',
    timeline: 'immediate',
    budgetTier: 'institutional',
    deliveryExpectation: 'institutional',
    subject: 'public-ngo'
  });

  assert.equal(summary.intent, 'institutional');
  assert.equal(summary.recommendedChannelKey, 'direct-formal');
  assert.equal(summary.band, 'high');
  assert.match(summary.channel, /Direktan formalni kanal/);
  assert(summary.score >= 70);
});

test('qualification detail changes increase score and keep partner route summary', function () {
  const lowSignal = buildRouteSummary({
    profile: 'partnership',
    inquiryType: 'general',
    priority: 'standard',
    companySize: 'small',
    timeline: 'strategic',
    budgetTier: 'exploratory',
    deliveryExpectation: 'direct',
    subject: 'other'
  });

  const highSignal = buildRouteSummary({
    profile: 'partnership',
    inquiryType: 'general',
    priority: 'high',
    companySize: 'enterprise',
    timeline: 'immediate',
    budgetTier: 'enterprise',
    deliveryExpectation: 'white-label',
    subject: 'country-partnership'
  });

  assert.equal(lowSignal.intent, 'partnership');
  assert.equal(highSignal.intent, 'partnership');
  assert.match(highSignal.nextStep, /partner/i);
  assert(highSignal.score > lowSignal.score);
  assert.equal(scoreBand(lowSignal.score), lowSignal.band);
  assert.equal(scoreBand(highSignal.score), highSignal.band);
  assert.notEqual(lowSignal.band, highSignal.band);
});
