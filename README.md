# Noakhali.net — Community Complaints Portal

A community complaints portal built with Next.js (App Router) and MongoDB.
Citizens submit complaints publicly; every complaint stays **Pending** until an
admin approves it, after which it appears in the public list and homepage stats.

## Tech stack

- Next.js 15 (App Router, TypeScript)
- MongoDB + Mongoose
- JWT authentication for admins (via `jose`), httpOnly cookie session
- Tailwind CSS
- Zod validation

## Features

- Public: submit a complaint, browse/search/filter approved complaints (paginated), view complaint detail
- Admin: JWT-based login, dashboard with counts, approve/reject/mark under review/resolve/delete complaints (paginated + searchable + filterable), manage other admin accounts (Super Admin only)
- No photo/file uploads — complaints are text-only by design

## 1. Prerequisites

- Node.js 18.18+ (20+ recommended)
- A MongoDB database — either:
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or
  - a local `mongod` instance

## 2. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/noakhali-net
JWT_SECRET=<a long random string>
ADMIN_NAME=Site Administrator
ADMIN_EMAIL=admin@noakhali.net
ADMIN_PASSWORD=<a strong password>
```

Generate a strong `JWT_SECRET`, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. Seed the first Super Admin

This creates the initial admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.
Run it once:

```bash
npm run seed
```

You can add more admins later from inside the app at `/admin/admins` (Super Admin only).

## 4. Run

```bash
npm run dev
```

Visit:
- `http://localhost:3000` — public site
- `http://localhost:3000/submit` — submit a complaint
- `http://localhost:3000/complaints` — browse approved complaints
- `http://localhost:3000/admin/login` — admin login

## 5. Production build

```bash
npm run build
npm start
```

## Project structure

```
app/
  page.tsx                 Home (hero, stats, recent complaints)
  submit/                  Public submit form
  complaints/               Public list + [id] detail
  admin/
    login/                 Admin login
    dashboard/             Stats + quick approve/reject
    complaints/            Full complaint management (paginated)
    admins/                Manage admin accounts (Super Admin only)
  api/
    complaints/            Public submit + list + detail
    stats/                 Public homepage counters
    admin/login|logout     Auth
    admin/complaints/      Admin list + update/delete
    admin/admins/          Admin account management
lib/
  mongodb.ts               Mongoose connection (cached)
  auth.ts                  JWT sign/verify helpers
  getCurrentAdmin.ts        Server-side helper to read the logged-in admin
  models/                  Admin.ts, Complaint.ts (Mongoose schemas)
  validation.ts             Zod schemas + shared constants
  pagination.ts             Pagination helpers
  rateLimit.ts               Basic in-memory rate limiter
middleware.ts                Protects /admin/* and /api/admin/* with JWT
components/                  Navbar, Footer, AdminNav, Pagination, StatusBadge, ComplaintCard
scripts/seed.ts               Creates the first Super Admin
```

## Notes / things to harden before production

- The rate limiter in `lib/rateLimit.ts` is in-memory and per-instance — swap for
  a shared store (e.g. Redis) if you deploy on multiple serverless instances.
- Consider adding email verification / invite-link flow for new admins instead of
  admin-set temporary passwords.
- Add automated tests and a CI pipeline before going live.
# noakhali.net
