import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../src/app.js";

describe("Auth", () => {
  it("should return 401 for invalid login", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "test@test.com",
      password: "WrongPassword1!",
    });
    expect(response.status).toBe(401);
  });

  it("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@email.com",
      password: "Password1!",
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
  });

  it("should login a registered user", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@email.com",
      password: "Password1!",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@email.com",
      password: "Password1!",
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
  });

  it("should return 409 when email or username already exists", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@email.com",
      password: "Password1!",
    });
    const response = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@email.com",
      password: "Password1!",
    });
    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });
});
