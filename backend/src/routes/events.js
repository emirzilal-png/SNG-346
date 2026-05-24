// src/routes/events.js
const { Router } = require("express");
const { body } = require("express-validator");
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require("../controllers/eventController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);

router.post("/", requireRole("ORGANISER"), [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("dateTime").isISO8601().withMessage("dateTime must be a valid ISO 8601 date"),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
], validate, createEvent);

router.put("/:id", requireRole("ORGANISER"), [
  body("title").optional().trim().notEmpty(),
  body("description").optional().trim().notEmpty(),
  body("dateTime").optional().isISO8601(),
  body("capacity").optional().isInt({ min: 1 }),
], validate, updateEvent);

router.delete("/:id", requireRole("ORGANISER"), deleteEvent);

module.exports = router;
