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

  const login = await request(app)
    .post('/api/auth/login')
    .send(adminCredentials)
    .expect(200);

  token = login.body.token;
});

test.after(async () => {
  await mongoose.disconnect();
});

test('GET /api/contact-messages returns lead-based contact messages with subject and leadScore metadata', async () => {
  const created = await request(app)
    .post('/api/leads')
    .send({
      name: 'Contact Message User',
      email: 'contact.message@example.com',
      phone: '+923001234567',
      company: 'Boost Vertex Client',
      serviceInterest: 'SEO',
      monthlyBudget: 'PKR 100,000–250,000',
      subject: 'SEO growth strategy',
      message: 'We need a full SEO growth plan for our website and content.',
      source: 'website',
      status: 'new',
      isRead: false,
    })
    .expect(201);

  const response = await request(app)
    .get('/api/contact-messages?serviceInterest=SEO&isRead=false&q=contact.message@example.com')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data));
  const match = response.body.data.find((item) => item._id === created.body.lead._id);
  assert.ok(match);
  assert.equal(match.subject, 'SEO growth strategy');
  assert.ok(typeof match.leadScore === 'number');
  assert.equal(match.isRead, false);
});

test('GET /api/industries/admin/list supports search, total metadata and pagination', async () => {
  const response = await request(app)
    .get('/api/industries/admin/list?page=1&limit=2&q=marketing')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.pagination);
  assert.ok(Number.isInteger(response.body.pagination.total));
  assert.ok(response.body.pagination.total >= 0);
});

test('GET and PUT /api/auth/profile and /api/auth/change-password work for admin settings', async () => {
  const beforeGet = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(beforeGet.body.name);
  assert.ok(beforeGet.body.email);

  const profileUpdate = await request(app)
    .put('/api/auth/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Boost Vertex Admin',
      jobTitle: 'Lead Generation Manager',
      department: 'Operations',
      bio: 'Manages marketing and lead operations.',
      language: 'en',
      timezone: 'Asia/Karachi',
    })
    .expect(200);

  assert.equal(profileUpdate.body.success, true);
  assert.equal(profileUpdate.body.data.jobTitle, 'Lead Generation Manager');
  assert.equal(profileUpdate.body.data.timezone, 'Asia/Karachi');

  const notificationSettings = await request(app)
    .get('/api/admin/notification-settings')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(notificationSettings.body.success, true);
  assert.ok(notificationSettings.body.data.notificationPrefs);

  const updateNotifications = await request(app)
    .put('/api/admin/notification-settings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      notificationEmail: 'notifications@boostvertex.com',
      notificationPrefs: {
        newContactMessage: false,
        newLead: true,
        leadUpdated: true,
        leadDeleted: true,
        serviceUpdated: true,
      },
    })
    .expect(200);

  assert.equal(updateNotifications.body.data.notificationEmail, 'notifications@boostvertex.com');
  assert.equal(updateNotifications.body.data.notificationPrefs.newContactMessage, false);

  const changePassword = await request(app)
    .put('/api/auth/change-password')
    .set('Authorization', `Bearer ${token}`)
    .send({
      currentPassword: adminCredentials.password,
      newPassword: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
    })
    .expect(200);

  assert.equal(changePassword.body.success, true);

  const relogin = await request(app)
    .post('/api/auth/login')
    .send({
      email: adminCredentials.email,
      password: 'StrongPass123!',
    })
    .expect(200);

  assert.ok(relogin.body.token);
  token = relogin.body.token;
});
