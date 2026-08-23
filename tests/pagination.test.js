const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Service = require('../src/models/Service');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  await Service.deleteMany({});
});

test.after(async () => {
  await Service.deleteMany({});
  await mongoose.disconnect();
});

test('GET /api/services supports pagination with default page and limit', async () => {
  // Create 15 test services
  const services = [];
  for (let i = 1; i <= 15; i++) {
    services.push({
      title: `Service ${i}`,
      slug: `service-${i}`,
      summary: `Summary for service ${i}`,
      description: `Description for service ${i}`,
      isPublished: true,
    });
  }
  await Service.insertMany(services);

  const response = await request(app)
    .get('/api/services')
    .expect(200);

  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.page, 1);
  assert.equal(response.body.pagination.limit, 10);
  assert.equal(response.body.pagination.total, 15);
  assert.equal(response.body.pagination.totalPages, 2);
  assert.equal(response.body.pagination.hasNextPage, true);
  assert.equal(response.body.pagination.hasPrevPage, false);
  assert.equal(response.body.data.length, 10);
});

test('GET /api/services respects custom page and limit parameters', async () => {
  const response = await request(app)
    .get('/api/services?page=2&limit=5')
    .expect(200);

  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.page, 2);
  assert.equal(response.body.pagination.limit, 5);
  assert.equal(response.body.data.length, 5);
  assert.equal(response.body.pagination.hasPrevPage, true);
  assert.equal(response.body.pagination.hasNextPage, true);
});

test('GET /api/services respects sort parameter', async () => {
  const response = await request(app)
    .get('/api/services?sort=title')
    .expect(200);

  assert.ok(response.body.data);
  assert.equal(response.body.data.length, 10);
  // First item should be Service 1 when sorted by title ascending
  assert.equal(response.body.data[0].title, 'Service 1');
});

test('GET /api/blogs supports pagination', async () => {
  const Blog = require('../src/models/Blog');
  await Blog.deleteMany({});

  const blogs = [];
  for (let i = 1; i <= 12; i++) {
    blogs.push({
      title: `Blog ${i}`,
      slug: `blog-${i}`,
      excerpt: `Excerpt ${i}`,
      content: `Content for blog ${i}`,
      isPublished: true,
    });
  }
  await Blog.insertMany(blogs);

  const response = await request(app)
    .get('/api/blogs?limit=5')
    .expect(200);

  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.total, 12);
  assert.equal(response.body.data.length, 5);
  assert.equal(response.body.pagination.totalPages, 3);

  await Blog.deleteMany({});
});

test('GET /api/case-studies supports pagination', async () => {
  const CaseStudy = require('../src/models/CaseStudy');
  await CaseStudy.deleteMany({});

  const caseStudies = [];
  for (let i = 1; i <= 8; i++) {
    caseStudies.push({
      title: `Case Study ${i}`,
      slug: `case-study-${i}`,
      clientName: `Client ${i}`,
      industry: `Industry ${i}`,
      service: `Service ${i}`,
      challenge: `Challenge ${i}`,
      solution: `Solution ${i}`,
      isPublished: true,
    });
  }
  await CaseStudy.insertMany(caseStudies);

  const response = await request(app)
    .get('/api/case-studies?limit=3')
    .expect(200);

  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.total, 8);
  assert.equal(response.body.data.length, 3);
  assert.equal(response.body.pagination.totalPages, 3);

  await CaseStudy.deleteMany({});
});

test('GET /api/testimonials supports pagination', async () => {
  const Testimonial = require('../src/models/Testimonial');
  await Testimonial.deleteMany({});

  const testimonials = [];
  for (let i = 1; i <= 6; i++) {
    testimonials.push({
      name: `Client ${i}`,
      role: `CEO`,
      quote: `Great service ${i}`,
      rating: 5,
      isPublished: true,
      isDraft: false,
      isApproved: true,
      permissionGranted: true,
    });
  }
  await Testimonial.insertMany(testimonials);

  const response = await request(app)
    .get('/api/testimonials?limit=2&page=2')
    .expect(200);

  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.total, 6);
  assert.equal(response.body.pagination.page, 2);
  assert.equal(response.body.data.length, 2);

  await Testimonial.deleteMany({});
});

test('Pagination respects unpublished items exclusion', async () => {
  const Service = require('../src/models/Service');
  await Service.deleteMany({});

  // Create 10 published and 5 unpublished
  const published = [];
  for (let i = 1; i <= 10; i++) {
    published.push({
      title: `Published ${i}`,
      slug: `published-${i}`,
      summary: `Summary`,
      description: `Description`,
      isPublished: true,
    });
  }

  const unpublished = [];
  for (let i = 1; i <= 5; i++) {
    unpublished.push({
      title: `Unpublished ${i}`,
      slug: `unpublished-${i}`,
      summary: `Summary`,
      description: `Description`,
      isPublished: false,
    });
  }

  await Service.insertMany([...published, ...unpublished]);

  const response = await request(app)
    .get('/api/services')
    .expect(200);

  // Only 10 published should be returned
  assert.equal(response.body.pagination.total, 10);
  assert.equal(response.body.data.length, 10);
  const allPublished = response.body.data.every((s) => s.isPublished === true);
  assert.ok(allPublished);

  await Service.deleteMany({});
});
