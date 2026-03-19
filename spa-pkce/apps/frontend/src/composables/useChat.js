import { ref } from "vue";
import { createConversation, sendMessage as graphSendMessage } from "../graphClient.js";
import { useAuth } from "./useAuth.js";

const messages = ref([]);
const currentConversationId = ref(null);
const isLoading = ref(false);

export function useChat() {
  const { acquireToken } = useAuth();

  async function startConversation() {
    const token = await acquireToken();
    const conversation = await createConversation(token);
    currentConversationId.value = conversation.id;
    messages.value = [];
    return conversation;
  }

  async function sendMessage(text) {
    if (!currentConversationId.value) {
      await startConversation();
    }
    isLoading.value = true;
    try {
      const token = await acquireToken();
      messages.value.push({ role: "user", text });
      const response = await graphSendMessage(token, currentConversationId.value, text);
      const assistantMessage = response.messages?.find((m) => m.id !== response.messages[0]?.id);
      if (assistantMessage) {
        messages.value.push({ role: "assistant", text: assistantMessage.text });
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  }

  return { messages, currentConversationId, isLoading, startConversation, sendMessage };
}
