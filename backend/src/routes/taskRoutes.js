import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership, authorizeOrgLead } from "../middlewares/auth.js";

const router = express.Router();
const memberInclude = { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }, orgTeam: { select: { id: true, name: true } } };

router.get("/:eventId/tasks", authenticate, authorizeEventMembership(), async (req, res) => {
  const { orgTeamId, status, priority } = req.query;
  try {
    const tasks = await prisma.task.findMany({ where: { eventId: req.params.eventId, ...(orgTeamId && { orgTeamId }), ...(status && { status }), ...(priority && { priority }) }, include: { orgTeam: true, assignedOrgMember: { include: memberInclude } }, orderBy: { createdAt: "desc" } });
    return res.json({ tasks });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch tasks.", details: error.message }); }
});

router.post("/:eventId/tasks", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const { title, description, orgTeamId, assignedOrgMemberId, priority, dueAt } = req.body;
  if (!title) return res.status(400).json({ error: "Task title is required." });
  try {
    let resolvedOrgTeamId = null;
    if (assignedOrgMemberId) {
      const member = await prisma.orgMember.findFirst({ where: { id: assignedOrgMemberId, eventId: req.params.eventId } });
      if (!member) return res.status(400).json({ error: "Assigned member does not belong to this event." });
      resolvedOrgTeamId = member.orgTeamId;
    }
    if (!assignedOrgMemberId && orgTeamId) {
      const team = await prisma.orgTeam.findFirst({ where: { id: orgTeamId, eventId: req.params.eventId } });
      if (!team) return res.status(400).json({ error: "Team does not belong to this event." });
      resolvedOrgTeamId = team.id;
    }
    const task = await prisma.task.create({ data: { eventId: req.params.eventId, title, description, orgTeamId: resolvedOrgTeamId, assignedOrgMemberId: assignedOrgMemberId || null, assignedAt: assignedOrgMemberId ? new Date() : null, priority: priority || "Medium", dueAt: dueAt ? new Date(dueAt) : null, lastUpdatedByName: req.user.name }, include: { orgTeam: true, assignedOrgMember: { include: memberInclude } } });
    return res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) { return res.status(500).json({ error: "Failed to create task.", details: error.message }); }
});

router.patch("/:taskId/status", authenticate, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required." });
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: "Task not found." });
    const membership = await prisma.eventMembership.findUnique({ where: { unique_event_user: { eventId: task.eventId, userId: req.user.id } } });
    if (!membership || membership.role !== "organizer") return res.status(403).json({ error: "Access denied for this event." });
    const prismaStatus = status === "In Progress" ? "In_Progress" : status === "Todo" ? "Todo" : status;
    const updated = await prisma.task.update({ where: { id: task.id }, data: { status: prismaStatus, lastUpdatedByName: req.user.name }, include: { orgTeam: true, assignedOrgMember: { include: memberInclude } } });
    return res.json({ message: "Task status updated.", task: updated });
  } catch (error) { return res.status(500).json({ error: "Failed to update task status.", details: error.message }); }
});

router.patch("/:taskId", authenticate, async (req, res) => {
  const { assignedOrgMemberId } = req.body;
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: "Task not found." });
    const membership = await prisma.eventMembership.findUnique({ where: { unique_event_user: { eventId: task.eventId, userId: req.user.id } } });
    if (!membership || membership.role !== "organizer") return res.status(403).json({ error: "Organizer access required." });
    let resolvedTeamId = null;
    if (assignedOrgMemberId) {
      const member = await prisma.orgMember.findFirst({ where: { id: assignedOrgMemberId, eventId: task.eventId } });
      if (!member) return res.status(400).json({ error: "Assigned member does not belong to this event." });
      resolvedTeamId = member.orgTeamId;
    }
    const updated = await prisma.task.update({ where: { id: task.id }, data: { assignedOrgMemberId: assignedOrgMemberId || null, orgTeamId: resolvedTeamId, assignedAt: assignedOrgMemberId ? new Date() : null, lastUpdatedByName: req.user.name }, include: { orgTeam: true, assignedOrgMember: { include: memberInclude } } });
    return res.json({ message: "Task assignment updated.", task: updated });
  } catch (error) { return res.status(500).json({ error: "Failed to update task assignment.", details: error.message }); }
});
export default router;
