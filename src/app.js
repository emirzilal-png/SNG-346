// src/app.js

const express = require("express");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ── Session configuration ─────────────────────────────────────────────────────
// NOTE: In production replace the default MemoryStore with a persistent store
// (e.g., connect-pg-simple for PostgreSQL) and use a strong SECRET from .env.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
