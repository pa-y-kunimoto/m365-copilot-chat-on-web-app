# 新しいパターンを追加する方法

以下の手順では `patternA` を例に説明します。実際のパターン名に読み替えてください。

## 1. ディレクトリと `package.json` を作成する

```bash
mkdir -p patternA/apps/backend
mkdir -p patternA/apps/frontend
```

`patternA/package.json` を作成します（パターン単位のスクリプト集約）。

```json
{
  "name": "@m365-copilot-chat/pattern-a",
  "version": "0.0.1",
  "private": true,
  "description": "Pattern A — [技術スタックの説明]",
  "scripts": {
    "dev:backend": "npm run dev --workspace=patternA/apps/backend",
    "dev:frontend": "npm run dev --workspace=patternA/apps/frontend",
    "test": "npm test --workspace=patternA/apps/backend --workspace=patternA/apps/frontend",
    "build": "npm run build --workspace=patternA/apps/frontend"
  }
}
```

## 2. ルートの `package.json` の `workspaces` を更新する

```json
{
  "workspaces": [
    "patternA", "patternA/apps/*"
  ]
}
```

## 3. バックエンドパッケージを追加する（TDD）

`patternA/apps/backend/package.json` を作成します。

```json
{
  "name": "@m365-copilot-chat/pattern-a-backend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^4.21.2"
  },
  "devDependencies": {
    "supertest": "^7.0.0",
    "vitest": "^4.1.0"
  }
}
```

TDD でまずテスト `patternA/apps/backend/src/__tests__/index.test.js` を書きます（Red）。

```js
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../index.js";

describe("GET /health", () => {
  it("returns status ok", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
```

次に `patternA/apps/backend/src/index.js` を実装して Green にします。

```js
import express from "express";

/**
 * アプリインスタンスを生成する（サーバー起動と分離することでテストを容易にする）
 */
export function createApp() {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}

export function startServer(port = 3000) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
```

## 4. フロントエンドパッケージを追加する（TDD）

`patternA/apps/frontend/package.json` を作成します。

```json
{
  "name": "@m365-copilot-chat/pattern-a-frontend",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.5",
    "@vue/test-utils": "^2.4.6",
    "happy-dom": "^20.8.4",
    "vite": "^8.0.0",
    "vitest": "^4.1.0"
  }
}
```

`patternA/apps/frontend/vite.config.js` を作成します。

```js
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
  },
});
```

`patternA/apps/frontend/index.html` を作成します。

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>M365 Copilot Chat</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

TDD でまずテスト `patternA/apps/frontend/src/__tests__/App.test.js` を書きます（Red）。

```js
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "../App.vue";

describe("App", () => {
  it("renders the application title", () => {
    const wrapper = mount(App);

    expect(wrapper.find("h1").text()).toBe("M365 Copilot Chat");
  });
});
```

次に `patternA/apps/frontend/src/App.vue` を実装して Green にします。

```vue
<template>
  <div id="app">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup>
const title = "M365 Copilot Chat";
</script>
```

`patternA/apps/frontend/src/main.js` も作成します。

```js
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

## 5. 依存関係をインストールして Green を確認する

```bash
npm install

npm test --workspace=patternA/apps/backend
npm test --workspace=patternA/apps/frontend
```

## 6. CI ジョブを追加する

`.github/workflows/ci.yml` に新しいパターン向けのジョブを追加します。

```yaml
test-pattern-a-backend:
  name: Test (patternA/backend)
  runs-on: ubuntu-latest
  permissions:
    contents: read
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version-file: "package.json"
        cache: "npm"
    - run: npm ci
    - run: npm test --workspace=patternA/apps/backend
```

> 💡 **ヒント**: VS Code で `.github/prompts/add-pattern.prompt.md` を Copilot Chat に読み込むと、手順を対話的にガイドしてもらえます。
