// src/routes/dashboard.js

const { Router } = require("express");

const { getOrgDashboard, getEventAttendees } = require("../controllers/dashboardController");
const { requireRole } = require("../middleware/auth");

const router = Router();

// GET /api/dashboard  –  organiser only
router.get("/", requireRole("ORGANISER"), getOrgDashboard);

// GET /api/dashboard/event/:id/attendees  –  organiser only
router.get("/event/:id/attendees", requireRole("ORGANISER"), getEventAttendees);

module.exports = router;
