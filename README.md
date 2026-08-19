# Job Application Tracker

A personal web application for tracking software engineering job applications. Built with React, NestJS, PostgreSQL, and Prisma.

## Project Structure

```
job_tracker/
├── backend/                 # NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Prisma migrations
│   └── src/
│       ├── applications/    # CRUD module
│       ├── dashboard/       # Stats & analytics
│       ├── prisma/          # Prisma service
│       └── common/          # Shared utilities
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── api/             # API client
│       ├── components/      # UI components
│       ├── pages/           # Route pages
│       ├── lib/             # Constants & utils
│       └── types/           # TypeScript types
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

## 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## 2. Set Up PostgreSQL

**Option A: Local PostgreSQL**

Create a database named `job_tracker`:

```bash
createdb job_tracker
```

**Option B: Docker**

```bash
docker run -d \
  --name job-tracker-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=job_tracker \
  -p 5433:5432 \
  postgres:16-alpine
```

## 3. Configure Environment Variables

**Backend** — copy and edit `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/job_tracker?schema=public"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
ADMIN_PASSWORD="your-strong-password"
JWT_SECRET="your-random-secret-at-least-32-characters"
```

> If using Docker on port 5433, update the URL to `localhost:5433`.

**Frontend** — copy and edit `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:3001/api
```

## 4. Run Database Migrations

```bash
cd backend
npm run prisma:migrate
```

## 5. Start the Backend

```bash
cd backend
npm run start:dev
```

API available at `http://localhost:3001/api`

## 6. Start the Frontend

```bash
cd frontend
npm run dev
```

App available at `http://localhost:5173` — you'll be prompted to sign in with your `ADMIN_PASSWORD`.

## Authentication

Single-user password auth protects all API routes and the frontend.

| Variable | Description |
|----------|-------------|
| `ADMIN_PASSWORD` | Plain-text password for login |
| `JWT_SECRET` | Secret used to sign session tokens (32+ random chars) |
| `ADMIN_PASSWORD_HASH` | Optional bcrypt hash instead of plain password |

**Login flow:** `POST /api/auth/login` with `{ "password": "..." }` → returns `{ "accessToken": "..." }`. All other endpoints require `Authorization: Bearer <token>`.

For production, prefer generating a bcrypt hash:

```bash
node -e "require('bcrypt').hash('your-password', 10).then(console.log)"
```

Set the output as `ADMIN_PASSWORD_HASH` and omit `ADMIN_PASSWORD`.

## API Endpoints

### Auth

| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | `/api/auth/login`  | Sign in (public)   |
| GET    | `/api/health`      | Health check (public) |

### Applications

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| GET    | `/api/applications`   | List with search/filter/sort   |
| GET    | `/api/applications/:id` | Get single application       |
| POST   | `/api/applications`   | Create application             |
| PATCH  | `/api/applications/:id` | Update application           |
| DELETE | `/api/applications/:id` | Delete application           |

**Query parameters for GET /applications:**

- `search` — filter by company or role
- `status` — filter by status enum
- `resumeType` — filter by resume type
- `source` — filter by source
- `sortBy` — `appliedAt` or `followUpDate`
- `sortOrder` — `asc` or `desc`
- `page`, `limit` — pagination

### Dashboard

| Method | Endpoint                              | Description                |
|--------|---------------------------------------|----------------------------|
| GET    | `/api/dashboard/stats`                | Summary stat cards         |
| GET    | `/api/dashboard/status-breakdown`     | Count by status            |
| GET    | `/api/dashboard/resume-type-breakdown`| Count by resume type     |
| GET    | `/api/dashboard/application-trend`  | Applications per month     |
| GET    | `/api/dashboard/follow-ups`           | Due today, overdue, upcoming |

## Architecture

```
┌─────────────┐     REST/JSON      ┌─────────────┐     Prisma ORM    ┌────────────┐
│   React     │ ◄──────────────► │   NestJS    │ ◄───────────────► │ PostgreSQL │
│  (Vite)     │   /api/*         │   API       │                   │            │
└─────────────┘                  └─────────────┘                   └────────────┘
```

- **Frontend**: React SPA with React Router, Tailwind CSS, and Recharts. Communicates with the backend via a typed fetch client. Vite dev server proxies `/api` to the backend.
- **Backend**: NestJS modules for applications (CRUD) and dashboard (aggregations). DTOs with class-validator for input validation. Global exception filter for consistent error responses.
- **Database**: PostgreSQL with Prisma ORM. Single `Application` model with enums for status, resume type, source, and current round. Indexed on `status`, `appliedAt`, `followUpDate`, and `company`.

## npm Scripts

### Backend

| Script                  | Description              |
|-------------------------|--------------------------|
| `npm run start:dev`     | Start with hot reload    |
| `npm run build`         | Compile TypeScript       |
| `npm run prisma:migrate`| Run migrations           |
| `npm run db:setup`      | Migrate database         |

### Frontend

| Script              | Description           |
|---------------------|-----------------------|
| `npm run dev`       | Start dev server      |
| `npm run build`     | Production build      |
| `npm run preview`   | Preview production    |

## Features

- Dashboard with stat cards, status/resume breakdown charts, application trend, and follow-up sections
- Applications table with search, filters, sorting, and pagination
- Add/edit application forms with validation
- Application detail view with quick status/round updates and delete confirmation
- Dedicated follow-ups page with overdue highlighting
- Toast notifications, loading/error/empty states
- Responsive sidebar navigation

## Deploy for Free (Public)

Yes — you can host this entirely on free tiers. Recommended stack:

| Layer    | Service | Free tier notes                          |
|----------|---------|------------------------------------------|
| Database | [Neon](https://neon.tech) | PostgreSQL, 0.5 GB, always free   |
| Backend  | [Render](https://render.com) | Web service; sleeps after ~15 min idle |
| Frontend | [Vercel](https://vercel.com) | Static hosting, always free       |

### Step 1 — Push to GitHub

```bash
cd job_tracker
git init
git add .
git commit -m "Job tracker app"
gh repo create job-tracker --public --source=. --push
```

### Step 2 — Create free PostgreSQL on Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project → copy the **connection string**
3. Append `?sslmode=require` if not present

### Step 3 — Deploy backend on Render

1. Sign up at [render.com](https://render.com) → **New → Blueprint**
2. Connect your GitHub repo (uses `render.yaml` in the repo root)
3. Set environment variables:
   - `DATABASE_URL` → your Neon connection string
   - `CORS_ORIGIN` → your Vercel URL (e.g. `https://job-tracker.vercel.app`)
   - `ADMIN_PASSWORD` → a strong password you'll use to sign in
   - `JWT_SECRET` → random 32+ character string
4. Deploy → note your API URL, e.g. `https://job-tracker-api.onrender.com`

> First request after idle may take ~30s (cold start on free tier).

### Step 4 — Deploy frontend on Vercel

1. Sign up at [vercel.com](https://vercel.com) → **Add New Project**
2. Import the GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` → `https://job-tracker-api.onrender.com/api`
4. Deploy → you get a public URL like `https://job-tracker.vercel.app`

### Step 5 — Update CORS

Go back to Render → your backend service → **Environment** → set:

```
CORS_ORIGIN=https://job-tracker.vercel.app
```

Redeploy the backend. Done — your app is live and public.

### Caveats (free tier)

- **Password auth** — single shared password protects the app. Use a strong password and prefer `ADMIN_PASSWORD_HASH` in production.
- **Render cold starts** — backend sleeps when unused; first load may be slow.
- **Neon limits** — 0.5 GB storage; plenty for a personal tracker.
