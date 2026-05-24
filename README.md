# SNG346 – Event Booking & Ticketing System (Full Stack)

## Team

| Student ID | Name |
|------------|------|
| 2587319    | Emir Zilal Dumancı  |

---

## Project Structure

```
event-booking-fullstack/
├── backend/                    # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js
│   │   │   ├── page.js
│   │   │   ├── login/page.js
│   │   │   ├── register/page.js
│   │   │   ├── events/
│   │   │   │   ├── page.js
│   │   │   │   ├── create/page.js
│   │   │   │   └── [id]/
│   │   │   │       ├── page.js
│   │   │   │       └── edit/page.js
│   │   │   ├── my-bookings/page.js
│   │   │   └── dashboard/page.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ui.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   └── lib/
│   │       └── api.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Backend    | Node.js, Express.js, Prisma ORM, SQLite  |
| Auth       | express-session + bcryptjs               |
| Frontend   | Next.js 14 (App Router), React 18        |
| Styling    | TailwindCSS                              |
| Deployment | Docker + Docker Compose                  |

---

## Local Development Setup (Without Docker)

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev          # runs on http://localhost:3001
```

### 2. Frontend (in a separate terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev          # runs on http://localhost:3000
```

Open http://localhost:3000 in your browser.

---

## Deployment Instructions (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports **3000** and **3001** must be free on your machine

### Step 1 — Clone the repository

```bash
git clone <your-repo-url>
cd event-booking-fullstack
```

### Step 2 — Configure environment variables (optional)

The defaults in `docker-compose.yml` work out of the box for local deployment.
To customise, open `docker-compose.yml` and edit the `environment` section of each service:

```yaml
# backend environment variables
SESSION_SECRET: "replace-with-a-long-random-string"
PORT: 3001
FRONTEND_URL: "http://localhost:3000"

# frontend environment variables
NEXT_PUBLIC_API_URL: "http://localhost:3001"
```

> ⚠️ In a real production environment, move secrets out of `docker-compose.yml`
> into a `.env` file and reference them with `${VARIABLE_NAME}`.

### Step 3 — Build and start all services

```bash
docker-compose up --build
```

Docker will:
1. Build the backend image (installs dependencies, generates Prisma client)
2. Build the frontend image (installs dependencies, runs `next build`)
3. Start both containers
4. Automatically run database migrations and seed on first boot

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:3001  |

### Step 4 — Verify it's running

```bash
docker ps
```

You should see two containers: `event-frontend` and `event-backend`.

Test the backend directly:
```bash
curl http://localhost:3001/api/events
```

### Stopping the application

```bash
# Stop containers (keeps database volume)
docker-compose down

# Stop containers AND delete the database
docker-compose down -v
```

### Rebuilding after code changes

```bash
docker-compose up --build
```

### Viewing logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

---

## Test Accounts (seeded automatically on first boot)

All accounts use password: **`password123`**

| Email              | Role       |
|--------------------|------------|
| alice@example.com  | ORGANISER  |
| bob@example.com    | ORGANISER  |
| carol@example.com  | ATTENDEE   |
| dave@example.com   | ATTENDEE   |
| eve@example.com    | ATTENDEE   |

---

## Frontend Pages

| Page                | URL               | Access           |
|---------------------|-------------------|------------------|
| Events list         | /events           | Public           |
| Event detail        | /events/:id       | Public           |
| Create event        | /events/create    | ORGANISER only   |
| Edit event          | /events/:id/edit  | ORGANISER (own)  |
| My bookings         | /my-bookings      | ATTENDEE only    |
| Organiser dashboard | /dashboard        | ORGANISER only   |
| Login               | /login            | Public           |
| Register            | /register         | Public           |

---

## Architecture

### Overview

```
Browser
  │
  ▼
Next.js Frontend (port 3000)
  │  fetch() with credentials: "include"
  ▼
Express Backend (port 3001)
  │  Prisma ORM
  ▼
SQLite Database (dev.db)
```

### API Integration
All backend calls are centralised in `src/lib/api.js`, which wraps `fetch` with:
- `credentials: "include"` to forward the session cookie automatically
- `Content-Type: application/json` header on every request
- Unified error handling — throws an `Error` with the server's message

### Authentication Flow
1. User submits login form → `POST /api/auth/login`
2. Backend validates credentials, creates a server-side session, returns a `connect.sid` cookie
3. Browser stores the cookie and sends it on every subsequent request automatically
4. `AuthContext` calls `GET /api/auth/me` on mount to rehydrate session state after page refresh
5. Logout → `POST /api/auth/logout` destroys the session and clears the cookie

### Protected Routes
- Frontend: each protected page checks `user` from `AuthContext` via `useEffect`; redirects with `useRouter` if the role doesn't match
- Backend: `requireAuth` middleware checks `req.session.user`; `requireRole("ORGANISER")` additionally checks the role

### Role-based UI
| Element               | ORGANISER | ATTENDEE | Guest |
|-----------------------|-----------|----------|-------|
| Navbar: Create Event  | ✅        | ❌       | ❌    |
| Navbar: Dashboard     | ✅        | ❌       | ❌    |
| Navbar: My Bookings   | ❌        | ✅       | ❌    |
| Book Ticket button    | ❌        | ✅       | 🔒 Login prompt |
| Edit / Delete event   | ✅ (own)  | ❌       | ❌    |

---

## API Documentation

Base URL: `http://localhost:3001/api`

### Auth

| Method | Route           | Body                              | Auth      | Response        |
|--------|-----------------|-----------------------------------|-----------|-----------------|
| POST   | /auth/register  | name, email, password, role       | Public    | 201 user object |
| POST   | /auth/login     | email, password                   | Public    | 200 user object |
| POST   | /auth/logout    | —                                 | Logged in | 200 message     |
| GET    | /auth/me        | —                                 | Logged in | 200 user object |

### Events

| Method | Route        | Body                                   | Auth       | Response           |
|--------|--------------|----------------------------------------|------------|--------------------|
| GET    | /events      | —                                      | Public     | 200 array          |
| GET    | /events/:id  | —                                      | Public     | 200 event          |
| POST   | /events      | title, description, dateTime, capacity | ORGANISER  | 201 event          |
| PUT    | /events/:id  | any subset of above fields             | ORGANISER  | 200 updated event  |
| DELETE | /events/:id  | —                                      | ORGANISER  | 200 message        |

### Bookings

| Method | Route          | Body    | Auth     | Response       |
|--------|----------------|---------|----------|----------------|
| POST   | /bookings      | eventId | ATTENDEE | 201 booking    |
| GET    | /bookings/my   | —       | ATTENDEE | 200 array      |
| DELETE | /bookings/:id  | —       | ATTENDEE | 200 message    |

### Dashboard

| Method | Route                          | Auth      | Response              |
|--------|--------------------------------|-----------|-----------------------|
| GET    | /dashboard                     | ORGANISER | 200 events + attendees |
| GET    | /dashboard/event/:id/attendees | ORGANISER | 200 attendee list     |

### HTTP Status Codes Used

| Code | Meaning                  |
|------|--------------------------|
| 200  | OK                       |
| 201  | Created                  |
| 401  | Unauthorised (not logged in) |
| 403  | Forbidden (wrong role or not owner) |
| 404  | Not found                |
| 409  | Conflict (duplicate booking / event full / capacity conflict) |
| 422  | Validation error         |
| 500  | Internal server error    |
