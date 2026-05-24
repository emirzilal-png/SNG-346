// src/routes/bookings.js
const { Router } = require("express");
const { body } = require("express-validator");
const { createBooking, getMyBookings, cancelBooking } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

router.post("/", requireRole("ATTENDEE"), [
  body("eventId").isInt({ min: 1 }).withMessage("eventId must be a positive integer"),
], validate, createBooking);

router.get("/my", requireRole("ATTENDEE"), getMyBookings);
router.delete("/:id", requireRole("ATTENDEE"), cancelBooking);

module.exports = router;
