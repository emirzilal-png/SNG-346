// src/middleware/auth.js
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user)
    return res.status(401).json({ error: "Unauthorised: please log in" });
  next();
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.session || !req.session.user)
    return res.status(401).json({ error: "Unauthorised: please log in" });
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(req.session.user.role))
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  next();
};

module.exports = { requireAuth, requireRole };
