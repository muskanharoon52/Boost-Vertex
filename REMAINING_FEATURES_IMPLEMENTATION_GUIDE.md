# Boost Vertex Remaining Features Implementation Guide

This guide explains how to implement the remaining features listed in `BACKEND_IMPLEMENTATION_STATUS.md`.

The current backend uses:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Nodemailer
- CommonJS modules

The frontend described by the project README should use React.

## Recommended Implementation Order

Implement the features in this order:

1. Legal content endpoints
2. reCAPTCHA verification
3. Lead export
4. Media upload and storage
5. Booking integration
6. XML sitemap and `robots.txt`
7. Structured data
8. Google Analytics and Search Console setup
9. React frontend integration
10. Production deployment and end-to-end testing

This order gives the frontend stable API contracts before the final SEO and deployment work.

## 1. reCAPTCHA Verification

### Purpose

Protect the public lead form from automated submissions.

Use Google reCAPTCHA v3 for a low-friction website form or reCAPTCHA Enterprise for a larger production system.

### Backend dependencies

```bash
npm install axios
```

### Environment variables

Add these to `.env`:

```env
RECAPTCHA_SECRET_KEY=your_private_recaptcha_secret
RECAPTCHA_MIN_SCORE=0.5
```

Never expose `RECAPTCHA_SECRET_KEY` to React.

### Frontend flow

1. Load the reCAPTCHA client script with the public site key.
2. Generate a token when the user submits the form.
3. Send the token with the lead request.

Example request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "03000000000",
  "company": "Example Company",
  "serviceInterest": "Meta Ads Management",
  "monthlyBudget": "PKR 100,000–250,000",
  "message": "We need qualified leads.",
  "recaptchaToken": "token-from-google"
}
```

### Backend verification

Create `src/services/recaptchaService.js`:

```js
const axios = require('axios');

const verifyRecaptcha = async (token, remoteIp) => {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return { success: true, skipped: true };
  }

  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
        remoteip: remoteIp,
      },
    }
  );

  const minimumScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
  return {
    success: response.data.success === true && Number(response.data.score || 0) >= minimumScore,
    score: response.data.score,
    errors: response.data['error-codes'] || [],
  };
};

module.exports = { verifyRecaptcha };
```

In `createLead`, verify the token before creating the MongoDB record. Return `400` or `403` when verification fails.

Recommended behavior:

- Development without a configured key: allow the request and log that verification was skipped.
- Production with a configured key: reject missing or invalid tokens.
- Never store the reCAPTCHA token in MongoDB.
- Rate-limit the public lead endpoint separately from admin endpoints.

### Tests

Add tests for:

- Valid token accepted
- Invalid token rejected
- Missing token rejected in production configuration
- Token is not saved in the lead document

## 2. Lead Export

### Purpose

Allow an authenticated administrator to download filtered leads as CSV.

### Endpoint

```http
GET /api/leads/export?status=new&dateFrom=2026-08-01&dateTo=2026-08-31
Authorization: Bearer <admin-token>
```

Response headers:

```http
Content-Type: text/csv
Content-Disposition: attachment; filename="boost-vertex-leads.csv"
```

### Backend dependency

```bash
npm install json2csv
```

### Controller design

Reuse the same filters as `getLeads`:

- `status`
- `isRead`
- `source`
- `q`
- `dateFrom`
- `dateTo`

Create an `exportLeads` controller that:

1. Builds the same filter object.
2. Queries all matching records.
3. Selects only business fields.
4. Converts records to CSV.
5. Sends the file as a download.

Recommended export fields:

```text
createdAt
name
email
phone
company
serviceInterest
monthlyBudget
message
source
status
isRead
```

Do not export internal credentials, tokens, or infrastructure data.

### Route ordering

Register the export route before `/:id` routes:

```js
router.get('/export', protect, adminRateLimiter, exportLeads);
router.get('/', protect, adminRateLimiter, getLeads);
```

### Security

- Require admin JWT.
- Apply a strict rate limit.
- Limit the maximum export date range or result count.
- Escape CSV values through the CSV library.
- Log export activity without logging private lead content.

### Tests

Verify:

- Unauthenticated export returns `401`.
- CSV content type is correct.
- Filters are applied.
- `monthlyBudget` is included.
- CSV values containing commas or quotes are escaped.

## 3. Media Upload And Storage

### Recommended provider

Use Cloudinary or Amazon S3 rather than storing uploaded files inside the Node process.

Cloudinary is simpler for image-heavy CMS content because it provides hosted URLs, transformations, and image optimization.

### Cloudinary dependencies

```bash
npm install cloudinary multer
```

### Environment variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never expose the API secret to React.

### Media model

Create `src/models/Media.js`:

```js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
    mimeType: String,
    originalName: String,
    altText: String,
    folder: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
```

### Upload rules

Allow only approved formats:

- Images: JPEG, PNG, WebP, SVG when trusted
- Videos: MP4, WebM

Set limits such as:

- Images: 5 MB
- Videos: 50 MB

Validate both MIME type and file signature. Do not trust the filename extension alone.

### Endpoints

```http
POST /api/media
DELETE /api/media/:id
GET /api/media/admin/list
```

All media management endpoints require an admin JWT.

Use `multer.memoryStorage()` for small files and upload the buffer directly to Cloudinary. Do not write arbitrary user uploads to the repository.

### Model integration

Keep the current nullable URL fields for compatibility, or replace them with media references:

- `Service.image`
- `Client.logo`
- `Testimonial.clientPhoto`
- `Testimonial.clientLogo`
- About founder photo
- `CaseStudy.media`

A media reference should include both the database ID and public URL if the frontend needs fast rendering.

### Delete behavior

When deleting a media record:

1. Remove it from Cloudinary/S3.
2. Remove the MongoDB record.
3. Clear references from related content records.

Do not delete a file only from MongoDB while leaving the cloud asset orphaned.

### Tests

Verify:

- Unauthenticated upload is rejected.
- Unsupported MIME types are rejected.
- Oversized files are rejected.
- Successful uploads return a public URL.
- Only administrators can delete media.

## 4. Booking Or Calendly Integration

The PDF says booking is currently unavailable, so do not expose a fake Calendly URL.

### Option A: External Calendly link

When a real booking URL is supplied:

1. Store it in `SiteSettings.bookingUrl`.
2. Return it through `GET /api/site-settings`.
3. Render the booking CTA only when the value is non-empty.

Example:

```js
const bookingUrl = settings.bookingUrl || null;
```

### Option B: Calendly embed

Install the frontend package:

```bash
npm install react-calendly
```

Render the embed only when `bookingUrl` exists.

### Option C: Internal booking records

If a custom booking system is required, add a `Booking` model:

```text
name
email
phone
preferredDate
preferredTime
timezone
notes
status
source
```

Add:

```http
POST /api/bookings
GET /api/bookings
PATCH /api/bookings/:id/status
```

Protect admin booking management and validate timezone/date values. This is more work than using Calendly and should only be chosen when the business needs full ownership of scheduling.

### Current implementation rule

Until the real booking URL is provided:

- Keep `bookingUrl: null`.
- Keep the booking CTA hidden or disabled.
- Use WhatsApp and the website inquiry form as the approved contact paths.

## 5. XML Sitemap And `robots.txt`

These are public technical SEO endpoints and do not need MongoDB if URLs are generated from published content.

### Endpoints

```http
GET /sitemap.xml
GET /robots.txt
```

These routes should be registered before the API 404 handler.

### Sitemap contents

Include:

- Homepage
- About page
- Contact page
- Published service pages
- Published industry pages
- Published case-study pages
- Published blog pages

Do not include:

- Admin pages
- Draft content
- Login pages
- Unpublished records

### Sitemap controller outline

1. Query published services, industries, case studies, and blogs.
2. Convert their slugs into canonical frontend URLs.
3. Escape XML values.
4. Return `application/xml`.

Example URL format:

```text
https://boostvertex.com/services/meta-ads-management
https://boostvertex.com/industries/healthcare
https://boostvertex.com/case-studies/whizpool
```

Store the public site URL in an environment variable:

```env
PUBLIC_SITE_URL=https://boostvertex.com
```

### robots.txt contents

```text
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://boostvertex.com/sitemap.xml
```

In development, use the local URL or omit the sitemap host.

### Tests

Verify:

- Sitemap returns valid XML.
- Draft records are excluded.
- `robots.txt` returns plain text.
- Admin and API paths are disallowed.
- Sitemap URL uses `PUBLIC_SITE_URL`.

## 6. Google Analytics And Search Console

### Google Analytics 4

GA4 tracking normally belongs in the React frontend, not in the Express API.

Frontend environment variable:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Load the Google tag once in the React application and track meaningful events:

- `generate_lead`
- `contact_form_start`
- `contact_form_submit`
- `whatsapp_click`
- `phone_click`
- `service_view`
- `case_study_view`

Do not send email addresses, phone numbers, names, or message text to Analytics.

Recommended lead event payload:

```js
window.gtag('event', 'generate_lead', {
  form_name: 'website_inquiry',
  service: selectedService,
  budget_range: monthlyBudget,
});
```

Avoid sending personally identifiable information.

### Google Search Console

Search Console is configured against the deployed domain, not through a normal backend API call.

Steps:

1. Add the production domain property.
2. Verify ownership using DNS, HTML tag, or an uploaded file.
3. Submit `/sitemap.xml`.
4. Inspect important service, industry, and case-study URLs.
5. Monitor indexing, coverage, performance, and enhancements.

If HTML-tag verification is required, store the verification value in an environment variable:

```env
GOOGLE_SITE_VERIFICATION=verification-value
```

Expose it through a safe public SEO settings endpoint or render it in the frontend document head. Never expose Google service-account credentials.

## 7. Structured-Data Generation

Structured data should be rendered by the React frontend on each public page, because it describes the page currently being viewed.

### Organization schema

Use on the homepage or site-wide layout:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Boost Vertex",
  "email": "boostvertex@gmail.com",
  "telephone": "03032799987",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Islamabad",
    "addressCountry": "PK"
  },
  "sameAs": [
    "https://www.facebook.com/adswithboostvertex",
    "https://www.instagram.com/boostvertex",
    "https://www.linkedin.com/company/boost-vertex-pk/"
  ]
}
```

### Service schema

Generate from the service API response:

- `name`
- `description`
- `url`
- `provider`
- `areaServed`

### FAQ schema

Only generate FAQPage schema for FAQs actually visible on the page. Do not add hidden or invented questions.

### Review schema

Only generate review markup after testimonials have final approval and permission. Draft testimonials must not be included.

### React helper

Create a reusable helper that serializes JSON safely into a `<script type="application/ld+json">` tag. Escape `<` characters to prevent script-breaking content.

Validate generated schema with:

- Google Rich Results Test
- Schema Markup Validator

## 8. Legal Content Endpoints

Do not invent legal language. Store only content supplied and approved by the business or legal advisor.

### Model

Create `src/models/LegalDocument.js`:

```js
const mongoose = require('mongoose');

const legalDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['privacy-policy', 'terms', 'cookie-policy', 'disclaimer'],
      unique: true,
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    version: String,
    effectiveDate: Date,
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LegalDocument', legalDocumentSchema);
```

### Endpoints

Public:

```http
GET /api/legal/privacy-policy
GET /api/legal/terms
GET /api/legal/cookie-policy
GET /api/legal/disclaimer
```

Admin:

```http
GET /api/legal/admin/list
PUT /api/legal/:type
```

Public endpoints must return only `isPublished: true` documents. Admin endpoints require JWT authentication.

### Consent wording

Add the approved consent wording to the lead form configuration only after it is supplied. Store the consent version with each lead:

```text
consentGiven
consentVersion
consentAt
```

Do not accept a consent flag from the frontend without validating that the user actually submitted the required consent field.

### Tests

Verify:

- Missing legal documents return `404` or a clear unpublished response.
- Draft legal documents are not public.
- Admin updates require JWT.
- Published documents return title, content, version, and effective date.

## 9. Frontend React Application

The current repository is backend-focused. A separate React application should consume the API rather than duplicating approved content.

### Recommended setup

Use Vite:

```bash
npm create vite@latest client -- --template react
cd client
npm install
```

Recommended frontend dependencies:

```bash
npm install react-router-dom axios react-helmet-async
```

Use Manrope for headings and Inter for body/UI, as specified in the approved PDF.

### Suggested structure

```text
client/
  src/
    api/
      client.js
      services.js
      leads.js
      content.js
    components/
      Header.jsx
      Footer.jsx
      CTAButton.jsx
      LeadForm.jsx
      SEO.jsx
      StructuredData.jsx
    pages/
      Home.jsx
      Services.jsx
      ServiceDetail.jsx
      Industries.jsx
      IndustryDetail.jsx
      CaseStudies.jsx
      CaseStudyDetail.jsx
      About.jsx
      Contact.jsx
      LegalPage.jsx
    layouts/
      PublicLayout.jsx
    routes/
      AppRoutes.jsx
    styles/
      tokens.css
      global.css
    App.jsx
    main.jsx
```

### API configuration

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_PUBLIC_SITE_URL=http://localhost:5173
VITE_RECAPTCHA_SITE_KEY=your_public_site_key
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The backend remains responsible for:

- Validation
- Authentication
- MongoDB persistence
- Email notification
- reCAPTCHA secret verification

The frontend remains responsible for:

- Page rendering
- Responsive layout
- Form UX
- SEO head tags
- Structured data rendering
- Analytics events
- WhatsApp/call links

### API client

Create a single Axios client:

```js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

Use separate modules for services, content, leads, and admin operations. Do not hardcode contact details in multiple components; load them from `/api/site-settings`.

### Required public pages

Implement the approved navigation:

- Home
- Services
- Industries
- Case Studies
- About
- Contact

Use dynamic routes for:

```text
/services/:slug
/industries/:slug
/case-studies/:slug
```

### Homepage requirements

Read `/api/site-content/homepage` and render:

- Performance marketing positioning
- Meta Ads and Lead Generation priority
- Pakistan, UAE, and Saudi Arabia markets
- Primary WhatsApp CTA
- Secondary inquiry CTA
- Approved client references
- Approved case studies
- Only approved testimonials

### Lead form requirements

Render exactly these seven business fields:

1. Name
2. Business / Company Name
3. Email
4. Phone / WhatsApp
5. Service Required
6. Monthly Marketing Budget
7. Message / Business Requirement

Send the matching API fields:

```json
{
  "name": "...",
  "company": "...",
  "email": "...",
  "phone": "...",
  "serviceInterest": "...",
  "monthlyBudget": "...",
  "message": "..."
}
```

After successful submission:

- Show a confirmation state.
- Track a `generate_lead` Analytics event without personal data.
- Offer WhatsApp or phone follow-up.

### Frontend security

- Never put admin secrets in Vite environment variables.
- Never expose JWT secrets, SMTP credentials, MongoDB credentials, or Cloudinary secrets.
- Escape or safely render CMS HTML.
- Validate form fields on the client for UX, but rely on backend validation for security.
- Use HTTPS in production.

### Frontend SEO

For every page, render:

- Unique title
- Meta description
- Canonical URL
- Correct H1
- Open Graph tags
- Twitter/X card tags where required
- Relevant structured data

Use the API SEO fields for services, industries, case studies, and legal pages.

## End-To-End Verification Checklist

### Backend

- [ ] reCAPTCHA rejects automated or invalid submissions.
- [ ] Lead export requires admin authentication.
- [ ] CSV export respects filters.
- [ ] Media upload validates type and size.
- [ ] Uploaded files receive public URLs.
- [ ] Booking URL is hidden while unavailable.
- [ ] Sitemap contains only published public content.
- [ ] `robots.txt` blocks `/api` and `/admin`.
- [ ] Legal endpoints expose only approved published documents.
- [ ] Public testimonials exclude drafts.

### Frontend

- [ ] All six approved services render.
- [ ] Industries render as confirmed experience, not an exclusive list.
- [ ] All three case studies render without invented metrics.
- [ ] Client logos render only with permission.
- [ ] Lead form contains exactly seven fields.
- [ ] WhatsApp number comes from site settings.
- [ ] Booking CTA remains unavailable until a real URL exists.
- [ ] Analytics tracks events without personal data.
- [ ] Sitemap and robots URLs work in production.
- [ ] Structured data passes validation.
- [ ] Legal links and consent wording are approved.

## Production Environment Checklist

Configure these values in the production environment:

```env
NODE_ENV=production
MONGO_URI=...
JWT_SECRET=...
CLIENT_URL=https://boostvertex.com
PUBLIC_SITE_URL=https://boostvertex.com
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
RECAPTCHA_SECRET_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Do not commit `.env` files or credentials to Git.
