import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";

vi.mock("@azure/msal-node", () => ({
  ConfidentialClientApplication: class {
    getAuthCodeUrl = vi.fn().mockResolvedValue("https://login.microsoftonline.com/mock-auth-url");
    acquireTokenByCode = vi.fn().mockResolvedValue({
      accessToken: "mock-access-token",
      account: { name: "Test User", username: "test@example.com" },
    });
  },
}));

describe("auth routes", () => {
  let app;

  beforeAll(async () => {
    app = await createApp({ sessionSecret: "test-secret" });
  });

  it("GET /auth/me returns 401 when not authenticated", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ isAuthenticated: false });
  });

  it("GET /auth/login redirects to Azure AD", async () => {
    const res = await request(app).get("/auth/login");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("login.microsoftonline.com");
  });

  it("POST /auth/logout returns success", async () => {
    const res = await request(app).post("/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
