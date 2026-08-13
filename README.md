# Boost Vertex Marketing Agency Website

A premium, scalable, and conversion-focused marketing agency website built with the **MERN stack** — MongoDB, Express.js, React.js, and Node.js.

The platform is designed to strengthen Boost Vertex's digital presence, showcase services and results, generate qualified leads, publish SEO-focused content, and provide a secure admin dashboard for managing website content and leads.

> **Project:** Boost Vertex Marketing Agency Website
> **Version:** 1.0
> **Stack:** MERN
> **Prepared by:** Muskan Haroon — Full Stack Web Developer
> **Date:** August 2026

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Objectives](#-objectives)
* [Key Features](#-key-features)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Website Pages](#-website-pages)
* [Lead Management](#-lead-management)
* [CMS & Admin Dashboard](#-cms--admin-dashboard)
* [SEO](#-seo)
* [Performance](#-performance)
* [Security](#-security)
* [Responsive Design](#-responsive-design)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Development Workflow](#-development-workflow)
* [Git Workflow](#-git-workflow)
* [Deployment](#-deployment)
* [Future Scope](#-future-scope)
* [Expected Outcome](#-expected-outcome)
* [Contributors](#-contributors)

---

## 🚀 Overview

**Boost Vertex Marketing Agency Website** is a full-stack marketing website developed to serve as the primary digital platform for Boost Vertex.

The website focuses on three core goals:

1. **Build brand trust** through professional design, testimonials, client logos, awards, and measurable case studies.
2. **Generate leads** through contact forms, booking workflows, phone/chat options, and strong calls-to-action.
3. **Support long-term organic growth** through SEO-optimized service pages, case studies, blogs, FAQs, and structured content.

The system consists of a public-facing website, lead-capture workflow, CMS-driven content management system, and secure admin dashboard.

---

## 🎯 Objectives

The project aims to:

* Establish a strong and professional online presence for Boost Vertex.
* Present marketing services in a clear and conversion-focused way.
* Showcase client results and case studies.
* Generate and manage potential client leads.
* Allow non-technical staff to manage website content.
* Provide an SEO-friendly architecture.
* Maintain strong performance and Core Web Vitals.
* Provide secure administrator authentication.
* Deliver a responsive experience across desktop, tablet, and mobile devices.
* Create a scalable foundation for future business features.

---

## ✨ Key Features

### 🌐 Public Website

* Premium marketing agency homepage
* About page
* Services pages
* Case studies
* Blog / Resources
* Industry landing pages
* Contact page
* Privacy Policy
* Thank You page
* Responsive navigation
* Strong CTA sections
* Client logo strip
* Testimonials
* Awards and trust indicators
* Results-focused content

### 📩 Lead Capture

* Contact forms
* Inline hero lead capture
* Call-to-action buttons
* Phone contact
* Chat/contact options
* Booking integration
* Calendly or equivalent scheduler
* reCAPTCHA spam protection
* MongoDB lead storage
* Email notifications through Nodemailer

### 📝 CMS

Administrators can manage:

* Services
* Case studies
* Blog posts
* Testimonials
* Client logos
* Site settings
* SEO metadata
* FAQs

### 🔐 Admin Dashboard

* Secure admin login
* JWT authentication
* bcrypt password hashing
* Protected admin routes
* Content CRUD operations
* Lead management
* Lead filtering
* Lead status management
* Lead export
* Media/image management
* SEO metadata management
* Analytics summary

### 🔎 SEO

* XML sitemap
* robots.txt
* Semantic HTML
* Structured data
* Organization schema
* LocalBusiness schema
* Service schema
* FAQPage schema
* Review schema
* Unique page titles
* Meta descriptions
* Canonical URLs
* Internal linking
* SEO-friendly service URLs
* Image alt text
* Google Search Console integration
* Google Analytics 4 integration

### 📱 Responsive Design

The website follows a mobile-first approach with support for:

* Small phones
* Large phones
* Tablets
* Laptops
* Desktop monitors
* Large screens

Mobile-specific features include:

* Hamburger navigation
* Sticky contact bar
* Large tap targets
* Horizontal-scroll content where appropriate
* Mobile-friendly forms
* No horizontal overflow

---

## 🛠 Technology Stack

| Layer            | Technology            |
| ---------------- | --------------------- |
| Frontend         | React.js              |
| Backend          | Node.js               |
| API              | Express.js            |
| Database         | MongoDB               |
| ODM              | Mongoose              |
| Authentication   | JWT + bcrypt          |
| Email            | Nodemailer            |
| CAPTCHA          | reCAPTCHA             |
| Analytics        | Google Analytics 4    |
| Search Analytics | Google Search Console |
| Scheduler        | Calendly / Equivalent |
| Version Control  | Git + GitHub          |
| Deployment       | Vercel                |

The SRS defines the architecture as a three-tier system consisting of a React client, Express/Node REST API, and MongoDB database.

---

## 🏗 System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Client   │
                    │      Web Browser     │
                    └──────────┬───────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │     React.js         │
                    │      Frontend        │
                    │                      │
                    │ UI / Pages / Forms   │
                    │ SEO / Responsive UI  │
                    └──────────┬───────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express.js │
                    │      Backend         │
                    │                      │
                    │ Authentication       │
                    │ Business Logic       │
                    │ Lead Handling        │
                    │ Content CRUD         │
                    │ Email Services       │
                    └──────────┬───────────┘
                               │
                         Mongoose / Driver
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │      Database        │
                    │                      │
                    │ Leads                │
                    │ Services             │
                    │ Case Studies         │
                    │ Blogs                │
                    │ Testimonials         │
                    │ Site Settings        │
                    └──────────────────────┘
```

---

## 📁 Project Structure

A recommended structure for the MERN implementation is:

```text
boost-vertex-website/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── sections/
│       ├── hooks/
│       ├── services/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .gitignore
├── README.md
└── package.json
```

> The exact folder structure may evolve during implementation while maintaining a clean separation between frontend, backend, and database layers.

---

# 🌐 Website Pages

## Home

The homepage includes:

1. Header
2. Hero section
3. Trust / award strip
4. Client logo strip
5. Services overview
6. Results / case studies
7. Process section
8. Testimonials
9. Secondary CTA
10. Footer

The hero section includes an outcome-driven headline, supporting content, primary and secondary CTAs, supporting visuals, and an inline lead capture form.

---

## About

The About page contains:

* Founding story
* Mission
* Team
* Team member bios
* Culture
* Values
* Careers link

---

## Services

Each core service receives its own dedicated page.

The service template follows:

```text
Problem
   ↓
Approach
   ↓
Deliverables
   ↓
Results
   ↓
FAQ
   ↓
CTA
```

Each service has a unique SEO-friendly URL such as:

```text
/services/seo
/services/ppc
```

---

## Case Studies

Case studies demonstrate real client outcomes through:

* Client challenge
* Strategy
* Execution
* Results
* Measurable metrics
* Testimonials
* Related case studies

The system is designed to avoid generic claims and emphasize measurable business results.

---

## Blog / Resources

The blog is CMS-driven and supports:

* Articles
* Categories
* Tags
* Featured images
* Pagination
* SEO metadata
* Search-oriented content strategy

---

## Industry Landing Pages

Industry-specific landing pages can target verticals such as:

```text
/marketing-for-real-estate
```

These pages reuse the agency's core offers while adapting messaging, vocabulary, and case studies for specific industries.

---

## Contact

The Contact page includes:

* Contact form
* Phone
* Email
* Calendar booking
* Embedded map where applicable
* Lead capture
* reCAPTCHA

---

# 📩 Lead Management

Lead submissions are stored in MongoDB and routed through the email workflow.

```text
Visitor
   │
   ▼
Contact / Lead Form
   │
   ▼
reCAPTCHA Validation
   │
   ▼
Express API
   │
   ├──────────────► MongoDB
   │                  │
   │                  ▼
   │               Lead Record
   │
   └──────────────► Nodemailer
                      │
                      ▼
                  Staff Inbox
```

The SRS requires contact submissions to be stored in a `leads` collection and routed through email notification.

---

# 📝 CMS & Admin Dashboard

The admin dashboard provides content management without requiring developers to manually modify website code.

### Manage Services

* Title
* Slug
* Content
* SEO metadata
* FAQs

### Manage Case Studies

* Title
* Slug
* Industry
* Service
* Metrics
* Content
* Client information

### Manage Blog Posts

* Title
* Slug
* Category
* Tags
* Content
* Featured image

### Manage Testimonials

* Name
* Role
* Quote
* Rating
* Review platform

### Manage Client Logos

* Client name
* Logo/image

### Site Settings

* Company name
* Phone
* Email
* Address
* Social links
* NAP information

### Lead Management

Administrators can:

* View leads
* Filter leads
* Update lead status
* Export leads
* Track submissions

These CMS and dashboard capabilities are defined in the project's SRS.

---

# 🔎 SEO

SEO is treated as a core part of the application rather than a post-development addition.

### Technical SEO

* XML sitemap
* robots.txt
* Crawlable pages
* Structured data
* Semantic HTML
* Google Search Console
* Google Analytics 4

### On-Page SEO

* Unique title tags
* Meta descriptions
* H1/H2 hierarchy
* Internal linking
* Keyword-aligned URLs
* Descriptive image alt text
* Canonical URLs

### Structured Data

The implementation plans support:

* Organization
* LocalBusiness
* Service
* FAQPage
* Review

### Content Strategy

The planned content strategy includes:

* Long-tail keyword targeting
* Service-focused content
* FAQs
* Case studies
* Regular blog publishing

The SRS specifies 2–4 blog posts per month and deep service pages of approximately 800–1,500+ words.

---

# ⚡ Performance

The application targets the following Core Web Vitals:

| Metric |    Target |
| ------ | --------: |
| LCP    |  `< 2.5s` |
| CLS    |   `< 0.1` |
| INP    | `< 200ms` |

Performance practices include:

* Image compression
* WebP images
* Lazy loading
* CSS/JS minification
* Optimized assets
* Responsive images
* Efficient component architecture

These performance requirements are explicitly defined in the SRS.

---

# 🔐 Security

The project follows security practices including:

* JWT-based authentication
* bcrypt password hashing
* Protected admin routes
* Input validation
* Input sanitization
* reCAPTCHA
* Environment variables for secrets
* Secure API endpoints
* No credentials committed to Git
* Cookie consent support

### Important

Never commit:

```text
.env
.env.local
.env.production
```

or any file containing:

```text
MongoDB credentials
JWT secrets
SMTP credentials
API keys
reCAPTCHA secrets
```

The SRS explicitly requires sensitive credentials to remain outside the repository through environment variables.

---

# 📱 Responsive Design

The website is designed around a mobile-first approach.

| Breakpoint    | Target                       |
| ------------- | ---------------------------- |
| `< 480px`     | Small phones                 |
| `480–768px`   | Large phones / small tablets |
| `768–1024px`  | Tablets                      |
| `1024–1440px` | Laptops / desktops           |
| `> 1440px`    | Large monitors               |

Mobile requirements include:

* Minimum `44 × 44px` tap targets
* Sticky bottom contact bar
* Hamburger navigation
* Mobile-friendly forms
* Horizontal-scroll carousels where appropriate
* No horizontal overflow
* Testing on real iOS and Android devices

---

# ⚙️ Getting Started

## 1. Clone the Repository

```bash
git clone <repository-url>
cd boost-vertex-website
```

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ../server
npm install
```

---

## 3. Configure Environment Variables

Create environment files for the frontend and backend.

Example:

```text
server/.env
client/.env
```

Add the required variables as described in the [Environment Variables](#-environment-variables) section.

---

## 4. Start MongoDB

Make sure your MongoDB database is available.

The backend should connect using the configured MongoDB connection string.

---

## 5. Start the Backend

```bash
cd server
npm run dev
```

---

## 6. Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

---

## 7. Open the Application

Use the local URL provided by your frontend development server, typically:

```text
http://localhost:5173
```

The backend API will run on the configured server port.

---

# 🔑 Environment Variables

Example backend configuration:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

RECAPTCHA_SECRET_KEY=your_recaptcha_secret

CLIENT_URL=http://localhost:5173
```

Example frontend configuration:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

> Use the actual variable names defined in the implementation. Do not commit real credentials.

---

# 🔄 Development Workflow

The project follows this development sequence:

```text
Requirements
     ↓
Wireframes
     ↓
UI Design
     ↓
Frontend Development
     ↓
Backend Development
     ↓
MongoDB Integration
     ↓
Testing
     ↓
SEO
     ↓
Deployment
     ↓
Maintenance
```

The SRS defines this as the project's development workflow.

---

# 🌿 Git Workflow

Development should follow a feature-branch workflow.

### Create a branch

```bash
git checkout -b feature/your-feature-name
```

### Check changes

```bash
git status
```

### Stage changes

```bash
git add .
```

### Commit

```bash
git commit -m "feat: add service management"
```

### Push

```bash
git push origin feature/your-feature-name
```

### Pull Request

Create a Pull Request into the main development branch.

### Recommended Commit Convention

```text
feat: new feature
fix: bug fix
docs: documentation
style: styling changes
refactor: code restructuring
test: testing
chore: maintenance
```

---

# 🚀 Deployment

The planned deployment target is **Vercel**.

Before production deployment:

* Configure production environment variables.
* Connect MongoDB.
* Configure API URLs.
* Configure SMTP.
* Configure reCAPTCHA.
* Configure Google Analytics 4.
* Configure Google Search Console.
* Verify sitemap.
* Verify robots.txt.
* Test all forms.
* Test admin authentication.
* Test mobile responsiveness.
* Test Core Web Vitals.
* Test real devices.

The project SRS specifies Vercel as the deployment target.

---

# 🧪 Testing Checklist

Before production launch, verify:

### Frontend

* [ ] All pages load correctly
* [ ] Navigation works
* [ ] Forms work
* [ ] CTAs work
* [ ] Responsive layout works
* [ ] No horizontal overflow
* [ ] Images load correctly
* [ ] Animations work correctly

### Backend

* [ ] API endpoints work
* [ ] Authentication works
* [ ] Protected routes work
* [ ] Validation works
* [ ] Error handling works
* [ ] Email notifications work
* [ ] Lead storage works

### Admin

* [ ] Login works
* [ ] CRUD operations work
* [ ] Lead management works
* [ ] Media uploads work
* [ ] SEO metadata management works

### SEO

* [ ] Sitemap works
* [ ] robots.txt works
* [ ] Meta titles exist
* [ ] Meta descriptions exist
* [ ] Canonical URLs exist
* [ ] Structured data works
* [ ] Google Search Console is configured

### Performance

* [ ] LCP < 2.5s
* [ ] CLS < 0.1
* [ ] INP < 200ms
* [ ] Images optimized
* [ ] Lazy loading implemented

---

# 🔮 Future Scope

The following features are planned for a potential Phase 2:

* Live chat widget
* Interactive website grader / SEO audit tool
* Client login portal
* Project management portal
* Dynamic ROI calculator
* Pricing calculator
* Video testimonials
* Founder video
* Multi-location landing pages
* Newsletter automation
* Email nurture sequences
* Ballpark pricing ranges
* Named engagement models

These features are intentionally deferred from the initial implementation.

---

# 🎯 Expected Outcome

The completed platform should provide Boost Vertex with a:

* Professional brand presence
* High-performance website
* SEO-friendly architecture
* Lead-generation system
* Content management platform
* Secure administration system
* Scalable technical foundation
* Mobile-first user experience

Ultimately, the website should help Boost Vertex **build trust, attract qualified prospects, convert visitors into clients, and support long-term business growth**.

---

# 👩‍💻 Contributors

### Team Lead / Full Stack Web Developer

**Muskan Haroon**

Responsible for project planning, requirements, architecture, development coordination, and implementation.

---

## 📄 Project Documentation

The complete project requirements are documented in the **Software Requirements Specification (SRS) v1.0**, which serves as the primary reference for design, development, testing, SEO, administration, and deployment.

---

## 📜 License

This project is proprietary software developed for **Boost Vertex Marketing Agency**.

Unauthorized copying, redistribution, or commercial reuse of the project, design, content, or source code is not permitted without appropriate authorization.

---

<p align="center">
  <strong>Boost Vertex Marketing Agency</strong><br>
  Marketing that moves the needle, not just the metrics.
</p>
