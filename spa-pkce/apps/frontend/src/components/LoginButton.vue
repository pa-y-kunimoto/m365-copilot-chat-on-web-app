<script setup>
import { useAuth } from "../composables/index.js";

const { login } = useAuth();
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-icon">🔐</div>
      <h2>Welcome</h2>
      <p>Sign in to start chatting with Copilot</p>
      <button type="button" class="login-btn" @click="login">
        <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="9" height="9" fill="#f25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
          <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
        Sign in with Microsoft
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.login-card {
  text-align: center;
  background: #fff;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  width: 100%;
}

.login-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-card h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.login-card p {
  font-size: 14px;
  color: #666;
  margin-bottom: 28px;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.login-btn:hover {
  background: #f8f8f8;
  border-color: #bbb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
