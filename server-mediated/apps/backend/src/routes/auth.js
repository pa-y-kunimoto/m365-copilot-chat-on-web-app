import { ConfidentialClientApplication } from "@azure/msal-node";
import { Router } from "express";
import { getAccount, saveTokens } from "../services/tokenStore.js";

const graphScopes = [
  "Sites.Read.All",
  "Mail.Read",
  "People.Read.All",
  "OnlineMeetingTranscript.Read.All",
  "Chat.Read",
  "ChannelMessage.Read.All",
  "ExternalItem.Read.All",
];

export function createAuthRouter(options = {}) {
  const router = Router();

  const msalConfig = {
    auth: {
      clientId: options.clientId || process.env.AZURE_CLIENT_ID || "",
      authority: `https://login.microsoftonline.com/${options.tenantId || process.env.AZURE_TENANT_ID || "common"}`,
      clientSecret: options.clientSecret || process.env.AZURE_CLIENT_SECRET || "",
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);
  const redirectUri =
    options.redirectUri || process.env.REDIRECT_URI || "http://localhost:3000/auth/callback";

  router.get("/login", async (_req, res) => {
    try {
      const authUrl = await cca.getAuthCodeUrl({
        scopes: graphScopes,
        redirectUri,
      });
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  router.get("/callback", async (req, res) => {
    try {
      const tokenResponse = await cca.acquireTokenByCode({
        code: req.query.code,
        scopes: graphScopes,
        redirectUri,
      });
      saveTokens(req.session, tokenResponse);
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ error: "Failed to acquire token" });
    }
  });

  router.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  router.get("/me", (req, res) => {
    const account = getAccount(req.session);
    if (account) {
      res.json({ isAuthenticated: true, account });
    } else {
      res.status(401).json({ isAuthenticated: false });
    }
  });

  return router;
}
