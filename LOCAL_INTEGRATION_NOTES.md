# Local Integration Notes — Boost Vertex Backend

Handoff for wiring the frontend to the backend locally. This covers the five items you raised, plus one important caveat about the test suite and the shared database.

**Base API URL:** `http://localhost:5000/api`
**Branch:** `naveed-updates` (clone/pull this, then `npm install`)

Quick start:

```bash
npm install
npm run seed:admin      # create/reset the admin login
npm run seed:content    # services, blogs, case studies, testimonials, site settings/content
npm run seed:leads      # 13 clearly-labelled test leads
npm run dev             # or: npm start  -> http://localhost:5000
```

The committed `.env` already points `MONGO_URI` at the shared Atlas database, so after cloning you can run the seeds and start the server without extra configuration.

---

## ⚠️ Important: the test suite wipes the shared database

Do **not** run `npm test` against the shared Atlas DB. Several suites call `deleteMany({})` with no filter in their setup/teardown (`admin-list`, `admin-crud`, `pagination`, `phase7-integration`), which **deletes all Services, Blogs, Case Studies, Testimonials, and Leads** in whatever database `MONGO_URI` points to. That is fine for a throwaway test DB, but it will empty the shared data you're testing against.

If you need to run the tests, point `MONGO_URI` at a local/scratch database first (e.g. `mongodb://localhost:27017/boostvertex_test`). If the shared data ever looks empty, just re-run the three seed commands above — they are idempotent and restore everything.

---

## 1. Seeded CMS + content records

All seeded with published/approved status so they appear on the public endpoints.

| Collection    | Count | Public endpoint            | Notes                                              |
|---------------|-------|----------------------------|----------------------------------------------------|
| Services      | 6     | `GET /api/services`        | `isPublished: true`                                |
| Blogs         | 4     | `GET /api/blogs`           | `isPublished: true` (Meta Ads, Lead Gen, Google Ads, SEO) |
| Case Studies  | 3     | `GET /api/case-studies`    | `isPublished: true`                                |
| Testimonials  | 5     | `GET /api/testimonials`    | `isDraft:false, isApproved:true, permissionGranted:true` |
| Site Settings | 1     | `GET /api/site-settings`   | Company/contact info + social links                |
| Site Content  | 2     | `GET /api/site-content/homepage`, `/about` | Homepage + About content              |
| Clients       | 9     | `GET /api/clients`         | `isPublished: true`                                |
| Industries    | 7     | `GET /api/industries`      | `isPublished: true`                                |

> Testimonials previously seeded as drafts, which is why `GET /api/testimonials` looked empty — the public endpoint filters `isDraft:false, isApproved:true, permissionGranted:true`. They are now approved and visible.

Re-run any time with `npm run seed:content`. Upserts are keyed by slug (name+company for testimonials), so re-running updates in place instead of duplicating.

---

## 2. Test leads (Lead List / filters / pagination / status / read-state)

`npm run seed:leads` inserts **13 clearly-labelled** leads. Every name is prefixed `Test Lead NN — …`, and every record has a `source` starting with `seed-test`, so they are easy to spot and to clean up:

- **Statuses covered:** `new` (3), `contacted` (3), `qualified` (3), `won` (2), `lost` (2) — all 5 enum values.
- **Read state:** mixed — 7 unread, 6 read.
- **Sources:** mostly `seed-test`, plus `seed-test-referral` and `seed-test-ad` (so you can test the `source` filter).
- **Service interest & monthly budget:** varied across all budget enum values.
- **`createdAt`:** back-dated across ~44 days so date-range filters and sorting are testable.
- **Count:** 13 leads = **2 pages** at the default list limit of 10.

Lead endpoints (all admin ones require the `Authorization: Bearer <token>` header):

| Method & path                         | Purpose                                                              |
|---------------------------------------|---------------------------------------------------------------------|
| `POST /api/leads`                     | Public — create a lead (contact form)                               |
| `GET  /api/leads`                     | Admin — list. Query: `page`, `limit`, `sort`, `status`, `isRead`, `source`, `q`, `dateFrom`, `dateTo` |
| `GET  /api/leads/export`              | Admin — CSV export (respects the same filters)                      |
| `PATCH /api/leads/:id/status`         | Admin — update status (body `{ "status": "contacted" }`)            |
| `PATCH /api/leads/:id/read`           | Admin — update read state (body `{ "isRead": true }`, or omit to toggle) |

List response shape: `{ "data": [ ...leads ], "pagination": { page, limit, total, totalPages } }`.

Clean up the seed leads later with `Lead.deleteMany({ source: /^seed-test/ })`.

---

## 3. `GET /api/admin/dashboard` — fixed

It was not a server-side failure (the endpoint returns **200** with a full body). The real cause was **CORS**: the backend only allowed `http://localhost:3000`, but your Vite dev server runs on `http://localhost:5173`. The browser blocked the response, which looks identical to "no response." See section 5 for the fix.

Verify it end-to-end:

```bash
# 1) Get a token
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"boostvertex@gmail.com","password":"admin123"}'
# -> { "token": "eyJhbG..." , ... }

# 2) Call the dashboard with the token
curl -s http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <PASTE_TOKEN_HERE>"
# -> 200 with { summary, recentLeads, recentContactMessages, recentContent, topServices }
```

**Admin login:** `boostvertex@gmail.com` / `admin123` (set via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`; `npm run seed:admin` resets it to these values).

---

## 4. reCAPTCHA — v2 Checkbox, enabled for local testing

The site key is registered as **reCAPTCHA v2 Checkbox** ("I'm not a robot"). Backend verification is now **ON** locally (`RECAPTCHA_ENABLED=true`), so `POST /api/leads` requires a valid v2 token. The frontend must mount the widget and send its token with the contact form.

**Keys:**
- **Site key** (public — embed in the frontend): `6LeZRJQtAAAAAAP-FPqKVcMg6OiAX7sa7UT_3cJOM`
- The **secret key stays server-side only** — never put it in frontend code.

**Allowed domains** (set on the key in the Google admin console): `www.boostvertex.online`, plus `localhost` for local testing. reCAPTCHA matches on hostname only, so `localhost` covers any port — `http://localhost:3000`, `:5173`, etc. all work.

### Frontend widget

Add the script once (e.g. in `index.html`):

```html
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
```

Render the checkbox inside the contact form:

```html
<div class="g-recaptcha" data-sitekey="6LeZRJQtAAAAAAP-FPqKVcMg6OiAX7sa7UT_3cJOM"></div>
```

On submit, read the token and send it with the lead. The token is available as `grecaptcha.getResponse()` (or from the hidden `g-recaptcha-response` field the widget injects):

```js
const token = grecaptcha.getResponse();          // '' if the user hasn't checked the box
if (!token) { /* block submit, show "please verify" */ }

await fetch('http://localhost:5000/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name, email, phone, company, serviceInterest, monthlyBudget, message,
    'g-recaptcha-response': token,   // or: recaptchaToken: token
  }),
});

grecaptcha.reset();   // tokens are single-use — reset the widget after every submit
```

The backend accepts the token under **either** field name: `g-recaptcha-response` (the widget's native name) or `recaptchaToken`.

### Backend behavior (`POST /api/leads`)

| Case | Response |
|------|----------|
| No token sent | `400 { message: "reCAPTCHA token is required" }` |
| Token fails Google verification | `403 { message: "reCAPTCHA verification failed", errors: [...] }` |
| Google siteverify unreachable | `503 { message: "reCAPTCHA verification service unavailable" }` |
| Valid token | `201` — lead created |

No lead is created unless verification passes. A v2 token is **single-use** and expires after ~2 minutes, so always `grecaptcha.reset()` after a submit and get a fresh token for the next one.

### Toggle & options (`.env`)

- `RECAPTCHA_ENABLED=true` → enforce (current setting). Set to `false` to bypass entirely for pure API testing without the widget.
- Unset → enforce only when `NODE_ENV=production` **and** a secret key is configured.
- Optional `RECAPTCHA_ALLOWED_HOSTNAMES=localhost,www.boostvertex.online` (comma-separated) adds a server-side hostname check on top of Google's verification. Leave it unset for local testing — the domain restriction on the key already covers this.

---

## 5. CORS — now allows your Vite origin

`src/app.js` previously hard-coded a single allowed origin (`CLIENT_URL` = `http://localhost:3000`). It now uses an allowlist:

- Any origin listed in `CLIENT_URL` / `CLIENT_URLS` (comma-separated) is allowed.
- In non-production, **any `localhost` / `127.0.0.1` port is auto-allowed** — so Vite `:5173`, Next `:3000`, etc. all work with no config.
- Requests with no `Origin` header (curl, Postman, server-to-server) are allowed.
- `credentials: true` is preserved and the specific origin is reflected back.

Confirmed: `OPTIONS` preflight and `GET` from `Origin: http://localhost:5173` both return `Access-Control-Allow-Origin: http://localhost:5173`.

No frontend change needed. If you deploy the frontend elsewhere, add that origin to `CLIENT_URLS` in the backend env.

---

## 6. CMS admin endpoints — confirmed ready

All modules follow the same REST pattern. Admin routes need `Authorization: Bearer <token>`; public GETs need nothing.

| Module        | Public list / read                          | Admin list                       | Create            | Update              | Delete               |
|---------------|---------------------------------------------|----------------------------------|-------------------|---------------------|----------------------|
| Services      | `GET /api/services`, `GET /api/services/:slug` | `GET /api/services/admin/list` | `POST /api/services` | `PUT /api/services/:id` | `DELETE /api/services/:id` |
| Blogs         | `GET /api/blogs`, `GET /api/blogs/:slug`    | `GET /api/blogs/admin/list`      | `POST /api/blogs` | `PUT /api/blogs/:id` | `DELETE /api/blogs/:id` |
| Case Studies  | `GET /api/case-studies`, `GET /api/case-studies/:slug` | `GET /api/case-studies/admin/list` | `POST /api/case-studies` | `PUT /api/case-studies/:id` | `DELETE /api/case-studies/:id` |
| Testimonials  | `GET /api/testimonials`                     | `GET /api/testimonials/admin/list` | `POST /api/testimonials` | `PUT /api/testimonials/:id` | `DELETE /api/testimonials/:id` |
| Site Settings | `GET /api/site-settings`                    | — (singleton)                    | —                 | `PUT /api/site-settings` | —                 |

Admin list endpoints support `page`, `limit`, `sort`, `q`, and module-specific filters (e.g. `isPublished`, `category`, `industry`, `rating`). Public list endpoints exclude unpublished records; admin list endpoints include them.

Related dashboard/analytics: `GET /api/admin/dashboard`, `GET /api/admin/analytics` (both admin-only).

All of the above were smoke-tested live against the running server (login → token → dashboard, public lists non-empty, CORS from `:5173`, reCAPTCHA v2 enforcement on lead POST — 400 without a token, 403 on an invalid one — lead pagination/filters/status/read) and pass.
