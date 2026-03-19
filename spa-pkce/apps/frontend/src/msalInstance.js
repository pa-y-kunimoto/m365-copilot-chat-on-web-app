import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./msalConfig.js";

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsal() {
  await msalInstance.initialize();
  const response = await msalInstance.handleRedirectPromise();
  return response;
}
