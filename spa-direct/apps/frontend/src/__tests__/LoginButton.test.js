import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import LoginButton from "../components/LoginButton.vue";

const mockLogin = vi.fn();

vi.mock("../composables/useAuth.js", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

describe("LoginButton", () => {
  it("renders sign-in button", () => {
    const wrapper = mount(LoginButton);
    expect(wrapper.find("button").text()).toBe("Sign in with Microsoft");
  });

  it("calls login on click", async () => {
    const wrapper = mount(LoginButton);
    await wrapper.find("button").trigger("click");
    expect(mockLogin).toHaveBeenCalled();
  });
});
