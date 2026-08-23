const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Admin = require('../src/models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testEmail = `password-reset-${Date.now()}@example.com`;
let admin;

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  admin = await Admin.create({ name: 'Password Reset Test Admin', email: testEmail, password: 'oldpassword' });
});

test.after(async () => {
  await Admin.deleteOne({ _id: admin._id });
  await mongoose.disconnect();
});

test('forgot-password returns a generic response and stores only a hashed token', async () => {
  const response = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: testEmail })
    .expect(200);

  assert.match(response.body.message, /If an account exists/i);
  const updatedAdmin = await Admin.findById(admin._id);
  assert.ok(updatedAdmin.resetPasswordToken);
  assert.notEqual(updatedAdmin.resetPasswordToken, response.body.resetToken);
  assert.ok(updatedAdmin.resetPasswordExpires > new Date());
  assert.equal(response.body.resetToken, undefined);
});

test('forgot-password does not reveal whether an email exists', async () => {
  const response = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'missing-admin@example.com' })
    .expect(200);

  assert.match(response.body.message, /If an account exists/i);
});

test('forgot-password validates email input', async () => {
  await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'invalid-email' })
    .expect(400);
});

test('reset-password consumes a valid token once and changes the password', async () => {
  const rawToken = 'known-reset-token-for-test';
  admin.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  admin.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await admin.save();

  await request(app)
    .post('/api/auth/reset-password')
    .send({ token: rawToken, password: 'newpassword' })
    .expect(200);

  const updatedAdmin = await Admin.findById(admin._id);
  assert.equal(updatedAdmin.resetPasswordToken, undefined);
  assert.equal(updatedAdmin.resetPasswordExpires, undefined);
  assert.equal(await updatedAdmin.matchPassword('newpassword'), true);

  await request(app)
    .post('/api/auth/reset-password')
    .send({ token: rawToken, password: 'anotherpassword' })
    .expect(400);
});

test('reset-password rejects invalid, expired, and weak reset requests', async () => {
  await request(app)
    .post('/api/auth/reset-password')
    .send({ token: 'missing-token', password: 'newpassword' })
    .expect(400);

  await request(app)
    .post('/api/auth/reset-password')
    .send({ token: 'some-token', password: 'short' })
    .expect(400);

  const expiredToken = 'expired-reset-token';
  admin.resetPasswordToken = crypto.createHash('sha256').update(expiredToken).digest('hex');
  admin.resetPasswordExpires = new Date(Date.now() - 1000);
  await admin.save();

  await request(app)
    .post('/api/auth/reset-password')
    .send({ token: expiredToken, password: 'newpassword' })
    .expect(400);
});
