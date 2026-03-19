import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

vi.mock("@azure/msal-node", () => ({
  ConfidentialClientApplication: class {
    getAuthCodeUrl = vi.fn().mockResolvedValue("https://login.microsoftonline.com/auth");
    acquireTokenByCode = vi.fn().mockResolvedValue({
      accessToken: "mock-token",
      account: { name: "Test User", username: "test@example.com" },
    });
  },
}));

describe("server-mediated backend", () => {
  const app = createApp({ sessionSecret: "test-secret" });

  it("GET /health returns { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
