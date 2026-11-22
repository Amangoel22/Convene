//health api test

import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /health returns an OK response", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
  assert.ok(response.body.timestamp);
});
