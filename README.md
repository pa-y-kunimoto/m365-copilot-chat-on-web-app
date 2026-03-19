# m365-copilot-chat-on-web-app

M365 Copilot Chat on Web App — monorepo

## 技術スタック

| 役割 | ライブラリ / ツール |
|------|-------------------|
| ランタイム | Node.js（Volta でバージョン固定） |
| パッケージ管理 | NPM Workspaces |
| フロントエンド | Vue.js 3 + Vite |
| バックエンド | Express.js |
| テスト | Vitest（古典派 TDD） |
| Lint / Format | Biome |
| CI | GitHub Actions |

---

## リポジトリ構成

```
m365-copilot-chat-on-web-app/
├── package.json          # ルート（workspaces 定義・Volta ピン・共通スクリプト）
├── package-lock.json
├── biome.json            # Biome（lint / format）共通設定
├── .github/
│   └── workflows/
│       └── ci.yml        # CI パイプライン
└── packages/
    ├── backend/          # Express.js バックエンドパッケージ
    │   ├── package.json
    │   └── src/          # 実装コードをここに追加
    └── frontend/         # Vue.js フロントエンドパッケージ
        ├── package.json
        ├── vite.config.js
        └── src/          # 実装コードをここに追加
```

---

## セットアップ

### 前提条件

- [Volta](https://volta.sh/) をインストールしておくと、`package.json` の `volta` フィールドに従って Node.js / npm のバージョンが自動で切り替わります。
- Volta なしでも動作しますが、`"volta"` フィールドで指定されたバージョン（Node.js 24 / npm 11）を手動で合わせてください。

### 依存関係のインストール

```bash
npm install
```

ルートで実行すると、全ワークスペース（`packages/*`）の依存関係が一括でインストールされます。

---

## 開発コマンド（ルートから実行）

| コマンド | 内容 |
|---------|------|
| `npm test` | 全パッケージのテストを実行 |
| `npm run build` | 全パッケージをビルド |
| `npm run lint` | Biome で lint チェック |
| `npm run lint:fix` | Biome で lint チェック＋自動修正 |
| `npm run format` | Biome でフォーマット |

特定のパッケージのみ操作したい場合は `--workspace` オプションを使います。

```bash
npm run test --workspace=packages/backend
npm run test --workspace=packages/frontend
npm run dev --workspace=packages/frontend
```

---

## 新しいパッケージを追加する方法

### 1. Express.js（バックエンド）パッケージを追加する

#### 1-1. ディレクトリとファイルを作成する

```bash
mkdir -p packages/<package-name>/src/__tests__
```

`packages/<package-name>/package.json` を作成します。

```json
{
  "name": "@m365-copilot-chat/<package-name>",
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

#### 1-2. アプリ本体を実装する（TDD: まずテストを書く）

テスト `packages/<package-name>/src/__tests__/index.test.js` を先に作成し、Red 状態を確認します。

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

次に `packages/<package-name>/src/index.js` を実装して Green にします。

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

#### 1-3. 依存関係をインストールする

```bash
npm install
```

#### 1-4. テストを実行して Green を確認する

```bash
npm run test --workspace=packages/<package-name>
```

---

### 2. Vue.js（フロントエンド）パッケージを追加する

#### 2-1. ディレクトリとファイルを作成する

```bash
mkdir -p packages/<package-name>/src/__tests__
```

`packages/<package-name>/package.json` を作成します。

```json
{
  "name": "@m365-copilot-chat/<package-name>",
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

`packages/<package-name>/vite.config.js` を作成します。

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

`packages/<package-name>/index.html` を作成します。

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

#### 2-2. コンポーネントを実装する（TDD: まずテストを書く）

テスト `packages/<package-name>/src/__tests__/App.test.js` を先に作成し、Red 状態を確認します。

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

次に `packages/<package-name>/src/App.vue` を実装して Green にします。

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

`packages/<package-name>/src/main.js` も作成します。

```js
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

#### 2-3. 依存関係をインストールする

```bash
npm install
```

#### 2-4. テストを実行して Green を確認する

```bash
npm run test --workspace=packages/<package-name>
```

#### 2-5. 開発サーバーを起動する

```bash
npm run dev --workspace=packages/<package-name>
```

---

## TDD ワークフロー（古典派）

本プロジェクトでは **Red → Green → Refactor** サイクルで開発します。

```
1. Red    : 失敗するテストを書く
2. Green  : テストを通す最小限の実装を書く
3. Refactor: コードを整理する（テストは常に Green を保つ）
```

- **Behavior Change**（振る舞いの変更）と **Structure Change**（リファクタリング）は同時に行わない。
- テストは `vitest` で実行し、`--workspace` で対象を絞って素早くフィードバックを得る。

---

## Lint / Format

[Biome](https://biomejs.dev/) で lint とフォーマットを統一しています。

```bash
# チェックのみ
npm run lint

# 自動修正
npm run lint:fix

# フォーマットのみ
npm run format
```

設定は `biome.json`（ルート）で管理されており、全パッケージに一括適用されます。

---

## CI

`.github/workflows/ci.yml` に以下のジョブが定義されています。

```
lint ──┬── test-backend  ─────────────────┐
       └── test-frontend ─── build-frontend ┘
```

| ジョブ | 内容 |
|--------|------|
| `lint` | Biome によるコード品質チェック |
| `test-backend` | バックエンドパッケージのテスト |
| `test-frontend` | フロントエンドパッケージのテスト |
| `build-frontend` | フロントエンドのプロダクションビルド（lint・test-frontend 成功後に実行） |