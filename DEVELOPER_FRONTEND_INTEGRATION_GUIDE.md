# Boost Vertex Frontend Developer Integration Guide

This document is written for frontend developers integrating the Boost Vertex website with the backend API. It focuses on the exact API routes, request/response formats, auth flow, pagination handling, and the most common frontend usage patterns.

---

## 1. Project API Overview

The backend exposes the following base API namespace:

```text
http://localhost:5000/api
```

The app includes these route groups:

- `/api/auth` — admin login and profile
- `/api/services` — public services + admin CRUD
- `/api/blogs` — public blogs + admin CRUD
- `/api/case-studies` — public case studies + admin CRUD
- `/api/testimonials` — public testimonials + admin CRUD
- `/api/leads` — public lead submission + admin lead management
- `/api/site-settings` — website global settings
- `/api/admin` — dashboard and analytics
- `/api/health` — backend reachability check

---

## 2. Base Configuration

### Development

```text
BASE_URL=http://localhost:5000/api
```

### Production (current site)

```text
PUBLIC_SITE_URL=https://boostvertex.com
```

If API is hosted under the same domain:

```text
BASE_URL=https://boostvertex.com/api
```

Recommended frontend env:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RECAPTCHA_SITE_KEY=<your_site_key>
```

### Example frontend usage

```js
const API_BASE = 'http://localhost:5000/api';
```

If your frontend is a separate app, make sure CORS is allowed from your frontend origin. The backend uses `cors` and supports `CLIENT_URL` in `.env`.

---

## 3. Authentication Model

The backend uses JWT-based authentication for admin-only features.

### Login

Endpoint:

```http
POST /api/auth/login
``` 

Body:

```json
{
  "email": "boostvertex@gmail.com",
  "password": "admin123"
}
```

Success response:

```json
{
  "_id": "64b5c1112dbd9d7e9e1f2f09",
  "name": "Boost Vertex Admin",
  "email": "boostvertex@gmail.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Auth header

For protected admin APIs, send:

```http
Authorization: Bearer <token>
```

### Frontend token handling

```js
const token = response.data.token;
localStorage.setItem('adminToken', token);
```

Then:

```js
const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
};
```

### Protected routes include

- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/analytics`
- `GET /api/leads`
- `PATCH /api/leads/:id/status`
- `PATCH /api/leads/:id/read`
- admin content endpoints for services, blogs, case studies, testimonials
- `PUT /api/site-settings`

### Token expiry

- JWT expiration is set to 7 days
- If the backend responds with `401`, force re-login

---

## 4. Common Response Format

### Success response patterns

Public list endpoints:

```json
{
  "data": [
    {
      "_id": "...",
      "title": "Example"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Single resource:

```json
{
  "_id": "...",
  "title": "Example"
}
```

Create/update responses:

```json
{
  "message": "Service created successfully",
  "service": { "_id": "..." }
}
```

### Error response

```json
{
  "statusCode": 400,
  "message": "Title is required"
}
```

### Common HTTP status codes

- `200` — success
- `201` — created
- `400` — validation error
- `401` — unauthorized / invalid token
- `404` — record not found
- `409` — duplicate slug / conflict
- `429` — rate limit exceeded
- `500` — server error

---

## 5. Public Content Endpoints

These are the endpoints your customer-facing pages should use.

### 5.1 Get all services

```http
GET /api/services?page=1&limit=10&sort=-createdAt
```

Example response:

```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Meta Ads Management",
      "slug": "meta-ads-management",
      "summary": "Facebook and Instagram advertising built for customer acquisition.",
      "description": "Boost Vertex's primary service: Meta Ads focused on lead generation, conversions, audience targeting, retargeting, creative testing, and conversion tracking.",
      "features": ["Meta Ads", "Facebook Ads", "Instagram Ads", "Lead generation", "Conversion tracking", "Creative testing"],
      "seoTitle": "Meta Ads Management",
      "seoDescription": "Meta Ads management for qualified lead generation.",
      "isPublished": true,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

Use this for:
- services listing page
- service cards
- featured services

### 5.2 Get a single service by slug

```http
GET /api/services/:slug
```

Example:

```http
GET /api/services/meta-ads-management
```

Use this for:
- individual service detail page
- SEO-friendly dynamic routes

### 5.3 Get all blogs

```http
GET /api/blogs?page=1&limit=10&sort=-createdAt
```

Typical blog object:

```json
{
  "_id": "...",
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "...",
  "category": "Marketing",
  "tags": ["..."],
  "author": "Boost Vertex",
  "isPublished": true,
  "createdAt": "2026-08-13T10:00:00.000Z"
}
```

Note: blogs are CMS-driven and may be empty until published from admin.

### 5.4 Get a single blog by slug

```http
GET /api/blogs/:slug
```

### 5.5 Get all case studies

```http
GET /api/case-studies?page=1&limit=10&sort=-createdAt
```

Typical case study object:

```json
{
  "_id": "...",
  "title": "MovePro Pakistan",
  "slug": "movepro-pakistan",
  "clientName": "MovePro Pakistan",
  "industry": "Transport & Logistics",
  "service": "Meta Ads + Lead Generation",
  "challenge": "MovePro Pakistan needed a reliable way to generate relevant prospects through paid advertising.",
  "solution": "Built and optimized a Meta Ads lead-generation strategy focused on relevant, business-ready prospects.",
  "results": [
    { "metric": "Known outcome", "description": "High-quality and mature leads were generated, and the client was satisfied with the prospect quality." }
  ],
  "whatWeDid": "Built and optimized a Meta Ads lead-generation strategy focused on relevant, business-ready prospects.",
  "isPublished": true,
  "createdAt": "2026-08-13T10:00:00.000Z"
}
```

### 5.6 Get a single case study by slug

```http
GET /api/case-studies/:slug
```

### 5.7 Get all testimonials

```http
GET /api/testimonials?page=1&limit=10&sort=-createdAt
```

Optional filter:

```http
GET /api/testimonials?minRating=4
```

### 5.8 Get site settings

```http
GET /api/site-settings
```

Example response:

```json
{
  "companyName": "Boost Vertex",
  "phone": "03032799987",
  "whatsapp": "03032799987",
  "email": "boostvertex@gmail.com",
  "salesEmail": "boostvertex@gmail.com",
  "address": "Blue Area, Islamabad, Pakistan",
  "workingHours": "Monday-Saturday, 10:00 AM-7:00 PM",
  "bookingUrl": null,
  "websiteUrl": "https://boostvertex.com",
  "socialLinks": {
    "facebook": "https://www.facebook.com/adswithboostvertex",
    "instagram": "https://www.instagram.com/boostvertex",
    "linkedin": "https://www.linkedin.com/company/boost-vertex-pk/"
  }
}
```

This should power the header, footer, contact info, and social media block globally.

---

## 6. Lead Submission Endpoint

This is the important customer form endpoint.

### Submit lead

```http
POST /api/leads
Content-Type: application/json
```

Body:

```json
{
  "name": "Muhammad Ali",
  "email": "ali@example.com",
  "phone": "03032799987",
  "company": "Example Company",
  "serviceInterest": "Meta Ads Management",
  "monthlyBudget": "PKR 100,000–250,000",
  "message": "We need qualified leads.",
  "source": "website",
  "recaptchaToken": "token-from-google"
}
```

Production note: when `RECAPTCHA_SECRET_KEY` is configured, missing token returns `400` and invalid token returns `403`.

Success response:

```json
{
  "message": "Lead submitted successfully",
  "lead": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Muhammad Ali",
    "email": "ali@example.com"
  }
}
```

Use this for:
- contact form
- quote request form
- service inquiry form
- CTA conversion widgets

---

## 7. Admin Dashboard and CRM API

These endpoints require a valid JWT token.

### 7.1 Get current admin profile

```http
GET /api/auth/me
```

### 7.2 Dashboard summary

```http
GET /api/admin/dashboard
```

Typical response:

```json
{
  "summary": {
    "totalPublishedContent": 18,
    "services": { "published": 5, "unpublished": 2, "total": 7 },
    "blogs": { "published": 8, "unpublished": 1, "total": 9 },
    "caseStudies": { "published": 3, "unpublished": 1, "total": 4 },
    "testimonials": { "published": 4, "unpublished": 1, "total": 5 },
    "leads": {
      "total": 45,
      "unread": 8,
      "byStatus": {
        "new": 10,
        "contacted": 15,
        "qualified": 12,
        "won": 5,
        "lost": 3
      }
    }
  },
  "recentLeads": [
    {
      "_id": "...",
      "name": "Muhammad Ali",
      "email": "ali@example.com",
      "status": "new",
      "isRead": false,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ]
}
```

### 7.3 Analytics

```http
GET /api/admin/analytics
```

This gives you:
- total requests
- average response time
- most-used endpoints
- error rate
- top admin activity

### 7.4 Get leads

```http
GET /api/leads?status=qualified&isRead=false&source=website&page=1&limit=20
```

Admin lead object:

```json
{
  "_id": "...",
  "name": "Muhammad Ali",
  "email": "ali@example.com",
  "phone": "03032799987",
  "company": "Example Company",
  "serviceInterest": "Meta Ads Management",
  "monthlyBudget": "PKR 100,000–250,000",
  "message": "We need qualified leads.",
  "source": "website",
  "status": "new",
  "isRead": false,
  "createdAt": "2026-08-13T10:00:00.000Z"
}
```

### 7.5 Update lead status

```http
PATCH /api/leads/:id/status
```

Body:

```json
{
  "status": "qualified"
}
```

### 7.6 Update lead read state

```http
PATCH /api/leads/:id/read
```

Body:

```json
{
  "isRead": true
}
```

---

## 8. Admin CRUD Content Endpoints

These endpoints are used by the admin CMS or a separate admin frontend.

### 8.1 Services

#### List all services including unpublished

```http
GET /api/services/admin/list?page=1&limit=10&isPublished=false
```

#### Create service

```http
POST /api/services
```

Body example:

```json
{
  "title": "SEO Growth",
  "slug": "seo-growth",
  "summary": "Improve search visibility and qualified traffic.",
  "description": "Detailed service description here.",
  "features": ["Keyword research", "Technical SEO", "Content optimization"],
  "seoTitle": "SEO Growth Services",
  "seoDescription": "Boost your search rankings with data-driven SEO campaigns.",
  "isPublished": true
}
```

#### Update service

```http
PUT /api/services/:id
```

#### Delete service

```http
DELETE /api/services/:id
```

### 8.2 Blogs

#### List blogs admin view

```http
GET /api/blogs/admin/list?page=1&limit=10&isPublished=false
```

#### Create blog

```http
POST /api/blogs
```

Body example:

```json
{
  "title": "Digital Marketing Strategy",
  "slug": "digital-marketing-strategy",
  "excerpt": "A complete guide to modern digital marketing.",
  "content": "Full blog content here...",
  "category": "Marketing",
  "tags": ["SEO", "Content", "Strategy"],
  "author": "Boost Vertex",
  "seoTitle": "Digital Marketing Strategy 2026",
  "seoDescription": "Learn effective strategies for digital marketing success.",
  "isPublished": true
}
```

#### Update blog

```http
PUT /api/blogs/:id
```

#### Delete blog

```http
DELETE /api/blogs/:id
```

### 8.3 Case studies

#### List case studies admin view

```http
GET /api/case-studies/admin/list?page=1&limit=10&isPublished=false
```

#### Create case study

```http
POST /api/case-studies
```

Body example:

```json
{
  "title": "Whizpool",
  "slug": "whizpool",
  "clientName": "Whizpool",
  "industry": "Technology / Software",
  "service": "Social Media Management / LinkedIn Content / Meta Ads",
  "challenge": "Whizpool needed stronger social media content and visibility to unlock organic lead opportunities.",
  "solution": "Developed LinkedIn-focused content and social media activity to improve visibility and engagement.",
  "whatWeDid": "Developed LinkedIn-focused content and social media activity to improve visibility and engagement.",
  "capabilities": ["Social Media Management", "LinkedIn Content", "Meta Ads"],
  "results": [
    { "metric": "Known outcome", "description": "Whizpool started receiving organic leads through LinkedIn." }
  ],
  "isPublished": true
}
```

### 8.4 Testimonials

#### List admin testimonials

```http
GET /api/testimonials/admin/list?page=1&limit=10&isPublished=false
```

#### Create testimonial

```http
POST /api/testimonials
```

Example:

```json
{
  "name": "John Smith",
  "role": "CEO",
  "company": "Tech Innovations",
  "quote": "Boost Vertex exceeded our expectations with their strategic approach.",
  "rating": 5,
  "platform": "Google",
  "isPublished": true
}
```

---

## 9. Site Settings API

This is used for global website configuration.

### Get settings

```http
GET /api/site-settings
```

### Update settings

```http
PUT /api/site-settings
```

Auth header required.

Example body:

```json
{
  "companyName": "Boost Vertex",
  "phone": "03032799987",
  "whatsapp": "03032799987",
  "email": "boostvertex@gmail.com",
  "salesEmail": "boostvertex@gmail.com",
  "address": "Blue Area, Islamabad, Pakistan",
  "workingHours": "Monday-Saturday, 10:00 AM-7:00 PM",
  "websiteUrl": "https://boostvertex.com",
  "socialLinks": {
    "facebook": "https://www.facebook.com/adswithboostvertex",
    "instagram": "https://www.instagram.com/boostvertex",
    "linkedin": "https://www.linkedin.com/company/boost-vertex-pk/"
  }
}
```

This is ideal for:
- global footer data
- contact section
- social links
- site-wide branding metadata

---

## 10. Pagination and Filtering

The backend returns consistent pagination metadata.

Example:

```json
{
  "data": [
    { "_id": "..." }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Common query parameters

- `page`: page number
- `limit`: number of items to return
- `sort`: sort field, usually `-createdAt`
- `isPublished`: true/false for admin list views
- `q`: general text search
- `status`: for leads
- `isRead`: true/false
- `source`: lead source
- `minRating`: testimonial filtering

Example:

```http
GET /api/leads?status=new&isRead=false&source=website&q=marketing&page=1&limit=20
```

---

## 11. Recommended Frontend Integration Pattern

### Option A: Native fetch

```js
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('adminToken');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${path}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
```

### Option B: axios

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Usage:

```js
const services = await api.get('/services?page=1&limit=10');
const leadResponse = await api.post('/leads', formData);
```

---

## 12. Frontend Use Cases

### 12.1 Home page

Fetch:
- `/api/services?page=1&limit=3`
- `/api/testimonials?page=1&limit=6`
- `/api/case-studies?page=1&limit=3`
- `/api/site-settings`

### 12.2 Service listing page

Fetch:
- `/api/services?page=1&limit=10&sort=-createdAt`

### 12.3 Service detail page

Fetch:
- `/api/services/:slug`

### 12.3 Blog listing and detail pages

Fetch:
- `/api/blogs?page=1&limit=10`
- `/api/blogs/:slug`

### 12.4 Contact page

Submit:
- `POST /api/leads`

### 12.5 Admin CMS panel

Fetch with token:
- `POST /api/auth/login`
- `GET /api/admin/dashboard`
- `GET /api/services/admin/list`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- same pattern for blogs, case studies, testimonials

---

## 13. Validation and Data Model Notes

The frontend should respect these rules from the backend:

### Services

Required fields:
- `title`
- `summary`
- `description`

Optional:
- `slug`
- `features`
- `seoTitle`
- `seoDescription`
- `isPublished`

### Blogs

Required fields:
- `title`
- `excerpt`
- `content`

Optional:
- `category`
- `tags`
- `author`
- `seoTitle`
- `seoDescription`
- `isPublished`

### Case studies

Required fields:
- `title`
- `clientName`
- `industry`
- `service`
- `challenge`
- `solution`

### Testimonials

Required fields:
- `name`
- `role`
- `quote`
- `rating` (1 to 5)

### Leads

Required fields:
- `name`
- `email`

Optional:
- `phone`
- `company`
- `serviceInterest`
- `monthlyBudget`
- `message`
- `source`
- `recaptchaToken`

---

## 14. Error Handling Best Practices

Always handle errors like this:

```js
try {
  const response = await api.get('/services');
  "name": "Muhammad Ali",
  "email": "ali@example.com",
  "phone": "03032799987",
    // logout user
  "serviceInterest": "Meta Ads Management",
  "monthlyBudget": "PKR 100,000–250,000",
  "message": "We need qualified leads.",
  if (error.response?.status === 429) {
    // show rate limit warning
  }

  console.error(error.response?.data || error.message);
}
```

Recommended UX:
- show inline validation errors for bad forms
- show global error banner for API failures
- redirect to login if `401` occurs on protected pages
- handle rate-limit messages gracefully

---

## 15. Rate Limiting Notes

The backend includes both global and per-admin rate limiting.

- Global API limit: 200 requests per 15 minutes
- Admin read limit: 1000 requests per 15 minutes per admin
- Admin write limit: 100 write operations per 15 minutes per admin

When rate-limited, the backend responds with:

```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later"
}
```

Recommended frontend behavior:
- do not spam auto-refresh or polling
- debounce search requests
- cache content when appropriate

---

## 16. Security Notes for Frontend

- Never expose admin credentials in the frontend app
- Store JWTs in secure storage or a managed cookie setup, depending on implementation
- Do not store secrets in client-side code
- Validate form data before submitting to the backend
- Treat all `401` and `403` responses as auth failures

---

## 17. Quick Start Example

### Login flow

```js
  "title": "Whizpool",
  "slug": "whizpool",
  "clientName": "Whizpool",
  "industry": "Technology / Software",
  "service": "Social Media Management / LinkedIn Content / Meta Ads",
  "challenge": "Whizpool needed stronger social media content and visibility to unlock organic lead opportunities.",
  "solution": "Developed LinkedIn-focused content and social media activity to improve visibility and engagement.",
  "whatWeDid": "Developed LinkedIn-focused content and social media activity to improve visibility and engagement.",
  "capabilities": ["Social Media Management", "LinkedIn Content", "Meta Ads"],
  const data = await res.json();
    { "metric": "Known outcome", "description": "Whizpool started receiving organic leads through LinkedIn." }
    throw new Error(data.message || 'Login failed');

  localStorage.setItem('adminToken', data.token);
  return data;
};
```

### Fetch services

```js
const fetchServices = async () => {
  const res = await fetch('http://localhost:5000/api/services?page=1&limit=10&sort=-createdAt');
  return await res.json();
};
```

### Submit lead

```js
const submitLead = async (payload) => {
  const res = await fetch('http://localhost:5000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Lead submission failed');
  }

  return data;
};
```

---

## 18. Recommended Frontend Architecture

For a clean implementation, structure frontend integration around these sections:

- `api/config.js` — base URL and shared headers
- `api/auth.js` — login and profile requests
- `api/services.js` — get/create/update/delete services
- `api/blogs.js` — blog requests
- `api/caseStudies.js` — case studies requests
- `api/testimonials.js` — testimonial requests
- `api/leads.js` — lead submission and admin management
- `api/siteSettings.js` — site settings CRUD
- `api/admin.js` — dashboard and analytics

This keeps frontend code clean and reduces repeated request logic.

---

## 19. Final Developer Notes

The backend is ready for frontend integration and supports the complete customer-facing website plus the admin CMS workflow.

The frontend should primarily rely on:

- `GET /api/services` and `GET /api/services/:slug`
- `GET /api/blogs` and `GET /api/blogs/:slug`
- `GET /api/case-studies` and `GET /api/case-studies/:slug`
- `GET /api/testimonials`
- `POST /api/leads`
- `GET /api/site-settings`
- `POST /api/auth/login` and protected admin endpoints for CMS tasks

This is the complete API shape the frontend needs to build the website and admin panel.
