const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';

let token = '';

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@boostvertex.com',
      password: 'admin123',
    });

  token = loginResponse.body.token;
});

test.after(async () => {
  await mongoose.disconnect();
});

test('POST /api/services rejects missing required fields', async () => {
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      summary: 'This is a short summary',
      description: 'This is the full description',
    });

  assert.equal(response.status, 400);
  assert.match(response.body.message, /title|slug|required/i);
});
