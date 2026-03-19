import { ref } from "vue";

const isAuthenticated = ref(false);
const account = ref(null);

export function useAuth() {
  async function login() {
    account.value = { name: "Mock User", username: "mock@example.com" };
    isAuthenticated.value = true;
  }

  async function logout() {
    account.value = null;
    isAuthenticated.value = false;
  }

  async function acquireToken() {
    return "mock-access-token";
  }

  return { isAuthenticated, account, login, logout, acquireToken };
}
