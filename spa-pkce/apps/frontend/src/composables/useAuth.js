import { ref } from "vue";
import { graphScopes } from "../msalConfig.js";
import { initializeMsal, msalInstance } from "../msalInstance.js";

const isAuthenticated = ref(false);
const account = ref(null);

export function useAuth() {
  async function initialize() {
    const response = await initializeMsal();
    if (response?.account) {
      account.value = response.account;
      isAuthenticated.value = true;
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        account.value = accounts[0];
        isAuthenticated.value = true;
      }
    }
  }

  async function login() {
    await msalInstance.loginRedirect({ scopes: graphScopes });
  }

  async function logout() {
    await msalInstance.logoutRedirect();
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
      await msalInstance.acquireTokenRedirect({ scopes: graphScopes });
    }
  }

  return { isAuthenticated, account, login, logout, acquireToken, initialize };
}
