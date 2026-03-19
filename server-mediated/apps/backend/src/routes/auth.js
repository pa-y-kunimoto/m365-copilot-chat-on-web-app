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

const isMockMode = process.env.MOCK_MODE === "true";

async function createRealAuthRouter(options) {
  const router = Router();

  // MSAL は実モードでのみ import（モック時に不要な依存を避ける）
  const { ConfidentialClientApplication } = await import("@azure/msal-node");

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

  return router;
}

function createMockAuthRouter() {
  const router = Router();

  // モック: Azure AD リダイレクトをスキップし、即座にセッションに保存
  router.get("/login", (req, res) => {
    saveTokens(req.session, {
      accessToken: "mock-access-token",
      account: { name: "Mock User", username: "mock@example.com" },
    });
    res.redirect("/");
  });

  router.get("/callback", (_req, res) => {
    res.redirect("/");
  });

  return router;
}

export async function createAuthRouter(options = {}) {
  const router = Router();

  // 認証ルート（モード切替）
  const authRouter = isMockMode ? createMockAuthRouter() : await createRealAuthRouter(options);
  router.use(authRouter);

  // 共通ルート
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
