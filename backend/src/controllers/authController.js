// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.status(201).json({ message: "Registered successfully", user });
  } catch (e) { console.error(e); return res.status(500).json({ error: "Internal server error" }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.status(200).json({ message: "Logged in", user: req.session.user });
  } catch (e) { console.error(e); return res.status(500).json({ error: "Internal server error" }); }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Could not log out" });
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "Logged out" });
  });
};

const me = (req, res) => res.status(200).json({ user: req.session.user });

module.exports = { register, login, logout, me };
