import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import App from "../App.vue";

vi.mock("../composables/index.js", () => ({
  useAuth: () => ({
    isAuthenticated: ref(false),
    account: ref(null),
    login: vi.fn(),
    logout: vi.fn(),
    acquireToken: vi.fn(),
    initialize: vi.fn(),
  }),
  useChat: () => ({
    messages: ref([]),
    currentConversationId: ref(null),
    isLoading: ref(false),
    startConversation: vi.fn(),
    sendMessage: vi.fn(),
  }),
}));

describe("App", () => {
  it("renders the title", () => {
    const wrapper = mount(App);
    expect(wrapper.find("h1").text()).toContain("M365 Copilot Chat");
  });

  it("renders SPA PKCE in the title", () => {
    const wrapper = mount(App);
    expect(wrapper.find("h1").text()).toContain("SPA PKCE");
  });

  it("shows LoginButton when not authenticated", () => {
    const wrapper = mount(App);
    expect(wrapper.find("button").text()).toBe("Sign in with Microsoft");
  });
});
