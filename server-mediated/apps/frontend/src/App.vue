<script setup>
import { onMounted } from "vue";
import ChatView from "./components/ChatView.vue";
import LoginButton from "./components/LoginButton.vue";
import { useAuth } from "./composables/useAuth.js";

const { isAuthenticated, checkAuth } = useAuth();

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div id="app">
    <h1>M365 Copilot Chat – Server Mediated</h1>
    <LoginButton v-if="!isAuthenticated" />
    <ChatView v-else />
  </div>
</template>
