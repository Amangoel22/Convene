import express from "express";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// GET /api/events/:eventId/tasks - List event tasks
// -------------------------------------------------------------
router.get("/:eventId/tasks", authenticate, authorizeEventMembership(), async (req, res) => {
  const { teamId, status, priority } = req.query;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        eventId: req.params.eventId,
        ...(teamId && { teamId }),
        ...(status && { status }),
        ...(priority && { priority })
      },
      include: {
        team: { select: { id: true, name: true, teamCode: true } },
        assignedUser: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tasks.", details: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/events/:eventId/tasks - Create a task
// -------------------------------------------------------------
router.post("/:eventId/tasks", authenticate, authorizeEventMembership(), async (req, res) => {
  const { title, description, teamId, assignedUserId, priority, dueAt } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    // Verify assigned user belongs to the same event
    if (assignedUserId) {
      const isMember = await prisma.eventMembership.findUnique({
        where: {
          unique_event_user: {
            eventId: req.params.eventId,
            userId: assignedUserId
          }
        }
      });
      if (!isMember) {
        return res.status(400).json({ error: "Assigned user is not a member of this event." });
      }
    }

    const task = await prisma.task.create({
      data: {
        eventId: req.params.eventId,
        title,
        description,
        teamId: teamId || null,
        assignedUserId: assignedUserId || null,
        priority: priority || "Medium",
        dueAt: dueAt ? new Date(dueAt) : null,
        status: "Todo"
      },
      include: {
        team: { select: { id: true, name: true, teamCode: true } },
        assignedUser: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }
      }
    });

    return res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create task.", details: error.message });
  }
});

// -------------------------------------------------------------
// PATCH /api/tasks/:taskId/status - Update task status
// -------------------------------------------------------------
router.patch("/:taskId/status", authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status }
    });

    return res.status(200).json({ message: "Task status updated.", task });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update task status.", details: error.message });
  }
});

export default router;
