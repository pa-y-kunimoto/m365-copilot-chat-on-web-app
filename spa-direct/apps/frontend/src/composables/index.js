const isMock = import.meta.env.VITE_MOCK_MODE === "true";

export const { useAuth } = isMock
  ? await import("./useAuth.mock.js")
  : await import("./useAuth.js");

export const { useChat } = isMock
  ? await import("./useChat.mock.js")
  : await import("./useChat.js");
