<script setup>
import { ref, nextTick, watch } from "vue";
import { useChat } from "../composables/index.js";
import MessageBubble from "./MessageBubble.vue";

const { messages, isLoading, sendMessage } = useChat();
const inputText = ref("");
const messagesContainer = ref(null);

async function handleSend() {
  const text = inputText.value.trim();
  if (!text) return;
  inputText.value = "";
  await sendMessage(text);
}

watch(
  () => messages.value.length,
  async () => {
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  },
);
</script>

<template>
  <div class="chat-view">
    <div class="messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>Start a conversation with Copilot</p>
      </div>
      <MessageBubble
        v-for="(msg, i) in messages"
        :key="i"
        :role="msg.role"
        :text="msg.text"
      />
      <div v-if="isLoading" class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
    <form @submit.prevent="handleSend" class="input-area">
      <input
        v-model="inputText"
        type="text"
        placeholder="Type a message..."
        :disabled="isLoading"
      />
      <button type="submit" :disabled="isLoading || !inputText.trim()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 15px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  align-self: flex-start;
  background: #f0f0f0;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
  background: #fafafa;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.input-area input:focus {
  border-color: #0078d4;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.15);
}

.input-area input:disabled {
  background: #f5f5f5;
  color: #999;
}

.input-area button {
  width: 44px;
  height: 44px;
  border: none;
  background: #0078d4;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.input-area button:hover:not(:disabled) {
  background: #106ebe;
}

.input-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
