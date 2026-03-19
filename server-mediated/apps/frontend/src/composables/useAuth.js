import { ref } from "vue";
import { get, post } from "../apiClient.js";

const isAuthenticated = ref(false);
const account = ref(null);

export function useAuth() {
  async function checkAuth() {
    try {
      const res = await get("/auth/me");
      if (res.ok) {
        const data = await res.json();
        isAuthenticated.value = data.isAuthenticated;
        account.value = data.account;
      } else {
        isAuthenticated.value = false;
        account.value = null;
      }
    } catch {
      isAuthenticated.value = false;
      account.value = null;
    }
  }

  function login() {
    window.location.href = "/auth/login";
  }

  async function logout() {
    await post("/auth/logout");
    isAuthenticated.value = false;
    account.value = null;
  }

  return { isAuthenticated, account, checkAuth, login, logout };
}
