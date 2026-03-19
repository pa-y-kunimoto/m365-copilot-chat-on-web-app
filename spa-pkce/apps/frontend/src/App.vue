<script setup>
import ChatView from "./components/ChatView.vue";
import LoginButton from "./components/LoginButton.vue";
import { useAuth } from "./composables/index.js";

const { isAuthenticated } = useAuth();
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>M365 Copilot Chat <span class="badge">SPA PKCE</span></h1>
    </header>
    <main class="app-main">
      <LoginButton v-if="!isAuthenticated" />
      <ChatView v-else />
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    sans-serif;
  background: #f5f5f5;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<style scoped>
.app-header {
  background: #fff;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e5e5;
  text-align: center;
}

.app-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.badge {
  display: inline-block;
  background: #e8f0fe;
  color: #0078d4;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-main {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
</style>
