import express from "express";

/**
 * Creates and configures the Express application.
 * Separated from server startup to enable testing without binding a port.
 *
 * @returns {import('express').Application} Configured Express app
 */
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}

/**
 * Starts the HTTP server.
 *
 * @param {number} port
 * @returns {import('http').Server}
 */
export function startServer(port = 3000) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
