import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership, authorizeOrgLead } from "../middlewares/auth.js";

const router = express.Router();
const memberInclude = { user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } } };

router.get("/:eventId/organizing-teams", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const teams = await prisma.orgTeam.findMany({
      where: { eventId: req.params.eventId },
      include: { members: { include: memberInclude, orderBy: { createdAt: "asc" } } },
      orderBy: { name: "asc" }
    });
    return res.json({ teams });
  } catch (error) { return res.status(500).json({ error: "Failed to fetch organizing teams.", details: error.message }); }
});

router.post("/:eventId/organizing-teams", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const { name, description, members = [] } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Team name is required." });
  if (members.some((member) => member.name?.trim() && !/^\d{10}$/.test(member.phone || ""))) return res.status(400).json({ error: "Every added member must have a 10-digit phone number." });
  try {
    const team = await prisma.orgTeam.create({
      data: {
        eventId: req.params.eventId,
        name: name.trim(),
        description: description?.trim() || null,
        members: { create: members.filter((member) => member.name?.trim()).map((member) => ({ eventId: req.params.eventId, name: member.name.trim(), phone: member.phone?.trim() || null, role: member.role || "member" })) }
      },
      include: { members: { include: memberInclude } }
    });
    return res.status(201).json({ message: "Organizing team created successfully.", team });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "A team with this name already exists for the event." });
    return res.status(500).json({ error: "Failed to create organizing team.", details: error.message });
  }
});

router.post("/:eventId/organizing-teams/:teamId/members", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const { name, email, phone, userId, role } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Member name is required." });
  if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ error: "Phone number must contain exactly 10 digits." });
  try {
    const team = await prisma.orgTeam.findFirst({ where: { id: req.params.teamId, eventId: req.params.eventId } });
    if (!team) return res.status(404).json({ error: "Organizing team not found." });
    const member = await prisma.orgMember.create({ data: { eventId: req.params.eventId, orgTeamId: team.id, userId: userId || null, name: name.trim(), phone: phone?.trim() || null, role: role || "member" } });
    return res.status(201).json({ message: "Team member added successfully.", member });
  } catch (error) { return res.status(500).json({ error: "Failed to add team member.", details: error.message }); }
});

router.patch("/:eventId/organizing-teams/:teamId/members/:memberId", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  const { name, phone, userId, role, orgTeamId } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Member name is required." });
  if (phone && !/^\d{10}$/.test(phone)) return res.status(400).json({ error: "Phone number must contain exactly 10 digits." });
  try {
    if (orgTeamId && !(await prisma.orgTeam.findFirst({ where: { id: orgTeamId, eventId: req.params.eventId } }))) return res.status(400).json({ error: "Target team does not belong to this event." });
    const member = await prisma.orgMember.updateMany({ where: { id: req.params.memberId, orgTeamId: req.params.teamId, eventId: req.params.eventId }, data: { name: name.trim(), phone: phone?.trim() || null, userId: userId || null, role: role || "member", ...(orgTeamId ? { orgTeamId } : {}) } });
    if (!member.count) return res.status(404).json({ error: "Team member not found." });
    return res.json({ message: "Team member updated successfully." });
  } catch (error) { return res.status(500).json({ error: "Failed to update team member.", details: error.message }); }
});

router.delete("/:eventId/organizing-teams/:teamId/members/:memberId", authenticate, authorizeEventMembership(["organizer"]), authorizeOrgLead(), async (req, res) => {
  try {
    const result = await prisma.orgMember.deleteMany({ where: { id: req.params.memberId, orgTeamId: req.params.teamId, eventId: req.params.eventId } });
    if (!result.count) return res.status(404).json({ error: "Team member not found." });
    return res.json({ message: "Team member removed successfully." });
  } catch (error) { return res.status(500).json({ error: "Failed to remove team member.", details: error.message }); }
});

export default router;
