import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership, authorizeOrgLead } from "../middlewares/auth.js";

const router = express.Router();

function parseTimeWindow(eventDate, timeWindow) {
  const [start, end] = String(timeWindow || "09:00 AM – 10:00 AM").split(/[–—-]/).map((v) => v.trim());
  const parse = (value) => {
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return new Date(eventDate);
    let hour = Number(match[1]);
    if (match[3].toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (match[3].toUpperCase() === "AM" && hour === 12) hour = 0;
    const date = new Date(eventDate);
    date.setHours(hour, Number(match[2]), 0, 0);
    return date;
  };
  return { startAt: parse(start), endAt: parse(end) };
}

function serializeStage(stage) {
  return { ...stage, timeWindow: `${stage.startAt.toISOString()} – ${stage.endAt.toISOString()}`, location: stage.venue?.name || "" };
}

async function resolveVenue(eventId, venueId, location) {
  if (venueId) return { connect: { id: venueId } };
  if (!location) return undefined;
  const venue = await prisma.venue.upsert({ where: { unique_event_venue_name: { eventId, name: location } }, create: { eventId, name: location }, update: {} });
  return { connect: { id: venue.id } };
}

router.get("/:eventId/stages", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const stages = await prisma.stage.findMany({ where: { eventId: req.params.eventId }, include: { venue: { include: { images: { orderBy: { sortOrder: "asc" } } } }, orgTeam: { select: { id: true, name: true } } }, orderBy: { stageOrder: "asc" } });
    return res.json({ stages: stages.map(serializeStage) });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch stages.", details: error.message }); }
});

router.post("/:eventId/stages", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const { title, timeWindow, startAt, endAt, venueId, location, orgTeamId, stageOrder } = req.body;
  if (!title || (!timeWindow && (!startAt || !endAt))) return res.status(400).json({ error: "Title and schedule are required." });
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.eventId }, select: { startDate: true } });
    const parsed = timeWindow ? parseTimeWindow(event.startDate, timeWindow) : { startAt: new Date(startAt), endAt: new Date(endAt) };
    const venue = await resolveVenue(req.params.eventId, venueId, location);
    const stage = await prisma.stage.create({ data: { eventId: req.params.eventId, stageOrder: stageOrder || await prisma.stage.count({ where: { eventId: req.params.eventId } }) + 1, title, startAt: parsed.startAt, endAt: parsed.endAt, ...(venue && { venue }), ...(orgTeamId && { orgTeam: { connect: { id: orgTeamId } } }) } });
    return res.status(201).json({ message: "Stage created successfully.", stage: serializeStage(stage) });
  } catch (error) { return res.status(500).json({ error: "Failed to create stage.", details: error.message }); }
});

router.patch("/:stageId", authenticate, async (req, res) => {
  try {
    const existing = await prisma.stage.findUnique({ where: { id: req.params.stageId } });
    if (!existing) return res.status(404).json({ error: "Stage not found." });
    const membership = await prisma.eventMembership.findUnique({ where: { unique_event_user: { eventId: existing.eventId, userId: req.user.id } } });
    const access = await prisma.orgAccess.findUnique({ where: { unique_event_org_access: { eventId: existing.eventId, userId: req.user.id } } });
    if (!membership || membership.role !== "organizer" || !access || access.accessLevel !== "lead") return res.status(403).json({ error: "Lead organizer access is required for this event." });
    const { title, startAt, endAt, timeWindow, venueId, location, orgTeamId, status } = req.body;
    const event = await prisma.event.findUnique({ where: { id: existing.eventId }, select: { startDate: true } });
    const schedule = timeWindow ? parseTimeWindow(event.startDate, timeWindow) : {};
    const venue = venueId || location ? await resolveVenue(existing.eventId, venueId, location) : undefined;
    const stage = await prisma.stage.update({ where: { id: existing.id }, data: { ...(title && { title }), ...(startAt && { startAt: new Date(startAt) }), ...(endAt && { endAt: new Date(endAt) }), ...schedule, ...(venue && { venue }), ...(orgTeamId !== undefined && { orgTeam: orgTeamId ? { connect: { id: orgTeamId } } : { disconnect: true } }), ...(status && { status }) } });
    return res.json({ message: "Stage updated successfully.", stage: serializeStage(stage) });
  } catch (error) { return res.status(error.statusCode || 500).json({ error: error.message || "Failed to update stage." }); }
});
export default router;
