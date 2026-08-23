const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Blog = require('../src/models/Blog');
const CaseStudy = require('../src/models/CaseStudy');
const Industry = require('../src/models/Industry');
const Service = require('../src/models/Service');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testRunId = Date.now().toString();
const slugs = {
  service: `sitemap-service-${testRunId}`,
  hiddenService: `hidden-sitemap-service-${testRunId}`,
  industry: `sitemap-industry-${testRunId}`,
  caseStudy: `sitemap-case-study-${testRunId}`,
  blog: `sitemap-blog-${testRunId}`,
};

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  await Service.create([
    {
      title: 'Sitemap Service <Test>',
      slug: slugs.service,
      summary: 'Sitemap service summary',
      description: 'Sitemap service description',
      isPublished: true,
    },
    {
      title: 'Hidden Sitemap Service',
      slug: slugs.hiddenService,
      summary: 'Hidden summary',
      description: 'Hidden description',
      isPublished: false,
    },
  ]);
  await Industry.create({ name: 'Sitemap Industry', slug: slugs.industry, isPublished: true });
  await CaseStudy.create({
    title: 'Sitemap Case Study',
    slug: slugs.caseStudy,
    clientName: 'Sitemap Client',
    industry: 'Technology',
    service: 'Meta Ads',
    challenge: 'Sitemap challenge',
    solution: 'Sitemap solution',
    isPublished: true,
  });
  await Blog.create({
    title: 'Sitemap Blog',
    slug: slugs.blog,
    excerpt: 'Sitemap excerpt',
    content: 'Sitemap content',
    isPublished: true,
  });
});

test.after(async () => {
  await Service.deleteMany({ slug: { $in: [slugs.service, slugs.hiddenService] } });
  await Industry.deleteOne({ slug: slugs.industry });
  await CaseStudy.deleteOne({ slug: slugs.caseStudy });
  await Blog.deleteOne({ slug: slugs.blog });
  await mongoose.disconnect();
});

test('sitemap returns valid XML with published content only', async () => {
  const response = await request(app).get('/sitemap.xml').expect(200);

  assert.match(response.headers['content-type'], /application\/xml/);
  assert.match(response.text, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(response.text, new RegExp(`/services/${slugs.service}`));
  assert.match(response.text, new RegExp(`/industries/${slugs.industry}`));
  assert.match(response.text, new RegExp(`/case-studies/${slugs.caseStudy}`));
  assert.match(response.text, new RegExp(`/blog/${slugs.blog}`));
  assert.doesNotMatch(response.text, new RegExp(`/services/${slugs.hiddenService}`));
  assert.doesNotMatch(response.text, /Sitemap Service <Test>/);
});

test('robots.txt allows public pages and blocks private paths', async () => {
  const response = await request(app).get('/robots.txt').expect(200);

  assert.match(response.headers['content-type'], /text\/plain/);
  assert.match(response.text, /User-agent: \*/);
  assert.match(response.text, /Allow: \/$/m);
  assert.match(response.text, /Disallow: \/admin/);
  assert.match(response.text, /Disallow: \/api/);
  assert.match(response.text, /Sitemap: https:\/\/boostvertex\.com\/sitemap\.xml/);
});
