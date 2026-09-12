import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";

const router = express.Router();
function parseClock(dateValue, value) {
  const match = String(value || "09:00 AM").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const date = new Date(dateValue);
  if (!match) return date;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
  date.setHours(hour, Number(match[2]), 0, 0);
  return date;
}

router.get("/", authenticate, async (req, res) => {
  try {
    const memberships = await prisma.eventMembership.findMany({ where: { userId: req.user.id }, include: { event: { include: { stages: { orderBy: { stageOrder: "asc" } }, venues: { include: { images: { orderBy: { sortOrder: "asc" } } } } } } }, orderBy: { createdAt: "desc" } });
    return res.json({ events: memberships.map((membership) => ({ ...membership.event, userRole: membership.role })) });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch events.", details: error.message }); }
});

router.post("/", authenticate, async (req, res) => {
  const { name, type, startDate, endDate, startTime, endTime, durationDisplay, primaryLocation, stages } = req.body;
  if (!name || !type || !startDate || !endDate || !startTime || !endTime) return res.status(400).json({ error: "Name, type, dates, and times are required." });
  try {
    const event = await prisma.event.create({ data: { name, type, startDate: new Date(startDate), endDate: new Date(endDate), startTime, endTime, durationDisplay: durationDisplay || "1 Day", primaryLocation: primaryLocation || null, memberships: { create: { userId: req.user.id, role: "organizer" } }, ...(Array.isArray(stages) && stages.length > 0 ? { stages: { create: stages.map((stage, index) => ({ stageOrder: stage.order || index + 1, title: stage.title, startAt: stage.startAt ? new Date(stage.startAt) : parseClock(startDate, stage.startTime), endAt: stage.endAt ? new Date(stage.endAt) : parseClock(startDate, stage.endTime || "10:00 AM"), status: stage.status === "LIVE" ? "LIVE" : stage.status === "Completed" ? "Completed" : "Upcoming" })) } } : {}) }, include: { stages: { orderBy: { stageOrder: "asc" } } } });
    return res.status(201).json({ message: "Event created successfully.", event });
  } catch (error) { return res.status(500).json({ error: "Failed to create event.", details: error.message }); }
});

router.get("/:eventId", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.eventId }, include: { venues: { include: { images: { orderBy: { sortOrder: "asc" } } } }, participantTeams: { include: { members: { include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } } } } } }, participants: { include: { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } } } }, stages: { include: { venue: { include: { images: true } } }, orderBy: { stageOrder: "asc" } } } });
    if (!event) return res.status(404).json({ error: "Event not found." });
    return res.json({ event, userRole: req.eventMembership.role });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch event.", details: error.message }); }
});
export default router;
