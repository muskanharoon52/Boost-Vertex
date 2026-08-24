const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Lead = require('../src/models/Lead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testRunId = Date.now().toString();
const testSource = `recaptcha-test-${testRunId}`;

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  RECAPTCHA_ENABLED: process.env.RECAPTCHA_ENABLED,
  RECAPTCHA_ALLOWED_HOSTNAMES: process.env.RECAPTCHA_ALLOWED_HOSTNAMES,
  SMTP_USER: process.env.SMTP_USER,
};

const originalFetch = global.fetch;

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  // Avoid external SMTP calls during this test suite.
  process.env.SMTP_USER = 'your_email@gmail.com';
  // These cases exercise the enforced path; opt in explicitly so a local
  // `.env` toggle does not mask them. A secret must be present for the
  // verify call to actually run (rather than being skipped).
  process.env.RECAPTCHA_ENABLED = 'true';
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';
  // Start with no hostname allowlist so the default (frictionless) path is tested.
  delete process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
});

test.after(async () => {
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.RECAPTCHA_SECRET_KEY = originalEnv.RECAPTCHA_SECRET_KEY;
  process.env.RECAPTCHA_ENABLED = originalEnv.RECAPTCHA_ENABLED;
  if (originalEnv.RECAPTCHA_ALLOWED_HOSTNAMES === undefined) {
    delete process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
  } else {
    process.env.RECAPTCHA_ALLOWED_HOSTNAMES = originalEnv.RECAPTCHA_ALLOWED_HOSTNAMES;
  }
  process.env.SMTP_USER = originalEnv.SMTP_USER;
  global.fetch = originalFetch;

  await Lead.deleteMany({ source: testSource });
  await mongoose.disconnect();
});

test('accepts lead when the v2 Checkbox token verifies successfully', async () => {
  // v2 siteverify shape: success + challenge_ts + hostname, no score.
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, challenge_ts: new Date().toISOString(), hostname: 'localhost' }),
  });

  const email = `valid-${testRunId}@example.com`;

  const response = await request(app)
    .post('/api/leads')
    .send({
      name: 'Valid Recaptcha Lead',
      email,
      phone: '03001112222',
      company: 'Valid Co',
      serviceInterest: 'Meta Ads Management',
      monthlyBudget: 'PKR 100,000–250,000',
      message: 'Valid token request',
      source: testSource,
      recaptchaToken: 'valid-token',
    })
    .expect(201);

  assert.equal(response.body.message, 'Lead submitted successfully');
  assert.equal(response.body.lead.email, email);

  const leadInDb = await Lead.findById(response.body.lead._id).lean();
  assert.ok(leadInDb);
  assert.equal(Object.prototype.hasOwnProperty.call(leadInDb, 'recaptchaToken'), false);
});

test('accepts the widget-native g-recaptcha-response field name', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, challenge_ts: new Date().toISOString(), hostname: 'localhost' }),
  });

  const email = `native-field-${testRunId}@example.com`;

  await request(app)
    .post('/api/leads')
    .send({
      name: 'Native Field Lead',
      email,
      phone: '03001115555',
      company: 'Native Co',
      serviceInterest: 'Lead Generation',
      monthlyBudget: 'PKR 50,000–100,000',
      message: 'Token sent as g-recaptcha-response',
      source: testSource,
      'g-recaptcha-response': 'valid-token',
    })
    .expect(201);

  const leadInDb = await Lead.findOne({ email }).lean();
  assert.ok(leadInDb);
});

test('rejects lead when the v2 token is invalid', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
  });

  const email = `invalid-${testRunId}@example.com`;

  const response = await request(app)
    .post('/api/leads')
    .send({
      name: 'Invalid Recaptcha Lead',
      email,
      phone: '03001113333',
      company: 'Invalid Co',
      serviceInterest: 'Lead Generation',
      monthlyBudget: 'PKR 50,000–100,000',
      message: 'Invalid token request',
      source: testSource,
      recaptchaToken: 'invalid-token',
    })
    .expect(403);

  assert.equal(response.body.message, 'reCAPTCHA verification failed');

  const leadInDb = await Lead.findOne({ email }).lean();
  assert.equal(leadInDb, null);
});

test('rejects missing reCAPTCHA token when enforcement is on', async () => {
  const email = `missing-${testRunId}@example.com`;

  const response = await request(app)
    .post('/api/leads')
    .send({
      name: 'Missing Recaptcha Lead',
      email,
      phone: '03001114444',
      company: 'Missing Co',
      serviceInterest: 'SEO',
      monthlyBudget: 'Under PKR 50,000',
      message: 'Missing token request',
      source: testSource,
    })
    .expect(400);

  assert.equal(response.body.message, 'reCAPTCHA token is required');

  const leadInDb = await Lead.findOne({ email }).lean();
  assert.equal(leadInDb, null);
});

test('rejects a token solved on a hostname outside the allowlist', async () => {
  process.env.RECAPTCHA_ALLOWED_HOSTNAMES = 'www.boostvertex.online,boostvertex.online';

  // Token verifies at Google, but was solved on a hostname we do not allow.
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, challenge_ts: new Date().toISOString(), hostname: 'attacker.example' }),
  });

  const email = `hostname-${testRunId}@example.com`;

  try {
    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'Hostname Mismatch Lead',
        email,
        phone: '03001116666',
        company: 'Mismatch Co',
        serviceInterest: 'Meta Ads Management',
        monthlyBudget: 'PKR 100,000–250,000',
        message: 'Token from a disallowed hostname',
        source: testSource,
        recaptchaToken: 'valid-but-wrong-host',
      })
      .expect(403);

    assert.equal(response.body.message, 'reCAPTCHA verification failed');
    assert.ok((response.body.errors || []).includes('hostname-not-allowed'));

    const leadInDb = await Lead.findOne({ email }).lean();
    assert.equal(leadInDb, null);
  } finally {
    delete process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
  }
});
