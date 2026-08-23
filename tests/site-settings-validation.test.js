const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const SiteSettings = require('../src/models/SiteSettings');
const { loginAsAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
let token = '';

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  const login = await loginAsAdmin(app, request);
  token = login.token;
});

test.after(async () => {
  await mongoose.disconnect();
});

test('site settings reject invalid email, phone, URL, and nested values', async () => {
  const invalidPayloads = [
    { email: 'not-an-email' },
    { phone: 'abc' },
    { websiteUrl: 'javascript:alert(1)' },
    { socialLinks: { facebook: 'not-a-url' } },
    { seoDefaults: 'invalid' },
  ];

  for (const payload of invalidPayloads) {
    const response = await request(app)
      .put('/api/site-settings')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(400);

    assert.match(response.body.message, /valid|object|non-empty/i);
  }
});

test('site settings accept approved contact data and nullable booking URL', async () => {
  const response = await request(app)
    .put('/api/site-settings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      companyName: ' Boost Vertex ',
      email: 'BOOSTVERTEX@GMAIL.COM',
      salesEmail: 'boostvertex@gmail.com',
      phone: '03032799987',
      whatsapp: '03032799987',
      address: 'Blue Area, Islamabad, Pakistan',
      workingHours: 'Monday-Saturday, 10:00 AM-7:00 PM',
      bookingUrl: null,
      socialLinks: {
        facebook: 'https://www.facebook.com/adswithboostvertex',
        instagram: 'https://www.instagram.com/boostvertex',
        linkedin: 'https://www.linkedin.com/company/boost-vertex-pk/',
      },
      seoDefaults: {
        siteTitle: 'Boost Vertex',
        metaDescription: 'Performance marketing for qualified leads.',
        canonicalUrl: 'https://boostvertex.com',
      },
    })
    .expect(200);

  assert.equal(response.body.settings.companyName, 'Boost Vertex');
  assert.equal(response.body.settings.email, 'boostvertex@gmail.com');
  assert.equal(response.body.settings.bookingUrl, null);
  assert.equal(response.body.settings.socialLinks.linkedin, 'https://www.linkedin.com/company/boost-vertex-pk/');
});

test('site settings update requires admin authentication', async () => {
  await request(app)
    .put('/api/site-settings')
    .send({ companyName: 'Unauthorized Update' })
    .expect(401);

  const settings = await SiteSettings.findOne();
  assert.ok(settings);
});
