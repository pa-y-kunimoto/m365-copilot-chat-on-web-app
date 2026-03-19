<script setup>
import ChatView from "./components/ChatView.vue";
import LoginButton from "./components/LoginButton.vue";
import { useAuth } from "./composables/useAuth.js";

const { isAuthenticated } = useAuth();
</script>

<template>
  <div id="app">
    <h1>M365 Copilot Chat – SPA Direct</h1>
    <LoginButton v-if="!isAuthenticated" />
    <ChatView v-else />
  </div>
</template>
