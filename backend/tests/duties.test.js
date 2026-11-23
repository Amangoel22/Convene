// API TEST FILE: Covers GET/POST /api/events/:eventId/duties and PATCH /api/events/:eventId/duties/:dutyId.

import "dotenv/config";
import { randomUUID } from "node:crypto";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { generateToken, hashPassword } from "../src/utils/auth.js";

let uniqueCounter = 0;
const createdUserIds = new Set();
const createdEventIds = new Set();

function uniqueValue(prefix) {
  uniqueCounter += 1;
  return `${prefix}-${Date.now()}-${uniqueCounter}`;
}

async function createTestUser() {
  const user = await prisma.user.create({
    data: {
      name: "Duties Test User",
      email: `${uniqueValue("duties")}@example.com`,
      phone: "9876543210",
      passwordHash: await hashPassword("password123"),
    },
  });
  createdUserIds.add(user.id);
  return { user, token: generateToken({ userId: user.id }) };
}

async function createTestEventForUser({
  userId,
  role = "organizer",
  accessLevel = "lead",
} = {}) {
  const event = await prisma.event.create({
    data: {
      name: uniqueValue("Duties Test Event"),
      type: "Conference",
      startDate: new Date("2030-01-01T00:00:00.000Z"),
      endDate: new Date("2030-01-01T00:00:00.000Z"),
      startTime: "09:00",
      endTime: "17:00",
      memberships: userId ? { create: { userId, role } } : undefined,
      orgAccess: userId
        ? { create: { userId, accessLevel } }
        : undefined,
    },
  });
  createdEventIds.add(event.id);
  return event;
}

async function createTestTeam(eventId) {
  return prisma.orgTeam.create({
    data: { eventId, name: uniqueValue("Duties Test Team") },
  });
}

async function createTestMember(eventId, orgTeamId, { userId = null } = {}) {
  return prisma.orgMember.create({
    data: {
      eventId,
      orgTeamId,
      userId,
      inviteKey: uniqueValue("DUTYINV").slice(-10).toUpperCase(),
      name: "Duty Assignee",
      phone: "9876543210",
    },
  });
}

async function createTestVenue(eventId) {
  return prisma.venue.create({
    data: { eventId, name: uniqueValue("Duties Venue") },
  });
}

async function createTestDuty(eventId, { title = "Existing Duty" } = {}) {
  return prisma.duty.create({
    data: {
      eventId,
      title,
      startAt: new Date("2030-01-01T09:00:00.000Z"),
      endAt: new Date("2030-01-01T10:00:00.000Z"),
    },
  });
}

const validDutyBody = {
  title: "Registration Desk",
  startAt: "2030-01-01T09:00:00.000Z",
  endAt: "2030-01-01T10:00:00.000Z",
};

// API: GET /api/events/:eventId/duties — rejects an unauthenticated request.
test("duty list rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(`/api/events/${event.id}/duties`);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/duties — keeps participant viewing disabled for now.
test("duty list rejects a participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const response = await request(app)
    .get(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: GET /api/events/:eventId/duties — returns an empty list for an organizer with no duties.
test("duty list returns an empty array when no duties exist", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.duties, []);
});

// API: GET /api/events/:eventId/duties — returns organizer duties ordered by start time.
test("organizer can list duties in start-time order", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  await prisma.duty.create({
    data: {
      eventId: event.id,
      title: "Later Duty",
      startAt: new Date("2030-01-01T12:00:00.000Z"),
      endAt: new Date("2030-01-01T13:00:00.000Z"),
    },
  });
  await prisma.duty.create({
    data: {
      eventId: event.id,
      title: "Earlier Duty",
      startAt: new Date("2030-01-01T09:00:00.000Z"),
      endAt: new Date("2030-01-01T10:00:00.000Z"),
    },
  });

  const response = await request(app)
    .get(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.duties[0].title, "Earlier Duty");
  assert.equal(response.body.duties[1].title, "Later Duty");
});

// API: GET /api/events/:eventId/duties — rejects an organizer from another event.
test("duty list rejects a wrong-event organizer", async () => {
  const requestedEvent = await createTestEventForUser();
  const { user, token } = await createTestUser();
  await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${requestedEvent.id}/duties`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/duties — rejects an unauthenticated request.
test("duty creation rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events/:eventId/duties — requires lead organizer access.
test("duty creation rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: POST /api/events/:eventId/duties — rejects a participant.
test("duty creation rejects a participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/duties — rejects missing mandatory duty fields.
test("duty creation rejects missing mandatory fields", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Duty title is required.");
});

// API: POST /api/events/:eventId/duties — rejects a duty whose end is not after its start.
test("duty creation rejects an invalid time range", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      ...validDutyBody,
      endAt: "2030-01-01T08:00:00.000Z",
    });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Duty end time must be after its start time.",
  );
});

// API: POST /api/events/:eventId/duties — rejects an assigned member from another event.
test("duty creation rejects a wrong-event member", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const otherTeam = await createTestTeam(otherEvent.id);
  const otherMember = await createTestMember(otherEvent.id, otherTeam.id);
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validDutyBody, orgMemberIds: [otherMember.id] });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Every assigned member must belong to this event.",
  );
});

// API: POST /api/events/:eventId/duties — rejects a venue from another event.
test("duty creation rejects a wrong-event venue", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const venue = await createTestVenue(otherEvent.id);
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validDutyBody, venueId: venue.id });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Venue does not belong to this event.");
});

// API: POST /api/events/:eventId/duties — creates a duty and its assignments.
test("lead organizer can create a duty with assignments", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const team = await createTestTeam(event.id);
  const member = await createTestMember(event.id, team.id);
  const venue = await createTestVenue(event.id);
  const response = await request(app)
    .post(`/api/events/${event.id}/duties`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      ...validDutyBody,
      venueId: venue.id,
      notes: "Bring the registration list.",
      orgMemberIds: [member.id],
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.duty.title, validDutyBody.title);
  assert.equal(response.body.duty.venueId, venue.id);
  assert.equal(response.body.duty.assignments.length, 1);
  assert.equal(response.body.duty.assignments[0].orgMemberId, member.id);
});

// API: PATCH /api/events/:eventId/duties/:dutyId — rejects an unauthenticated request.
test("duty update rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const duty = await createTestDuty(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${duty.id}`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: PATCH /api/events/:eventId/duties/:dutyId — returns 404 for a missing duty.
test("duty update rejects a nonexistent duty", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${randomUUID()}`)
    .set("Authorization", `Bearer ${token}`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Duty not found.");
});

// API: PATCH /api/events/:eventId/duties/:dutyId — rejects a duty ID belonging to another event.
test("duty update rejects an event ID mismatch", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const duty = await createTestDuty(otherEvent.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${duty.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Duty does not belong to this event.");
});

// API: PATCH /api/events/:eventId/duties/:dutyId — rejects an organizer without lead access.
test("duty update rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const duty = await createTestDuty(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${duty.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send(validDutyBody);

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Lead organizer access is required for this event.",
  );
});

// API: PATCH /api/events/:eventId/duties/:dutyId — rejects an empty mandatory update.
test("duty update rejects missing mandatory fields", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const duty = await createTestDuty(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${duty.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Duty title and times are required.");
});

// API: PATCH /api/events/:eventId/duties/:dutyId — replaces assignments during a valid update.
test("lead organizer can update a duty and replace assignments", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const team = await createTestTeam(event.id);
  const firstMember = await createTestMember(event.id, team.id);
  const secondMember = await createTestMember(event.id, team.id);
  const duty = await createTestDuty(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${duty.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      ...validDutyBody,
      title: "Updated Registration Desk",
      orgMemberIds: [secondMember.id],
    });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.duty.title, "Updated Registration Desk");
  assert.equal(response.body.duty.assignments.length, 1);
  assert.equal(response.body.duty.assignments[0].orgMemberId, secondMember.id);
  assert.notEqual(response.body.duty.assignments[0].orgMemberId, firstMember.id);
});

// API: PATCH /api/events/:eventId/duties/:dutyId — rejects a wrong-event assigned member.
test("duty update rejects a wrong-event member", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const otherTeam = await createTestTeam(otherEvent.id);
  const otherMember = await createTestMember(otherEvent.id, otherTeam.id);
  const duty = await createTestDuty(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/duties/${duty.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validDutyBody, orgMemberIds: [otherMember.id] });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Every assigned member must belong to this event.",
  );
});

after(async () => {
  for (const eventId of createdEventIds) {
    await prisma.event.delete({ where: { id: eventId } }).catch(() => {});
  }

  if (createdUserIds.size > 0) {
    await prisma.user
      .deleteMany({ where: { id: { in: [...createdUserIds] } } })
      .catch(() => {});
  }

  await prisma.$disconnect();
});
