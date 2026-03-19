import { createApp } from "./app.js";

const PORT = process.env.PORT || 3000;

export function startServer(app, port = PORT) {
  return app.listen(port, () => {
    console.log(`spa-pkce backend listening on port ${port}`);
  });
}

const app = createApp();
startServer(app);
