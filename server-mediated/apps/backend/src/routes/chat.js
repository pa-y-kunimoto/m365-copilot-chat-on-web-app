import { Router } from "express";
import { createConversation, sendMessage } from "../services/graphClient.js";
import { getAccessToken } from "../services/tokenStore.js";

function requireAuth(req, res, next) {
  const token = getAccessToken(req.session);
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.accessToken = token;
  next();
}

export function createChatRouter() {
  const router = Router();

  router.post("/conversations", requireAuth, async (req, res) => {
    try {
      const conversation = await createConversation(req.accessToken);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(502).json({ error: "Failed to create conversation" });
    }
  });

  router.post("/conversations/:id/chat", requireAuth, async (req, res) => {
    try {
      const { text, timeZone } = req.body;
      const response = await sendMessage(req.accessToken, req.params.id, text, timeZone);
      res.json(response);
    } catch (error) {
      res.status(502).json({ error: "Failed to send message" });
    }
  });

  return router;
}
