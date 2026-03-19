import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../graphClient.js", () => ({
  createConversation: vi.fn().mockResolvedValue({ id: "conv-123" }),
  sendMessage: vi.fn().mockResolvedValue({
    messages: [
      { id: "msg-1", text: "Hello" },
      { id: "msg-2", text: "Hi! How can I help?" },
    ],
  }),
}));

vi.mock("./useAuth.js", () => ({
  useAuth: () => ({
    acquireToken: vi.fn().mockResolvedValue("mock-access-token"),
  }),
}));

const { createConversation, sendMessage: graphSendMessage } = await import("../graphClient.js");

describe("useChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("can be imported", async () => {
    const { useChat } = await import("../composables/useChat.js");
    const chat = useChat();
    expect(chat.messages).toBeDefined();
    expect(chat.sendMessage).toBeDefined();
    expect(chat.startConversation).toBeDefined();
  });
});
