const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Lead = require('../src/models/Lead');
const { loginAsAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testRunId = Date.now().toString();
const testEmail = `lead-export-${testRunId}@example.com`;
let token = '';
let leadId = '';

const authHeader = () => ({ Authorization: `Bearer ${token}` });

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  const login = await loginAsAdmin(app, request);
  token = login.token;

  const lead = await Lead.create({
    name: 'Export, Test',
    email: testEmail,
    phone: '03032799987',
    company: 'Export Company',
    serviceInterest: 'Meta Ads Management',
    monthlyBudget: 'PKR 100,000–250,000',
    message: 'Needs "qualified" leads, with a detailed review.',
    source: `export-test-${testRunId}`,
    status: 'qualified',
    isRead: false,
  });
  leadId = lead._id;
});

test.after(async () => {
  await Lead.deleteOne({ _id: leadId });
  await mongoose.disconnect();
});

test('lead export requires admin authentication', async () => {
  await request(app).get('/api/leads/export').expect(401);
});

test('admin can export filtered leads as escaped CSV', async () => {
  const response = await request(app)
    .get(`/api/leads/export?status=qualified&source=export-test-${testRunId}`)
    .set(authHeader())
    .expect(200);

  assert.match(response.headers['content-type'], /text\/csv/);
  assert.match(response.headers['content-disposition'], /attachment; filename="boost-vertex-leads-/);
  assert.match(response.text, /createdAt,name,email,phone,company,serviceInterest,monthlyBudget,message,source,status,isRead/);
  assert.match(response.text, /"Export, Test"/);
  assert.match(response.text, /"Needs ""qualified"" leads, with a detailed review\."/);
  assert.match(response.text, /PKR 100,000–250,000/);
  assert.match(response.text, new RegExp(testEmail));
});

test('lead export returns an empty CSV when filters match no records', async () => {
  const response = await request(app)
    .get(`/api/leads/export?source=missing-source-${testRunId}`)
    .set(authHeader())
    .expect(200);

  assert.equal(response.text.split('\r\n').length, 1);
  assert.match(response.text, /^createdAt,name,email/);
});
