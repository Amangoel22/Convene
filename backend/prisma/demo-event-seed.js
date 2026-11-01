// Purpose: create a non-destructive demo event with records across the operational pages.
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Purpose: create a stable suffix so demo data can be seeded repeatedly without collisions.
function demoSuffix() {
  return `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(2).toString("hex")}`;
}

// Purpose: create a complete event fixture without deleting existing application data.
async function main() {
  const suffix = demoSuffix();
  const passwordHash = await bcrypt.hash("12345678", 10);
  let organizer = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organizer) {
    organizer = await prisma.user.create({
      data: {
        name: "Demo Organizer",
        email: `demo.organizer.${suffix}@convene.test`,
        passwordHash,
        phone: "9000000000",
      },
    });
  }

  const event = await prisma.event.create({
    data: {
      name: `Convene Import Test ${suffix}`,
      type: "Conference",
      startDate: new Date("2026-11-15"),
      endDate: new Date("2026-11-16"),
      startTime: "09:00 AM",
      endTime: "06:00 PM",
      durationDisplay: "2 Days",
      primaryLocation: "Demo Convention Centre",
    },
  });

  await prisma.eventMembership.create({
    data: { eventId: event.id, userId: organizer.id, role: "organizer" },
  });
  await prisma.orgAccess.create({
    data: { eventId: event.id, userId: organizer.id, accessLevel: "lead" },
  });

  const [operations, production] = await Promise.all([
    prisma.orgTeam.create({
      data: {
        eventId: event.id,
        name: "Operations",
        description: "Guest flow and venue readiness",
      },
    }),
    prisma.orgTeam.create({
      data: {
        eventId: event.id,
        name: "Production",
        description: "Stage, audio, and visuals",
      },
    }),
  ]);

  const organizerMember = await prisma.orgMember.create({
    data: {
      eventId: event.id,
      orgTeamId: operations.id,
      userId: organizer.id,
      inviteKey: crypto
        .randomBytes(5)
        .toString("hex")
        .slice(0, 10)
        .toUpperCase(),
      name: organizer.name,
      phone: organizer.phone,
      accessLevel: "lead",
    },
  });

  const venue = await prisma.venue.create({
    data: { eventId: event.id, name: "Main Hall" },
  });
  await prisma.stage.createMany({
    data: [
      {
        eventId: event.id,
        stageOrder: 1,
        title: "Doors Open",
        startAt: new Date("2026-11-15T09:00:00Z"),
        endAt: new Date("2026-11-15T10:00:00Z"),
        venueId: venue.id,
        status: "Completed",
      },
      {
        eventId: event.id,
        stageOrder: 2,
        title: "Opening Session",
        startAt: new Date("2026-11-15T10:15:00Z"),
        endAt: new Date("2026-11-15T11:30:00Z"),
        venueId: venue.id,
        orgTeamId: production.id,
        status: "LIVE",
      },
      {
        eventId: event.id,
        stageOrder: 3,
        title: "Workshop Block",
        startAt: new Date("2026-11-15T12:00:00Z"),
        endAt: new Date("2026-11-15T14:00:00Z"),
        venueId: venue.id,
        orgTeamId: operations.id,
        status: "Upcoming",
      },
    ],
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        eventId: event.id,
        name: "Registration tablets",
        totalNeeded: 8,
        available: 6,
        defective: 1,
      },
      {
        eventId: event.id,
        name: "Directional signs",
        totalNeeded: 12,
        available: 12,
        defective: 0,
      },
    ],
  });

  const duty = await prisma.duty.create({
    data: {
      eventId: event.id,
      title: "Registration Desk",
      startAt: new Date("2026-11-15T08:30:00Z"),
      endAt: new Date("2026-11-15T10:30:00Z"),
      venueId: venue.id,
      notes: "Check badges and direct guests to Main Hall.",
    },
  });
  await prisma.dutyAssignment.create({
    data: {
      eventId: event.id,
      dutyId: duty.id,
      orgMemberId: organizerMember.id,
      userId: organizer.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        eventId: event.id,
        title: "Prepare welcome desk",
        description: "Place badges, lanyards, and scanners before doors open.",
        orgTeamId: operations.id,
        assignedOrgMemberId: organizerMember.id,
        status: "In_Progress",
        priority: "High",
        dueAt: new Date("2026-11-15T08:30:00Z"),
        assignedAt: new Date(),
        lastUpdatedByName: organizer.name,
      },
      {
        eventId: event.id,
        title: "Check presentation playback",
        description: "Confirm the opening deck and backup clicker.",
        orgTeamId: production.id,
        status: "Todo",
        priority: "Medium",
        dueAt: new Date("2026-11-15T09:30:00Z"),
        lastUpdatedByName: organizer.name,
      },
      {
        eventId: event.id,
        title: "Confirm venue signage",
        description: null,
        orgTeamId: operations.id,
        status: "Completed",
        priority: "Low",
        lastUpdatedByName: organizer.name,
      },
    ],
  });

  await prisma.issue.create({
    data: {
      eventId: event.id,
      orgTeamId: operations.id,
      title: "Demo issue: signage needs moving",
      description: "The west entrance sign is blocking the queue path.",
      priority: "Medium",
      status: "Open",
      reporterUserId: organizer.id,
    },
  });

  const teamNames = ["Orbit Crew", "Signal Makers"];
  for (let teamIndex = 0; teamIndex < teamNames.length; teamIndex += 1) {
    const participantTeam = await prisma.participantTeam.create({
      data: {
        eventId: event.id,
        name: teamNames[teamIndex],
        teamCode: `DEMO-${teamIndex + 1}`,
        description: "Convene Demo University",
      },
    });
    for (let memberIndex = 0; memberIndex < 2; memberIndex += 1) {
      const user = await prisma.user.create({
        data: {
          name: `${teamNames[teamIndex].split(" ")[0]} Member ${memberIndex + 1}`,
          email: `demo.participant.${teamIndex + 1}.${memberIndex + 1}.${suffix}@convene.test`,
          passwordHash,
          phone: `9${teamIndex + 1}${memberIndex + 1}1234567`,
        },
      });
      await prisma.eventMembership.create({
        data: { eventId: event.id, userId: user.id, role: "participant" },
      });
      await prisma.participantTeamMember.create({
        data: {
          participantTeamId: participantTeam.id,
          userId: user.id,
          role: memberIndex === 0 ? "lead" : "member",
        },
      });
      await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: user.id,
          participantCode: `${participantTeam.teamCode}-${memberIndex + 1}`,
          qrToken: crypto.randomBytes(24).toString("hex"),
          checkInStatus: memberIndex === 0 ? "Confirmed" : "Unconfirmed",
        },
      });
    }
  }

  console.log(`Created demo event: ${event.name}`);
  console.log(`Event ID: ${event.id}`);
  console.log(`Organizer login: ${organizer.email}`);
}

main()
  .catch((error) => {
    console.error("Demo event seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
