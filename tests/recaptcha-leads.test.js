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
  RECAPTCHA_MIN_SCORE: process.env.RECAPTCHA_MIN_SCORE,
  RECAPTCHA_ENABLED: process.env.RECAPTCHA_ENABLED,
  SMTP_USER: process.env.SMTP_USER,
};

const originalFetch = global.fetch;

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  // Avoid external SMTP calls during this test suite.
  process.env.SMTP_USER = 'your_email@gmail.com';
  process.env.RECAPTCHA_MIN_SCORE = '0.5';
  // These cases exercise the enforced path; opt in explicitly so a local
  // `.env` with RECAPTCHA_ENABLED=false does not mask them.
  process.env.RECAPTCHA_ENABLED = 'true';
});

test.after(async () => {
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.RECAPTCHA_SECRET_KEY = originalEnv.RECAPTCHA_SECRET_KEY;
  process.env.RECAPTCHA_MIN_SCORE = originalEnv.RECAPTCHA_MIN_SCORE;
  process.env.RECAPTCHA_ENABLED = originalEnv.RECAPTCHA_ENABLED;
  process.env.SMTP_USER = originalEnv.SMTP_USER;
  global.fetch = originalFetch;

  await Lead.deleteMany({ source: testSource });
  await mongoose.disconnect();
});

test('accepts lead when reCAPTCHA token is valid in production mode', async () => {
  process.env.NODE_ENV = 'production';
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';

  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: true, score: 0.9 }),
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

test('rejects lead when reCAPTCHA token is invalid in production mode', async () => {
  process.env.NODE_ENV = 'production';
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';

  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: false, score: 0.1, 'error-codes': ['invalid-input-response'] }),
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

test('rejects missing reCAPTCHA token in production mode when secret is configured', async () => {
  process.env.NODE_ENV = 'production';
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret-key';

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
