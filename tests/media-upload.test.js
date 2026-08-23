const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Media = require('../src/models/Media');
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

test('media listing and upload require admin authentication', async () => {
  await request(app).get('/api/media/admin/list').expect(401);
  await request(app).post('/api/media').attach('file', Buffer.from('file'), 'file.txt').expect(401);
});

test('authenticated media upload validates required file and type', async () => {
  await request(app)
    .post('/api/media')
    .set('Authorization', `Bearer ${token}`)
    .expect(400);

  const invalidType = await request(app)
    .post('/api/media')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from('not an image'), 'payload.txt')
    .expect(400);

  assert.match(invalidType.body.message, /only.*allowed/i);
});

test('authenticated upload reports missing Cloudinary configuration clearly', async () => {
  const originalCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const originalApiKey = process.env.CLOUDINARY_API_KEY;
  const originalApiSecret = process.env.CLOUDINARY_API_SECRET;
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  try {
    const response = await request(app)
      .post('/api/media')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('small image placeholder'), 'placeholder.png')
      .expect(503);

    assert.match(response.body.message, /Cloudinary is not configured/i);
    assert.equal(await Media.countDocuments({ originalName: 'placeholder.png' }), 0);
  } finally {
    if (originalCloudName) process.env.CLOUDINARY_CLOUD_NAME = originalCloudName;
    if (originalApiKey) process.env.CLOUDINARY_API_KEY = originalApiKey;
    if (originalApiSecret) process.env.CLOUDINARY_API_SECRET = originalApiSecret;
  }
});
