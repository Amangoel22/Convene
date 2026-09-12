import express from "express";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();
export const createQrToken = () => crypto.randomBytes(32).toString("hex");

router.post("/verify", authenticate, async (req, res) => {
  const { qrToken } = req.body;
  if (!qrToken) return res.status(400).json({ error: "QR token is required for verification." });
  try {
    const participant = await prisma.eventParticipant.findUnique({ where: { qrToken }, include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }, event: { select: { id: true, name: true, type: true, primaryLocation: true } } } });
    if (!participant) return res.status(404).json({ valid: false, error: "Invalid QR token." });
    const membership = await prisma.eventMembership.findUnique({ where: { unique_event_user: { eventId: participant.eventId, userId: req.user.id } } });
    if (!membership || membership.role !== "organizer") return res.status(403).json({ valid: false, error: "Only organizers of this event can verify entry QR codes." });
    return res.json({ valid: true, participant: { id: participant.id, participantCode: participant.participantCode, checkInStatus: participant.checkInStatus, internalNotes: participant.internalNotes, user: participant.user, event: participant.event } });
  } catch (error) { return res.status(500).json({ error: "QR verification failed.", details: error.message }); }
});
export default router;
