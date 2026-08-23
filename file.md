I’ll read `boostvertexpdf.md` and summarize its requirements, especially anything that affects the backend integration.

Read 

I read `boostvertexpdf.md`. This is the **final approved content**, and it supersedes the earlier handoff where information was still pending.

## What Must Be Updated in the Backend

### 1. Update `SiteSettings`

Replace the current placeholder defaults:

```text
phone: +1 (555) 123-4567
email: hello@boostvertex.com
address: Your business address
```

With the approved data:

```text
companyName: Boost Vertex
email: boostvertex@gmail.com
salesEmail: boostvertex@gmail.com
phone: 03032799987
whatsapp: 03032799987
address: Blue Area, Islamabad, Pakistan
workingHours: Monday–Saturday, 10:00 AM–7:00 PM
preferredContactMethod: WhatsApp
secondaryContactMethod: Phone Call
bookingUrl: unavailable
```

Update social links:

```text
facebook: https://www.facebook.com/adswithboostvertex
instagram: https://www.instagram.com/boostvertex
linkedin: https://www.linkedin.com/company/boost-vertex-pk/
```

The current backend does not yet support all these fields.

## 2. Update the Lead Model

The approved form has exactly these 7 fields:

1. Name
2. Business / Company Name
3. Email
4. Phone / WhatsApp
5. Service Required
6. Monthly Marketing Budget
7. Message / Business Requirement

The current `Lead` model already supports:

- `name`
- `email`
- `phone`
- `company`
- `serviceInterest`
- `message`

It still needs:

```text
monthlyBudget
```

Recommended allowed budget values:

```text
Under PKR 50,000
PKR 50,000–100,000
PKR 100,000–250,000
PKR 250,000–500,000
PKR 500,000+
```

The existing `source`, `status`, and `isRead` fields can remain for admin workflow purposes.

## 3. Update Services With Approved Content

The backend has six service records available conceptually:

- Meta Ads Management
- Lead Generation
- Google Ads
- YouTube Ads
- SEO
- Web Development

However, each service needs richer fields from the PDF:

```text
whoNeedsThisService
problemsWeSolve
approach
deliverables
expectedOutcomes
benefits
faqs
cta
primaryKeyword
secondaryKeywords
searchIntent
internalLinkingRecommendations
```

Each service should also contain:

```text
seoTitle
seoDescription
isPublished
sortOrder
isFeatured
```

Meta Ads and Lead Generation should have the highest `sortOrder` or `isFeatured: true`.

## 4. Add About Page Content

The approved founder story must be stored exactly as written:

```text
Founder: Tayyab Riaz
Role: Founder, Boost Vertex
```

The backend needs an About content endpoint:

```http
GET /api/site-content/about
PUT /api/site-content/about
```

Recommended fields:

```text
companyIntroduction
founderStory
mission
vision
coreValues
differentiation
founderName
founderTitle
founderPhoto
seoTitle
seoDescription
isPublished
```

Do not add a team collection because the PDF explicitly says not to add additional team members.

## 5. Add Industries

The backend needs an industry module for:

- Transport & Logistics
- Healthcare
- Technology / Software

Recommended fields:

```text
name
slug
description
relatedServices
relatedClients
relatedCaseStudies
seoTitle
seoDescription
isPublished
sortOrder
```

Recommended endpoints:

```http
GET /api/industries
GET /api/industries/:slug
GET /api/industries/admin/list
POST /api/industries
PUT /api/industries/:id
DELETE /api/industries/:id
```

Important: These are confirmed client industries, not the only industries Boost Vertex can serve.

## 6. Update Client Records

The approved client list now contains five clients:

1. MovePro Pakistan
2. Dr. Waqas Ahmad / Homoeopathic Centre Medicare
3. Whizpool
4. AH Interior
5. Mr. Ali — Software Company

The current backend does not have a dedicated client model. Client names are currently stored only inside case studies or testimonials.

Add a `Client` model with:

```text
name
slug
companyDescription
websiteUrl
logo
displayPermission
isPublished
sortOrder
```

Recommended endpoints:

```http
GET /api/clients
GET /api/clients/admin/list
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
```

Do not add any other client logos.

## 7. Update Testimonials

The PDF approves five testimonial drafts:

- Hasnain Ahmed — MovePro Pakistan
- Dr. Waqas Ahmad
- Muhammad Bilal — Whizpool
- AH Interior
- Mr. Ali — Software Company

The current testimonial model already supports:

```text
name
role
company
quote
rating
platform
isPublished
```

Add these fields:

```text
isDraft
isApproved
permissionGranted
reviewUrl
clientPhoto
clientLogo
```

Because the PDF says these are drafts subject to final wording approval, the records should initially use:

```text
isDraft: true
isApproved: false
```

The backend should not mark them as direct verified quotations until final approval is received.

## 8. Update Case Studies

The approved case studies are:

- MovePro Pakistan
- Dr. Waqas Ahmad
- Whizpool

The required structure is:

```text
Client
Service
Challenge
What We Did
Outcome
```

The current model has:

```text
clientName
industry
service
challenge
solution
results
testimonial
```

Rename or map `solution` to `whatWeDid` for frontend clarity. Add:

```text
cta
relatedServices
client
isFeatured
```

The approved service values should be:

```text
MovePro Pakistan: Meta Ads + Lead Generation
Dr. Waqas Ahmad: Lead Generation
Whizpool: Social Media Management / LinkedIn Content / Meta Ads
```

Do not add:

- Invented lead numbers
- ROAS
- CPL
- Revenue
- Percentage growth
- Campaign screenshots
- Google Analytics screenshots
- Google Search Console screenshots

## 9. Add Social Media Management Capability

The PDF mentions Social Media Management and LinkedIn Content for Whizpool.

These are not currently included in the approved six-service hierarchy. Therefore, the safest implementation is to store them as:

```text
relatedServices
capabilities
```

inside the Whizpool case study, rather than adding an unapproved seventh public service page.

## 10. Add Homepage Content

The backend currently has no dedicated homepage content endpoint.

Add:

```http
GET /api/site-content/homepage
PUT /api/site-content/homepage
```

The homepage content should include:

```text
heroTitle
heroDescription
primaryCtaText
primaryCtaAction
secondaryCtaText
servicesSection
whyBoostVertex
industries
clients
featuredCaseStudies
testimonials
finalCta
seoMetadata
```

Approved primary CTA:

```text
Get a Free Consultation
```

Approved CTA action:

```text
WhatsApp: 03032799987
```

Approved secondary CTA:

```text
Discuss Your Project
```

There is currently no Calendly link, so the backend should not expose a fake booking URL.

## 11. Add Media Support

The PDF says logos, project photos, campaign creatives, LinkedIn examples, videos, and icons may be supplied separately.

The backend currently has no media upload system.

It will eventually need:

- Image upload endpoint
- Logo upload support
- Client logo fields
- Testimonial photo fields
- Founder photo field
- Case study media fields
- File type validation
- File size limits
- Public media URLs
- Local or cloud storage

For the first implementation, media fields can be nullable so content integration is not blocked.

## 12. Add Legal Content Before Launch

The PDF says these are required before final launch:

- Privacy Policy
- Terms & Conditions
- Cookie Policy
- Disclaimer
- Contact/data consent wording
- Company registration details where required

The backend should eventually provide:

```http
GET /api/legal/privacy-policy
GET /api/legal/terms
GET /api/legal/cookie-policy
GET /api/legal/disclaimer
```

Do not invent the legal content. The legal documents must be supplied first.

## 13. Add Navigation and CTA Configuration

The approved navigation is:

```text
Home
Services
Industries
Case Studies
About
Contact
```

This can be stored in homepage or site settings:

```text
navigation
primaryCta
secondaryCta
```

The backend should expose the approved WhatsApp number consistently. A frontend should not have to hardcode it in multiple places.

## What Is Already Ready

The existing backend already supports:

- JWT admin authentication
- Public published content APIs
- Admin CRUD
- Pagination
- Admin filtering
- Case studies
- Testimonials
- Blog content
- Lead status tracking
- Site settings
- Rate limiting
- Analytics
- Request logging

## What Is Still Needed From the Client

Even though the PDF is approved, these assets/content are still not fully available in the backend:

- Official logo files
- Client logo files
- Founder photo
- Project photos
- LinkedIn content examples
- Campaign creatives
- Videos
- Additional logo variations
- Legal documents
- Company registration information
- Final client approval for testimonial wording

## Recommended Backend Implementation Order

1. Update `SiteSettings` with the approved contact and social information.
2. Add `monthlyBudget` to `Lead`.
3. Expand `Service` with the approved structured content fields.
4. Add `HomepageContent`.
5. Add `AboutContent`.
6. Add `Industry`.
7. Add `Client`.
8. Expand `Testimonial`.
9. Expand `CaseStudy`.
10. Add legal content endpoints.
11. Add media fields and upload support.
12. Seed all approved services, clients, testimonials, case studies, homepage data, and About content.
13. Add integration tests for the new frontend data contract.

The biggest immediate backend gaps are `monthlyBudget`, approved contact settings, homepage content, About content, industries, clients, richer service fields, and the five approved testimonial records.