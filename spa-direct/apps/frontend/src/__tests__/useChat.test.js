import { describe, expect, it } from "vitest";
import { useChat } from "../composables/useChat.mock.js";

describe("useChat", () => {
  it("exposes messages, sendMessage, startConversation", () => {
    const chat = useChat();
    expect(chat.messages).toBeDefined();
    expect(chat.sendMessage).toBeDefined();
    expect(chat.startConversation).toBeDefined();
    expect(chat.isLoading).toBeDefined();
  });

  it("startConversation creates a conversation id", async () => {
    const chat = useChat();
    const result = await chat.startConversation();
    expect(result.id).toContain("mock-conv-");
    expect(chat.currentConversationId.value).toBe(result.id);
  });
});
