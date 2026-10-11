// Provides persisted shift-duty listing and creation for an event.
import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership, authorizeOrgLead } from "../middlewares/auth.js";

const router = express.Router();

const assignmentInclude = {
  orgMember: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      orgTeam: { select: { id: true, name: true } }
    }
  },
  user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
};

const dutyInclude = {
  venue: true,
  assignments: { include: assignmentInclude, orderBy: { id: "asc" } }
};

// Lists duties and resolves both pending members and registered users.
router.get("/:eventId/duties", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const duties = await prisma.duty.findMany({
      where: { eventId: req.params.eventId },
      include: dutyInclude,
      orderBy: [{ startAt: "asc" }, { createdAt: "desc" }]
    });
    return res.json({ duties });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch duties.", details: error.message });
  }
});

// Creates a duty and stores assignments against organization members.
router.post("/:eventId/duties", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const { title, startAt, endAt, venueId, notes, orgMemberIds = [] } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Duty title is required." });
  if (!startAt || !endAt) return res.status(400).json({ error: "Duty start and end times are required." });

  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ error: "Duty end time must be after its start time." });
  }

  try {
    const memberIds = [...new Set(Array.isArray(orgMemberIds) ? orgMemberIds.filter(Boolean) : [])];
    const members = memberIds.length
      ? await prisma.orgMember.findMany({ where: { id: { in: memberIds }, eventId: req.params.eventId } })
      : [];
    if (members.length !== memberIds.length) return res.status(400).json({ error: "Every assigned member must belong to this event." });

    if (venueId) {
      const venue = await prisma.venue.findFirst({ where: { id: venueId, eventId: req.params.eventId } });
      if (!venue) return res.status(400).json({ error: "Venue does not belong to this event." });
    }

    const duty = await prisma.$transaction(async (tx) => {
      const created = await tx.duty.create({
        data: {
          eventId: req.params.eventId,
          title: title.trim(),
          startAt: start,
          endAt: end,
          venueId: venueId || null,
          notes: notes?.trim() || null
        }
      });

      if (members.length) {
        await tx.dutyAssignment.createMany({
          data: members.map((member) => ({
            eventId: req.params.eventId,
            dutyId: created.id,
            orgMemberId: member.id,
            userId: member.userId || null
          }))
        });
      }

      return tx.duty.findUnique({ where: { id: created.id }, include: dutyInclude });
    });

    return res.status(201).json({ message: "Duty created successfully.", duty });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create duty.", details: error.message });
  }
});

// Updates a duty and replaces its event-scoped member assignments.
router.patch("/:eventId/duties/:dutyId", authenticate, async (req, res) => {
  const { title, startAt, endAt, venueId, notes, orgMemberIds = [] } = req.body;
  if (!title?.trim() || !startAt || !endAt) return res.status(400).json({ error: "Duty title and times are required." });
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return res.status(400).json({ error: "Duty end time must be after its start time." });
  try {
    const duty = await prisma.duty.findUnique({ where: { id: req.params.dutyId } });
    if (!duty) return res.status(404).json({ error: "Duty not found." });
    if (duty.eventId !== req.params.eventId) return res.status(400).json({ error: "Duty does not belong to this event." });
    const membership = await prisma.eventMembership.findUnique({ where: { unique_event_user: { eventId: duty.eventId, userId: req.user.id } } });
    if (!membership || membership.role !== "organizer") return res.status(403).json({ error: "Organizer access required." });
    const memberIds = [...new Set(Array.isArray(orgMemberIds) ? orgMemberIds.filter(Boolean) : [])];
    const members = memberIds.length ? await prisma.orgMember.findMany({ where: { id: { in: memberIds }, eventId: duty.eventId } }) : [];
    if (members.length !== memberIds.length) return res.status(400).json({ error: "Every assigned member must belong to this event." });
    if (venueId && !(await prisma.venue.findFirst({ where: { id: venueId, eventId: duty.eventId } }))) return res.status(400).json({ error: "Venue does not belong to this event." });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.duty.update({ where: { id: duty.id }, data: { title: title.trim(), startAt: start, endAt: end, venueId: venueId || null, notes: notes?.trim() || null } });
      await tx.dutyAssignment.deleteMany({ where: { dutyId: duty.id } });
      if (members.length) await tx.dutyAssignment.createMany({ data: members.map((member) => ({ eventId: duty.eventId, dutyId: duty.id, orgMemberId: member.id, userId: member.userId || null })) });
      return tx.duty.findUnique({ where: { id: duty.id }, include: dutyInclude });
    });
    return res.json({ message: "Duty updated successfully.", duty: updated });
  } catch (error) { return res.status(500).json({ error: "Failed to update duty.", details: error.message }); }
});

export default router;
