// API TEST FILE: Covers GET /api/events/:eventId/stages, POST /api/events/:eventId/stages, and PATCH /api/stages/:stageId.

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
      name: "Stages Test User",
      email: `${uniqueValue("stages")}@example.com`,
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
      name: uniqueValue("Stages Test Event"),
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

async function createTestStage(eventId, stageOrder = 1) {
  return prisma.stage.create({
    data: {
      eventId,
      stageOrder,
      title: `Stage ${stageOrder}`,
      startAt: new Date("2030-01-01T09:00:00.000Z"),
      endAt: new Date("2030-01-01T10:00:00.000Z"),
    },
  });
}

// API: GET /api/events/:eventId/stages — rejects a request without authentication.
test("stage list rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(`/api/events/${event.id}/stages`);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/stages — rejects an authenticated user without event membership.
test("stage list rejects a non-member", async () => {
  const event = await createTestEventForUser();
  const { token } = await createTestUser();
  const response = await request(app)
    .get(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: GET /api/events/:eventId/stages — returns an empty list when an event has no stages.
test("stage list returns an empty array for an event with no stages", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.stages, []);
});

// API: GET /api/events/:eventId/stages — allows an authorized participant to read stages in order.
test("authorized participant can read stages in stage order", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  await createTestStage(event.id, 2);
  await createTestStage(event.id, 1);

  const response = await request(app)
    .get(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.stages.length, 2);
  assert.equal(response.body.stages[0].stageOrder, 1);
  assert.equal(response.body.stages[1].stageOrder, 2);
});

// API: POST /api/events/:eventId/stages — rejects a request without authentication.
test("stage creation rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/stages`)
    .send({ title: "Unauthorized Stage", timeWindow: "09:00 AM – 10:00 AM" });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events/:eventId/stages — rejects a user who is not a member of the event.
test("stage creation rejects a non-member", async () => {
  const event = await createTestEventForUser();
  const { token } = await createTestUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Non-member Stage", timeWindow: "09:00 AM – 10:00 AM" });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/stages — rejects a participant without organizer permission.
test("stage creation rejects a participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Participant Stage", timeWindow: "09:00 AM – 10:00 AM" });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/stages — rejects an organizer without lead access.
test("stage creation rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Member Organizer Stage", timeWindow: "09:00 AM – 10:00 AM" });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: POST /api/events/:eventId/stages — rejects missing title or schedule fields.
test("stage creation rejects empty mandatory fields", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "" });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Title and schedule are required.");
});

// API: POST /api/events/:eventId/stages — creates a stage for a lead organizer.
test("lead organizer can create a stage", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/stages`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Opening Stage",
      timeWindow: "09:00 AM – 10:00 AM",
      location: "Main Hall",
      stageOrder: 1,
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.stage.title, "Opening Stage");
  assert.equal(response.body.stage.location, "Main Hall");
  assert.equal(response.body.stage.stageOrder, 1);
});

// API: PATCH /api/stages/:stageId — rejects a request without authentication.
test("stage update rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const stage = await createTestStage(event.id);
  const response = await request(app)
    .patch(`/api/stages/${stage.id}`)
    .send({
      title: "Updated Stage",
      timeWindow: "10:00 AM – 11:00 AM",
    });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: PATCH /api/stages/:stageId — returns 404 when the stage does not exist.
test("stage update rejects a nonexistent stage", async () => {
  const { token } = await createTestUser();
  const response = await request(app)
    .patch(`/api/stages/${randomUUID()}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Updated Stage",
      timeWindow: "10:00 AM – 11:00 AM",
    });

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Stage not found.");
});

// API: PATCH /api/stages/:stageId — rejects a participant attempting to edit a stage.
test("stage update rejects a participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const stage = await createTestStage(event.id);
  const response = await request(app)
    .patch(`/api/stages/${stage.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Updated Stage", timeWindow: "10:00 AM – 11:00 AM" });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Lead organizer access is required for this event.",
  );
});

// API: PATCH /api/stages/:stageId — rejects an organizer without lead access.
test("stage update rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const stage = await createTestStage(event.id);
  const response = await request(app)
    .patch(`/api/stages/${stage.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Updated Stage", timeWindow: "10:00 AM – 11:00 AM" });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Lead organizer access is required for this event.",
  );
});

// API: PATCH /api/stages/:stageId — rejects an update with empty mandatory fields.
test("stage update rejects empty mandatory fields", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const stage = await createTestStage(event.id);
  const response = await request(app)
    .patch(`/api/stages/${stage.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Title and schedule are required.");
});

// API: PATCH /api/stages/:stageId — requires mandatory fields even for a status-only update.
test("stage update rejects a status-only update", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const stage = await createTestStage(event.id);
  const response = await request(app)
    .patch(`/api/stages/${stage.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "LIVE" });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Title and schedule are required.");
});

// API: PATCH /api/stages/:stageId — updates a stage when the lead organizer sends complete fields.
test("lead organizer can update a stage", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const stage = await createTestStage(event.id);
  const response = await request(app)
    .patch(`/api/stages/${stage.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Updated Stage",
      timeWindow: "10:00 AM – 11:00 AM",
      location: "Updated Hall",
      status: "LIVE",
    });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "Stage updated successfully.");
  assert.equal(response.body.stage.title, "Updated Stage");
  assert.equal(response.body.stage.location, "Updated Hall");
  assert.equal(response.body.stage.status, "LIVE");
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
