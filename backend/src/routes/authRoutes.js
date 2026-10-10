import express from "express";
import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// POST /api/auth/register - Register a new user
// -------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password, phone, avatarUrl, inviteKey: rawInviteKey } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "Name, email, password, and phone number are required fields." });
  }

  const normalizedPhone = phone.replace(/\D/g, "");
  if (!/^\d{10}$/.test(normalizedPhone)) {
    return res.status(400).json({ error: "Phone number must contain exactly 10 digits." });
  }

  try {
    const inviteKey = rawInviteKey?.trim().toUpperCase() || null;
    const invitedMember = inviteKey
      ? await prisma.orgMember.findUnique({ where: { inviteKey } })
      : null;
    if (inviteKey && !invitedMember) return res.status(400).json({ error: "Invalid event invite key." });
    if (invitedMember?.userId) return res.status(409).json({ error: "This event invite key has already been used." });
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
        phone: normalizedPhone,
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

    if (invitedMember) {
      await prisma.orgMember.update({ where: { id: invitedMember.id }, data: { userId: user.id } });
      await prisma.eventMembership.upsert({
        where: { unique_event_user: { eventId: invitedMember.eventId, userId: user.id } },
        update: {},
        create: { eventId: invitedMember.eventId, userId: user.id, role: "participant" }
      });
    }

    const token = generateToken({ userId: user.id });

    return res.status(201).json({
      message: "User registered successfully.",
      user,
      token,
      joinedEventId: invitedMember?.eventId || null
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
