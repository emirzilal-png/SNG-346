# SNG346 – Event Booking & Ticketing System (Backend)
# Emir Zilal Dumancı - 2587319

---

## Tech Stack

| Layer           | Technology                    |
|-----------------|-------------------------------|
| Runtime         | Node.js                       |
| Framework       | Express.js                    |
| ORM             | Prisma                        |
| Database        | SQLite (dev)                  |
| Auth            | express-session + bcryptjs    |
| Validation      | express-validator             |

---

## Architecture

```
event-booking-backend/
├── prisma/
│   ├── schema.prisma      # Data models (User, Event, Booking)
│   └── seed.js            # Sample data seed script
├── src/
│   ├── app.js             # Express app (middleware + routes)
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── bookingController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js        # requireAuth, requireRole
│   │   └── validate.js    # express-validator error handler
│   └── routes/
│       ├── auth.js
│       ├── events.js
│       ├── bookings.js
│       └── dashboard.js
├── server.js              # Entry point
├── .env.example
└── package.json
```

**Separation of concerns:** Routes handle HTTP and validation. Controllers contain business logic. Middleware handles cross-cutting concerns (auth, validation). Prisma Client is the only data-access layer.

---

## Setup Instructions

### 1. Clone & install

```bash
git clone <your-repo-url>
cd event-booking-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for development)
```

### 3. Run migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed the database

```bash
node prisma/seed.js
```

### 5. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:3000** by default.

### Useful scripts

| Script            | Description                            |
|-------------------|----------------------------------------|
| `npm run dev`     | Start with nodemon (hot reload)        |
| `npm start`       | Start without nodemon                  |
| `npm run db:seed` | Re-seed the database                   |
| `npm run db:reset`| Reset DB, run migrations, and seed     |
| `npm run db:studio` | Open Prisma Studio (GUI)             |

---

## Test Accounts (after seeding)

All accounts use password: **`password123`**

| Email                | Role       |
|----------------------|------------|
| emirr@example.com    | ORGANISER  |
| bob@example.com      | ORGANISER  |
| carol@example.com    | ATTENDEE   |
| dave@example.com     | ATTENDEE   |
| eve@example.com      | ATTENDEE   |

---

## API Documentation

Base URL: `http://localhost:3000/api`

---

### Auth

#### `POST /auth/register`
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "ATTENDEE"
}
```
`role` must be `"ORGANISER"` or `"ATTENDEE"`.

**Responses:** `201 Created` | `409 Conflict` (email in use) | `422 Unprocessable Entity` (validation)

---

#### `POST /auth/login`
Log in and start a session.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Responses:** `200 OK` | `401 Unauthorized`

---

#### `POST /auth/logout`
🔒 Requires login. Destroys the session.

**Responses:** `200 OK`

---

#### `GET /auth/me`
🔒 Requires login. Returns the current session user.

**Responses:** `200 OK` | `401 Unauthorized`

---

### Events

#### `GET /events`
Public. Returns all events with booking counts and spots left.

**Response:** `200 OK` – array of event objects.

---

#### `GET /events/:id`
Public. Returns a single event by ID.

**Responses:** `200 OK` | `404 Not Found`

---

#### `POST /events`
🔒 ORGANISER only. Create a new event.

**Body:**
```json
{
  "title": "Tech Conference",
  "description": "Annual tech event.",
  "dateTime": "2026-09-01T09:00:00Z",
  "capacity": 50
}
```

**Responses:** `201 Created` | `401` | `403` | `422`

---

#### `PUT /events/:id`
🔒 ORGANISER only (must own the event). All fields optional.

**Body:**
```json
{
  "title": "Updated Title",
  "capacity": 100
}
```

**Responses:** `200 OK` | `403 Forbidden` | `404 Not Found` | `409 Conflict` (capacity < existing bookings)

---

#### `DELETE /events/:id`
🔒 ORGANISER only (must own the event). Deletes the event and all its bookings.

**Responses:** `200 OK` | `403 Forbidden` | `404 Not Found`

---

### Bookings

#### `POST /bookings`
🔒 ATTENDEE only. Book a ticket.

**Body:**
```json
{ "eventId": 1 }
```

**Responses:** `201 Created` | `409 Conflict` (full or duplicate) | `404 Not Found`

---

#### `GET /bookings/my`
🔒 ATTENDEE only. List the current user's bookings.

**Response:** `200 OK` – array of bookings with event details.

---

#### `DELETE /bookings/:id`
🔒 ATTENDEE only (must own the booking). Cancel a booking.

**Responses:** `200 OK` | `403 Forbidden` | `404 Not Found`

---

### Dashboard

#### `GET /dashboard`
🔒 ORGANISER only. Summary of all their events: tickets sold and attendee lists.

**Response:**
```json
{
  "organiser": "Alice Organiser",
  "events": [
    {
      "id": 1,
      "title": "Tech Conference",
      "capacity": 50,
      "ticketsSold": 10,
      "spotsLeft": 40,
      "attendees": [...]
    }
  ]
}
```

---

#### `GET /dashboard/event/:id/attendees`
🔒 ORGANISER only (must own the event). Detailed attendee list for one event.

**Responses:** `200 OK` | `403 Forbidden` | `404 Not Found`

---

## Authentication Flow

1. Client sends `POST /auth/login` with credentials.
2. Server validates credentials, creates a session, and sets a `connect.sid` cookie.
3. All subsequent requests automatically include the cookie (handled by the browser / HTTP client).
4. Protected routes check `req.session.user`; if absent → `401`.
5. Role-protected routes additionally check `req.session.user.role` → `403` if wrong role.
6. `POST /auth/logout` calls `req.session.destroy()` and clears the cookie.

---

## Data Modelling

```
User          Event         Booking
────────      ─────────     ──────────
id            id            id
name          title         userId  → User.id
email         description   eventId → Event.id
password      dateTime      createdAt
role          capacity
createdAt     organiserId → User.id
              createdAt
              updatedAt
```

- A `User` with role `ORGANISER` can own many `Event`s.
- A `User` with role `ATTENDEE` can have many `Booking`s.
- A `Booking` links one `User` to one `Event` (unique constraint prevents duplicates).
- Overbooking is prevented by comparing `bookings.count` against `event.capacity` before inserting.
