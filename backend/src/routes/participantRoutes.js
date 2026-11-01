// Purpose: participantRoutes implements this source module.
import express from "express";
import crypto from "node:crypto";
import multer from "multer";
import { prisma } from "../config/prisma.js";
import {
  authenticate,
  authorizeEventMembership,
  authorizeOrgLead,
} from "../middlewares/auth.js";
import { hashPassword } from "../utils/auth.js";
import {
  createWorkbookBuffer,
  parseParticipantWorkbook,
  PARTICIPANT_WORKBOOK_HEADERS,
  normalizeParticipantStatus,
} from "../utils/workbook.js";

const router = express.Router();
const workbookUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Purpose: format database status values for the participant workbook.
function exportParticipantStatus(status) {
  return status === "Checked_In" ? "Checked In" : status || "Unconfirmed";
}

// Purpose: create a safe fallback email when an imported row only has a phone number.
function generatedParticipantEmail(phone) {
  return `participant_${phone || crypto.randomBytes(6).toString("hex")}@convene.test`;
}

// Purpose: translate workbook status labels into Prisma enum values.
function databaseParticipantStatus(status) {
  return normalizeParticipantStatus(status) === "Checked In"
    ? "Checked_In"
    : normalizeParticipantStatus(status);
}

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
    if (leaderPhone)
      phonesToValidate.push({ field: "Leader Phone", val: leaderPhone });
    if (memberPhone)
      phonesToValidate.push({ field: "Member Phone", val: memberPhone });
    if (Array.isArray(teamMembers)) {
      teamMembers.forEach((m, i) => {
        if (m.phone)
          phonesToValidate.push({
            field: `Member ${i + 1} Phone`,
            val: m.phone,
          });
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

      const cleanPhone = phone
        ? String(phone).replace(/\D/g, "").slice(0, 10)
        : null;

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
          checkInStatus: "Unconfirmed",
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

// Purpose: import one normalized workbook and group rows into event participant teams.
router.post(
  "/:eventId/participants/import",
  authenticate,
  authorizeEventMembership(["organizer"]),
  authorizeOrgLead(),
  workbookUpload.single("file"),
  async (req, res) => {
    if (!req.file)
      return res
        .status(400)
        .json({ error: "An XLSX, XLS, or CSV file is required." });
    const extension = req.file.originalname.toLowerCase().split(".").pop();
    if (!["xlsx", "xls", "csv"].includes(extension))
      return res
        .status(400)
        .json({ error: "Only XLSX, XLS, and CSV files are supported." });

    const { rows, errors } = parseParticipantWorkbook(req.file.buffer);
    if (errors.length)
      return res
        .status(422)
        .json({ error: "The workbook could not be imported.", errors });

    try {
      const defaultPasswordHash = await hashPassword("password123");
      const result = await prisma.$transaction(async (tx) => {
        const teams = new Map();
        let importedParticipants = 0;

        for (const row of rows) {
          let team = teams.get(row.teamCode);
          if (!team) {
            team = await tx.participantTeam.upsert({
              where: {
                unique_event_participant_team_code: {
                  eventId: req.params.eventId,
                  teamCode: row.teamCode,
                },
              },
              create: {
                eventId: req.params.eventId,
                teamCode: row.teamCode,
                name: row.teamName,
                description: row.teamCollege || row.college || null,
                status: row.teamStatus || "Unconfirmed",
                internalNotes: row.teamNotes || null,
              },
              update: {
                name: row.teamName,
                description: row.teamCollege || row.college || undefined,
                status: row.teamStatus || undefined,
                internalNotes: row.teamNotes || undefined,
              },
            });
            teams.set(row.teamCode, team);
          }

          let user = row.email
            ? await tx.user.findUnique({ where: { email: row.email } })
            : null;
          if (!user && row.phone)
            user = await tx.user.findFirst({ where: { phone: row.phone } });
          if (!user) {
            user = await tx.user.create({
              data: {
                name: row.participantName,
                email: row.email || generatedParticipantEmail(row.phone),
                phone: row.phone || null,
                passwordHash: defaultPasswordHash,
              },
            });
          } else {
            user = await tx.user.update({
              where: { id: user.id },
              data: {
                name: row.participantName || user.name,
                ...(row.phone ? { phone: row.phone } : {}),
              },
            });
          }

          await tx.eventMembership.upsert({
            where: {
              unique_event_user: {
                eventId: req.params.eventId,
                userId: user.id,
              },
            },
            create: {
              eventId: req.params.eventId,
              userId: user.id,
              role: "participant",
            },
            update: {},
          });

          await tx.eventParticipant.upsert({
            where: {
              unique_event_participant: {
                eventId: req.params.eventId,
                userId: user.id,
              },
            },
            create: {
              eventId: req.params.eventId,
              userId: user.id,
              participantCode:
                row.participantCode ||
                `${row.teamCode}-${importedParticipants + 1}`,
              qrToken: crypto.randomBytes(32).toString("hex"),
              checkInStatus: databaseParticipantStatus(row.participantStatus),
              internalNotes: row.notes || null,
            },
            update: {
              checkInStatus: databaseParticipantStatus(row.participantStatus),
              internalNotes: row.notes || null,
              ...(row.participantCode
                ? { participantCode: row.participantCode }
                : {}),
            },
          });

          await tx.participantTeamMember.upsert({
            where: {
              unique_participant_team_user: {
                participantTeamId: team.id,
                userId: user.id,
              },
            },
            create: {
              participantTeamId: team.id,
              userId: user.id,
              role: row.role,
            },
            update: { role: row.role },
          });
          importedParticipants += 1;
        }
        return { teams: teams.size, participants: importedParticipants };
      });

      return res
        .status(201)
        .json({ message: "Participants imported successfully.", ...result });
    } catch (error) {
      return res
        .status(500)
        .json({
          error: "Failed to import participants.",
          details: error.message,
        });
    }
  },
);

// Purpose: export event teams and participants into the same single-sheet import format.
router.get(
  "/:eventId/participants/export",
  authenticate,
  authorizeEventMembership(),
  async (req, res) => {
    try {
      const event = await prisma.event.findUnique({
        where: { id: req.params.eventId },
        include: {
          participantTeams: {
            orderBy: { createdAt: "asc" },
            include: {
              members: {
                include: { user: true },
                orderBy: { createdAt: "asc" },
              },
            },
          },
          participants: true,
        },
      });
      if (!event) return res.status(404).json({ error: "Event not found." });

      const participantByUserId = new Map(
        event.participants.map((participant) => [
          participant.userId,
          participant,
        ]),
      );
      const rows = event.participantTeams.flatMap((team) => {
        const lead =
          team.members.find((member) => member.role === "lead") ||
          team.members[0];
        return team.members.map((member) => {
          const participant = participantByUserId.get(member.userId);
          return {
            "Team ID": team.id,
            "Team Code": team.teamCode,
            "Team Name": team.name,
            "Team Status": team.status || "Unconfirmed",
            "Team College / Org": team.description || "",
            "Team Notes": team.internalNotes || "",
            "Team Lead Name": lead?.user?.name || "",
            "Team Lead Email": lead?.user?.email || "",
            "Team Lead Phone": lead?.user?.phone || "",
            "Participant ID": participant?.id || "",
            "Participant Code": participant?.participantCode || "",
            "Participant Name": member.user?.name || "",
            Email: member.user?.email || "",
            Phone: member.user?.phone || "",
            "College / Org": team.description || "",
            "Participant Status": exportParticipantStatus(
              participant?.checkInStatus,
            ),
            Role: member.role === "lead" ? "Team Lead" : "Member",
            Notes: participant?.internalNotes || "",
          };
        });
      });
      const buffer = createWorkbookBuffer(
        "Participants",
        PARTICIPANT_WORKBOOK_HEADERS,
        rows,
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-participants.xlsx"`,
      );
      return res.send(buffer);
    } catch (error) {
      return res
        .status(500)
        .json({
          error: "Failed to export participants.",
          details: error.message,
        });
    }
  },
);

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
      return res.status(500).json({
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
  const { checkInStatus, internalNotes } = req.body;

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

    const dataToUpdate = {};

    if (checkInStatus !== undefined) {
      let dbStatus = checkInStatus;
      if (checkInStatus === "Checked In" || checkInStatus === "Checked_In") {
        dbStatus = "Checked_In";
      }
      dataToUpdate.checkInStatus = dbStatus;
    }

    if (internalNotes !== undefined) {
      dataToUpdate.internalNotes = internalNotes;
    }

    const updated = await prisma.eventParticipant.update({
      where: { id: participant.id },
      data: dataToUpdate,
    });

    return res.status(200).json({
      message: "Participant updated successfully.",
      participant: updated,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update participant.",
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
