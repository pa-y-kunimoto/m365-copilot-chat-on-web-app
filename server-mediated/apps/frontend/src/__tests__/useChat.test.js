import { describe, expect, it, vi } from "vitest";

vi.mock("../apiClient.js", () => ({
  get: vi.fn(),
  post: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: "conv-123" }),
  }),
}));

describe("useChat", () => {
  it("can be imported", async () => {
    const { useChat } = await import("../composables/useChat.js");
    const chat = useChat();
    expect(chat.messages).toBeDefined();
    expect(chat.sendMessage).toBeDefined();
    expect(chat.startConversation).toBeDefined();
  });
});
