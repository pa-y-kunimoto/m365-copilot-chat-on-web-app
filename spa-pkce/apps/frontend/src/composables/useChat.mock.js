import { ref } from "vue";

const messages = ref([]);
const currentConversationId = ref(null);
const isLoading = ref(false);

let turnCount = 0;

const mockResponses = [
  "こんにちは！M365 Copilot のモックモードです。何かお手伝いできることはありますか？",
  "これはモックの応答です。実際の環境では Microsoft Graph Copilot Chat API を通じて回答が返されます。",
  "モックモードでは、UI の動作確認ができます。Azure AD の設定なしで画面の流れを確認できます。",
  "Enterprise グラウンディングや Web 検索は、実際の API 接続時に利用可能になります。",
];

export function useChat() {
  async function startConversation() {
    currentConversationId.value = `mock-conv-${Date.now()}`;
    messages.value = [];
    turnCount = 0;
    return { id: currentConversationId.value };
  }

  async function sendMessage(text) {
    if (!currentConversationId.value) {
      await startConversation();
    }
    isLoading.value = true;
    try {
      messages.value.push({ role: "user", text });
      // 応答の遅延をシミュレート
      await new Promise((resolve) => setTimeout(resolve, 800));
      const responseText = mockResponses[turnCount % mockResponses.length];
      messages.value.push({ role: "assistant", text: responseText });
      turnCount++;
    } finally {
      isLoading.value = false;
    }
  }

  return { messages, currentConversationId, isLoading, startConversation, sendMessage };
}
