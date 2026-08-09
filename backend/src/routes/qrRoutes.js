import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// POST /api/qr/verify - Verify a participant's QR token
// -------------------------------------------------------------
router.post("/verify", authenticate, async (req, res) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return res.status(400).json({ error: "QR token is required for verification." });
  }

  try {
    const participant = await prisma.eventParticipant.findUnique({
      where: { qrToken },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true }
        },
        event: {
          select: { id: true, name: true, type: true, primaryLocation: true }
        }
      }
    });

    if (!participant) {
      return res.status(404).json({ valid: false, error: "Invalid QR token. Participant not found." });
    }

    return res.status(200).json({
      valid: true,
      participant: {
        id: participant.id,
        participantCode: participant.participantCode,
        checkInStatus: participant.checkInStatus,
        internalNotes: participant.internalNotes,
        user: participant.user,
        event: participant.event
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "QR verification failed.", details: error.message });
  }
});

export default router;
