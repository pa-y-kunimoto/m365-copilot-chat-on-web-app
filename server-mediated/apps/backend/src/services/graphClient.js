const GRAPH_BASE = "https://graph.microsoft.com/beta/copilot";

export async function createConversation(accessToken) {
  const res = await fetch(`${GRAPH_BASE}/conversations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error(`Failed to create conversation: ${res.status}`);
  }
  return res.json();
}

export async function sendMessage(accessToken, conversationId, text, timeZone = "UTC") {
  const res = await fetch(`${GRAPH_BASE}/conversations/${conversationId}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: { text },
      locationHint: { timeZone },
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to send message: ${res.status}`);
  }
  return res.json();
}
