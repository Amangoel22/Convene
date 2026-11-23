// API TEST FILE: Covers participant registration, import/export, listing, check-in, and team updates.

import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { generateToken, hashPassword } from "../src/utils/auth.js";

let sequence = 0;
const userIds = new Set();
const eventIds = new Set();

function unique(prefix) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

async function user() {
  const record = await prisma.user.create({
    data: { name: "Participant Test User", email: `${unique("participant")}@example.com`, phone: "9876543210", passwordHash: await hashPassword("password123") },
  });
  userIds.add(record.id);
  return { user: record, token: generateToken({ userId: record.id }) };
}

async function eventWithUser({ userId, role = "organizer" } = {}) {
  const event = await prisma.event.create({
    data: {
      name: unique("Participant Event"), type: "Conference",
      startDate: new Date("2030-01-01"), endDate: new Date("2030-01-01"), startTime: "09:00", endTime: "17:00",
      memberships: userId ? { create: { userId, role } } : undefined,
    },
  });
  eventIds.add(event.id);
  return event;
}

async function participant(eventId, userId) {
  return prisma.eventParticipant.create({
    data: { eventId, userId, participantCode: unique("PART"), qrToken: randomUUID(), checkInStatus: "Unconfirmed" },
  });
}

async function participantTeam(eventId, userId) {
  const team = await prisma.participantTeam.create({ data: { eventId, name: unique("Team"), teamCode: unique("TEAM") } });
  await prisma.participantTeamMember.create({ data: { participantTeamId: team.id, userId, role: "lead" } });
  return team;
}

// API: POST /api/participants/:eventId/register — requires authentication.
test("registration rejects unauthenticated requests", async () => {
  const event = await eventWithUser();
  const response = await request(app).post(`/api/participants/${event.id}/register`).send({ memberName: "Alex" });
  assert.equal(response.statusCode, 401);
});

// API: POST /api/participants/:eventId/register — validates the event.
test("registration rejects a missing event", async () => {
  const { token } = await user();
  const response = await request(app).post(`/api/participants/${randomUUID()}/register`).set("Authorization", `Bearer ${token}`).send({ memberName: "Alex" });
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Event not found.");
});

// API: POST /api/participants/:eventId/register — validates phone input.
test("registration rejects non-numeric phone values", async () => {
  const { token } = await user();
  const event = await eventWithUser();
  const response = await request(app).post(`/api/participants/${event.id}/register`).set("Authorization", `Bearer ${token}`).send({ memberName: "Alex", memberPhone: "98-765" });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.error, /Member Phone/);
});

// API: POST /api/participants/:eventId/register — registers an individual participant.
test("registration creates an individual participant", async () => {
  const { user: registrant, token } = await user();
  const event = await eventWithUser();
  const response = await request(app).post(`/api/participants/${event.id}/register`).set("Authorization", `Bearer ${token}`).send({ memberName: "  Alex  ", memberEmail: registrant.email, memberPhone: "9876543210" });
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.participant.user.name, registrant.name);
  assert.equal(response.body.participant.checkInStatus, "Unconfirmed");
});

// API: POST /api/participants/:eventId/register — rejects a missing existing team.
test("registration rejects a nonexistent target team", async () => {
  const { token } = await user();
  const event = await eventWithUser();
  const response = await request(app).post(`/api/participants/${event.id}/register`).set("Authorization", `Bearer ${token}`).send({ mode: "existingTeam", targetTeamId: randomUUID(), memberName: "Alex" });
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Target team not found.");
});

// API: POST /api/participants/:eventId/participants/import — requires a workbook file.
test("participant import rejects a missing file", async () => {
  const { user: organizer, token } = await user();
  const event = await eventWithUser({ userId: organizer.id });
  await prisma.orgAccess.create({ data: { eventId: event.id, userId: organizer.id, accessLevel: "lead" } });
  const response = await request(app).post(`/api/participants/${event.id}/participants/import`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "An XLSX, XLS, or CSV file is required.");
});

// API: POST /api/participants/:eventId/participants/import — rejects unsupported extensions.
test("participant import rejects unsupported file types", async () => {
  const { user: organizer, token } = await user();
  const event = await eventWithUser({ userId: organizer.id });
  await prisma.orgAccess.create({ data: { eventId: event.id, userId: organizer.id, accessLevel: "lead" } });
  const response = await request(app).post(`/api/participants/${event.id}/participants/import`).set("Authorization", `Bearer ${token}`).attach("file", Buffer.from("not a workbook"), { filename: "participants.txt", contentType: "text/plain" });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Only XLSX, XLS, and CSV files are supported.");
});

// API: GET /api/participants/:eventId/participants — allows event members to list participants.
test("participant list allows an event member", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id, role: "participant" });
  const response = await request(app).get(`/api/participants/${event.id}/participants`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.participants, []);
});

// API: GET /api/participants/:eventId/participants — rejects a wrong-event user.
test("participant list rejects a wrong-event user", async () => {
  const event = await eventWithUser();
  const { token } = await user();
  const response = await request(app).get(`/api/participants/${event.id}/participants`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 403);
});

// API: GET /api/participants/:eventId/participants/export — exports an authorized event workbook.
test("participant export returns an XLSX workbook", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const response = await request(app).get(`/api/participants/${event.id}/participants/export`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"], /spreadsheetml/);
  assert.match(response.headers["content-disposition"], /attachment/);
});

// API: PATCH /api/participants/:id/status — rejects a non-organizer.
test("participant status rejects a non-organizer", async () => {
  const { user: participantUser, token } = await user();
  const event = await eventWithUser();
  const record = await participant(event.id, participantUser.id);
  const response = await request(app).patch(`/api/participants/${record.id}/status`).set("Authorization", `Bearer ${token}`).send({ checkInStatus: "Checked In" });
  assert.equal(response.statusCode, 403);
});

// API: PATCH /api/participants/:id/status — updates status and notes for an organizer.
test("participant status updates status and notes", async () => {
  const { user: organizer, token } = await user();
  const event = await eventWithUser({ userId: organizer.id });
  const record = await participant(event.id, organizer.id);
  const response = await request(app).patch(`/api/participants/${record.id}/status`).set("Authorization", `Bearer ${token}`).send({ checkInStatus: "Checked In", internalNotes: "  Arrived  " });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.participant.checkInStatus, "Checked_In");
  assert.equal(response.body.participant.internalNotes, "  Arrived  ");
});

// API: PATCH /api/participants/teams/:teamId/status — rejects a non-member.
test("team status rejects a non-member", async () => {
  const { user: owner } = await user();
  const event = await eventWithUser({ userId: owner.id });
  const team = await participantTeam(event.id, owner.id);
  const { token } = await user();
  const response = await request(app).patch(`/api/participants/teams/${team.id}/status`).set("Authorization", `Bearer ${token}`).send({ status: "Checked In" });
  assert.equal(response.statusCode, 403);
});

// API: PATCH /api/participants/teams/:teamId/notes — updates notes for an organizer.
test("team notes update for an event organizer", async () => {
  const { user: organizer, token } = await user();
  const event = await eventWithUser({ userId: organizer.id });
  const team = await participantTeam(event.id, organizer.id);
  const response = await request(app).patch(`/api/participants/teams/${team.id}/notes`).set("Authorization", `Bearer ${token}`).send({ internalNotes: "Stage near entrance" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.team.internalNotes, "Stage near entrance");
});

after(async () => {
  for (const id of eventIds) await prisma.event.delete({ where: { id } }).catch(() => {});
  if (userIds.size) await prisma.user.deleteMany({ where: { id: { in: [...userIds] } } }).catch(() => {});
  await prisma.$disconnect();
});
