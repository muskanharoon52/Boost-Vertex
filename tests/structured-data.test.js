const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Blog = require('../src/models/Blog');
const CaseStudy = require('../src/models/CaseStudy');
const Industry = require('../src/models/Industry');
const Service = require('../src/models/Service');
const Testimonial = require('../src/models/Testimonial');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testRunId = Date.now().toString();
const slugs = {
  service: `structured-service-${testRunId}`,
  industry: `structured-industry-${testRunId}`,
  caseStudy: `structured-case-study-${testRunId}`,
  blog: `structured-blog-${testRunId}`,
};

let approvedReview;

test.before(async () => {
  return mongoose.connect(MONGO_URI).then(async () => {
    await Service.create({
      title: 'Structured Data Test Service',
      slug: slugs.service,
      summary: 'Structured data service summary',
      description: 'Structured data service description',
      faqs: [{ question: 'What is this service?', answer: 'It supports qualified customer acquisition.' }],
      isPublished: true,
    });
    await Industry.create({
      name: 'Structured Data Test Industry',
      slug: slugs.industry,
      description: 'Structured data industry description',
      isPublished: true,
    });
    await CaseStudy.create({
      title: 'Structured Data Test Case Study',
      slug: slugs.caseStudy,
      clientName: 'Structured Data Client',
      industry: 'Technology',
      service: 'Meta Ads',
      challenge: 'Structured data case-study challenge',
      solution: 'Structured data case-study solution',
      isPublished: true,
    });
    await Blog.create({
      title: 'Structured Data Test Blog',
      slug: slugs.blog,
      excerpt: 'Structured data blog excerpt',
      content: 'Structured data blog content',
      tags: ['seo', 'structured-data'],
      isPublished: true,
    });
    approvedReview = await Testimonial.create({
      name: 'Structured Data Reviewer',
      role: 'Founder',
      company: 'Structured Data Company',
      quote: 'Approved structured data review',
      rating: 5,
      isPublished: true,
      isDraft: false,
      isApproved: true,
      permissionGranted: true,
    });
    await Testimonial.create({
      name: 'Structured Data Draft Reviewer',
      role: 'Client',
      quote: 'Draft review must not be exposed',
      isPublished: true,
      isDraft: true,
      isApproved: false,
      permissionGranted: true,
    });
  });
});

test.after(async () => {
  await Promise.all([
    Service.deleteOne({ slug: slugs.service }),
    Industry.deleteOne({ slug: slugs.industry }),
    CaseStudy.deleteOne({ slug: slugs.caseStudy }),
    Blog.deleteOne({ slug: slugs.blog }),
    Testimonial.deleteMany({ _id: { $in: [approvedReview?._id] } }),
    Testimonial.deleteOne({ name: 'Structured Data Draft Reviewer' }),
  ]);
  await mongoose.disconnect();
});

test('organization schema uses approved site identity', async () => {
  const response = await request(app).get('/api/seo/organization').expect(200);

  assert.equal(response.body['@context'], 'https://schema.org');
  assert.equal(response.body['@type'], 'Organization');
  assert.equal(response.body.name, 'Boost Vertex');
  assert.ok(response.body.sameAs.includes('https://www.linkedin.com/company/boost-vertex-pk/'));
});

test('service schema includes service and visible FAQ structured data', async () => {
  const response = await request(app).get(`/api/seo/service/${slugs.service}`).expect(200);
  const serviceSchema = response.body['@graph'].find((item) => item['@type'] === 'Service');
  const faqSchema = response.body['@graph'].find((item) => item['@type'] === 'FAQPage');

  assert.ok(serviceSchema);
  assert.equal(serviceSchema.name, 'Structured Data Test Service');
  assert.ok(faqSchema);
  assert.equal(faqSchema.mainEntity[0].name, 'What is this service?');
});

test('industry, case-study, and blog schemas return published content', async () => {
  const [industry, caseStudy, blog] = await Promise.all([
    request(app).get(`/api/seo/industry/${slugs.industry}`),
    request(app).get(`/api/seo/case-study/${slugs.caseStudy}`),
    request(app).get(`/api/seo/blog/${slugs.blog}`),
  ]);

  assert.equal(industry.status, 200);
  assert.equal(industry.body['@type'], 'WebPage');
  assert.equal(caseStudy.status, 200);
  assert.equal(caseStudy.body['@type'], 'Article');
  assert.equal(blog.status, 200);
  assert.equal(blog.body['@type'], 'Article');
  assert.deepEqual(blog.body.keywords, 'seo, structured-data');
});

test('review schema excludes draft testimonials', async () => {
  const response = await request(app).get('/api/seo/reviews').expect(200);
  const reviewNames = response.body.itemListElement.map((item) => item.item.author.name);

  assert.ok(reviewNames.includes('Structured Data Reviewer'));
  assert.equal(reviewNames.includes('Structured Data Draft Reviewer'), false);
});

test('schema endpoints exclude unpublished resources', async () => {
  const unpublished = await Service.create({
    title: 'Unpublished Structured Service',
    slug: `unpublished-structured-service-${testRunId}`,
    summary: 'Unpublished summary',
    description: 'Unpublished description',
    isPublished: false,
  });

  const response = await request(app).get(`/api/seo/service/${unpublished.slug}`).expect(404);
  assert.equal(response.body.message, 'Service not found');
  await Service.deleteOne({ _id: unpublished._id });
});
