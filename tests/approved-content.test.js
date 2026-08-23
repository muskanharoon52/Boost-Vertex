const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Client = require('../src/models/Client');
const Industry = require('../src/models/Industry');
const SiteContent = require('../src/models/SiteContent');
const Service = require('../src/models/Service');
const CaseStudy = require('../src/models/CaseStudy');
const Testimonial = require('../src/models/Testimonial');
const Lead = require('../src/models/Lead');
const { loginAsAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testRunId = Date.now().toString();
const testClientSlug = `approved-content-test-client-${testRunId}`;
const hiddenClientSlug = `hidden-approved-content-test-client-${testRunId}`;
const testIndustrySlug = `approved-content-test-industry-${testRunId}`;
const hiddenIndustrySlug = `hidden-approved-content-test-industry-${testRunId}`;
let token = '';

const authHeader = () => ({ Authorization: `Bearer ${token}` });

test.before(async () => {
  await mongoose.connect(MONGO_URI);

  const login = await loginAsAdmin(app, request);
  token = login.token;
});

test.after(async () => {
  await mongoose.disconnect();
});

test('public clients and industries expose approved published records', async () => {
  await Client.create({ name: `Approved Content Test Client ${testRunId}`, slug: testClientSlug, displayPermission: true, isPublished: true });
  await Client.create({ name: `Hidden Approved Content Test Client ${testRunId}`, slug: hiddenClientSlug, isPublished: false });
  await Industry.create({ name: `Approved Content Test Industry ${testRunId}`, slug: testIndustrySlug, isPublished: true });
  await Industry.create({ name: `Hidden Approved Content Test Industry ${testRunId}`, slug: hiddenIndustrySlug, isPublished: false });

  const clients = await request(app).get('/api/clients').expect(200);
  const industries = await request(app).get('/api/industries').expect(200);

  assert.ok(clients.body.data.some((client) => client.slug === testClientSlug));
  assert.equal(clients.body.data.some((client) => client.slug === hiddenClientSlug), false);
  assert.ok(industries.body.data.some((industry) => industry.slug === testIndustrySlug));
  assert.equal(industries.body.data.some((industry) => industry.slug === hiddenIndustrySlug), false);
});

test('client and industry writes require admin authentication', async () => {
  await request(app).post('/api/clients').send({ name: 'Unauthorized Client' }).expect(401);
  await request(app).post('/api/industries').send({ name: 'Unauthorized Industry' }).expect(401);
});

test('homepage and About content can be read publicly and updated by admins', async () => {
  const homepagePayload = {
    heroTitle: 'Performance Marketing That Generates Qualified Leads',
    primaryCtaText: 'Get a Free Consultation',
  };
  const aboutPayload = {
    founderName: 'Tayyab Riaz',
    founderTitle: 'Founder, Boost Vertex',
  };

  await request(app).put('/api/site-content/homepage').set(authHeader()).send(homepagePayload).expect(200);
  await request(app).put('/api/site-content/about').set(authHeader()).send(aboutPayload).expect(200);

  const homepage = await request(app).get('/api/site-content/homepage').expect(200);
  const about = await request(app).get('/api/site-content/about').expect(200);

  assert.equal(homepage.body.content.heroTitle, homepagePayload.heroTitle);
  assert.equal(about.body.content.founderName, aboutPayload.founderName);
});

test('lead accepts an approved monthly marketing budget value', async () => {
  const response = await request(app)
    .post('/api/leads')
    .send({
      name: 'Budget Test Lead',
      email: 'budget@example.com',
      company: 'Budget Company',
      serviceInterest: 'Meta Ads Management',
      monthlyBudget: 'PKR 100,000–250,000',
      message: 'Interested in qualified leads.',
    })
    .expect(201);

  assert.equal(response.body.lead.monthlyBudget, 'PKR 100,000–250,000');
});

test('service and case study APIs preserve approved rich content fields', async () => {
  const serviceResponse = await request(app)
    .post('/api/services')
    .set(authHeader())
    .send({
      title: 'Approved Content Test Service',
      slug: 'approved-content-test-service',
      summary: 'Facebook and Instagram advertising built for customer acquisition.',
      description: 'Campaign management focused on qualified leads.',
      approach: ['Audience research', 'Conversion tracking'],
      deliverables: ['Campaign strategy', 'Performance reporting'],
      faqs: [{ question: 'Do you manage Instagram ads?', answer: 'Yes.' }],
      primaryKeyword: 'Meta Ads agency Pakistan',
      isFeatured: true,
    })
    .expect(201);

  const caseStudyResponse = await request(app)
    .post('/api/case-studies')
    .set(authHeader())
    .send({
      title: 'Approved Content Test Case Study',
      slug: 'approved-content-test-case-study',
      clientName: 'Approved Content Test Client',
      industry: 'Technology / Software',
      service: 'Social Media Management / LinkedIn Content / Meta Ads',
      challenge: 'Whizpool needed stronger LinkedIn visibility.',
      whatWeDid: 'Developed LinkedIn content and social media activity.',
      capabilities: ['Social Media Management', 'LinkedIn Content', 'Meta Ads'],
    })
    .expect(201);

  assert.deepEqual(serviceResponse.body.service.approach, ['Audience research', 'Conversion tracking']);
  assert.equal(serviceResponse.body.service.faqs[0].question, 'Do you manage Instagram ads?');
  assert.equal(caseStudyResponse.body.caseStudy.whatWeDid, 'Developed LinkedIn content and social media activity.');
  assert.deepEqual(caseStudyResponse.body.caseStudy.capabilities, ['Social Media Management', 'LinkedIn Content', 'Meta Ads']);
});

test('public testimonials exclude drafts and unapproved quotations', async () => {
  await Testimonial.create([
    {
      name: 'Approved Content Draft Client',
      role: 'Client',
      quote: 'Draft wording',
      isPublished: true,
      isDraft: true,
      isApproved: false,
      permissionGranted: true,
    },
    {
      name: 'Approved Content Approved Client',
      role: 'Founder',
      quote: 'Approved wording',
      isPublished: true,
      isDraft: false,
      isApproved: true,
      permissionGranted: true,
    },
  ]);

  const response = await request(app).get('/api/testimonials').expect(200);

  assert.equal(response.body.data.some((testimonial) => testimonial.name === 'Approved Content Draft Client'), false);
  assert.ok(response.body.data.some((testimonial) => testimonial.name === 'Approved Content Approved Client'));
});
