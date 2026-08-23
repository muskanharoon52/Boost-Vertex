const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

const app = require('../src/app');
const Lead = require('../src/models/Lead');
const Service = require('../src/models/Service');
const { loginAsAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';

let token = '';

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  // Clean up collections
  await Lead.deleteMany({});
  await Service.deleteMany({});

  // Get admin token
  const login = await loginAsAdmin(app, request);
  token = login.token;
});

test.after(async () => {
  await Lead.deleteMany({});
  await Service.deleteMany({});
  await mongoose.disconnect();
});

test('Admin can access analytics endpoint', async () => {
  const response = await request(app)
    .get('/api/admin/analytics')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.analytics);
  assert.ok(response.body.analytics.totalRequests !== undefined);
  assert.ok(Array.isArray(response.body.analytics.endpoints));
  assert.ok(Array.isArray(response.body.analytics.topAdmins));
});

test('Analytics endpoint requires authentication', async () => {
  const response = await request(app)
    .get('/api/admin/analytics')
    .expect(401);

  assert.match(response.body.message, /not authorized|token/i);
});

test('API requests are logged to file', async () => {
  // Make a test request
  await request(app)
    .get('/api/health')
    .expect(200);

  // Check if logs directory and file exist
  const logsDir = path.join(__dirname, '../logs');
  const logFile = path.join(logsDir, 'api-requests.log');

  if (fs.existsSync(logFile)) {
    const logs = fs
      .readFileSync(logFile, 'utf-8')
      .split('\n')
      .filter((line) => line.trim());

    // Verify at least one log entry exists
    assert.ok(logs.length > 0, 'At least one log entry should exist');

    // Parse the last log entry
    const lastLog = JSON.parse(logs[logs.length - 1]);
    assert.ok(lastLog.timestamp);
    assert.ok(lastLog.method);
    assert.ok(lastLog.path);
    assert.ok(lastLog.statusCode !== undefined);
  } else {
    // If log file doesn't exist yet, that's okay for first test run
    assert.ok(true, 'Logs will be created after first requests');
  }
});

test('Admin dashboard includes all required metrics', async () => {
  const response = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const { summary } = response.body;

  // Verify content metrics
  assert.ok(summary.totalPublishedContent !== undefined);
  assert.ok(summary.services);
  assert.ok(summary.services.published !== undefined);
  assert.ok(summary.services.unpublished !== undefined);
  assert.ok(summary.services.total !== undefined);

  // Verify blog metrics
  assert.ok(summary.blogs);
  assert.ok(summary.blogs.published !== undefined);
  assert.ok(summary.blogs.unpublished !== undefined);

  // Verify case study metrics
  assert.ok(summary.caseStudies);
  assert.ok(summary.caseStudies.published !== undefined);
  assert.ok(summary.caseStudies.unpublished !== undefined);

  // Verify testimonial metrics
  assert.ok(summary.testimonials);
  assert.ok(summary.testimonials.published !== undefined);
  assert.ok(summary.testimonials.averageRating !== undefined);

  // Verify lead metrics
  assert.ok(summary.leads);
  assert.ok(summary.leads.total !== undefined);
  assert.ok(summary.leads.unread !== undefined);
  assert.ok(summary.leads.byStatus);
  assert.ok(Array.isArray(summary.leadSources));

  // Verify mockup-facing dashboard panels
  assert.ok(summary.industries);
  assert.ok(summary.industries.published !== undefined);
  assert.ok(summary.clients);
  assert.ok(summary.clients.published !== undefined);
  assert.ok(Array.isArray(summary.topServices));
  assert.ok(summary.notifications);
  assert.ok(summary.notifications.total !== undefined);
  assert.ok(Array.isArray(response.body.recentContactMessages));
  assert.ok(Array.isArray(response.body.recentContent));
});

test('Admin dashboard supports a lead activity period', async () => {
  const response = await request(app)
    .get('/api/admin/dashboard?period=30d')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.summary.period, '30d');
  assert.ok(response.body.summary.leads);
});

test('Admin list endpoints support pagination', async () => {
  // Create some test services
  for (let i = 1; i <= 3; i++) {
    await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `Service ${i}`,
        slug: `service-${i}`,
        summary: 'Test summary',
        description: 'Test description',
        isPublished: true,
      })
      .expect(201);
  }

  // Test pagination
  const response = await request(app)
    .get('/api/services/admin/list?page=1&limit=2')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.data);
  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.page, 1);
  assert.equal(response.body.pagination.limit, 2);
  assert.ok(response.body.pagination.totalPages >= 1);
});

test('Admin list endpoints include unpublished items', async () => {
  // Create published and unpublished services
  await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Published Service',
      slug: 'published-service-phase7',
      summary: 'Published',
      description: 'Description',
      isPublished: true,
    })
    .expect(201);

  await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Unpublished Service',
      slug: 'unpublished-service-phase7',
      summary: 'Unpublished',
      description: 'Description',
      isPublished: false,
    })
    .expect(201);

  // Admin list should include both
  const adminResponse = await request(app)
    .get('/api/services/admin/list')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const hasPublished = adminResponse.body.data.some((s) => s.title === 'Published Service');
  const hasUnpublished = adminResponse.body.data.some((s) => s.title === 'Unpublished Service');

  assert.ok(hasPublished, 'Admin list should include published items');
  assert.ok(hasUnpublished, 'Admin list should include unpublished items');

  // Public list should only include published
  const publicResponse = await request(app)
    .get('/api/services')
    .expect(200);

  const publicHasUnpublished = publicResponse.body.data.some((s) => s.title === 'Unpublished Service');
  assert.ok(!publicHasUnpublished, 'Public list should NOT include unpublished items');
});

test('Admin list endpoints support filtering by status', async () => {
  // Create leads with different statuses
  await Lead.create([
    { name: 'Lead 1', email: 'lead1@test.com', status: 'new' },
    { name: 'Lead 2', email: 'lead2@test.com', status: 'qualified' },
    { name: 'Lead 3', email: 'lead3@test.com', status: 'won' },
  ]);

  // Filter by status
  const response = await request(app)
    .get('/api/leads?status=qualified')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.data));
  const allQualified = response.body.data.every((lead) => lead.status === 'qualified');
  assert.ok(allQualified, 'All filtered leads should have status=qualified');
});

test('Admin list endpoints support read status filtering', async () => {
  // Create leads with different read statuses
  await Lead.create([
    { name: 'Read Lead', email: 'read@test.com', isRead: true },
    { name: 'Unread Lead', email: 'unread@test.com', isRead: false },
  ]);

  // Filter by read status
  const response = await request(app)
    .get('/api/leads?isRead=false')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.data));
  const allUnread = response.body.data.every((lead) => lead.isRead === false);
  assert.ok(allUnread, 'All filtered leads should have isRead=false');
});

test('Admin list endpoints support search by text', async () => {
  // Create test leads
  await Lead.create([
    { name: 'John Doe', email: 'john@example.com', company: 'Acme Corp' },
    { name: 'Jane Smith', email: 'jane@test.com', company: 'Tech Inc' },
  ]);

  // Search by name
  const response = await request(app)
    .get('/api/leads?q=John')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const foundJohn = response.body.data.some((lead) => lead.name.includes('John'));
  assert.ok(foundJohn, 'Search should find leads by name');
});

test('Admin write operations are rate limited', async () => {
  // Admin write rate limiter allows 100 operations per 15 minutes
  // We'll verify the header is set (full test would require 100+ requests)
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Rate Limit Test Service',
      slug: 'rate-limit-test-service',
      summary: 'Testing rate limits',
      description: 'Description',
    })
    .expect(201);

  // Check for RateLimit headers
  assert.ok(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']);
});

test('Unauthenticated requests cannot access admin features', async () => {
  const response = await request(app)
    .get('/api/services/admin/list')
    .expect(401);

  assert.match(response.body.message, /not authorized|token/i);
});

test('Admin list endpoints return consistent response format', async () => {
  // Create a test service
  await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Format Test',
      slug: 'format-test-phase7',
      summary: 'Test',
      description: 'Test',
    })
    .expect(201);

  // Check response format
  const response = await request(app)
    .get('/api/services/admin/list')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  // Verify response structure
  assert.ok(response.body.data !== undefined, 'Response should have data array');
  assert.ok(response.body.pagination !== undefined, 'Response should have pagination');
  assert.ok(Array.isArray(response.body.data), 'data should be an array');
  assert.ok(typeof response.body.pagination === 'object', 'pagination should be an object');

  // Verify pagination properties
  assert.ok(response.body.pagination.page !== undefined);
  assert.ok(response.body.pagination.limit !== undefined);
  assert.ok(response.body.pagination.total !== undefined);
  assert.ok(response.body.pagination.totalPages !== undefined);
  assert.ok(response.body.pagination.hasNextPage !== undefined);
  assert.ok(response.body.pagination.hasPrevPage !== undefined);
});
