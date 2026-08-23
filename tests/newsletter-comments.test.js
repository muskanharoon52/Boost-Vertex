const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../src/app');
const Blog = require('../src/models/Blog');
const BlogComment = require('../src/models/BlogComment');
const NewsletterSubscription = require('../src/models/NewsletterSubscription');
const { loginAsAdmin } = require('./helpers/adminTestAuth');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/boost-vetex';
const testRunId = Date.now().toString();
let token = '';
let blogId = '';

const authHeader = () => ({ Authorization: `Bearer ${token}` });

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  const login = await loginAsAdmin(app, request);
  token = login.token;

  const blog = await Blog.create({
    title: `Comments Test Blog ${testRunId}`,
    slug: `comments-test-blog-${testRunId}`,
    excerpt: 'Comments test excerpt',
    content: 'Comments test content',
    isPublished: true,
  });
  blogId = blog._id.toString();
});

test.after(async () => {
  await BlogComment.deleteMany({ blog: blogId });
  await Blog.deleteOne({ _id: blogId });
  await NewsletterSubscription.deleteMany({ email: { $regex: `newsletter-test-${testRunId}` } });
  await mongoose.disconnect();
});

test('newsletter subscription can be created, reactivated, and unsubscribed', async () => {
  const email = `newsletter-test-${testRunId}@example.com`;

  const subscribed = await request(app)
    .post('/api/newsletter/subscribe')
    .send({ email })
    .expect(200);

  assert.equal(subscribed.body.subscription.email, email);
  assert.equal(subscribed.body.subscription.status, 'active');

  const unsubscribed = await request(app)
    .post('/api/newsletter/unsubscribe')
    .send({ email: email.toUpperCase() })
    .expect(200);

  assert.equal(unsubscribed.body.subscription.status, 'unsubscribed');

  const reactivated = await request(app)
    .post('/api/newsletter/subscribe')
    .send({ email })
    .expect(200);

  assert.equal(reactivated.body.subscription.status, 'active');
});

test('newsletter admin listing requires authentication and supports filtering', async () => {
  const email = `newsletter-test-${testRunId}-filter@example.com`;
  await request(app).post('/api/newsletter/subscribe').send({ email });

  await request(app).get('/api/newsletter/admin/list').expect(401);
  const response = await request(app)
    .get(`/api/newsletter/admin/list?q=${testRunId}`)
    .set(authHeader())
    .expect(200);

  assert.ok(response.body.data.some((subscription) => subscription.email === email));
  assert.ok(response.body.pagination);
});

test('blog comments are pending publicly and approved comments are returned', async () => {
  const created = await request(app)
    .post(`/api/blog-comments/${blogId}`)
    .send({ name: 'Comment Author', email: `comment-${testRunId}@example.com`, comment: 'A useful comment.' })
    .expect(201);

  assert.equal(created.body.comment.status, 'pending');

  const beforeApproval = await request(app).get(`/api/blog-comments/${blogId}`).expect(200);
  assert.equal(beforeApproval.body.data.some((comment) => comment._id === created.body.comment._id), false);

  const adminList = await request(app)
    .get(`/api/blog-comments/admin/list?blogId=${blogId}`)
    .set(authHeader())
    .expect(200);
  assert.ok(adminList.body.data.some((comment) => comment._id === created.body.comment._id));

  const approved = await request(app)
    .patch(`/api/blog-comments/${created.body.comment._id}/status`)
    .set(authHeader())
    .send({ status: 'approved' })
    .expect(200);
  assert.equal(approved.body.comment.status, 'approved');

  const afterApproval = await request(app).get(`/api/blog-comments/${blogId}`).expect(200);
  assert.equal(afterApproval.body.data[0].name, 'Comment Author');
  assert.equal(afterApproval.body.data[0].email, undefined);
});

test('blog comment moderation changes require authentication', async () => {
  const comment = await BlogComment.create({
    blog: blogId,
    name: 'Protected Comment',
    email: `protected-${testRunId}@example.com`,
    comment: 'Protected moderation test',
  });

  await request(app)
    .patch(`/api/blog-comments/${comment._id}/status`)
    .send({ status: 'approved' })
    .expect(401);
});
