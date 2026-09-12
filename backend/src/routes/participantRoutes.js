import express from "express";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// POST /api/participants/:eventId/register - Register user as a participant for an event
// -------------------------------------------------------------
router.post("/:eventId/register", authenticate, async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Check if user is already registered for this event
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          eventId,
          userId: req.user.id
        }
      }
    });

    if (existingParticipant) {
      return res.status(409).json({
        message: "User is already registered for this event.",
        participant: existingParticipant
      });
    }

    // Generate unique QR token and participant code
    const qrToken = crypto.randomBytes(32).toString("hex");
    const participantCode = `PART-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create EventParticipant and EventMembership (role: participant) in a transaction
    const [participant] = await prisma.$transaction([
      prisma.eventParticipant.create({
        data: {
          eventId,
          userId: req.user.id,
          participantCode,
          qrToken,
          checkInStatus: "Confirmed"
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
        }
      }),
      prisma.eventMembership.upsert({
        where: {
          unique_event_user: { eventId, userId: req.user.id }
        },
        create: {
          eventId,
          userId: req.user.id,
          role: "participant"
        },
        update: {}
      })
    ]);

    return res.status(201).json({
      message: "Successfully registered for event.",
      participant
    });
  } catch (error) {
    return res.status(500).json({ error: "Event registration failed.", details: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/events/:eventId/participants - List event participants
// -------------------------------------------------------------
router.get("/:eventId/participants", authenticate, authorizeEventMembership(), async (req, res) => {
  const { checkInStatus } = req.query;

  try {
    const participants = await prisma.eventParticipant.findMany({
      where: {
        eventId: req.params.eventId,
        ...(checkInStatus && { checkInStatus })
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ participants });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch participants.", details: error.message });
  }
});

// -------------------------------------------------------------
// PATCH /api/event-participants/:id/status - Update check-in status (Organizers only)
// -------------------------------------------------------------
router.patch("/:id/status", authenticate, async (req, res) => {
  const { id } = req.params;
  const { checkInStatus } = req.body;

  if (!checkInStatus) {
    return res.status(400).json({ error: "checkInStatus is required." });
  }

  try {
    const participant = await prisma.eventParticipant.findUnique({ where: { id } });
    if (!participant) {
      return res.status(404).json({ error: "Participant not found." });
    }

    // Verify user is an organizer of this event
    const membership = await prisma.eventMembership.findUnique({
      where: {
        unique_event_user: {
          eventId: participant.eventId,
          userId: req.user.id
        }
      }
    });

    if (!membership || membership.role !== "organizer") {
      return res.status(403).json({ error: "Access denied. Only organizers can modify participant status." });
    }

    const updated = await prisma.eventParticipant.update({
      where: { id },
      data: { checkInStatus }
    });

    return res.status(200).json({ message: "Check-in status updated successfully.", participant: updated });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update participant status.", details: error.message });
  }
});

export default router;
