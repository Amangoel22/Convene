// API TEST FILE: Covers GET/POST /api/events/:eventId/resources and PATCH /api/events/:eventId/resources/:resourceId.

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
      name: "Resources Test User",
      email: `${uniqueValue("resources")}@example.com`,
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
      name: uniqueValue("Resources Test Event"),
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

async function createTestResource(eventId, uploadedUserId = null) {
  return prisma.eventResource.create({
    data: {
      eventId,
      uploadedUserId,
      title: "Existing Rulebook.pdf",
      category: "application/pdf",
      fileUrl: `events/${eventId}/existing-rulebook.pdf`,
      fileType: "application/pdf",
      fileSizeBytes: 128,
    },
  });
}

// API: GET /api/events/:eventId/resources — rejects an unauthenticated request.
test("resource list rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(`/api/events/${event.id}/resources`);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/resources — allows an authorized event participant to view resources.
test("resource list allows an event participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const response = await request(app)
    .get(`/api/events/${event.id}/resources`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.resources, []);
});

// API: GET /api/events/:eventId/resources — rejects a user from another event.
test("resource list rejects a wrong-event user", async () => {
  const requestedEvent = await createTestEventForUser();
  const { user, token } = await createTestUser();
  await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${requestedEvent.id}/resources`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/resources — rejects an unauthenticated request.
test("resource upload rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/resources`)
    .field("title", "Rulebook")
    .attach("file", Buffer.from("pdf content"), {
      filename: "rulebook.pdf",
      contentType: "application/pdf",
    });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events/:eventId/resources — requires lead organizer access.
test("resource upload rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/resources`)
    .set("Authorization", `Bearer ${token}`)
    .field("title", "Rulebook")
    .attach("file", Buffer.from("pdf content"), {
      filename: "rulebook.pdf",
      contentType: "application/pdf",
    });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: POST /api/events/:eventId/resources — rejects a request without a file.
test("resource upload rejects a missing file", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/resources`)
    .set("Authorization", `Bearer ${token}`)
    .field("title", "Rulebook");

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "A file is required.");
});

// API: POST /api/events/:eventId/resources — rejects unsupported MIME types.
test("resource upload rejects unsupported file types", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/resources`)
    .set("Authorization", `Bearer ${token}`)
    .attach("file", Buffer.from("plain text"), {
      filename: "notes.txt",
      contentType: "text/plain",
    });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Only PDF, JPG, PNG, CSV, XLS, and XLSX files are allowed.",
  );
});

// API: POST /api/events/:eventId/resources — rejects a participant upload.
test("resource upload rejects a participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/resources`)
    .set("Authorization", `Bearer ${token}`)
    .attach("file", Buffer.from("pdf content"), {
      filename: "rulebook.pdf",
      contentType: "application/pdf",
    });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: PATCH /api/events/:eventId/resources/:resourceId — rejects an unauthenticated request.
test("resource update rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const resource = await createTestResource(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/resources/${resource.id}`)
    .field("title", "Updated Rulebook");

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: PATCH /api/events/:eventId/resources/:resourceId — returns 404 for a missing resource.
test("resource update rejects a nonexistent resource", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .patch(`/api/events/${event.id}/resources/${randomUUID()}`)
    .set("Authorization", `Bearer ${token}`)
    .field("title", "Updated Rulebook");

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Resource not found.");
});

// API: PATCH /api/events/:eventId/resources/:resourceId — rejects an organizer without lead access.
test("resource update rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const resource = await createTestResource(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/resources/${resource.id}`)
    .set("Authorization", `Bearer ${token}`)
    .field("title", "Updated Rulebook");

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: PATCH /api/events/:eventId/resources/:resourceId — rejects a resource belonging to another event.
test("resource update rejects a wrong-event resource", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const resource = await createTestResource(otherEvent.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/resources/${resource.id}`)
    .set("Authorization", `Bearer ${token}`)
    .field("title", "Updated Rulebook");

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Resource not found.");
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
