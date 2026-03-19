import { ref } from "vue";
import { graphScopes } from "../msalConfig.js";
import { msalInstance } from "../msalInstance.js";

const isAuthenticated = ref(false);
const account = ref(null);

export function useAuth() {
  async function login() {
    const response = await msalInstance.loginPopup({ scopes: graphScopes });
    account.value = response.account;
    isAuthenticated.value = true;
  }

  async function logout() {
    await msalInstance.logoutPopup();
    account.value = null;
    isAuthenticated.value = false;
  }

  async function acquireToken() {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error("No authenticated account");
    }
    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: graphScopes,
        account: accounts[0],
      });
      return response.accessToken;
    } catch {
      const response = await msalInstance.acquireTokenPopup({
        scopes: graphScopes,
      });
      return response.accessToken;
    }
  }

  return { isAuthenticated, account, login, logout, acquireToken };
}
