import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/auth.js";

const email = `login-test-${Date.now()}@example.com`;

//test for user login
test("valid user can log in", async () => {
  const password = "password123";

  await prisma.user.create({
    data: {
      name: "Login Test User",
      email,
      phone: "9876543210",
      passwordHash: await hashPassword(password),
    },
  });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password,
    });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.user.email, email);
  assert.ok(response.body.token);
});

after(async () => {
  await prisma.user.deleteMany({
    where: { email },
  });

  await prisma.$disconnect();
});

// Test for invalid user login
test("invalid user cannot log in", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

  assert.equal(response.statusCode, 401);
  assert.ok(response.body.error);
});
