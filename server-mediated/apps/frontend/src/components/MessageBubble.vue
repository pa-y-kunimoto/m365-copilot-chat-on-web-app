<script setup>
defineProps({
  role: {
    type: String,
    required: true,
    validator: (v) => ["user", "assistant"].includes(v),
  },
  text: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div :class="['message-bubble', role]">
    <span class="role-label">{{ role === "user" ? "You" : "Copilot" }}</span>
    <p class="message-text">{{ text }}</p>
  </div>
</template>
