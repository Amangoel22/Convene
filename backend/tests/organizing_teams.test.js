// API TEST FILE: Covers organizing-team list/create/member/key/update/delete endpoints.

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
    data: {
      name: "Team Test User",
      email: `${unique("teams")}@example.com`,
      phone: "9876543210",
      passwordHash: await hashPassword("password123"),
    },
  });
  userIds.add(record.id);
  return { user: record, token: generateToken({ userId: record.id }) };
}

async function eventWithUser({ userId, role = "organizer", accessLevel = "lead" } = {}) {
  const event = await prisma.event.create({
    data: {
      name: unique("Team Event"), type: "Conference",
      startDate: new Date("2030-01-01"), endDate: new Date("2030-01-01"),
      startTime: "09:00", endTime: "17:00",
      memberships: userId ? { create: { userId, role } } : undefined,
      orgAccess: userId ? { create: { userId, accessLevel } } : undefined,
    },
  });
  eventIds.add(event.id);
  return event;
}

async function team(eventId) {
  return prisma.orgTeam.create({
    data: { eventId, name: unique("Existing Team"), description: "Operations" },
  });
}

// API: GET /api/events/:eventId/organizing-teams — requires authentication.
test("team list rejects unauthenticated requests", async () => {
  const event = await eventWithUser();
  const response = await request(app).get(`/api/events/${event.id}/organizing-teams`);
  assert.equal(response.statusCode, 401);
});

// API: GET /api/events/:eventId/organizing-teams — allows event participants to view.
test("team list allows an event participant", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id, role: "participant", accessLevel: "member" });
  const response = await request(app).get(`/api/events/${event.id}/organizing-teams`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.teams, []);
});

// API: POST /api/events/:eventId/organizing-teams — requires lead access.
test("team creation rejects a non-lead organizer", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id, accessLevel: "member" });
  const response = await request(app).post(`/api/events/${event.id}/organizing-teams`).set("Authorization", `Bearer ${token}`).send({ name: "Tech" });
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied. Organizing lead access is required.");
});

// API: POST /api/events/:eventId/organizing-teams — validates a team name.
test("team creation rejects a blank name", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const response = await request(app).post(`/api/events/${event.id}/organizing-teams`).set("Authorization", `Bearer ${token}`).send({ name: "   " });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Team name is required.");
});

// API: POST /api/events/:eventId/organizing-teams — validates member phone numbers.
test("team creation rejects an invalid member phone", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const response = await request(app).post(`/api/events/${event.id}/organizing-teams`).set("Authorization", `Bearer ${token}`).send({ name: "Tech", members: [{ name: "Alex", phone: "123" }] });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Every added member must have a 10-digit phone number.");
});

// API: POST /api/events/:eventId/organizing-teams — creates a team and linked member.
test("team creation trims fields and creates members", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const response = await request(app).post(`/api/events/${event.id}/organizing-teams`).set("Authorization", `Bearer ${token}`).send({ name: "  Tech  ", description: "  Setup  ", members: [{ name: "  Alex  ", phone: "9876543211", userId: member.id, accessLevel: "lead" }] });
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.team.name, "Tech");
  assert.equal(response.body.team.description, "Setup");
  assert.equal(response.body.team.members[0].name, "Alex");
});

// API: POST /api/events/:eventId/organizing-teams/:teamId/members — validates member input.
test("adding a team member validates name and phone", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const target = await team(event.id);
  const response = await request(app).post(`/api/events/${event.id}/organizing-teams/${target.id}/members`).set("Authorization", `Bearer ${token}`).send({ name: "", phone: "bad" });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Member name is required.");
});

// API: PATCH /api/events/:eventId/organizing-teams/:teamId/members/:memberId/key — returns 404 for wrong team.
test("invite-key regeneration rejects a missing member", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const target = await team(event.id);
  const response = await request(app).patch(`/api/events/${event.id}/organizing-teams/${target.id}/members/${randomUUID()}/key`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Team member not found.");
});

// API: DELETE /api/events/:eventId/organizing-teams/:teamId/members/:memberId — returns 404 for wrong event/team.
test("member deletion rejects a missing member", async () => {
  const { user: member, token } = await user();
  const event = await eventWithUser({ userId: member.id });
  const target = await team(event.id);
  const response = await request(app).delete(`/api/events/${event.id}/organizing-teams/${target.id}/members/${randomUUID()}`).set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Team member not found.");
});

after(async () => {
  for (const id of eventIds) await prisma.event.delete({ where: { id } }).catch(() => {});
  if (userIds.size) await prisma.user.deleteMany({ where: { id: { in: [...userIds] } } }).catch(() => {});
  await prisma.$disconnect();
});
