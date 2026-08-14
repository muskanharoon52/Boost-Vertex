const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Service = require('../src/models/Service');
const Blog = require('../src/models/Blog');
const CaseStudy = require('../src/models/CaseStudy');
const Testimonial = require('../src/models/Testimonial');
const Lead = require('../src/models/Lead');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';

let token = '';

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  // Clean up collections
  await Service.deleteMany({});
  await Blog.deleteMany({});
  await CaseStudy.deleteMany({});
  await Testimonial.deleteMany({});
  await Lead.deleteMany({});

  // Get admin token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@boostvertex.com',
      password: 'admin123',
    });

  token = loginResponse.body.token;

  // Create test data for admin list endpoints
  // Services with mixed published status
  await Service.create([
    {
      title: 'Published Service 1',
      slug: 'published-service-1',
      summary: 'Published summary',
      description: 'Published description',
      isPublished: true,
    },
    {
      title: 'Draft Service',
      slug: 'draft-service',
      summary: 'Draft summary',
      description: 'Draft description',
      isPublished: false,
    },
    {
      title: 'Published Service 2',
      slug: 'published-service-2',
      summary: 'Another published service',
      description: 'Another description',
      isPublished: true,
    },
  ]);

  // Blogs with mixed published status and categories
  await Blog.create([
    {
      title: 'Marketing Blog',
      slug: 'marketing-blog',
      excerpt: 'Marketing excerpt',
      content: 'Marketing content',
      category: 'Marketing',
      isPublished: true,
    },
    {
      title: 'Draft SEO Blog',
      slug: 'draft-seo-blog',
      excerpt: 'Draft SEO',
      content: 'Draft SEO content',
      category: 'SEO',
      isPublished: false,
    },
  ]);

  // Case studies
  await CaseStudy.create([
    {
      title: 'Tech Industry Case Study',
      slug: 'tech-industry-case',
      clientName: 'Tech Corp',
      industry: 'Technology',
      service: 'Digital Marketing',
      challenge: 'Low visibility',
      solution: 'SEO campaign',
      isPublished: true,
    },
    {
      title: 'Retail Case Study',
      slug: 'retail-case-study',
      clientName: 'Retail Inc',
      industry: 'Retail',
      service: 'Content Marketing',
      challenge: 'No online presence',
      solution: 'Content strategy',
      isPublished: false,
    },
  ]);

  // Testimonials with different ratings
  await Testimonial.create([
    {
      name: '5-Star Reviewer',
      role: 'CEO',
      quote: 'Excellent service!',
      rating: 5,
      isPublished: true,
    },
    {
      name: '3-Star Reviewer',
      role: 'Manager',
      quote: 'Good but needs improvement',
      rating: 3,
      isPublished: false,
    },
  ]);

  // Leads with different statuses
  await Lead.create([
    {
      name: 'New Lead',
      email: 'new@example.com',
      status: 'new',
      isRead: false,
      source: 'website',
    },
    {
      name: 'Qualified Lead',
      email: 'qualified@example.com',
      status: 'qualified',
      isRead: true,
      source: 'referral',
    },
  ]);
});

test.after(async () => {
  await Service.deleteMany({});
  await Blog.deleteMany({});
  await CaseStudy.deleteMany({});
  await Testimonial.deleteMany({});
  await Lead.deleteMany({});
  await mongoose.disconnect();
});

// Admin list endpoints tests
test('Admin can list all services including unpublished', async () => {
  const response = await request(app)
    .get('/api/services/admin/list')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.length >= 3); // At least 3 services we created
  assert.ok(response.body.pagination);

  // Verify we have both published and unpublished items
  const hasPublished = response.body.data.some((s) => s.isPublished === true);
  const hasUnpublished = response.body.data.some((s) => s.isPublished === false);
  assert.ok(hasPublished);
  assert.ok(hasUnpublished);
});

test('Admin can filter services by published status', async () => {
  const draftResponse = await request(app)
    .get('/api/services/admin/list?isPublished=false')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(draftResponse.body.data.length, 1);
  assert.equal(draftResponse.body.data[0].title, 'Draft Service');
});

test('Admin can search services by title', async () => {
  const response = await request(app)
    .get('/api/services/admin/list?q=Draft')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].slug, 'draft-service');
});

test('Admin can list all blogs with category filter', async () => {
  const response = await request(app)
    .get('/api/blogs/admin/list?category=Marketing')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.data.length >= 1);
  // Verify all results have the Marketing category
  const allMarketing = response.body.data.every((b) => b.category === 'Marketing');
  assert.ok(allMarketing);
});

test('Admin can list case studies with industry filter', async () => {
  const response = await request(app)
    .get('/api/case-studies/admin/list?industry=Technology')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.data.length >= 1);
  assert.ok(response.body.data.some((cs) => cs.industry === 'Technology'));
});

test('Admin can list testimonials with rating filter', async () => {
  const response = await request(app)
    .get('/api/testimonials/admin/list?rating=5')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.data.length >= 1);
  assert.equal(response.body.data[0].rating, 5);
});

test('Admin list endpoints require JWT token', async () => {
  const response = await request(app)
    .get('/api/services/admin/list')
    .expect(401);

  assert.match(response.body.message, /not authorized|token/i);
});

test('Admin can list leads with advanced filtering', async () => {
  const response = await request(app)
    .get('/api/leads?status=qualified&isRead=true')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.pagination);
});

test('Admin can filter leads by date range', async () => {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();

  const response = await request(app)
    .get(`/api/leads?dateFrom=${yesterday}&dateTo=${tomorrow}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.length >= 1);
});

test('Admin list endpoints support pagination', async () => {
  const response = await request(app)
    .get('/api/services/admin/list?page=1&limit=2')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.pagination.limit, 2);
  assert.equal(response.body.pagination.page, 1);
  assert.ok(typeof response.body.pagination.total === 'number');
});

test('Admin list endpoints support sorting', async () => {
  const response = await request(app)
    .get('/api/services/admin/list?sort=title')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.length > 0);
});

test('Public services endpoint still excludes unpublished', async () => {
  const response = await request(app)
    .get('/api/services')
    .expect(200);

  // Should only have published services
  assert.ok(response.body.data.length >= 2); // At least 2 published services we created
  const allPublished = response.body.data.every((s) => s.isPublished === true);
  assert.ok(allPublished);

  // Verify draft service is not included
  const hasDraft = response.body.data.some((s) => s.slug === 'draft-service');
  assert.equal(hasDraft, false);
});

test('Public blogs endpoint still excludes unpublished', async () => {
  const response = await request(app)
    .get('/api/blogs')
    .expect(200);

  // Should only have published blogs
  assert.ok(response.body.data.length >= 1); // At least 1 published blog we created
  const allPublished = response.body.data.every((b) => b.isPublished === true);
  assert.ok(allPublished);

  // Verify draft blog is not included
  const hasDraft = response.body.data.some((b) => b.slug === 'draft-seo-blog');
  assert.equal(hasDraft, false);
});

test('Lead response format consistency for list endpoints', async () => {
  const response = await request(app)
    .get('/api/leads?page=1&limit=10')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(response.body.data);
  assert.ok(response.body.pagination);
  assert.ok(typeof response.body.pagination.page === 'number');
  assert.ok(typeof response.body.pagination.total === 'number');
});
