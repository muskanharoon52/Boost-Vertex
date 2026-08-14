const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Service = require('../src/models/Service');
const Blog = require('../src/models/Blog');
const CaseStudy = require('../src/models/CaseStudy');
const Testimonial = require('../src/models/Testimonial');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';

let token = '';

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  // Clean up collections
  await Service.deleteMany({});
  await Blog.deleteMany({});
  await CaseStudy.deleteMany({});
  await Testimonial.deleteMany({});

  // Get admin token
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@boostvertex.com',
      password: 'admin123',
    });

  token = loginResponse.body.token;
});

test.after(async () => {
  await Service.deleteMany({});
  await Blog.deleteMany({});
  await CaseStudy.deleteMany({});
  await Testimonial.deleteMany({});
  await mongoose.disconnect();
});

test('Admin can create a service', async () => {
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'SEO Growth Strategy',
      slug: 'seo-growth-strategy',
      summary: 'Boost your search visibility.',
      description: 'Comprehensive SEO strategy for long-term growth.',
      features: ['Keyword research', 'Technical SEO', 'Content optimization'],
      seoTitle: 'SEO Growth Services',
      seoDescription: 'Professional SEO services for your business.',
      isPublished: true,
    })
    .expect(201);

  assert.equal(response.body.message, 'Service created successfully');
  assert.ok(response.body.service._id);
  assert.equal(response.body.service.title, 'SEO Growth Strategy');
  assert.equal(response.body.service.isPublished, true);
});

test('Admin cannot create service without title', async () => {
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      slug: 'no-title-service',
      summary: 'Summary without title.',
      description: 'Description without title.',
    })
    .expect(400);

  assert.match(response.body.message, /title|required/i);
});

test('Admin cannot create service with duplicate slug', async () => {
  // Create first service
  await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'First Service',
      slug: 'duplicate-test',
      summary: 'First service summary.',
      description: 'First service description.',
    })
    .expect(201);

  // Try to create second service with same slug
  const response = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Second Service',
      slug: 'duplicate-test',
      summary: 'Second service summary.',
      description: 'Second service description.',
    })
    .expect(409);

  assert.match(response.body.message, /slug|already exists/i);
});

test('Admin can update a service', async () => {
  // Create a service first
  const created = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Original Service',
      slug: 'original-service',
      summary: 'Original summary.',
      description: 'Original description.',
    })
    .expect(201);

  const serviceId = created.body.service._id;

  // Update the service
  const response = await request(app)
    .put(`/api/services/${serviceId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Updated Service',
      slug: 'updated-service',
      summary: 'Updated summary.',
      description: 'Updated description.',
      isPublished: true,
    })
    .expect(200);

  assert.equal(response.body.message, 'Service updated successfully');
  assert.equal(response.body.service.title, 'Updated Service');
  assert.equal(response.body.service.slug, 'updated-service');
});

test('Admin can delete a service', async () => {
  // Create a service first
  const created = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Delete Me',
      slug: 'delete-me-service',
      summary: 'To be deleted.',
      description: 'This will be deleted.',
    })
    .expect(201);

  const serviceId = created.body.service._id;

  // Delete the service
  const response = await request(app)
    .delete(`/api/services/${serviceId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.message, 'Service deleted successfully');

  // Verify it's deleted
  const checkResponse = await request(app)
    .get(`/api/services/delete-me-service`)
    .expect(404);

  assert.equal(checkResponse.body.message, 'Service not found');
});

test('Admin can create a blog post', async () => {
  const response = await request(app)
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Digital Marketing Trends 2026',
      slug: 'digital-marketing-trends-2026',
      excerpt: 'Discover the latest digital marketing trends.',
      content: 'Comprehensive content about digital marketing trends.',
      category: 'Marketing',
      tags: ['digital', 'marketing', 'trends'],
      author: 'Boost Vertex',
      seoTitle: 'Digital Marketing Trends 2026',
      seoDescription: 'Learn about the top digital marketing trends for 2026.',
      isPublished: true,
    })
    .expect(201);

  assert.equal(response.body.message, 'Blog created successfully');
  assert.ok(response.body.blog._id);
  assert.equal(response.body.blog.category, 'Marketing');
});

test('Admin can update a blog post', async () => {
  // Create a blog first
  const created = await request(app)
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Original Blog',
      slug: 'original-blog',
      excerpt: 'Original excerpt.',
      content: 'Original content.',
    })
    .expect(201);

  const blogId = created.body.blog._id;

  // Update the blog
  const response = await request(app)
    .put(`/api/blogs/${blogId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Updated Blog',
      slug: 'updated-blog',
      excerpt: 'Updated excerpt.',
      content: 'Updated content.',
      category: 'Strategy',
      isPublished: true,
    })
    .expect(200);

  assert.equal(response.body.message, 'Blog updated successfully');
  assert.equal(response.body.blog.title, 'Updated Blog');
});

test('Admin can delete a blog post', async () => {
  // Create a blog first
  const created = await request(app)
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Delete Blog',
      slug: 'delete-blog',
      excerpt: 'To be deleted.',
      content: 'This blog will be deleted.',
    })
    .expect(201);

  const blogId = created.body.blog._id;

  // Delete the blog
  const response = await request(app)
    .delete(`/api/blogs/${blogId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.message, 'Blog deleted successfully');
});

test('Admin can create a case study', async () => {
  const response = await request(app)
    .post('/api/case-studies')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'E-commerce Growth Success',
      slug: 'ecommerce-growth-success',
      clientName: 'ABC E-commerce',
      industry: 'E-commerce',
      service: 'Digital Marketing',
      challenge: 'Low online sales conversion.',
      solution: 'Implemented targeted PPC campaigns and optimized product pages.',
      results: [
        { metric: 'Sales Growth', description: '250% increase in 6 months' },
        { metric: 'ROI', description: '5:1 return on ad spend' },
      ],
      testimonial: 'Boost Vertex transformed our online business.',
      isPublished: true,
    })
    .expect(201);

  assert.equal(response.body.message, 'Case study created successfully');
  assert.ok(response.body.caseStudy._id);
  assert.equal(response.body.caseStudy.clientName, 'ABC E-commerce');
  assert.equal(response.body.caseStudy.results.length, 2);
});

test('Admin can update a case study', async () => {
  // Create a case study first
  const created = await request(app)
    .post('/api/case-studies')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Original Case Study',
      slug: 'original-case-study',
      clientName: 'Original Client',
      industry: 'Tech',
      service: 'Consulting',
      challenge: 'Original challenge.',
      solution: 'Original solution.',
    })
    .expect(201);

  const caseStudyId = created.body.caseStudy._id;

  // Update the case study
  const response = await request(app)
    .put(`/api/case-studies/${caseStudyId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Updated Case Study',
      slug: 'updated-case-study',
      clientName: 'Updated Client',
      industry: 'Finance',
      service: 'Strategy',
      challenge: 'Updated challenge.',
      solution: 'Updated solution.',
      isPublished: true,
    })
    .expect(200);

  assert.equal(response.body.message, 'Case study updated successfully');
  assert.equal(response.body.caseStudy.title, 'Updated Case Study');
});

test('Admin can delete a case study', async () => {
  // Create a case study first
  const created = await request(app)
    .post('/api/case-studies')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Delete Case Study',
      slug: 'delete-case-study',
      clientName: 'Delete Client',
      industry: 'Retail',
      service: 'Marketing',
      challenge: 'Delete challenge.',
      solution: 'Delete solution.',
    })
    .expect(201);

  const caseStudyId = created.body.caseStudy._id;

  // Delete the case study
  const response = await request(app)
    .delete(`/api/case-studies/${caseStudyId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.message, 'Case study deleted successfully');
});

test('Admin can create a testimonial', async () => {
  const response = await request(app)
    .post('/api/testimonials')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'John Smith',
      role: 'CEO',
      company: 'Tech Innovations',
      quote: 'Boost Vertex exceeded our expectations with their strategic approach.',
      rating: 5,
      platform: 'Google',
      isPublished: true,
    })
    .expect(201);

  assert.equal(response.body.message, 'Testimonial created successfully');
  assert.ok(response.body.testimonial._id);
  assert.equal(response.body.testimonial.rating, 5);
});

test('Admin can update a testimonial', async () => {
  // Create a testimonial first
  const created = await request(app)
    .post('/api/testimonials')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Original Name',
      role: 'Manager',
      quote: 'Original quote.',
      rating: 4,
    })
    .expect(201);

  const testimonialId = created.body.testimonial._id;

  // Update the testimonial
  const response = await request(app)
    .put(`/api/testimonials/${testimonialId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Updated Name',
      role: 'Director',
      quote: 'Updated quote.',
      rating: 5,
      isPublished: true,
    })
    .expect(200);

  assert.equal(response.body.message, 'Testimonial updated successfully');
  assert.equal(response.body.testimonial.name, 'Updated Name');
  assert.equal(response.body.testimonial.rating, 5);
});

test('Admin can delete a testimonial', async () => {
  // Create a testimonial first
  const created = await request(app)
    .post('/api/testimonials')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Delete Name',
      role: 'Analyst',
      quote: 'To be deleted.',
      rating: 3,
    })
    .expect(201);

  const testimonialId = created.body.testimonial._id;

  // Delete the testimonial
  const response = await request(app)
    .delete(`/api/testimonials/${testimonialId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.message, 'Testimonial deleted successfully');
});

test('Non-admin cannot create content without token', async () => {
  const response = await request(app)
    .post('/api/services')
    .send({
      title: 'Unauthorized Service',
      slug: 'unauthorized-service',
      summary: 'Should fail.',
      description: 'No token provided.',
    })
    .expect(401);

  assert.match(response.body.message, /not authorized|token/i);
});

test('Non-admin cannot update content without token', async () => {
  const response = await request(app)
    .put('/api/services/507f1f77bcf86cd799439011')
    .send({
      title: 'Unauthorized Update',
    })
    .expect(401);

  assert.match(response.body.message, /not authorized|token/i);
});

test('Non-admin cannot delete content without token', async () => {
  const response = await request(app)
    .delete('/api/services/507f1f77bcf86cd799439011')
    .expect(401);

  assert.match(response.body.message, /not authorized|token/i);
});

test('Response format is consistent for all CRUD operations', async () => {
  // Create
  const createResponse = await request(app)
    .post('/api/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Format Test Service',
      slug: 'format-test-service',
      summary: 'Testing response format.',
      description: 'Ensuring consistent response structure.',
    })
    .expect(201);

  assert.ok(createResponse.body.message);
  assert.ok(createResponse.body.service);
  assert.ok(createResponse.body.service._id);

  const serviceId = createResponse.body.service._id;

  // Update
  const updateResponse = await request(app)
    .put(`/api/services/${serviceId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Format Test Service Updated',
      slug: 'format-test-service-updated',
      summary: 'Updated format test.',
      description: 'Checking update response format.',
    })
    .expect(200);

  assert.ok(updateResponse.body.message);
  assert.ok(updateResponse.body.service);
  assert.ok(updateResponse.body.service._id);

  // Delete
  const deleteResponse = await request(app)
    .delete(`/api/services/${serviceId}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  assert.ok(deleteResponse.body.message);
});
