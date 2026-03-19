<script setup>
import { computed } from "vue";
import { marked } from "marked";

const props = defineProps({
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

marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderedHtml = computed(() => {
  if (props.role === "user") return null;
  return marked.parse(props.text);
});
</script>

<template>
  <div :class="['message-bubble', role]">
    <span class="role-label">{{ role === "user" ? "You" : "Copilot" }}</span>
    <p v-if="role === 'user'" class="message-text">{{ text }}</p>
    <div v-else class="message-text markdown-body" v-html="renderedHtml"></div>
  </div>
</template>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-bubble.user {
  align-self: flex-end;
  background: #0078d4;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-bubble.assistant {
  align-self: flex-start;
  background: #f0f0f0;
  color: #1a1a1a;
  border-bottom-left-radius: 4px;
}

.role-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  opacity: 0.7;
}

.message-text {
  margin: 0;
  font-size: 14px;
}

/* Markdown body styles */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 8px 0 4px;
  line-height: 1.3;
}

.markdown-body :deep(h1) {
  font-size: 1.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.15em;
}

.markdown-body :deep(h3) {
  font-size: 1.05em;
}

.markdown-body :deep(p) {
  margin: 0 0 8px;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 4px 0 8px;
  padding-left: 20px;
}

.markdown-body :deep(li) {
  margin-bottom: 2px;
}

.markdown-body :deep(code) {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
}

.markdown-body :deep(pre) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 13px;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid #0078d4;
  margin: 8px 0;
  padding: 4px 12px;
  color: #555;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 13px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}

.markdown-body :deep(th) {
  background: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.markdown-body :deep(a) {
  color: #0078d4;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #ddd;
  margin: 12px 0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
}
</style>
