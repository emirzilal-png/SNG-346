// src/routes/auth.js

const { Router } = require("express");
const { body } = require("express-validator");

const { register, login, logout, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["ORGANISER", "ATTENDEE"])
      .withMessage("Role must be ORGANISER or ATTENDEE"),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// POST /api/auth/logout
router.post("/logout", requireAuth, logout);

// GET /api/auth/me
router.get("/me", requireAuth, me);

module.exports = router;
