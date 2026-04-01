// src/routes/events.js

const { Router } = require("express");
const { body } = require("express-validator");

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

// GET /api/events  –  public
router.get("/", getAllEvents);

// GET /api/events/:id  –  public
router.get("/:id", getEventById);

// POST /api/events  –  organiser only
router.post(
  "/",
  requireRole("ORGANISER"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("dateTime").isISO8601().withMessage("dateTime must be a valid ISO 8601 date"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be a positive integer"),
  ],
  validate,
  createEvent
);

// PUT /api/events/:id  –  organiser only (ownership checked inside controller)
router.put(
  "/:id",
  requireRole("ORGANISER"),
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().trim().notEmpty().withMessage("Description cannot be empty"),
    body("dateTime").optional().isISO8601().withMessage("dateTime must be a valid ISO 8601 date"),
    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Capacity must be a positive integer"),
  ],
  validate,
  updateEvent
);

// DELETE /api/events/:id  –  organiser only (ownership checked inside controller)
router.delete("/:id", requireRole("ORGANISER"), deleteEvent);

module.exports = router;
