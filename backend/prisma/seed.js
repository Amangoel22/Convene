import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEAM_NAMES = [
  "CyberPulse Innovations",
  "NovaTech Labs",
  "QuantumBits Squad",
  "AI Matrix Coders",
  "CodeStorm Hackers",
  "DataDynamos",
  "CloudX Engineers",
  "ByteCraft Developers",
  "ApexCoders",
  "ZenithLabs"
];

const MEMBER_NAMES = [
  ["Aarav Sharma", "Bhavya Patel", "Chetan Kumar", "Divya Singh"],
  ["Esha Reddy", "Farhan Khan", "Gautam Joshi", "Heena Malhotra"],
  ["Ishan Verma", "Jiya Kapoor", "Kabir Nair", "Lata Iyer"],
  ["Manav Das", "Neha Gupta", "Omkar Saxena", "Pooja Roy"],
  ["Qasim Ali", "Riya Sen", "Samarth Jain", "Tanya Mishra"],
  ["Utkarsh Mehta", "Vidya Bhat", "Wassim Sheikh", "Yash Chopra"],
  ["Zoya Khan", "Aditya Bose", "Ananya Paul", "Bharat D'Souza"],
  ["Chaggan Lal", "Deepa Pillai", "Girish Hegde", "Indu Saxena"],
  ["Jatin Solanki", "Kavita Rao", "Lokesh Chandra", "Meera Nambiar"],
  ["Nitin Agarwal", "Prerna Pandey", "Rohan Vaswani", "Siddharth Kaul"]
];

async function main() {
  console.log("🌱 Starting Convene Database Seeding...");

  // 1. Clear existing data in correct dependency order
  await prisma.issue.deleteMany();
  await prisma.dutyAssignment.deleteMany();
  await prisma.duty.deleteMany();
  await prisma.task.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.eventResource.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.participantTeamMember.deleteMany();
  await prisma.participantTeam.deleteMany();
  await prisma.orgAccess.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.orgTeam.deleteMany();
  await prisma.eventMembership.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned old database records.");

  // Password hash for Aman (password: 12345678)
  const passwordHash = await bcrypt.hash("12345678", 10);

  // 2. Create Single Main Organizer User: Aman
  const userAman = await prisma.user.create({
    data: {
      name: "Aman",
      email: "aman@gmail.com",
      passwordHash,
      phone: "9999999999",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  });

  console.log(`👤 Created Main Organizer User: ${userAman.name} (${userAman.email})`);

  // 3. Create Event
  const event1 = await prisma.event.create({
    data: {
      name: "TechNext Summit 2026",
      type: "Conference & Hackathon",
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-10-17"),
      startTime: "09:00 AM",
      endTime: "06:00 PM",
      durationDisplay: "3 Days",
      primaryLocation: "Grand Auditorium & Hall B, Tech Park"
    }
  });

  console.log(`📅 Created Event: "${event1.name}" (${event1.id})`);

  // Organizer Membership for Aman
  await prisma.eventMembership.create({
    data: {
      eventId: event1.id,
      userId: userAman.id,
      role: "organizer"
    }
  });

  // 4. Organising Teams & Members
  const designOrgTeam = await prisma.orgTeam.create({
    data: { eventId: event1.id, name: "Design & Content", description: "Branding, stage backdrops, social assets" }
  });
  const techOrgTeam = await prisma.orgTeam.create({
    data: { eventId: event1.id, name: "Tech & Stage", description: "AV system, lighting, livestreaming" }
  });
  const opsOrgTeam = await prisma.orgTeam.create({
    data: { eventId: event1.id, name: "Logistics & Operations", description: "Venue, check-in, catering, badges" }
  });

  // Aman as Org Member Lead in Logistics & Ops
  const orgMemberAman = await prisma.orgMember.create({
    data: {
      eventId: event1.id,
      orgTeamId: opsOrgTeam.id,
      userId: userAman.id,
      name: userAman.name,
      phone: userAman.phone
    }
  });

  // Assign Lead access level to Aman
  await prisma.orgAccess.create({
    data: {
      eventId: event1.id,
      userId: userAman.id,
      accessLevel: "lead"
    }
  });

  console.log("🏢 Created Organising Teams & assigned Lead access to Aman.");

  // 5. CREATE 10 PARTICIPANT TEAMS (4 Members each: 1 Lead + 3 Members)
  let totalParticipantsCreated = 0;
  const statuses = ["Checked_In", "Confirmed", "Unconfirmed"];

  for (let tIdx = 0; tIdx < 10; tIdx++) {
    const teamCode = `TEAM-${String(tIdx + 1).padStart(2, "0")}`;
    const teamName = TEAM_NAMES[tIdx];

    const partTeam = await prisma.participantTeam.create({
      data: {
        eventId: event1.id,
        name: teamName,
        teamCode,
        description: `IIT Bombay / Convene Campus Team ${tIdx + 1}`
      }
    });

    const membersForThisTeam = MEMBER_NAMES[tIdx];

    for (let mIdx = 0; mIdx < 4; mIdx++) {
      const name = membersForThisTeam[mIdx];
      const isLead = mIdx === 0;
      const email = `member.${tIdx + 1}.${mIdx + 1}@hackathon.io`;
      const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

      // Create Participant User
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          phone,
          avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (tIdx * 4 + mIdx) * 1000}?w=150`
        }
      });

      // Join Event Membership as Participant
      await prisma.eventMembership.create({
        data: {
          eventId: event1.id,
          userId: user.id,
          role: "participant"
        }
      });

      // Add to ParticipantTeamMember (lead vs member)
      await prisma.participantTeamMember.create({
        data: {
          participantTeamId: partTeam.id,
          userId: user.id,
          role: isLead ? "lead" : "member"
        }
      });

      // Create EventParticipant QR entry
      const checkInStatus = isLead ? "Confirmed" : statuses[(tIdx + mIdx) % 3];
      await prisma.eventParticipant.create({
        data: {
          eventId: event1.id,
          userId: user.id,
          participantCode: `PART-${tIdx + 1}-${mIdx + 1}`,
          qrToken: `QR_TOKEN_T${tIdx + 1}_M${mIdx + 1}_${Date.now()}`,
          checkInStatus,
          internalNotes: isLead ? "Team Lead Contact" : undefined
        }
      });

      totalParticipantsCreated++;
    }
  }

  console.log(`🏆 Created 10 Participant Teams with 4 members each (${totalParticipantsCreated} total participants).`);

  // 6. Stages
  await prisma.stage.createMany({
    data: [
      {
        eventId: event1.id,
        stageOrder: 1,
        title: "Opening Ceremony & Keynote Address",
        timeWindow: "09:30 AM – 10:45 AM",
        location: "Main Auditorium",
        orgTeamId: techOrgTeam.id,
        status: "Completed"
      },
      {
        eventId: event1.id,
        stageOrder: 2,
        title: "AI & Next-Gen Tech Panel Discussion",
        timeWindow: "11:00 AM – 01:00 PM",
        location: "Stage A",
        orgTeamId: designOrgTeam.id,
        status: "LIVE"
      },
      {
        eventId: event1.id,
        stageOrder: 3,
        title: "Hackathon Final Pitching Round",
        timeWindow: "02:30 PM – 05:00 PM",
        location: "Grand Ballroom",
        orgTeamId: opsOrgTeam.id,
        status: "Upcoming"
      }
    ]
  });

  // 7. Tasks
  await prisma.task.createMany({
    data: [
      {
        eventId: event1.id,
        title: "Setup Participant Registration & QR Scanning Desks",
        description: "Deploy tablets with scanner web app at entrance.",
        orgTeamId: opsOrgTeam.id,
        assignedOrgMemberId: orgMemberAman.id,
        status: "In_Progress",
        priority: "High",
        dueAt: new Date("2026-10-15T08:30:00Z")
      },
      {
        eventId: event1.id,
        title: "Finalize Main Stage LED Screen Graphic Assets",
        description: "Export 4K resolution backdrops for keynotes.",
        orgTeamId: designOrgTeam.id,
        assignedOrgMemberId: orgMemberAman.id,
        status: "Completed",
        priority: "Critical",
        dueAt: new Date("2026-10-15T08:00:00Z")
      }
    ]
  });

  // 8. Duties
  const duty1 = await prisma.duty.create({
    data: {
      eventId: event1.id,
      title: "North Gate QR Badge Scanner Duty",
      timeWindow: "08:00 AM – 11:30 AM",
      location: "North Gate Entrance",
      orgTeamId: opsOrgTeam.id,
      notes: "Verify participant QR codes on the Convene App."
    }
  });

  await prisma.dutyAssignment.create({
    data: { eventId: event1.id, dutyId: duty1.id, userId: userAman.id }
  });

  console.log("\n✅ Database Seeding Complete!");
  console.log("-------------------------------------------------------");
  console.log("Organizer Login Credentials:");
  console.log("  Email:    aman@gmail.com");
  console.log("  Password: 12345678");
  console.log("  Phone:    9999999999");
  console.log("-------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
