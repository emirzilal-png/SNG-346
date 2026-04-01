// src/middleware/validate.js

const { validationResult } = require("express-validator");

/**
 * validate – runs after express-validator chains and returns 422 if errors exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validate };
