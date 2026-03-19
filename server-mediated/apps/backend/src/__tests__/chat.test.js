import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
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

vi.mock("../services/graphClient.js", () => ({
  createConversation: vi.fn().mockResolvedValue({ id: "conv-123" }),
  sendMessage: vi.fn().mockResolvedValue({
    messages: [
      { id: "msg-1", text: "Hello" },
      { id: "msg-2", text: "Hi! How can I help?" },
    ],
  }),
}));

describe("chat routes", () => {
  let app;

  beforeAll(async () => {
    app = await createApp({ sessionSecret: "test-secret" });
  });

  it("POST /api/conversations returns 401 when not authenticated", async () => {
    const res = await request(app).post("/api/conversations");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Not authenticated" });
  });

  it("POST /api/conversations/:id/chat returns 401 when not authenticated", async () => {
    const res = await request(app).post("/api/conversations/conv-123/chat").send({ text: "Hello" });
    expect(res.status).toBe(401);
  });
});
