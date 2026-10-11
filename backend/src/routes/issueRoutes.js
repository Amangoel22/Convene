// Purpose: issueRoutes lets event members report and close operational issues.
import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";

const router = express.Router();
const issueInclude = { reporterUser: { select: { id: true, name: true, email: true } } };
const priorities = ["Critical", "High", "Medium", "Low"];

// Lists issues for every authenticated event member.
router.get("/:eventId/issues", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({ where: { eventId: req.params.eventId }, include: issueInclude, orderBy: { createdAt: "desc" } });
    return res.json({ issues });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch issues.", details: error.message }); }
});

// Reports an issue using the authenticated user as its reporter.
router.post("/:eventId/issues", authenticate, authorizeEventMembership(), async (req, res) => {
  const { title, priority, description } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Issue title is required." });
  if (!priorities.includes(priority)) return res.status(400).json({ error: "A valid issue priority is required." });
  try {
    const issue = await prisma.issue.create({ data: { eventId: req.params.eventId, title: title.trim(), priority, description: description?.trim() || null, reporterUserId: req.user.id }, include: issueInclude });
    return res.status(201).json({ issue });
  } catch (error) { return res.status(500).json({ error: "Failed to report issue.", details: error.message }); }
});

// Closes an issue for any authenticated member of the same event.
router.patch("/:eventId/issues/:issueId/close", authenticate, authorizeEventMembership(), async (req, res) => {
  const feedback = req.body.feedback?.trim();
  if (!feedback) return res.status(400).json({ error: "Resolution feedback is required." });
  try {
    const issue = await prisma.issue.findFirst({ where: { id: req.params.issueId, eventId: req.params.eventId } });
    if (!issue) return res.status(404).json({ error: "Issue not found." });
    const updated = await prisma.issue.update({ where: { id: issue.id }, data: { status: "Resolved", mandatoryResolutionFeedback: feedback, resolvedAt: new Date() }, include: issueInclude });
    return res.json({ issue: updated });
  } catch (error) { return res.status(500).json({ error: "Failed to close issue.", details: error.message }); }
});

export default router;
