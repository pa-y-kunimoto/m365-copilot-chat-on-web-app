import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ChatView from "../components/ChatView.vue";

vi.mock("../composables/useChat.js", () => ({
  useChat: () => ({
    messages: ref([
      { role: "user", text: "Hello" },
      { role: "assistant", text: "Hi there!" },
    ]),
    isLoading: ref(false),
    sendMessage: vi.fn(),
    startConversation: vi.fn(),
    currentConversationId: ref("conv-1"),
  }),
}));

vi.mock("../composables/useAuth.js", () => ({
  useAuth: () => ({
    acquireToken: vi.fn().mockResolvedValue("mock-token"),
  }),
}));

describe("ChatView", () => {
  it("renders message bubbles", () => {
    const wrapper = mount(ChatView);
    const bubbles = wrapper.findAll(".message-bubble");
    expect(bubbles).toHaveLength(2);
  });

  it("renders input field and send button", () => {
    const wrapper = mount(ChatView);
    expect(wrapper.find("input[type='text']").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").exists()).toBe(true);
  });
});
