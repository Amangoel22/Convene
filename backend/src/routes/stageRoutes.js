import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// GET /api/events/:eventId/stages - Get event run of show timeline
// -------------------------------------------------------------
router.get("/:eventId/stages", authenticate, authorizeEventMembership(), async (req, res) => {
  try {
    const stages = await prisma.stage.findMany({
      where: { eventId: req.params.eventId },
      include: {
        ownerTeam: { select: { id: true, name: true, teamCode: true } }
      },
      orderBy: { stageOrder: "asc" }
    });

    return res.status(200).json({ stages });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch stages.", details: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/events/:eventId/stages - Create timeline stage (Organizers only)
// -------------------------------------------------------------
router.post("/:eventId/stages", authenticate, authorizeEventMembership(["organizer"]), async (req, res) => {
  const { title, timeWindow, location, ownerTeamId, stageOrder } = req.body;

  if (!title || !timeWindow) {
    return res.status(400).json({ error: "Title and time window are required." });
  }

  try {
    const existingCount = await prisma.stage.count({ where: { eventId: req.params.eventId } });

    const stage = await prisma.stage.create({
      data: {
        eventId: req.params.eventId,
        stageOrder: stageOrder || existingCount + 1,
        title,
        timeWindow,
        location: location || "",
        ownerTeamId: ownerTeamId || null,
        status: "Upcoming"
      }
    });

    return res.status(201).json({ message: "Stage created successfully.", stage });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create stage.", details: error.message });
  }
});

// -------------------------------------------------------------
// PATCH /api/stages/:stageId - Update stage details or status (Organizers only)
// -------------------------------------------------------------
router.patch("/:stageId", authenticate, async (req, res) => {
  const { stageId } = req.params;
  const { title, timeWindow, location, ownerTeamId, status } = req.body;

  try {
    const existingStage = await prisma.stage.findUnique({ where: { id: stageId } });
    if (!existingStage) {
      return res.status(404).json({ error: "Stage not found." });
    }

    // Check organizer membership for stage's event
    const membership = await prisma.eventMembership.findUnique({
      where: {
        unique_event_user: {
          eventId: existingStage.eventId,
          userId: req.user.id
        }
      }
    });

    if (!membership || membership.role !== "organizer") {
      return res.status(403).json({ error: "Access denied. Only event organizers can edit stages." });
    }

    if (existingStage.status === "Completed" && status !== undefined && status !== "Completed") {
      return res.status(400).json({ error: "Completed stages cannot have their status modified." });
    }

    const stage = await prisma.stage.update({
      where: { id: stageId },
      data: {
        ...(title && { title }),
        ...(timeWindow && { timeWindow }),
        ...(location && { location }),
        ...(ownerTeamId !== undefined && { ownerTeamId }),
        ...(status && { status })
      }
    });

    return res.status(200).json({ message: "Stage updated successfully.", stage });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update stage.", details: error.message });
  }
});

export default router;
