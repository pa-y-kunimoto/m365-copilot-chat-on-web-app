import { createApp } from "vue";
import App from "./App.vue";

async function boot() {
  if (import.meta.env.VITE_MOCK_MODE === "true") {
    const { worker } = await import("./mocks/browser.js");
    await worker.start({ onUnhandledRequest: "bypass" });
    console.log("[MSW] Mock service worker started");
  }

  createApp(App).mount("#app");
}

boot();
