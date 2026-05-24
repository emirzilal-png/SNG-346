// src/routes/dashboard.js
const { Router } = require("express");
const { getOrgDashboard, getEventAttendees } = require("../controllers/dashboardController");
const { requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", requireRole("ORGANISER"), getOrgDashboard);
router.get("/event/:id/attendees", requireRole("ORGANISER"), getEventAttendees);

module.exports = router;
