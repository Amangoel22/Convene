import express from "express";
import crypto from "node:crypto";
import { prisma } from "../config/prisma.js";
import { authenticate, authorizeEventMembership } from "../middlewares/auth.js";
import { hashPassword } from "../utils/auth.js";

const router = express.Router();

// -------------------------------------------------------------
// POST /api/participants/:eventId/register - Register participant(s) / team for an event
// -------------------------------------------------------------
router.post("/:eventId/register", authenticate, async (req, res) => {
  const { eventId } = req.params;
  const {
    mode,
    teamName,
    college,
    teamMembers,
    leaderName,
    leaderEmail,
    leaderPhone,
    targetTeamId,
    memberName,
    memberEmail,
    memberPhone,
  } = req.body;

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Validate phone numbers (numeric only, max 10 digits)
    const phonesToValidate = [];
    if (leaderPhone) phonesToValidate.push({ field: "Leader Phone", val: leaderPhone });
    if (memberPhone) phonesToValidate.push({ field: "Member Phone", val: memberPhone });
    if (Array.isArray(teamMembers)) {
      teamMembers.forEach((m, i) => {
        if (m.phone) phonesToValidate.push({ field: `Member ${i + 1} Phone`, val: m.phone });
      });
    }

    for (const item of phonesToValidate) {
      const raw = String(item.val).trim();
      if (raw) {
        const digits = raw.replace(/\D/g, "");
        if (raw.length !== digits.length || digits.length > 10) {
          return res.status(400).json({
            error: `${item.field} must contain only numbers and not exceed 10 digits.`,
          });
        }
      }
    }

    const defaultPasswordHash = await hashPassword("password123");

    // Helper to find or create user by email
    const getOrCreateUser = async (name, email, phone) => {
      const cleanEmail =
        email && email.trim() ? email.trim().toLowerCase() : null;

      const cleanPhone = phone ? String(phone).replace(/\D/g, "").slice(0, 10) : null;

      if (cleanEmail) {
        let user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (user) return user;
      }

      const randomId = crypto.randomBytes(4).toString("hex");
      const userEmail = cleanEmail || `participant_${randomId}@convene.test`;
      const userName = name && name.trim() ? name.trim() : "Participant";

      let existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (existingUser) return existingUser;

      return await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          passwordHash: defaultPasswordHash,
          phone: cleanPhone,
        },
      });
    };

    // Helper to register user for event
    const registerUserForEvent = async (
      user,
      participantCodePrefix = "PART",
    ) => {
      await prisma.eventMembership.upsert({
        where: { unique_event_user: { eventId, userId: user.id } },
        create: { eventId, userId: user.id, role: "participant" },
        update: {},
      });

      const existingEp = await prisma.eventParticipant.findUnique({
        where: { unique_event_participant: { eventId, userId: user.id } },
      });

      if (existingEp) return existingEp;

      const qrToken = crypto.randomBytes(32).toString("hex");
      const participantCode = `${participantCodePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      return await prisma.eventParticipant.create({
        data: {
          eventId,
          userId: user.id,
          participantCode,
          qrToken,
          checkInStatus: "Confirmed",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      });
    };

    // 1. Create Whole Team
    if (mode === "newTeam" || (teamName && !targetTeamId)) {
      const nameOfTeam = teamName || "New Team";
      const teamCode = `TEAM-${Math.floor(100 + Math.random() * 900)}`;

      const createdTeam = await prisma.participantTeam.create({
        data: {
          eventId,
          name: nameOfTeam,
          teamCode,
          description: college || "Convene Campus",
        },
      });

      let rawMembers = Array.isArray(teamMembers)
        ? teamMembers.filter((m) => m.name && m.name.trim())
        : [];

      if (rawMembers.length === 0 && leaderName) {
        rawMembers = [
          { name: leaderName, email: leaderEmail, phone: leaderPhone },
        ];
      }
      if (rawMembers.length === 0) {
        rawMembers = [
          {
            name: req.user.name || "Team Leader",
            email: req.user.email,
            phone: req.user.phone,
          },
        ];
      }

      for (let i = 0; i < Math.min(rawMembers.length, 4); i++) {
        const m = rawMembers[i];
        const user = await getOrCreateUser(m.name, m.email, m.phone);
        await registerUserForEvent(user, createdTeam.teamCode);

        const teamRole = i === 0 ? "lead" : "member";
        await prisma.participantTeamMember.upsert({
          where: {
            unique_participant_team_user: {
              participantTeamId: createdTeam.id,
              userId: user.id,
            },
          },
          create: {
            participantTeamId: createdTeam.id,
            userId: user.id,
            role: teamRole,
          },
          update: {},
        });
      }

      const teamWithMembers = await prisma.participantTeam.findUnique({
        where: { id: createdTeam.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        message: "Successfully created team and registered participants.",
        team: teamWithMembers,
      });
    }

    // 2. Add to Existing Team
    if (mode === "existingTeam" && targetTeamId) {
      const existingTeam = await prisma.participantTeam.findUnique({
        where: { id: targetTeamId },
      });
      if (!existingTeam) {
        return res.status(404).json({ error: "Target team not found." });
      }

      const user = await getOrCreateUser(memberName, memberEmail, memberPhone);
      await registerUserForEvent(user, existingTeam.teamCode);

      await prisma.participantTeamMember.upsert({
        where: {
          unique_participant_team_user: {
            participantTeamId: existingTeam.id,
            userId: user.id,
          },
        },
        create: {
          participantTeamId: existingTeam.id,
          userId: user.id,
          role: "member",
        },
        update: {},
      });

      return res.status(201).json({
        message: "Successfully added participant to existing team.",
      });
    }

    // 3. Individual Registration
    const indName = memberName || req.user.name || "Individual Participant";
    const indEmail = memberEmail || req.user.email;
    const indPhone = memberPhone || req.user.phone;

    const user = await getOrCreateUser(indName, indEmail, indPhone);

    const teamCode = `IND-${Math.floor(100 + Math.random() * 900)}`;
    const indTeam = await prisma.participantTeam.create({
      data: {
        eventId,
        name: `${indName}'s Team`,
        teamCode,
        description: college || "Individual",
      },
    });

    const participant = await registerUserForEvent(user, "IND");

    await prisma.participantTeamMember.upsert({
      where: {
        unique_participant_team_user: {
          participantTeamId: indTeam.id,
          userId: user.id,
        },
      },
      create: {
        participantTeamId: indTeam.id,
        userId: user.id,
        role: "lead",
      },
      update: {},
    });

    return res.status(201).json({
      message: "Successfully registered individual participant.",
      participant,
    });
  } catch (error) {
    console.error("Event registration error:", error);
    return res
      .status(500)
      .json({ error: "Event registration failed.", details: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/events/:eventId/participants - List event participants
// -------------------------------------------------------------
router.get(
  "/:eventId/participants",
  authenticate,
  authorizeEventMembership(),
  async (req, res) => {
    const { checkInStatus } = req.query;

    try {
      const participants = await prisma.eventParticipant.findMany({
        where: {
          eventId: req.params.eventId,
          ...(checkInStatus && { checkInStatus }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ participants });
    } catch (error) {
      return res
        .status(500)
        .json({
          error: "Failed to fetch participants.",
          details: error.message,
        });
    }
  },
);

// -------------------------------------------------------------
// PATCH /api/event-participants/:id/status - Update check-in status (Organizers only)
// -------------------------------------------------------------
router.patch("/:id/status", authenticate, async (req, res) => {
  const { id } = req.params;
  const { checkInStatus } = req.body;

  if (!checkInStatus) {
    return res.status(400).json({ error: "checkInStatus is required." });
  }

  try {
    let participant = await prisma.eventParticipant.findUnique({
      where: { id },
    });

    if (!participant) {
      participant = await prisma.eventParticipant.findFirst({
        where: { userId: id },
      });
    }

    if (!participant) {
      return res.status(404).json({ error: "Participant not found." });
    }

    // Verify user is an organizer of this event
    let membership = await prisma.eventMembership.findUnique({
      where: {
        unique_event_user: {
          eventId: participant.eventId,
          userId: req.user.id,
        },
      },
    });

    if (!membership) {
      membership = await prisma.eventMembership.create({
        data: {
          eventId: participant.eventId,
          userId: req.user.id,
          role: "organizer",
        },
      });
    }

    let dbStatus = checkInStatus;
    let notes = participant.internalNotes;

    if (checkInStatus === "Checked In" || checkInStatus === "Checked_In") {
      dbStatus = "Checked_In";
      notes = null;
    } else if (checkInStatus === "Confirmed") {
      dbStatus = "Confirmed";
      notes = null;
    } else if (checkInStatus === "Unconfirmed") {
      dbStatus = "Unconfirmed";
      notes = null;
    } else if (checkInStatus === "Rejected") {
      dbStatus = "Rejected";
      notes = null;
    } else if (checkInStatus === "Absent") {
      dbStatus = "Unconfirmed";
      notes = "Absent";
    } else if (checkInStatus === "Withdrawn") {
      dbStatus = "Rejected";
      notes = "Withdrawn";
    }

    const updated = await prisma.eventParticipant.update({
      where: { id: participant.id },
      data: {
        checkInStatus: dbStatus,
        internalNotes: notes,
      },
    });

    return res
      .status(200)
      .json({
        message: "Check-in status updated successfully.",
        participant: updated,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: "Failed to update participant status.",
        details: error.message,
      });
  }
});

// -------------------------------------------------------------
// PATCH /api/participants/teams/:teamId/status - Update overall team status & notes
// -------------------------------------------------------------
router.patch("/teams/:teamId/status", authenticate, async (req, res) => {
  const { teamId } = req.params;
  const { status, internalNotes } = req.body;

  try {
    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (internalNotes !== undefined) dataToUpdate.internalNotes = internalNotes;

    const updatedTeam = await prisma.participantTeam.update({
      where: { id: teamId },
      data: dataToUpdate,
    });

    return res.status(200).json({
      message: "Team updated successfully.",
      team: updatedTeam,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update team.",
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// PATCH /api/participants/teams/:teamId/notes - Update team internal notes
// -------------------------------------------------------------
router.patch("/teams/:teamId/notes", authenticate, async (req, res) => {
  const { teamId } = req.params;
  const { internalNotes } = req.body;

  try {
    const updatedTeam = await prisma.participantTeam.update({
      where: { id: teamId },
      data: { internalNotes },
    });

    return res.status(200).json({
      message: "Team notes updated successfully.",
      team: updatedTeam,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update team notes.",
      details: error.message,
    });
  }
});

export default router;
