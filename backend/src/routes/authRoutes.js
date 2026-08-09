import express from "express";
import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// POST /api/auth/register - Register a new user
// -------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password, phone, avatarUrl } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required fields." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        avatarUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    const token = generateToken({ userId: user.id });

    return res.status(201).json({
      message: "User registered successfully.",
      user,
      token
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed.", details: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/auth/login - User Login
// -------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required fields." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = generateToken({ userId: user.id });

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed.", details: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/auth/me - Get Current Authenticated Profile
// -------------------------------------------------------------
router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({ user: req.user });
});

export default router;
