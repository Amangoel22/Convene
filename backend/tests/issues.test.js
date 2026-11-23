// API TEST FILE: Covers GET/POST /api/events/:eventId/issues and PATCH /api/events/:eventId/issues/:issueId/close.

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
      name: "Issues Test User",
      email: `${uniqueValue("issues")}@example.com`,
      phone: "9876543210",
      passwordHash: await hashPassword("password123"),
    },
  });
  createdUserIds.add(user.id);
  return { user, token: generateToken({ userId: user.id }) };
}

async function createTestEventForUser({ userId, role = "organizer" } = {}) {
  const event = await prisma.event.create({
    data: {
      name: uniqueValue("Issues Test Event"),
      type: "Conference",
      startDate: new Date("2030-01-01T00:00:00.000Z"),
      endDate: new Date("2030-01-01T00:00:00.000Z"),
      startTime: "09:00",
      endTime: "17:00",
      memberships: userId ? { create: { userId, role } } : undefined,
    },
  });
  createdEventIds.add(event.id);
  return event;
}

async function createTestIssue(eventId, reporterUserId) {
  return prisma.issue.create({
    data: {
      eventId,
      reporterUserId,
      title: "Existing network issue",
      priority: "High",
      description: "Access point is offline.",
    },
  });
}

// API: GET /api/events/:eventId/issues — rejects an unauthenticated request.
test("issue list rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(`/api/events/${event.id}/issues`);
  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/issues — allows any event member to view issues.
test("issue list allows an event participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id, role: "participant" });
  const response = await request(app)
    .get(`/api/events/${event.id}/issues`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.issues, []);
});

// API: GET /api/events/:eventId/issues — rejects a user from another event.
test("issue list rejects a wrong-event user", async () => {
  const requestedEvent = await createTestEventForUser();
  const { user, token } = await createTestUser();
  await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${requestedEvent.id}/issues`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/issues — rejects an unauthenticated request.
test("issue creation rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/issues`)
    .send({ title: "Wi-Fi down", priority: "High" });
  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events/:eventId/issues — rejects a user without event membership.
test("issue creation rejects a wrong-event user", async () => {
  const event = await createTestEventForUser();
  const { token } = await createTestUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/issues`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Wi-Fi down", priority: "High" });
  assert.equal(response.statusCode, 403);
});

// API: POST /api/events/:eventId/issues — requires a non-blank title.
test("issue creation rejects a blank title", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/issues`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "   ", priority: "High" });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Issue title is required.");
});

// API: POST /api/events/:eventId/issues — validates the priority enum.
test("issue creation rejects an invalid priority", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/issues`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Wi-Fi down", priority: "Urgent" });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "A valid issue priority is required.");
});

// API: POST /api/events/:eventId/issues — creates an issue for a member.
test("issue creation stores a trimmed issue", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id, role: "participant" });
  const response = await request(app)
    .post(`/api/events/${event.id}/issues`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "  Wi-Fi down  ", priority: "Critical", description: "  Router offline  " });
  assert.equal(response.statusCode, 201);
  assert.equal(response.body.issue.title, "Wi-Fi down");
  assert.equal(response.body.issue.priority, "Critical");
  assert.equal(response.body.issue.description, "Router offline");
});

// API: PATCH /api/events/:eventId/issues/:issueId/close — requires resolution feedback.
test("issue closing rejects blank feedback", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const issue = await createTestIssue(event.id, user.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/issues/${issue.id}/close`)
    .set("Authorization", `Bearer ${token}`)
    .send({ feedback: "   " });
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Resolution feedback is required.");
});

// API: PATCH /api/events/:eventId/issues/:issueId/close — returns 404 for a missing issue.
test("issue closing rejects a nonexistent issue", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .patch(`/api/events/${event.id}/issues/${randomUUID()}/close`)
    .set("Authorization", `Bearer ${token}`)
    .send({ feedback: "Resolved" });
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Issue not found.");
});

// API: PATCH /api/events/:eventId/issues/:issueId/close — prevents cross-event issue access.
test("issue closing rejects an issue from another event", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const issue = await createTestIssue(otherEvent.id, user.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/issues/${issue.id}/close`)
    .set("Authorization", `Bearer ${token}`)
    .send({ feedback: "Resolved" });
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Issue not found.");
});

// API: PATCH /api/events/:eventId/issues/:issueId/close — marks an issue resolved.
test("issue closing stores trimmed feedback", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const issue = await createTestIssue(event.id, user.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/issues/${issue.id}/close`)
    .set("Authorization", `Bearer ${token}`)
    .send({ feedback: "  Replaced the router.  " });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.issue.status, "Resolved");
  assert.equal(response.body.issue.mandatoryResolutionFeedback, "Replaced the router.");
  assert.ok(response.body.issue.resolvedAt);
});

after(async () => {
  for (const eventId of createdEventIds) {
    await prisma.event.delete({ where: { id: eventId } }).catch(() => {});
  }
  if (createdUserIds.size > 0) {
    await prisma.user.deleteMany({ where: { id: { in: [...createdUserIds] } } }).catch(() => {});
  }
  await prisma.$disconnect();
});
