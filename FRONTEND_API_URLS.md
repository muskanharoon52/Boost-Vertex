# Boost Vertex Frontend API URLs

This document provides the exact backend URLs and endpoint groups the frontend should integrate.

## Base URLs

- Local API base URL: `http://localhost:5000/api`
- Production API base URL: `https://api.boostvertex.com/api` (replace with your deployed backend URL)

## Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Authentication

### Admin login

```http
POST /auth/login
```

Use returned token for protected routes:

```http
Authorization: Bearer <token>
```

## Public Endpoints (No Auth)

### Health

- `GET /health`

### Services

- `GET /services`
- `GET /services/:slug`

### Blogs

- `GET /blogs`
- `GET /blogs/:slug`

### Case Studies

- `GET /case-studies`
- `GET /case-studies/:slug`

### Testimonials

- `GET /testimonials`

### Company Content

- `GET /clients`
- `GET /industries`
- `GET /site-settings`
- `GET /site-content/homepage`
- `GET /site-content/about`

### SEO + Technical SEO

- `GET /seo/organization`
- `GET /seo/reviews`
- `GET /seo/service/:slug`
- `GET /seo/industry/:slug`
- `GET /seo/case-study/:slug`
- `GET /seo/blog/:slug`
- `GET /sitemap.xml`
- `GET /robots.txt`

### Legal

- `GET /legal/privacy-policy`
- `GET /legal/terms`
- `GET /legal/cookie-policy`
- `GET /legal/disclaimer`

### Newsletter

- `POST /newsletter/subscribe`
- `POST /newsletter/unsubscribe`

### Blog Comments

- `POST /blog-comments/:blogId`
- `GET /blog-comments/:blogId`

## Public Lead Endpoint

```http
POST /leads
```

Recommended payload:

```json
{
  "name": "John Doe",
  "company": "Example Co",
  "email": "john@example.com",
  "phone": "03001234567",
  "serviceInterest": "Meta Ads Management",
  "monthlyBudget": "PKR 100,000–250,000",
  "message": "Need qualified leads",
  "source": "website",
  "recaptchaToken": "token-from-google"
}
```

Notes:

- `name` and `email` are required.
- In production with configured reCAPTCHA secret, `recaptchaToken` is required.

## Admin Endpoints (Auth Required)

### Auth + Dashboard

- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /admin/dashboard`
- `GET /admin/analytics`

### Lead Management

- `GET /leads`
- `GET /leads/export`
- `PATCH /leads/:id/status`
- `PATCH /leads/:id/read`

### CMS Management

#### Services

- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`
- `GET /services/admin/list`

#### Blogs

- `POST /blogs`
- `PUT /blogs/:id`
- `DELETE /blogs/:id`
- `GET /blogs/admin/list`

#### Case Studies

- `POST /case-studies`
- `PUT /case-studies/:id`
- `DELETE /case-studies/:id`
- `GET /case-studies/admin/list`

#### Testimonials

- `POST /testimonials`
- `PUT /testimonials/:id`
- `DELETE /testimonials/:id`
- `GET /testimonials/admin/list`

#### Site + Legal + Engagement

- `PUT /site-settings`
- `PUT /site-content/homepage`
- `PUT /site-content/about`
- `GET /legal/admin/list`
- `PUT /legal/:type`
- `GET /newsletter/admin/list`
- `GET /blog-comments/admin/list`
- `PATCH /blog-comments/:id/status`
- `DELETE /blog-comments/:id`

#### Media

- `POST /media`
- `GET /media/admin/list`
- `DELETE /media/:id`

## Common Query Parameters

- `page`, `limit`, `sort`
- `q` (search)
- `isPublished` (admin list filters)

Lead filters:

- `status`
- `isRead`
- `source`
- `dateFrom`
- `dateTo`
