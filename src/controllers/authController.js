// src/controllers/authController.js

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Body: { name, email, password, role }
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Automatically log in after registration
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    return res.status(201).json({ message: "Registered successfully", user });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    return res.status(200).json({
      message: "Logged in successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

/**
 * GET /api/auth/me
 */
const me = (req, res) => {
  return res.status(200).json({ user: req.session.user });
};

module.exports = { register, login, logout, me };
