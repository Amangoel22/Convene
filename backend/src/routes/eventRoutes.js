import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// GET /api/events - List events for authenticated user
// -------------------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    const memberships = await prisma.eventMembership.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            stages: { orderBy: { stageOrder: "asc" } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const events = memberships.map((m) => ({
      ...m.event,
      userRole: m.role
    }));

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch events.", details: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/events - Create a new event
// -------------------------------------------------------------
router.post("/", authenticate, async (req, res) => {
  const { name, type, startDate, endDate, startTime, endTime, durationDisplay, primaryLocation, stages } = req.body;

  if (!name || !type || !startDate || !endDate || !startTime || !endTime) {
    return res.status(400).json({ error: "Name, type, start/end dates, and times are required fields." });
  }

  try {
    const stagesToCreate = Array.isArray(stages)
      ? stages.map((stg, idx) => ({
          stageOrder: stg.order || idx + 1,
          title: stg.title,
          timeWindow: stg.timeWindow || `${stg.startTime || "09:00 AM"} – ${stg.endTime || "10:00 AM"}`,
          location: stg.location || primaryLocation || "",
          status: stg.status === "LIVE" ? "LIVE" : stg.status === "Completed" ? "Completed" : "Upcoming"
        }))
      : [];

    const event = await prisma.event.create({
      data: {
        name,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        durationDisplay: durationDisplay || "1 Day",
        primaryLocation: primaryLocation || "Main Venue",
        memberships: {
          create: {
            userId: req.user.id,
            role: "organizer"
          }
        },
        stages: {
          create: stagesToCreate
        }
      },
      include: {
        stages: { orderBy: { stageOrder: "asc" } }
      }
    });

    return res.status(201).json({ message: "Event created successfully.", event });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create event.", details: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/events/:eventId - Fetch event details
// -------------------------------------------------------------
router.get("/:eventId", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
      include: {
        participantTeams: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } } }
            }
          }
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
          }
        },
        stages: { orderBy: { stageOrder: "asc" } }
      }
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    return res.status(200).json({ event, userRole: req.eventMembership.role });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch event.", details: error.message });
  }
});

export default router;
