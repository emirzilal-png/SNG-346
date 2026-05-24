// src/routes/auth.js
const { Router } = require("express");
const { body } = require("express-validator");
const { register, login, logout, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = Router();

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["ORGANISER", "ATTENDEE"]).withMessage("Role must be ORGANISER or ATTENDEE"),
], validate, register);

router.post("/login", [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
], validate, login);

router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;
