import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("spa-direct backend", () => {
  const app = createApp();

  it("GET /health returns { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
