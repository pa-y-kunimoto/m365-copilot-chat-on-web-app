<script setup>
import { ref } from "vue";
import { useChat } from "../composables/useChat.js";
import MessageBubble from "./MessageBubble.vue";

const { messages, isLoading, sendMessage } = useChat();
const inputText = ref("");

async function handleSend() {
  const text = inputText.value.trim();
  if (!text) return;
  inputText.value = "";
  await sendMessage(text);
}
</script>

<template>
  <div class="chat-view">
    <div class="messages">
      <MessageBubble
        v-for="(msg, i) in messages"
        :key="i"
        :role="msg.role"
        :text="msg.text"
      />
    </div>
    <form @submit.prevent="handleSend" class="input-area">
      <input
        v-model="inputText"
        type="text"
        placeholder="Type a message..."
        :disabled="isLoading"
      />
      <button type="submit" :disabled="isLoading || !inputText.trim()">Send</button>
    </form>
  </div>
</template>
