// API TEST FILE: Covers task listing, export, creation, status updates, and assignment updates.

import "dotenv/config";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import XLSX from "xlsx";
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

function responseBodyToBuffer(body) {
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  if (body?.type === "Buffer" && body.data) return Buffer.from(body.data);
  if (body?.data && typeof body.data === "object")
    return Buffer.from(Object.values(body.data));
  if (body && typeof body === "object")
    return Buffer.from(Object.values(body));
  return Buffer.from(body);
}

function binaryParser(response, callback) {
  const chunks = [];
  response.on("data", (chunk) => chunks.push(chunk));
  response.on("end", () => callback(null, Buffer.concat(chunks)));
}

async function createTestUser() {
  const user = await prisma.user.create({
    data: {
      name: "Tasks Test User",
      email: `${uniqueValue("tasks")}@example.com`,
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
      name: uniqueValue("Tasks Test Event"),
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
    data: { eventId, name: uniqueValue("Tasks Test Team") },
  });
}

async function createTestMember(eventId, orgTeamId, { userId = null } = {}) {
  return prisma.orgMember.create({
    data: {
      eventId,
      orgTeamId,
      userId,
      inviteKey: uniqueValue("TASKINV").slice(-10).toUpperCase(),
      name: "Task Assignee",
      phone: "9876543210",
    },
  });
}

async function createTestTask(
  eventId,
  { orgTeamId = null, assignedOrgMemberId = null, status = "Todo" } = {},
) {
  return prisma.task.create({
    data: {
      eventId,
      title: uniqueValue("Test Task"),
      description: "Task description for testing.",
      orgTeamId,
      assignedOrgMemberId,
      status,
      priority: "Medium",
      lastUpdatedByName: "Tasks Test User",
    },
  });
}

// API: GET /api/events/:eventId/tasks — rejects an unauthenticated request.
test("task list rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(`/api/events/${event.id}/tasks`);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/tasks — rejects a user without membership in the event.
test("task list rejects a non-member", async () => {
  const event = await createTestEventForUser();
  const { token } = await createTestUser();
  const response = await request(app)
    .get(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: GET /api/events/:eventId/tasks — returns an empty list for an event without tasks.
test("task list returns an empty array when no tasks exist", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.tasks, []);
});

// API: GET /api/events/:eventId/tasks — does not return tasks from another event.
test("task list is isolated to the requested event", async () => {
  const { user, token } = await createTestUser();
  const ownEvent = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const ownTask = await createTestTask(ownEvent.id);
  await createTestTask(otherEvent.id);

  const response = await request(app)
    .get(`/api/events/${ownEvent.id}/tasks`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.tasks.length, 1);
  assert.equal(response.body.tasks[0].id, ownTask.id);
});

// API: GET /api/events/:eventId/tasks — supports status, priority, and team filters.
test("task list applies supported filters", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const team = await createTestTeam(event.id);
  await prisma.task.create({
    data: {
      eventId: event.id,
      title: "Filtered Task",
      orgTeamId: team.id,
      status: "Completed",
      priority: "High",
    },
  });
  await createTestTask(event.id, { orgTeamId: team.id });

  const response = await request(app)
    .get(`/api/events/${event.id}/tasks`)
    .query({ orgTeamId: team.id, status: "Completed", priority: "High" })
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.tasks.length, 1);
  assert.equal(response.body.tasks[0].title, "Filtered Task");
});

// API: GET /api/events/:eventId/tasks/export — rejects an unauthenticated request.
test("task export rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(
    `/api/events/${event.id}/tasks/export`,
  );

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/tasks/export — rejects a member of a different event.
test("task export rejects a wrong-event user", async () => {
  const requestedEvent = await createTestEventForUser();
  const { user, token } = await createTestUser();
  await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${requestedEvent.id}/tasks/export`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: GET /api/events/:eventId/tasks/export — includes all documented task columns.
test("task export includes the complete task header and row", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  await prisma.task.create({
    data: {
      eventId: event.id,
      title: "Exported Task",
      description: "Export description",
      status: "Completed",
      priority: "High",
      lastUpdatedByName: "Exporter",
    },
  });

  const response = await request(app)
    .get(`/api/events/${event.id}/tasks/export`)
    .set("Authorization", `Bearer ${token}`)
    .buffer(true)
    .parse(binaryParser);

  assert.equal(response.statusCode, 200);
  assert.match(
    response.headers["content-type"],
    /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/,
  );

  const workbookBuffer = responseBodyToBuffer(response.body);
  assert.ok(workbookBuffer.length > 0);
  const workbook = XLSX.read(workbookBuffer, { type: "buffer" });
  const rows = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]],
    { header: 1, defval: "" },
  );
  assert.deepEqual(rows[0], [
    "Task ID",
    "Task Title",
    "Description",
    "Team",
    "Assigned To",
    "Assigned Phone",
    "Status",
    "Priority",
    "Due Date",
    "Completion State",
    "Created At",
    "Updated At",
  ]);
  assert.equal(rows[1][1], "Exported Task");
  assert.equal(rows[1][6], "Completed");
  assert.equal(rows[1][9], "Completed");
});

// API: POST /api/events/:eventId/tasks — rejects an unauthenticated request.
test("task creation rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/tasks`)
    .send({ title: "Unauthorized Task" });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events/:eventId/tasks — requires organizer and lead access.
test("task creation rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Unauthorized Lead Task" });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: POST /api/events/:eventId/tasks — rejects a missing or whitespace-only title.
test("task creation rejects an empty mandatory title", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "   " });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Task title is required.");
});

// API: POST /api/events/:eventId/tasks — rejects unsupported priorities.
test("task creation rejects an invalid priority", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Invalid Priority Task", priority: "Urgent" });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Invalid task priority.");
});

// API: POST /api/events/:eventId/tasks — creates an unassigned task for a lead organizer.
test("lead organizer can create an unassigned task", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Prepare Registration Desk",
      description: "Prepare badges and check-in materials.",
      priority: "High",
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.task.title, "Prepare Registration Desk");
  assert.equal(response.body.task.priority, "High");
  assert.equal(response.body.task.assignedOrgMemberId, null);
});

// API: POST /api/events/:eventId/tasks — rejects an assigned member from another event.
test("task creation rejects a member from another event", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const otherTeam = await createTestTeam(otherEvent.id);
  const otherMember = await createTestMember(otherEvent.id, otherTeam.id);
  const response = await request(app)
    .post(`/api/events/${event.id}/tasks`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Wrong Event Assignment", assignedOrgMemberId: otherMember.id });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Assigned member does not belong to this event.",
  );
});

// API: PATCH /api/tasks/:taskId/status — rejects an unauthenticated request.
test("task status update rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}/status`)
    .send({ status: "Completed" });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: PATCH /api/tasks/:taskId/status — rejects an empty or invalid status.
test("task status update rejects missing and invalid status", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const task = await createTestTask(event.id);
  const missing = await request(app)
    .patch(`/api/tasks/${task.id}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({});
  const invalid = await request(app)
    .patch(`/api/tasks/${task.id}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "Unknown" });

  assert.equal(missing.statusCode, 400);
  assert.equal(missing.body.error, "Status is required.");
  assert.equal(invalid.statusCode, 400);
  assert.equal(invalid.body.error, "Invalid task status.");
});

// API: PATCH /api/tasks/:taskId/status — rejects an unrelated event member.
test("task status update rejects a user from another event", async () => {
  const taskEvent = await createTestEventForUser();
  const task = await createTestTask(taskEvent.id);
  const { user, token } = await createTestUser();
  await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .patch(`/api/tasks/${task.id}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "Completed" });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Only the assigned member or an organizer can update task status.",
  );
});

// API: PATCH /api/tasks/:taskId/status — allows an organizer to update task status.
test("organizer can update task status", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "In Progress" });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.task.status, "In_Progress");
});

// API: PATCH /api/tasks/:taskId/status — allows an assigned participant to update their task.
test("assigned participant can update their task status", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const team = await createTestTeam(event.id);
  const member = await createTestMember(event.id, team.id, { userId: user.id });
  const task = await createTestTask(event.id, {
    orgTeamId: team.id,
    assignedOrgMemberId: member.id,
  });
  const response = await request(app)
    .patch(`/api/tasks/${task.id}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "Completed" });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.task.status, "Completed");
});

// API: PATCH /api/tasks/:taskId — rejects an unauthenticated assignment update.
test("task assignment update rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .send({ priority: "High" });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: PATCH /api/tasks/:taskId — rejects an empty assignment update.
test("task assignment update rejects missing fields", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "At least one task assignment field is required.",
  );
});

// API: PATCH /api/tasks/:taskId — rejects a participant attempting to edit assignment fields.
test("task assignment update rejects a participant", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ priority: "High" });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Organizer access required.");
});

// API: PATCH /api/tasks/:taskId — rejects an organizer without lead access.
test("task assignment update rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ priority: "High" });

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Lead organizer access is required for this event.",
  );
});

// API: PATCH /api/tasks/:taskId — rejects an invalid priority.
test("task assignment update rejects an invalid priority", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ priority: "Urgent" });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Invalid task priority.");
});

// API: PATCH /api/tasks/:taskId — updates assignment and due date for an organizer.
test("organizer can update task assignment fields", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const team = await createTestTeam(event.id);
  const member = await createTestMember(event.id, team.id);
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      assignedOrgMemberId: member.id,
      priority: "High",
      dueAt: "2030-01-02T09:00:00.000Z",
    });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.task.assignedOrgMemberId, member.id);
  assert.equal(response.body.task.orgTeamId, team.id);
  assert.equal(response.body.task.priority, "High");
});

// API: PATCH /api/tasks/:taskId — rejects assignment to a member from another event.
test("task assignment update rejects a wrong-event member", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const otherTeam = await createTestTeam(otherEvent.id);
  const otherMember = await createTestMember(otherEvent.id, otherTeam.id);
  const task = await createTestTask(event.id);
  const response = await request(app)
    .patch(`/api/tasks/${task.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ assignedOrgMemberId: otherMember.id });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Assigned member does not belong to this event.",
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
