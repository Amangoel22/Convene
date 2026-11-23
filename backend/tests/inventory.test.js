// API TEST FILE: Covers GET/POST /api/events/:eventId/inventory and PATCH /api/events/:eventId/inventory/:itemId.

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
      name: "Inventory Test User",
      email: `${uniqueValue("inventory")}@example.com`,
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
      name: uniqueValue("Inventory Test Event"),
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

async function createTestItem(eventId, values = {}) {
  return prisma.inventoryItem.create({
    data: {
      eventId,
      name: values.name || uniqueValue("Inventory Item"),
      totalNeeded: values.totalNeeded ?? 10,
      available: values.available ?? 8,
      defective: values.defective ?? 1,
    },
  });
}

const validInventoryBody = {
  name: "HDMI Cables",
  totalNeeded: 10,
  available: 8,
  defective: 1,
};

// API: GET /api/events/:eventId/inventory — rejects an unauthenticated request.
test("inventory list rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app).get(`/api/events/${event.id}/inventory`);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/events/:eventId/inventory — allows an authorized participant to view inventory.
test("inventory list allows an event participant to view items", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "participant",
    accessLevel: "member",
  });
  await createTestItem(event.id);
  const response = await request(app)
    .get(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.inventory.length, 1);
});

// API: GET /api/events/:eventId/inventory — returns an empty list when no items exist.
test("inventory list returns an empty array when no items exist", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.inventory, []);
});

// API: GET /api/events/:eventId/inventory — keeps inventory isolated to the requested event.
test("inventory list rejects a wrong-event user", async () => {
  const requestedEvent = await createTestEventForUser();
  const { user, token } = await createTestUser();
  await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .get(`/api/events/${requestedEvent.id}/inventory`)
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, "Access denied for this event.");
});

// API: POST /api/events/:eventId/inventory — rejects an unauthenticated request.
test("inventory creation rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const response = await request(app)
    .post(`/api/events/${event.id}/inventory`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: POST /api/events/:eventId/inventory — rejects an organizer without lead access.
test("inventory creation rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const response = await request(app)
    .post(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: POST /api/events/:eventId/inventory — rejects a missing or whitespace-only item name.
test("inventory creation rejects a whitespace-only name", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validInventoryBody, name: "   " });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Inventory item name is required.");
});

// API: POST /api/events/:eventId/inventory — rejects negative quantities.
test("inventory creation rejects negative quantities", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validInventoryBody, available: -1 });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Inventory quantities must be non-negative whole numbers.",
  );
});

// API: POST /api/events/:eventId/inventory — rejects decimal quantities.
test("inventory creation rejects decimal quantities", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validInventoryBody, totalNeeded: 2.5 });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Inventory quantities must be non-negative whole numbers.",
  );
});

// API: POST /api/events/:eventId/inventory — creates an item with valid whole-number quantities.
test("lead organizer can create inventory", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .post(`/api/events/${event.id}/inventory`)
    .set("Authorization", `Bearer ${token}`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.item.name, "HDMI Cables");
  assert.equal(response.body.item.totalNeeded, 10);
  assert.equal(response.body.item.available, 8);
  assert.equal(response.body.item.defective, 1);
});

// API: PATCH /api/events/:eventId/inventory/:itemId — rejects an unauthenticated request.
test("inventory update rejects an unauthenticated request", async () => {
  const event = await createTestEventForUser();
  const item = await createTestItem(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/inventory/${item.id}`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: PATCH /api/events/:eventId/inventory/:itemId — returns 404 for a missing item.
test("inventory update rejects a nonexistent item", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const response = await request(app)
    .patch(`/api/events/${event.id}/inventory/${randomUUID()}`)
    .set("Authorization", `Bearer ${token}`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Inventory item not found.");
});

// API: PATCH /api/events/:eventId/inventory/:itemId — rejects an organizer without lead access.
test("inventory update rejects an organizer without lead access", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({
    userId: user.id,
    role: "organizer",
    accessLevel: "member",
  });
  const item = await createTestItem(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/inventory/${item.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 403);
  assert.equal(
    response.body.error,
    "Access denied. Organizing lead access is required.",
  );
});

// API: PATCH /api/events/:eventId/inventory/:itemId — rejects an item from another event.
test("inventory update rejects a wrong-event item", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const otherEvent = await createTestEventForUser();
  const item = await createTestItem(otherEvent.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/inventory/${item.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send(validInventoryBody);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "Inventory item not found.");
});

// API: PATCH /api/events/:eventId/inventory/:itemId — rejects invalid quantities.
test("inventory update rejects invalid quantities", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const item = await createTestItem(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/inventory/${item.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ ...validInventoryBody, defective: -2 });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Inventory quantities must be non-negative whole numbers.",
  );
});

// API: PATCH /api/events/:eventId/inventory/:itemId — updates an item with valid values.
test("lead organizer can update inventory", async () => {
  const { user, token } = await createTestUser();
  const event = await createTestEventForUser({ userId: user.id });
  const item = await createTestItem(event.id);
  const response = await request(app)
    .patch(`/api/events/${event.id}/inventory/${item.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Updated Cables",
      totalNeeded: 20,
      available: 15,
      defective: 2,
    });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.item.name, "Updated Cables");
  assert.equal(response.body.item.totalNeeded, 20);
  assert.equal(response.body.item.available, 15);
  assert.equal(response.body.item.defective, 2);
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
