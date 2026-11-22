// API TEST FILE: Covers GET /api/events, POST /api/events, and GET /api/events/:eventId.

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
      name: "Events Test User",
      email: `${uniqueValue("events")}@example.com`,
      phone: "9876543210",
      passwordHash: await hashPassword("password123"),
    },
  });
  createdUserIds.add(user.id);
  return { user, token: generateToken({ userId: user.id }) };
}

async function createTestEvent({
  userId,
  role = "organizer",
  accessLevel = "lead",
} = {}) {
  const event = await prisma.event.create({
    data: {
      name: uniqueValue("Events Test Event"),
      type: "Conference",
      startDate: new Date("2030-01-01T00:00:00.000Z"),
      endDate: new Date("2030-01-01T00:00:00.000Z"),
      startTime: "09:00",
      endTime: "17:00",
      memberships: userId
        ? { create: { userId, role } }
        : undefined,
      orgAccess: userId
        ? { create: { userId, accessLevel } }
        : undefined,
    },
  });
  createdEventIds.add(event.id);
  return event;
}

// API: GET /api/events — rejects a request from a user without an authentication token.
test("event list rejects an unauthenticated request", async () => {
  const response = await request(app).get("/api/events");

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events — returns an empty list for an authenticated user with no memberships.
test("event list returns no events for a user without memberships", async () => {
  const { token } = await createTestUser();
  const response = await request(app)
    .get("/api/events")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.events, []);
});

// API: GET /api/events — returns only events the authenticated user can access.
test("event list returns only the user's authorized events", async () => {
  const { user, token } = await createTestUser();
  const ownEvent = await createTestEvent({ userId: user.id });
  const otherUser = await createTestUser();
  const otherEvent = await createTestEvent({ userId: otherUser.user.id });

  const response = await request(app)
    .get("/api/events")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.events.length, 1);
  assert.equal(response.body.events[0].id, ownEvent.id);
  assert.notEqual(response.body.events[0].id, otherEvent.id);
  assert.equal(response.body.events[0].userRole, "organizer");
  assert.equal(response.body.events[0].accessLevel, "lead");
});

// API: GET /api/events — returns participant and member access values for non-organizers.
test("event list returns participant role and member access", async () => {
  const { user, token } = await createTestUser();
  await createTestEvent({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });

  const response = await request(app)
    .get("/api/events")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.events[0].userRole, "participant");
  assert.equal(response.body.events[0].accessLevel, "member");
});

// API: POST /api/events — rejects a request from a user without an authentication token.
test("event creation rejects an unauthenticated request", async () => {
  const response = await request(app)
    .post("/api/events")
    .send({ name: "Unauthorized Event" });
    // .set("Authorization", `Bearer ${token}`) not sent here to simulate unauthenticated request

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events — rejects a request missing required event fields.
test("event creation rejects missing required fields", async () => {
  const { token } = await createTestUser();
  const response = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Incomplete Event" }); //sending only name to simulate missing required fields like type, dates...

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Name, type, dates, and times are required.",
  );
});

// API: POST /api/events — creates an event and grants the creator organizer/lead access.
test("authenticated user can create an event", async () => {
  const { user, token } = await createTestUser();
  const response = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Created Events Test",
      type: "Conference",
      startDate: "2030-01-01",
      endDate: "2030-01-01",
      startTime: "09:00",
      endTime: "17:00",
      primaryLocation: "Test Venue",
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.message, "Event created successfully.");
  assert.equal(response.body.event.userRole, "organizer");
  assert.equal(response.body.event.accessLevel, "lead");
  assert.equal(response.body.event.name, "Created Events Test");
  createdEventIds.add(response.body.event.id);

  const membership = await prisma.eventMembership.findUnique({
    where: {
      unique_event_user: {
        eventId: response.body.event.id,
        userId: user.id,
      },
    },
  });
  assert.equal(membership.role, "organizer");
});

// API: POST /api/events — creates initial stages when stages are included in the request.
test("event creation stores initial stages", async () => {
  const { token } = await createTestUser();
  const response = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Staged Events Test",
      type: "Conference",
      startDate: "2030-01-01",
      endDate: "2030-01-01",
      startTime: "09:00",
      endTime: "17:00",
      stages: [
        {
          order: 1,
          title: "Opening",
          startTime: "09:00 AM",
          endTime: "10:00 AM",
        },
        {
          order: 2,
          title: "Closing",
          startTime: "04:00 PM",
          endTime: "05:00 PM",
        },
      ],
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.event.stages.length, 2);
  assert.equal(response.body.event.stages[0].title, "Opening");
  assert.equal(response.body.event.stages[1].title, "Closing");
  createdEventIds.add(response.body.event.id);
});

// API: GET /api/events/:eventId — rejects a request from a user without an authentication token.
test("event detail rejects an unauthenticated request", async () => {
  const event = await createTestEvent();
  const response = await request(app).get(`/api/events/${event.id}`);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId — returns event details to an authorized member.
test("authorized member can read event details", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEvent({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${event.id}`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.event.id, event.id);
  assert.equal(response.body.event.name, event.name);
  assert.equal(response.body.userRole, "organizer");
  assert.equal(response.body.accessLevel, "lead");
});

// API: GET /api/events/:eventId — denies a user who is not a member of the event.
test("event detail rejects a user without event membership", async () => {
  const event = await createTestEvent();
  const { token } = await createTestUser();
  const response = await request(app)
    .get(`/api/events/${event.id}`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: GET /api/events/:eventId — authorization runs before lookup for a nonexistent event ID.
test("event detail denies an inaccessible nonexistent event ID", async () => {
  const { token } = await createTestUser();
  const response = await request(app)
    .get(`/api/events/${randomUUID()}`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
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
