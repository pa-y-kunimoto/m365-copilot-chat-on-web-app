import { ref } from "vue";
import { post } from "../apiClient.js";

const messages = ref([]);
const currentConversationId = ref(null);
const isLoading = ref(false);

export function useChat() {
  async function startConversation() {
    const res = await post("/api/conversations");
    if (!res.ok) throw new Error("Failed to create conversation");
    const data = await res.json();
    currentConversationId.value = data.id;
    messages.value = [];
    return data;
  }

  async function sendMessage(text) {
    if (!currentConversationId.value) {
      await startConversation();
    }
    isLoading.value = true;
    try {
      messages.value.push({ role: "user", text });
      const res = await post(`/api/conversations/${currentConversationId.value}/chat`, {
        text,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      const responseMessages = data.messages ?? [];
      const assistantMessage =
        responseMessages.length > 1 ? responseMessages[responseMessages.length - 1] : null;
      if (assistantMessage) {
        messages.value.push({ role: "assistant", text: assistantMessage.text });
      }
      return data;
    } finally {
      isLoading.value = false;
    }
  }

  return { messages, currentConversationId, isLoading, startConversation, sendMessage };
}
