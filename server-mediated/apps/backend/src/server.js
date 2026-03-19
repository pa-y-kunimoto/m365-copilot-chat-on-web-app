import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;

export function startServer(app, port = PORT) {
  return app.listen(port, () => {
    console.log(`server-mediated backend listening on port ${port}`);
  });
}

const app = createApp({
  sessionSecret: process.env.SESSION_SECRET || "dev-secret",
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  tenantId: process.env.AZURE_TENANT_ID,
  redirectUri: process.env.REDIRECT_URI || "http://localhost:3000/auth/callback",
});

startServer(app);
