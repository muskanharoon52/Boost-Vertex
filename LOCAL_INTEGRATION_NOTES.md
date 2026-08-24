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

## 4. reCAPTCHA — disabled for local testing

reCAPTCHA is **OFF** locally, so `POST /api/leads` succeeds whether or not a token is sent. Confirmed: posting a lead **with** a dummy `recaptchaToken` returns `201` locally (the token is ignored, not verified against Google).

- Controlled by `RECAPTCHA_ENABLED` in `.env`, currently `false`.
- **Frontend site key** (for when you enable it — safe to embed in the frontend): `6LeZRJQtAAAAAAP-FPqKVcMg6OiAX7sa7UT_3cJOM`
- The **secret key stays server-side only** and is never needed by the frontend.

Enforcement logic (in `src/services/recaptchaService.js` → `isRecaptchaEnforced()`):
- `RECAPTCHA_ENABLED=true` → always enforce.
- `RECAPTCHA_ENABLED=false` → never enforce (current local setting).
- Unset → enforce only when `NODE_ENV=production` **and** a secret key is configured.

To exercise verification locally, set `RECAPTCHA_ENABLED=true` and provide a valid token from the widget; otherwise leave it `false`.

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

All of the above were smoke-tested live against the running server (login → token → dashboard, public lists non-empty, CORS from `:5173`, reCAPTCHA-off lead POST, lead pagination/filters/status/read) and pass.
