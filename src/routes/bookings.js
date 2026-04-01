// src/routes/bookings.js

const { Router } = require("express");
const { body } = require("express-validator");

const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

// POST /api/bookings  –  attendee only
router.post(
  "/",
  requireRole("ATTENDEE"),
  [body("eventId").isInt({ min: 1 }).withMessage("eventId must be a positive integer")],
  validate,
  createBooking
);

// GET /api/bookings/my  –  attendee only
router.get("/my", requireRole("ATTENDEE"), getMyBookings);

// DELETE /api/bookings/:id  –  attendee only (ownership checked inside controller)
router.delete("/:id", requireRole("ATTENDEE"), cancelBooking);

module.exports = router;
