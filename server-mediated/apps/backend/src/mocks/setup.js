import { setupServer } from "msw/node";
import { handlers } from "./handlers.js";

export const mockServer = setupServer(...handlers);

export function startMockServer() {
  mockServer.listen({ onUnhandledRequest: "bypass" });
  console.log("[MSW] Mock server started — intercepting Azure AD and Graph API requests");
}
