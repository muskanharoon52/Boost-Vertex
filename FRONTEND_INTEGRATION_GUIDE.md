# Boost Vertex Frontend Integration Guide

**Complete guide for frontend engineers to integrate with the Boost Vertex backend API.**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Common Workflows](#common-workflows)
7. [Code Examples](#code-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Backend Server URL

**Development:**
```
http://localhost:5000/api
```

**Production:** (to be configured)
```
https://api.boostvertex.com/api
```

### Health Check

Test if the backend is running:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Boost Vertex backend is running"
}
```

### Setup Steps

1. **Ensure MongoDB is running**
   ```bash
   # Make sure MongoDB service is active
   ```

2. **Start the backend server**
   ```bash
   cd path/to/Boost-Vertex
   npm run dev
   ```
   Server will run on http://localhost:5000

3. **Verify connection**
   ```bash
   curl http://localhost:5000/api/health
   ```

---

## 🔐 Authentication

### JWT Token System

The backend uses JWT (JSON Web Token) for admin authentication. All protected endpoints require a valid token in the `Authorization` header.

### Admin Login

**Endpoint:**
```http
POST /api/auth/login
```

**Request body:**
```json
{
  "email": "admin@boostvertex.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Boost Vertex Admin",
  "email": "admin@boostvertex.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### Using the Token

Store the token in your frontend (localStorage, sessionStorage, or secure cookie):

```javascript
// After login, store token
localStorage.setItem('adminToken', response.token);

// For all subsequent admin requests, add to headers
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
  'Content-Type': 'application/json'
};
```

### Token Expiration

- Token expires in **7 days**
- When expired, user must login again
- Implement token refresh or auto-login redirect on 401 response

---

## 📡 API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get All Services (Published Only)

```http
GET /api/services?page=1&limit=10&sort=-createdAt
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort order (default: -createdAt)

**Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "SEO Growth Strategy",
      "slug": "seo-growth-strategy",
      "summary": "Boost your search visibility",
      "description": "Comprehensive SEO strategy...",
      "features": ["Keyword research", "Technical SEO"],
      "seoTitle": "SEO Growth Services",
      "seoDescription": "Professional SEO services",
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

#### 2. Get Service by Slug

```http
GET /api/services/:slug
```

**Example:**
```
GET /api/services/seo-growth-strategy
```

**Response:** Single service object (same structure as above)

#### 3. Get All Blogs (Published Only)

```http
GET /api/blogs?page=1&limit=10
```

**Response:** Same structure as services (data + pagination)

#### 4. Get Blog by Slug

```http
GET /api/blogs/:slug
```

#### 5. Get All Case Studies (Published Only)

```http
GET /api/case-studies?page=1&limit=10
```

#### 6. Get Case Study by Slug

```http
GET /api/case-studies/:slug
```

#### 7. Get All Testimonials (Published Only)

```http
GET /api/testimonials?page=1&limit=10
```

**Additional query parameter:**
- `minRating`: Filter by minimum rating (1-5)

#### 8. Submit a Lead (No Auth Required)

```http
POST /api/leads
Content-Type: application/json
```

**Request body:**
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

**Response (201 Created):**
```json
{
  "message": "Lead submitted successfully",
  "lead": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Protected Endpoints (Admin Only)

All these endpoints require authentication header:
```
Authorization: Bearer <token>
```

#### Admin Dashboard

```http
GET /api/admin/dashboard
```

**Response:**
```json
{
  "summary": {
    "services": { "published": 5, "unpublished": 2, "total": 7 },
    "blogs": { "published": 8, "unpublished": 1, "total": 9 },
    "testimonials": { "published": 4, "unpublished": 1, "averageRating": 4.8 },
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
      "name": "John Doe",
      "email": "john@example.com",
      "status": "new",
      "isRead": false,
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ]
}
```

#### Admin Analytics

```http
GET /api/admin/analytics
```

**Response:**
```json
{
  "message": "Analytics data retrieved successfully",
  "analytics": {
    "totalRequests": 1250,
    "averageResponseTime": "45ms",
    "errorRate": "2.3%",
    "endpoints": [
      {
        "endpoint": "GET /api/services",
        "requestCount": 185,
        "errorCount": 2,
        "errorRate": "1.1%",
        "averageTime": "35ms"
      }
    ],
    "topAdmins": [
      {
        "email": "admin@boostvertex.com",
        "requestCount": 450
      }
    ]
  }
}
```

#### Get All Leads (Admin)

```http
GET /api/leads?status=new&isRead=false&source=website&q=marketing
```

**Query Parameters:**
- `status`: new, contacted, qualified, won, lost
- `isRead`: true or false
- `source`: lead source (website, email, referral, etc.)
- `q`: search by name, email, company, or message
- `page`: page number
- `limit`: items per page

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "new",
      "isRead": false,
      "source": "website",
      "createdAt": "2026-08-13T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

#### Update Lead Status

```http
PATCH /api/leads/:id/status
```

**Request body:**
```json
{
  "status": "qualified"
}
```

**Allowed values:** new, contacted, qualified, won, lost

#### Update Lead Read State

```http
PATCH /api/leads/:id/read
```

**Request body:**
```json
{
  "isRead": true
}
```

#### Admin List Endpoints (with unpublished content)

**Services:**
```http
GET /api/services/admin/list?isPublished=false&page=1&limit=10
```

**Blogs:**
```http
GET /api/blogs/admin/list?category=Marketing&page=1&limit=10
```

**Case Studies:**
```http
GET /api/case-studies/admin/list?industry=E-commerce&page=1
```

**Testimonials:**
```http
GET /api/testimonials/admin/list?isPublished=true&page=1
```

All return paginated lists including unpublished items.

#### Create Content (Admin)

**Create Service:**
```http
POST /api/services
```

**Request body:**
```json
{
  "title": "SEO Growth",
  "slug": "seo-growth",
  "summary": "Improve search visibility",
  "description": "Full description...",
  "features": ["Keyword research", "Content optimization"],
  "isPublished": true
}
```

**Similar endpoints exist for:**
- `POST /api/blogs`
- `POST /api/case-studies`
- `POST /api/testimonials`

**Response (201 Created):**
```json
{
  "message": "Service created successfully",
  "service": { ... }
}
```

#### Update Content (Admin)

```http
PUT /api/services/:id
```

**Request body:** Same fields as create (all optional)

**Response (200 OK):**
```json
{
  "message": "Service updated successfully",
  "service": { ... }
}
```

#### Delete Content (Admin)

```http
DELETE /api/services/:id
```

**Response (200 OK):**
```json
{
  "message": "Service deleted successfully"
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate slug |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Title is required"
}
```

### Frontend Error Handling

```javascript
try {
  const response = await fetch('http://localhost:5000/api/services', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${response.status}:`, error.message);
    throw new Error(error.message);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

---

## 🚦 Rate Limiting

### Rate Limits

- **Global**: 200 requests per 15 minutes on `/api` routes
- **Admin read operations**: 1000 requests per 15 minutes per admin user
- **Admin write operations**: 100 write operations per 15 minutes per admin user

### Rate Limit Headers

```http
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1691936400
```

### Handling Rate Limits

When you hit the limit (429 response):

```javascript
if (response.status === 429) {
  const resetTime = new Date(response.headers.get('RateLimit-Reset') * 1000);
  console.warn(`Rate limited. Try again at ${resetTime}`);
  
  // Implement exponential backoff retry
  setTimeout(() => retryRequest(), 5000);
}
```

---

## 🔄 Common Workflows

### Workflow 1: Admin Login & Dashboard

```javascript
// Step 1: Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@boostvertex.com',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Step 2: Store token
localStorage.setItem('adminToken', token);

// Step 3: Get dashboard
const dashResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const dashboard = await dashResponse.json();
console.log(dashboard.summary); // Display metrics
```

### Workflow 2: Display Published Services

```javascript
// Fetch published services
const response = await fetch('http://localhost:5000/api/services?limit=10');
const { data: services, pagination } = await response.json();

// Display services
services.forEach(service => {
  console.log(`${service.title}: ${service.summary}`);
});

// Handle pagination
if (pagination.hasNextPage) {
  console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
}
```

### Workflow 3: Submit a Lead

```javascript
const leadData = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '+923001234567',
  company: 'Tech Corp',
  serviceInterest: 'Digital Marketing',
  message: 'Need a comprehensive marketing strategy',
  source: 'website'
};

const response = await fetch('http://localhost:5000/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadData)
});

const result = await response.json();
if (response.ok) {
  console.log('Lead submitted:', result.lead);
  // Show success message to user
}
```

### Workflow 4: Admin Create Service

```javascript
const token = localStorage.getItem('adminToken');

const serviceData = {
  title: 'Brand Strategy',
  slug: 'brand-strategy',
  summary: 'Build a strong brand identity',
  description: 'Detailed brand strategy service...',
  features: ['Logo design', 'Brand guidelines', 'Brand voice'],
  isPublished: false // Draft
};

const response = await fetch('http://localhost:5000/api/services', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(serviceData)
});

const result = await response.json();
if (response.ok) {
  console.log('Service created:', result.service);
} else {
  console.error('Error:', result.message);
}
```

### Workflow 5: Filter Leads by Status

```javascript
const token = localStorage.getItem('adminToken');

// Get all qualified leads
const response = await fetch(
  'http://localhost:5000/api/leads?status=qualified&isRead=false',
  { headers: { 'Authorization': `Bearer ${token}` } }
);

const { data: leads, pagination } = await response.json();
console.log(`Found ${pagination.total} qualified leads`);
leads.forEach(lead => console.log(lead.name, lead.email));
```

---

## 💻 Code Examples

### React Fetch Example

```javascript
import { useState, useEffect } from 'react';

export function ServicesList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {services.map(service => (
        <div key={service._id}>
          <h3>{service.title}</h3>
          <p>{service.summary}</p>
        </div>
      ))}
    </div>
  );
}
```

### React Admin Hook (useAdmin)

```javascript
import { useState, useEffect } from 'react';

export function useAdmin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setUser(data);
      } else {
        throw new Error(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
  };

  const fetchWithAuth = async (url, options = {}) => {
    if (!token) throw new Error('No admin token');

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  };

  return { token, user, login, logout, fetchWithAuth };
}

// Usage in component
export function AdminDashboard() {
  const { token, user, login, logout } = useAdmin();

  if (!token) {
    return <LoginForm onLogin={login} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}
```

### Axios Example

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Usage
async function getServices() {
  const { data } = await api.get('/services');
  return data;
}

async function createService(serviceData) {
  const { data } = await api.post('/services', serviceData);
  return data;
}

async function getLeads(filters) {
  const { data } = await api.get('/leads', { params: filters });
  return data;
}
```

---

## ✅ Best Practices

### 1. Token Management

```javascript
// ✅ DO: Store token securely and check expiration
function getValidToken() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    redirectToLogin();
    return null;
  }
  return token;
}

// ❌ DON'T: Store token in plain text or as URL parameter
// ❌ DON'T: Send token in URL: /api/leads?token=xyz
```

### 2. Error Messages

```javascript
// ✅ DO: Show user-friendly error messages
if (error.message === 'Title is required') {
  showError('Please enter a service title');
}

// ❌ DON'T: Show raw API errors to users
// ❌ DON'T: Expose sensitive details in error messages
```

### 3. Loading States

```javascript
// ✅ DO: Show loading state while fetching
const [loading, setLoading] = useState(false);

async function loadServices() {
  setLoading(true);
  try {
    const data = await api.get('/services');
    setServices(data.data);
  } finally {
    setLoading(false);
  }
}

// ❌ DON'T: Show multiple loading indicators
// ❌ DON'T: Allow requests while one is in progress
```

### 4. Pagination

```javascript
// ✅ DO: Use pagination for large datasets
const { data, pagination } = await api.get('/services', {
  params: { page: 1, limit: 10 }
});

if (pagination.hasNextPage) {
  // Load next page when user scrolls or clicks "Next"
}

// ❌ DON'T: Load all items at once
// ❌ DON'T: Ignore pagination metadata
```

### 5. Input Validation

```javascript
// ✅ DO: Validate before sending to API
function validateService(data) {
  if (!data.title?.trim()) throw new Error('Title required');
  if (!data.slug?.trim()) throw new Error('Slug required');
  if (!data.summary?.trim()) throw new Error('Summary required');
  if (!data.description?.trim()) throw new Error('Description required');
}

// ❌ DON'T: Send empty or invalid data
```

### 6. Environment Variables

```javascript
// ✅ DO: Use environment variables for API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ❌ DON'T: Hardcode URLs
// ❌ DON'T: Mix dev and prod URLs
```

---

## 🔧 Troubleshooting

### Issue: CORS Error

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Backend CORS is configured for your CLIENT_URL
- In `.env` on backend, ensure: `CLIENT_URL=http://localhost:3000`
- Verify backend is running before making requests

### Issue: 401 Unauthorized

**Problem:** Token is invalid or expired

**Solution:**
```javascript
if (response.status === 401) {
  localStorage.removeItem('adminToken');
  window.location.href = '/login';
}
```

### Issue: 404 Not Found

**Problem:** Endpoint doesn't exist

**Solution:**
- Verify endpoint path matches documentation
- Check HTTP method (GET, POST, PUT, DELETE)
- Verify resource ID is correct

### Issue: 429 Too Many Requests

**Problem:** Rate limit exceeded

**Solution:**
```javascript
// Implement exponential backoff
let retries = 0;
const maxRetries = 3;

async function retryFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries < maxRetries) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      return retryFetch(url, options);
    }
    throw err;
  }
}
```

### Issue: "Title is required" Error

**Problem:** Validation error from backend

**Solution:**
- Check all required fields are provided
- Verify fields are not empty or whitespace
- Check field names match documentation

Required fields by endpoint:
- **Services**: title, slug, summary, description
- **Blogs**: title, slug, excerpt, content
- **Case Studies**: title, slug, clientName, industry, service, challenge, solution
- **Testimonials**: name, role, quote, rating (1-5)

### Issue: Duplicate Slug Error (409)

**Problem:** Slug already exists for another item

**Solution:**
```javascript
// Generate unique slug automatically
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Or add timestamp/random suffix
const slug = generateSlug(title) + '-' + Date.now();
```

---

## 📞 API Reference Summary

| Feature | Endpoint | Method | Auth | Purpose |
|---------|----------|--------|------|---------|
| Health | `/health` | GET | No | Check server status |
| Login | `/auth/login` | POST | No | Admin authentication |
| Dashboard | `/admin/dashboard` | GET | Yes | View metrics & summary |
| Analytics | `/admin/analytics` | GET | Yes | View API usage stats |
| Services (Public) | `/services` | GET | No | List published services |
| Services (Admin) | `/services/admin/list` | GET | Yes | List all services |
| Service Detail | `/services/:slug` | GET | No | View single service |
| Create Service | `/services` | POST | Yes | Create new service |
| Update Service | `/services/:id` | PUT | Yes | Edit service |
| Delete Service | `/services/:id` | DELETE | Yes | Remove service |
| Leads (Submit) | `/leads` | POST | No | Submit lead form |
| Leads (Admin) | `/leads` | GET | Yes | View all leads |
| Update Lead | `/leads/:id/status` | PATCH | Yes | Change lead status |

---

## 🎯 Next Steps

1. **Clone/download the backend** from the repository
2. **Install dependencies**: `npm install`
3. **Configure `.env`** with MongoDB URI and JWT secret
4. **Start the server**: `npm run dev`
5. **Test endpoints** using the examples in this guide
6. **Integrate into your frontend** using provided code examples
7. **Deploy** when ready

---

**Last Updated:** August 13, 2026  
**Backend Version:** 1.0.0  
**Status:** ✅ Production Ready (57/57 tests passing)
