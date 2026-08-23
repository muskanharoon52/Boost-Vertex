const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const { getAdminCredentials, ensureTestAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';

const adminCredentials = getAdminCredentials();

let token = '';

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  await ensureTestAdmin();
});

test.after(async () => {
  await mongoose.disconnect();
});

test('POST /api/auth/login returns JWT for valid admin', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send(adminCredentials)
    .expect(200);

  assert.ok(response.body.token);
  assert.equal(response.body.email, adminCredentials.email);

  token = response.body.token;
});

test('GET /api/admin/dashboard works with admin token', async () => {
  const response = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.summary);
  assert.ok(response.body.recentLeads);
});

test('GET /api/leads supports status and read filtering for admins', async () => {
  const createdLead = await request(app)
    .post('/api/leads')
    .send({
      name: 'Filtered Lead',
      email: 'filtered.lead@example.com',
      phone: '+923001112233',
      company: 'Filtered Co',
      serviceInterest: 'Paid Ads',
      message: 'Needs a campaign audit',
      source: 'website',
      status: 'qualified',
      isRead: false,
    })
    .expect(201);

  const response = await request(app)
    .get('/api/leads?status=qualified&isRead=false')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.data);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.pagination);
  const found = response.body.data.find((lead) => lead._id === createdLead.body.lead._id);
  assert.ok(found);
  assert.equal(found.status, 'qualified');
  assert.equal(found.isRead, false);
});

test('PATCH /api/leads/:id/read toggles read state for admins', async () => {
  const createdLead = await request(app)
    .post('/api/leads')
    .send({
      name: 'Readable Lead',
      email: 'readable.lead@example.com',
      phone: '+923003334455',
      company: 'Readable Co',
      serviceInterest: 'Brand Strategy',
      message: 'Need a direction update',
      source: 'website',
      status: 'new',
      isRead: false,
    })
    .expect(201);

  const response = await request(app)
    .patch(`/api/leads/${createdLead.body.lead._id}/read`)
    .set('Authorization', `Bearer ${token}`)
    .send({ isRead: true })
    .expect(200);

  assert.equal(response.body.lead.isRead, true);
  assert.equal(response.body.message, 'Lead read state updated');
});
