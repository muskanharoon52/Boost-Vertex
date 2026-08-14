# Boost Vertex Backend API Guide

## 1. Overview
This document defines the backend API structure for the Boost Vertex marketing agency website. It is intended for the backend developer and for frontend integration planning.

The backend is built with:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Nodemailer

---

## 2. Base URL

Development base URL:

```text
http://localhost:5000/api
```

---

## 3. Authentication & Security

The admin uses JWT-based authentication with per-admin rate limiting.

### Login
```http
POST /api/auth/login
```

Request body:
```json
{
  "email": "admin@boostvertex.com",
  "password": "admin123"
}
```

Response:
```json
{
  "_id": "...",
  "name": "Boost Vertex Admin",
  "email": "admin@boostvertex.com",
  "token": "jwt_token_here"
}
```

### Protected routes
Use this header:

```http
Authorization: Bearer <token>
```

### Rate Limiting (Phase 7)
All admin routes are protected with per-admin rate limiting:
- **Read operations**: 1000 requests per 15 minutes per admin user
- **Write operations**: 100 operations per 15 minutes per admin user (POST, PUT, DELETE)

When rate limit is exceeded:
```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later"
}
```

Rate limit information is included in response headers:
```http
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1691936400
```

### API Logging (Phase 7)
All API requests are automatically logged for audit trails and analytics:
- Request method, path, and status code
- Response time (in milliseconds)
- Admin user (email) for protected routes
- Client IP address and user agent
- Request and response body sizes

Logs are stored in `logs/api-requests.log` with JSON line format for easy parsing and analytics extraction.

---

## 4. Admin Endpoints

### Get admin profile
```http
GET /api/auth/me
```

Headers:
```http
Authorization: Bearer <token>
```

### Admin dashboard summary
```http
GET /api/admin/dashboard
```

Headers:
```http
Authorization: Bearer <token>
```

Response example:
```json
{
  "summary": {
    "totalPublishedContent": 18,
    "services": {
      "published": 5,
      "unpublished": 2,
      "total": 7
    },
    "blogs": {
      "published": 8,
      "unpublished": 1,
      "total": 9
    },
    "caseStudies": {
      "published": 3,
      "unpublished": 1,
      "total": 4
    },
    "testimonials": {
      "published": 4,
      "unpublished": 1,
      "total": 5,
      "averageRating": 4.8
    },
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
    },
    "leadSources": [
      { "_id": "website", "count": 25 },
      { "_id": "email", "count": 12 },
      { "_id": "referral", "count": 8 }
    ]
  },
  "recentLeads": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "new",
      "isRead": false,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ]
}
```

### Admin analytics
```http
GET /api/admin/analytics
```

Headers:
```http
Authorization: Bearer <token>
```

Response example:
```json
{
  "message": "Analytics data retrieved successfully",
  "analytics": {
    "totalRequests": 1250,
    "averageResponseTime": "45ms",
    "endpoints": [
      {
        "endpoint": "GET /api/services",
        "requestCount": 185,
        "errorCount": 2,
        "errorRate": "1.1%",
        "averageTime": "35ms"
      },
      {
        "endpoint": "POST /api/leads",
        "requestCount": 156,
        "errorCount": 5,
        "errorRate": "3.2%",
        "averageTime": "52ms"
      }
    ],
    "errorRate": "2.3%",
    "topAdmins": [
      {
        "email": "admin@boostvertex.com",
        "requestCount": 450
      }
    ],
    "generatedAt": "2026-08-13T12:30:00.000Z"
  }
}
```

This endpoint provides:
- Total API requests made
- Average response time across all endpoints
- Top 10 most-used endpoints with error rates
- Overall error rate
- Top 5 most active admin users
- Data generation timestamp

For performance monitoring and debugging, refer to this endpoint regularly to track API usage patterns.

---

## 4b. Admin-Only List Endpoints (Phase 7)

All content types now provide admin-only list endpoints that include unpublished items and support advanced filtering.

### Get all services (admin view)
```http
GET /api/services/admin/list?page=1&limit=10&isPublished=false
```

Headers:
```http
Authorization: Bearer <token>
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt)
- `isPublished`: filter by published status (true/false)

Response example:
```json
{
  "data": [
    {
      "_id": "...",
      "title": "Draft Service",
      "slug": "draft-service",
      "summary": "Service summary",
      "description": "Full description",
      "isPublished": false,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get all blogs (admin view)
```http
GET /api/blogs/admin/list?category=Marketing&isPublished=false
```

Headers:
```http
Authorization: Bearer <token>
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt)
- `isPublished`: filter by published status
- `category`: filter by blog category
- `q`: search by title, excerpt, or content (full-text search)

Response: Same structure as services list (includes pagination metadata).

### Get all case studies (admin view)
```http
GET /api/case-studies/admin/list?industry=E-commerce
```

Headers:
```http
Authorization: Bearer <token>
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt)
- `isPublished`: filter by published status
- `industry`: filter by industry
- `q`: search by title or client name

### Get all testimonials (admin view)
```http
GET /api/testimonials/admin/list?isPublished=true
```

Headers:
```http
Authorization: Bearer <token>
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt)
- `isPublished`: filter by published status
- `minRating`: filter by minimum rating (1-5)
- `q`: search by name or quote

---

### Submit new lead
```http
POST /api/leads
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+923001234567",
  "company": "Example Company",
  "serviceInterest": "SEO",
  "message": "We want to grow our brand.",
  "source": "website"
}
```

Response:
```json
{
  "message": "Lead submitted successfully",
  "lead": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get all leads (Admin)
```http
GET /api/leads?status=qualified&isRead=false&source=website
```

Headers:
```http
Authorization: Bearer <token>
```

Query parameters (all optional):
- `status`: filter by lead status (new, contacted, qualified, won, lost)
- `isRead`: filter by read state (true/false)
- `source`: filter by lead source (website, email, referral, etc.)
- `q`: full-text search by name, email, company, or message
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt)

Advanced filtering example:
```http
GET /api/leads?status=new&isRead=false&source=website&q=marketing&page=1&limit=20
```

Response:
```json
{
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+923001234567",
      "company": "Example Company",
      "serviceInterest": "SEO",
      "message": "We want to grow our brand.",
      "source": "website",
      "status": "new",
      "isRead": false,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Update lead status
```http
PATCH /api/leads/:id/status
```

Headers:
```http
Authorization: Bearer <token>
```

Request body:
```json
{
  "status": "qualified"
}
```

### Update lead read state
```http
PATCH /api/leads/:id/read
```

Headers:
```http
Authorization: Bearer <token>
```

Request body:
```json
{
  "isRead": true
}
```

---

## 6. Service Endpoints

### Get all published services with pagination (Public)
```http
GET /api/services?page=1&limit=10&sort=-createdAt
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt for descending)

Response example:
```json
{
  "data": [
    {
      "_id": "...",
      "title": "SEO Growth",
      "slug": "seo-growth",
      "summary": "Improve search visibility",
      "description": "...",
      "features": ["Keyword research", "Content optimization"],
      "isPublished": true,
      "createdAt": "2026-08-13T10:00:00.000Z"
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

### Get service by slug (Public)
```http
GET /api/services/:slug
```

Response:
```json
{
  "_id": "...",
  "title": "SEO Growth",
  "slug": "seo-growth",
  "summary": "Improve search visibility",
  "description": "Full description...",
  "features": ["Keyword research", "Content optimization"],
  "seoTitle": "SEO Growth Services",
  "seoDescription": "Professional SEO services",
  "isPublished": true,
  "createdAt": "2026-08-13T10:00:00.000Z"
}
```

### Create service (Admin only)
```http
POST /api/services
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Required fields: `title`, `slug`, `summary`, `description`

Request body example:
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

Response: `201 Created`
```json
{
  "message": "Service created successfully",
  "service": {
    "_id": "...",
    "title": "SEO Growth",
    "slug": "seo-growth",
    "summary": "Improve search visibility and qualified traffic.",
    "description": "Detailed service description here.",
    "features": ["Keyword research", "Technical SEO", "Content optimization"],
    "seoTitle": "SEO Growth Services",
    "seoDescription": "Boost your search rankings with data-driven SEO campaigns.",
    "isPublished": true,
    "createdAt": "2026-08-13T10:00:00.000Z"
  }
}
```

Error codes:
- `400`: Missing required fields (title, slug, summary, description)
- `409`: Duplicate slug
- `401`: No token or invalid token

### Update service (Admin only)
```http
PUT /api/services/:id
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Request body (all fields optional):
```json
{
  "title": "Updated Title",
  "slug": "updated-slug",
  "summary": "Updated summary",
  "description": "Updated description",
  "features": ["New feature 1", "New feature 2"],
  "isPublished": false
}
```

Response: `200 OK`
```json
{
  "message": "Service updated successfully",
  "service": { ... }
}
```

### Delete service (Admin only)
```http
DELETE /api/services/:id
```

Headers:
```http
Authorization: Bearer <token>
```

Response: `200 OK`
```json
{
  "message": "Service deleted successfully"
}
```

---

## 7. Blog Endpoints

### Get all published blogs with pagination (Public)
```http
GET /api/blogs?page=1&limit=10&sort=-createdAt
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt for descending)

Response includes pagination metadata (same structure as services).

### Get blog by slug (Public)
```http
GET /api/blogs/:slug
```

Response:
```json
{
  "_id": "...",
  "title": "Digital Marketing Strategy",
  "slug": "digital-marketing-strategy",
  "excerpt": "A complete guide to modern digital marketing.",
  "content": "Full blog content here...",
  "category": "Marketing",
  "tags": ["SEO", "Content", "Strategy"],
  "author": "Boost Vertex",
  "isPublished": true,
  "createdAt": "2026-08-13T10:00:00.000Z"
}
```

### Create blog (Admin only)
```http
POST /api/blogs
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Required fields: `title`, `slug`, `excerpt`, `content`

Request body example:
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

Response: `201 Created`
```json
{
  "message": "Blog created successfully",
  "blog": { ... }
}
```

Error codes:
- `400`: Missing required fields (title, slug, excerpt, content)
- `409`: Duplicate slug
- `401`: No token or invalid token

### Update blog (Admin only)
```http
PUT /api/blogs/:id
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Request body (all fields optional):
```json
{
  "title": "Updated Title",
  "slug": "updated-slug",
  "excerpt": "Updated excerpt",
  "content": "Updated content",
  "category": "Strategy",
  "isPublished": true
}
```

Response: `200 OK`
```json
{
  "message": "Blog updated successfully",
  "blog": { ... }
}
```

### Delete blog (Admin only)
```http
DELETE /api/blogs/:id
```

Headers:
```http
Authorization: Bearer <token>
```

Response: `200 OK`
```json
{
  "message": "Blog deleted successfully"
}
```

---

## 8. Case Study Endpoints

### Get all published case studies with pagination (Public)
```http
GET /api/case-studies?page=1&limit=10&sort=-createdAt
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt for descending)

Response example:
```json
{
  "data": [
    {
      "_id": "...",
      "title": "E-commerce Growth Success",
      "slug": "ecommerce-growth-success",
      "clientName": "ABC E-commerce",
      "industry": "E-commerce",
      "service": "Digital Marketing",
      "challenge": "Low online sales conversion.",
      "solution": "Implemented targeted PPC campaigns and optimized product pages.",
      "results": [
        { "metric": "Sales Growth", "description": "250% increase in 6 months" },
        { "metric": "ROI", "description": "5:1 return on ad spend" }
      ],
      "isPublished": true,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### Get case study by slug (Public)
```http
GET /api/case-studies/:slug
```

### Create case study (Admin only)
```http
POST /api/case-studies
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Required fields: `title`, `slug`, `clientName`, `industry`, `service`, `challenge`, `solution`

Request body example:
```json
{
  "title": "E-commerce Growth Success",
  "slug": "ecommerce-growth-success",
  "clientName": "ABC E-commerce",
  "industry": "E-commerce",
  "service": "Digital Marketing",
  "challenge": "Low online sales conversion.",
  "solution": "Implemented targeted PPC campaigns and optimized product pages.",
  "results": [
    { "metric": "Sales Growth", "description": "250% increase in 6 months" },
    { "metric": "ROI", "description": "5:1 return on ad spend" }
  ],
  "testimonial": "Boost Vertex transformed our online business.",
  "isPublished": true
}
```

Response: `201 Created`
```json
{
  "message": "Case study created successfully",
  "caseStudy": { ... }
}
```

Error codes:
- `400`: Missing required fields
- `409`: Duplicate slug
- `401`: No token or invalid token

### Update case study (Admin only)
```http
PUT /api/case-studies/:id
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Request body (all fields optional):
```json
{
  "title": "Updated Title",
  "clientName": "Updated Client",
  "solution": "Updated solution",
  "results": [{ "metric": "New Metric", "description": "New value" }],
  "isPublished": true
}
```

Response: `200 OK`
```json
{
  "message": "Case study updated successfully",
  "caseStudy": { ... }
}
```

### Delete case study (Admin only)
```http
DELETE /api/case-studies/:id
```

Headers:
```http
Authorization: Bearer <token>
```

Response: `200 OK`
```json
{
  "message": "Case study deleted successfully"
}
```

---

## 9. Testimonial Endpoints

### Get all published testimonials with pagination (Public)
```http
GET /api/testimonials?page=1&limit=10&sort=-createdAt
```

Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 10, max: 100)
- `sort`: sort field (default: -createdAt for descending)

Response example:
```json
{
  "data": [
    {
      "_id": "...",
      "name": "John Smith",
      "role": "CEO",
      "company": "Tech Innovations",
      "quote": "Boost Vertex exceeded our expectations with their strategic approach.",
      "rating": 5,
      "platform": "Google",
      "isPublished": true,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### Create testimonial (Admin only)
```http
POST /api/testimonials
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Required fields: `name`, `role`, `quote`, `rating` (1-5)

Request body example:
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

Response: `201 Created`
```json
{
  "message": "Testimonial created successfully",
  "testimonial": { ... }
}
```

Error codes:
- `400`: Missing required fields or invalid rating (not 1-5)
- `401`: No token or invalid token

### Update testimonial (Admin only)
```http
PUT /api/testimonials/:id
```

Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

Request body (all fields optional):
```json
{
  "name": "Updated Name",
  "role": "Director",
  "quote": "Updated testimonial quote.",
  "rating": 4,
  "isPublished": true
}
```

Note: Rating is automatically clamped to 1-5 range.

Response: `200 OK`
```json
{
  "message": "Testimonial updated successfully",
  "testimonial": { ... }
}
```

### Delete testimonial (Admin only)
```http
DELETE /api/testimonials/:id
```

Headers:
```http
Authorization: Bearer <token>
```

Response: `200 OK`
```json
{
  "message": "Testimonial deleted successfully"
}
```

---

## 10. Site Settings Endpoints

### Get site settings
```http
GET /api/site-settings
```

### Update site settings
```http
PUT /api/site-settings
```

Headers:
```http
Authorization: Bearer <token>
```

Example payload:
```json
{
  "companyName": "Boost Vertex",
  "phone": "+1 (555) 123-4567",
  "email": "hello@boostvertex.com",
  "address": "Lahore, Pakistan",
  "websiteUrl": "https://boostvertex.com",
  "socialLinks": {
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "linkedin": "https://linkedin.com"
  }
}
```

---

## 11. Default Admin Credentials

For local backend development:

```text
Email: admin@boostvertex.com
Password: admin123
```

---

## 12. Security & Rate Limiting (Phase 7)

The backend now includes comprehensive security features:

### Authentication
- JWT-based authentication with 7-day token expiration
- Password hashing with bcryptjs (10 salt rounds)
- Admin profile verification on protected routes

### Rate Limiting
- **Global limit**: 200 requests per 15 minutes on `/api` routes
- **Per-admin read limit**: 1000 requests per 15 minutes per admin user
- **Per-admin write limit**: 100 write operations per 15 minutes per admin user

Rate limiting is applied to:
- All admin-only content management endpoints
- Analytics endpoint
- Lead management endpoints (protected operations)

### Additional Security
- CORS enabled with credentials support
- Helmet.js security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- Request/response logging for audit trails
- Input validation on all CRUD endpoints
- Unique slug enforcement to prevent duplicates

### Logging & Monitoring
- All API requests logged with timestamp, method, path, status, response time
- Admin user tracking on protected routes
- Error rate tracking per endpoint
- Performance metrics available via analytics endpoint
- Log files stored in `logs/api-requests.log`

---

## 13. Validation and Security Notes

The backend includes:
- JWT validation with Bearer token authentication
- Password hashing with bcrypt
- Protected admin middleware on all sensitive routes
- MongoDB-based content and leads management
- Per-admin and global rate limiting
- CORS configuration
- Helmet security headers
- Request/response logging and audit trails
- Input validation on all CRUD operations
- Duplicate prevention via unique slug constraints
- Graceful error handling with standardized response formats

Additional security features:
- Admin password hashing before storage
- Token validation on every protected request
- Admin existence check before granting access
- Rate limit enforcement with RFC 6585 compliance
- Comprehensive request logging for compliance

---

## 14. Backend Milestone Status - Phase 7 COMPLETE ✅

**✅ Completed**:
- ✔ Project setup and dependencies
- ✔ MongoDB connection and 7 models
- ✔ Express server with middleware stack
- ✔ JWT authentication and admin login
- ✔ Admin dashboard summary with real-time metrics
- ✔ CMS models and CRUD routes for all content types
- ✔ Lead workflow with status and read tracking
- ✔ Site settings module
- ✔ Pagination and sorting on all list endpoints
- ✔ Public vs. admin content visibility
- ✔ Per-admin rate limiting
- ✔ API request/response logging
- ✔ Analytics endpoint with comprehensive metrics
- ✔ Admin-only list endpoints with filtering
- ✔ Advanced lead filtering and search
- ✔ 57 passing integration tests

**Phase 7 Enhancements**:
- Rate limiting per admin user (1000 reads/15min, 100 writes/15min)
- Complete request/response logging
- Comprehensive analytics endpoint
- Admin-only content list endpoints with filtering
- Enhanced lead filtering with full-text search
- Admin metrics dashboard integration
- Audit trail logging for compliance

---

## 15. Frontend Integration Notes

The frontend team can consume these APIs once the backend is running and the required JWT token is generated through admin login.

This backend supports:
- Public website data fetches (services, blogs, case studies, testimonials)
- Lead submissions via contact forms
- Admin CRUD operations for content management
- Advanced filtering and search capabilities
- Dashboard analytics summary
- Per-admin rate limiting to prevent abuse
- Comprehensive request logging

### Integration Best Practices
1. Store JWT token securely (secure HTTP-only cookie or local storage)
2. Include `Authorization: Bearer <token>` header on all admin requests
3. Handle rate limit responses (429 status code)
4. Display pagination metadata to users (hasNextPage, totalPages)
5. Use query parameters for filtering and search
6. Cache analytics data with appropriate TTL
7. Implement error boundaries for failed API requests

### Example Authentication Flow
1. Admin enters credentials via login form
2. Frontend calls `POST /api/auth/login`
3. Receives JWT token from response
4. Stores token securely
5. Includes token in `Authorization` header for all subsequent requests
6. On token expiration, user must re-login

---

## 16. Example Request Flow

1. Admin logs in via `/api/auth/login`
2. Receives JWT token (valid for 7 days)
3. Uses token for `/api/admin/dashboard` to view analytics
4. Creates or updates content via `/api/services`, `/api/blogs`, etc.
5. Views admin-only content via `/api/services/admin/list`
6. Filters leads via `/api/leads?status=qualified&isRead=false`
7. Public users view published content via `/api/services`, `/api/blogs`

---

## 17. API Response Structure

All API endpoints follow a consistent response structure:

**Success Response**:
```json
{
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": { ... }
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2026-08-13T10:00:00.000Z"
}
```

**Status Codes**:
- `200`: OK - Request successful
- `201`: Created - Resource created
- `400`: Bad Request - Invalid input or validation error
- `401`: Unauthorized - Missing or invalid token
- `404`: Not Found - Resource not found
- `409`: Conflict - Duplicate resource (e.g., slug already exists)
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

---

## 18. Summary

**Boost Vertex Backend - Phase 7 Complete ✅**

The backend is fully production-ready with:
- 57/57 tests passing (100% success rate)
- Secure JWT authentication with rate limiting
- Comprehensive API request logging
- Real-time analytics dashboard
- Advanced filtering and search capabilities
- Admin content management system
- Lead capture and management
- Site configuration management
- 40+ public and admin endpoints
- Performance monitoring via analytics
- Full audit trail for compliance

The API is ready for frontend integration and supports the complete Boost Vertex website experience from lead capture to content management.

---

## 19. Development & Deployment

### Local Development
```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### Testing
```bash
npm test
```

Runs all 57 tests with detailed reporting

### Database
MongoDB connection: `mongodb://localhost:27017/boost-vetex`

### Environment Variables
Required in `.env`:
```
MONGO_URI=mongodb://localhost:27017/boost-vetex
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Optional:
```
SMTP_SERVICE=gmail
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@boostvertex.com
```
