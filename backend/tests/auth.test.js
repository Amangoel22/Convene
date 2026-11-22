// API TEST FILE: Covers POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, and PATCH /api/auth/password.

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

async function createTestUser({
  email = `${uniqueValue("auth")}@example.com`,
  password = "password123",
  phone = "9876543210",
} = {}) {
  const user = await prisma.user.create({
    data: {
      name: "Auth Test User",
      email,
      phone,
      passwordHash: await hashPassword(password),
    },
  });
  createdUserIds.add(user.id);
  return { user, password };
}

async function createTestEventWithInvite({
  invitePhone = "9876543210",
  accessLevel = "member",
  linkedUserId = null,
} = {}) {
  const event = await prisma.event.create({
    data: {
      name: uniqueValue("Auth Test Event"),
      type: "Conference",
      startDate: new Date("2030-01-01T00:00:00.000Z"),
      endDate: new Date("2030-01-01T00:00:00.000Z"),
      startTime: "09:00",
      endTime: "17:00",
    },
  });
  createdEventIds.add(event.id);

  const team = await prisma.orgTeam.create({
    data: { eventId: event.id, name: uniqueValue("Auth Test Team") },
  });

  const member = await prisma.orgMember.create({
    data: {
      eventId: event.id,
      orgTeamId: team.id,
      inviteKey: uniqueValue("INVITE").slice(-10).toUpperCase(),
      name: "Invited Auth User",
      phone: invitePhone,
      accessLevel,
      userId: linkedUserId,
    },
  });

  return { event, team, member };
}

// API: POST /api/auth/register — registers a user and returns a token.
test("valid user can register", async () => {
  const email = `${uniqueValue("register")}@example.com`;
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "New Auth User",
      email,
      password: "password123",
      phone: "(987) 654-3210",
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.user.email, email);
  assert.equal(response.body.user.phone, "9876543210");
  assert.ok(response.body.user.id);
  assert.ok(response.body.token);
  assert.equal(response.body.user.passwordHash, undefined);
  createdUserIds.add(response.body.user.id);
});

// API: POST /api/auth/register — rejects requests missing required fields.
test("registration rejects missing required fields", async () => {
  const response = await request(app).post("/api/auth/register").send({});
  assert.equal(response.statusCode, 400);
  assert.ok(response.body.error);
});

// API: POST /api/auth/register — rejects phone numbers that do not contain ten digits.
test("registration rejects an invalid phone number", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Invalid Phone User",
      email: `${uniqueValue("invalid-phone")}@example.com`,
      password: "password123",
      phone: "12345",
    });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Phone number must contain exactly 10 digits.",
  );
});

// API: POST /api/auth/register — rejects an email that already belongs to a user.
test("registration rejects a duplicate email", async () => {
  const { user } = await createTestUser();
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Duplicate User",
      email: user.email,
      password: "password123",
      phone: "9876543211",
    });

  assert.equal(response.statusCode, 409);
  assert.ok(response.body.error);
});

// API: POST /api/auth/register — rejects an invite key that does not exist.
test("registration rejects an invalid invite key", async () => {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Invalid Invite User",
      email: `${uniqueValue("invalid-invite")}@example.com`,
      password: "password123",
      phone: "9876543210",
      inviteKey: "NOTREAL1",
    });

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "Invalid event invite key.");
});

// API: POST /api/auth/register — rejects an invite when the phone does not match.
test("registration rejects an invite phone mismatch", async () => {
  const { member } = await createTestEventWithInvite();
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Mismatched Invite User",
      email: `${uniqueValue("invite-mismatch")}@example.com`,
      password: "password123",
      phone: "9876543211",
      inviteKey: member.inviteKey,
    });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Phone number does not match the invited team member.",
  );
});

// API: POST /api/auth/register — links a valid invite to the new user and event membership.
test("registration accepts a valid invite", async () => {
  const { event, member } = await createTestEventWithInvite({
    accessLevel: "lead",
  });
  const email = `${uniqueValue("valid-invite")}@example.com`;
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Valid Invite User",
      email,
      password: "password123",
      phone: "9876543210",
      inviteKey: member.inviteKey,
    });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.joinedEventId, event.id);
  assert.ok(response.body.token);
  createdUserIds.add(response.body.user.id);

  const membership = await prisma.eventMembership.findUnique({
    where: {
      unique_event_user: {
        eventId: event.id,
        userId: response.body.user.id,
      },
    },
  });
  assert.equal(membership.role, "organizer");
});

// API: POST /api/auth/register — rejects an invite that has already been used.
test("registration rejects an already-used invite key", async () => {
  const { user } = await createTestUser();
  const { member } = await createTestEventWithInvite({
    linkedUserId: user.id,
  });
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Used Invite User",
      email: `${uniqueValue("used-invite")}@example.com`,
      password: "password123",
      phone: "9876543210",
      inviteKey: member.inviteKey,
    });

  assert.equal(response.statusCode, 409);
  assert.equal(
    response.body.error,
    "This event invite key has already been used.",
  );
});

// API: POST /api/auth/login — authenticates a valid user and returns a token.
test("valid user can log in", async () => {
  const password = "password123";
  const { user } = await createTestUser({ password });
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.user.email, user.email);
  assert.ok(response.body.token);
  assert.equal(response.body.user.passwordHash, undefined);
});

// API: POST /api/auth/login — rejects a login for a user that does not exist.
test("nonexistent user cannot log in", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: `${uniqueValue("missing-user")}@example.com`,
      password: "wrongpassword",
    });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "Invalid credentials.");
});

// API: POST /api/auth/login — rejects a valid user when the password is incorrect.
test("valid user cannot log in with the wrong password", async () => {
  const { user } = await createTestUser({ password: "correctpassword" });
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: "wrongpassword" });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "Invalid credentials.");
});

// API: POST /api/auth/login — rejects a request with no email or password.
test("login rejects missing credentials", async () => {
  const response = await request(app).post("/api/auth/login").send({});
  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "Email and password are required fields.",
  );
});

// API: POST /api/auth/login — rejects a request with only an email.
test("login rejects a missing password", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: `${uniqueValue("missing-password")}@example.com` });
  assert.equal(response.statusCode, 400);
  assert.ok(response.body.error);
});

// API: POST /api/auth/login — rejects a request with only a password.
test("login rejects a missing email", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ password: "password123" });
  assert.equal(response.statusCode, 400);
  assert.ok(response.body.error);
});

// API: GET /api/auth/me — rejects requests without an authentication token.
test("profile request rejects a missing token", async () => {
  const response = await request(app).get("/api/auth/me");
  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});

// API: GET /api/auth/me — rejects malformed or expired authentication tokens.
test("profile request rejects an invalid token", async () => {
  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", "Bearer not-a-real-token");
  assert.equal(response.statusCode, 401);
  assert.equal(
    response.body.error,
    "Invalid or expired authentication token.",
  );
});

// API: GET /api/auth/me — rejects a valid token for a user that no longer exists.
test("profile request rejects a token for a missing user", async () => {
  const token = generateToken({ userId: randomUUID() });
  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.error, "User account not found.");
});

// API: GET /api/auth/me — returns the authenticated user's safe profile.
test("profile request returns the authenticated user", async () => {
  const { user } = await createTestUser();
  const token = generateToken({ userId: user.id });
  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.user.id, user.id);
  assert.equal(response.body.user.email, user.email);
  assert.equal(response.body.user.passwordHash, undefined);
});

// API: PATCH /api/auth/password — rejects a password change without both passwords.
test("password change rejects missing passwords", async () => {
  const { user } = await createTestUser();
  const token = generateToken({ userId: user.id });
  const response = await request(app)
    .patch("/api/auth/password")
    .set("Authorization", `Bearer ${token}`)
    .send({});

  assert.equal(response.statusCode, 400);
  assert.ok(response.body.error);
});

// API: PATCH /api/auth/password — rejects a new password shorter than eight characters.
test("password change rejects a short new password", async () => {
  const { user } = await createTestUser({ password: "oldpassword" });
  const token = generateToken({ userId: user.id });
  const response = await request(app)
    .patch("/api/auth/password")
    .set("Authorization", `Bearer ${token}`)
    .send({ currentPassword: "oldpassword", newPassword: "short" });

  assert.equal(response.statusCode, 400);
  assert.equal(
    response.body.error,
    "New password must be at least 8 characters long.",
  );
});

// API: PATCH /api/auth/password — rejects an incorrect current password.
test("password change rejects an incorrect current password", async () => {
  const { user } = await createTestUser({ password: "oldpassword" });
  const token = generateToken({ userId: user.id });
  const response = await request(app)
    .patch("/api/auth/password")
    .set("Authorization", `Bearer ${token}`)
    .send({
      currentPassword: "wrongpassword",
      newPassword: "newpassword123",
    });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "Current password is incorrect.");
});

// API: PATCH /api/auth/password — changes the password when credentials are valid.
test("password change succeeds with valid credentials", async () => {
  const oldPassword = "oldpassword";
  const newPassword = "newpassword123";
  const { user } = await createTestUser({ password: oldPassword });
  const token = generateToken({ userId: user.id });
  const response = await request(app)
    .patch("/api/auth/password")
    .set("Authorization", `Bearer ${token}`)
    .send({ currentPassword: oldPassword, newPassword });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "Password changed successfully.");

  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: newPassword });
  assert.equal(loginResponse.statusCode, 200);
  assert.ok(loginResponse.body.token);
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
