const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const LegalDocument = require('../src/models/LegalDocument');
const { loginAsAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testType = `privacy-policy-${Date.now()}`;
let token = '';

// The model intentionally allows only the four production types; use privacy-policy
// for persistence tests and remove it after the suite.
test.before(async () => {
  await mongoose.connect(MONGO_URI);
  const login = await loginAsAdmin(app, request);
  token = login.token;
});

test.after(async () => {
  await LegalDocument.deleteOne({ type: 'privacy-policy' });
  await mongoose.disconnect();
});

test('unpublished legal documents are hidden from public reads', async () => {
  await LegalDocument.findOneAndUpdate(
    { type: 'privacy-policy' },
    {
      type: 'privacy-policy',
      title: 'Privacy Policy',
      content: 'Approved privacy content for testing.',
      version: '1.0',
      isPublished: false,
    },
    { upsert: true, new: true, runValidators: true }
  );

  await request(app).get('/api/legal/privacy-policy').expect(404);
});

test('admins can create and publish approved legal content', async () => {
  const response = await request(app)
    .put('/api/legal/privacy-policy')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Privacy Policy',
      content: 'Approved privacy policy content supplied by the business.',
      version: '1.0',
      effectiveDate: '2026-08-21',
      isPublished: true,
    })
    .expect(200);

  assert.equal(response.body.document.type, 'privacy-policy');
  assert.equal(response.body.document.isPublished, true);
  assert.equal(response.body.document.version, '1.0');

  const publicResponse = await request(app).get('/api/legal/privacy-policy').expect(200);
  assert.equal(publicResponse.body.content, 'Approved privacy policy content supplied by the business.');
  assert.equal(publicResponse.body.updatedBy, undefined);
});

test('admins can list and update legal documents', async () => {
  const listResponse = await request(app)
    .get('/api/legal/admin/list?isPublished=true&q=Privacy')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(listResponse.body.data.some((document) => document.type === 'privacy-policy'));
  assert.ok(listResponse.body.pagination);

  const updateResponse = await request(app)
    .put('/api/legal/privacy-policy')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Privacy Policy Updated',
      content: 'Updated approved privacy policy content.',
      version: '1.1',
      isPublished: false,
    })
    .expect(200);

  assert.equal(updateResponse.body.document.version, '1.1');
  await request(app).get('/api/legal/privacy-policy').expect(404);
});

test('legal writes validate type, content, and authentication', async () => {
  await request(app)
    .put('/api/legal/unknown-policy')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Unknown', content: 'Content', version: '1.0' })
    .expect(400);

  await request(app)
    .put('/api/legal/terms')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Terms', version: '1.0' })
    .expect(400);

  await request(app)
    .put('/api/legal/privacy-policy')
    .send({ title: 'Privacy Policy', content: 'Content', version: '1.0' })
    .expect(401);
});
