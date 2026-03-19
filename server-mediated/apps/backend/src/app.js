import cors from "cors";
import express from "express";
import { createSessionMiddleware } from "./middleware/session.js";
import { createAuthRouter } from "./routes/auth.js";
import { createChatRouter } from "./routes/chat.js";

export function createApp(options = {}) {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(createSessionMiddleware(options.sessionSecret));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", createAuthRouter(options));
  app.use("/api", createChatRouter());

  return app;
}
