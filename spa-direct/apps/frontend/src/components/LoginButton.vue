<script setup>
import { useAuth } from "../composables/index.js";

const { login } = useAuth();
</script>

<template>
  <button type="button" @click="login">Sign in with Microsoft</button>
</template>
