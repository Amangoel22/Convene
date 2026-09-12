import { verifyToken } from "../utils/auth.js";
import { prisma } from "../config/prisma.js";

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Access denied. Authentication token missing." });
  const decoded = verifyToken(authHeader.slice(7));
  if (!decoded?.userId) return res.status(401).json({ error: "Invalid or expired authentication token." });
  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, name: true, email: true, phone: true, avatarUrl: true } });
    if (!user) return res.status(404).json({ error: "User account not found." });
    req.user = user;
    next();
  } catch (error) { return res.status(500).json({ error: "Authentication check failed.", details: error.message }); }
}

export function authorizeEventMembership(allowedRoles = ["organizer", "participant"]) {
  return async (req, res, next) => {
    const eventId = req.params.eventId || req.body.eventId;
    if (!eventId) return res.status(400).json({ error: "Event ID is required for authorization check." });
    try {
      const membership = await prisma.eventMembership.findUnique({ where: { unique_event_user: { eventId, userId: req.user.id } } });
      if (!membership || !allowedRoles.includes(membership.role)) return res.status(403).json({ error: "Access denied for this event." });
      req.eventId = eventId;
      req.eventMembership = membership;
      next();
    } catch (error) { return res.status(500).json({ error: "Event authorization check failed.", details: error.message }); }
  };
}

export function authorizeOrgLead() {
  return async (req, res, next) => {
    const eventId = req.eventId || req.params.eventId || req.body.eventId;
    try {
      const access = await prisma.orgAccess.findUnique({ where: { unique_event_org_access: { eventId, userId: req.user.id } } });
      if (!access || access.accessLevel !== "lead") return res.status(403).json({ error: "Access denied. Organizing lead access is required." });
      next();
    } catch (error) { return res.status(500).json({ error: "Organizing access check failed.", details: error.message }); }
  };
}
