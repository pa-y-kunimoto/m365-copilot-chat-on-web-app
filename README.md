# m365-copilot-chat-on-web-app

M365 Copilot Chat on Web App — monorepo

同一のユースケースに対して複数の実装パターン（`patternA`, `patternB`, …）を並走させ、比較・評価するためのモノレポです。

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
├── package.json              # ルート（workspaces 定義・Volta ピン・共通スクリプト）
├── package-lock.json
├── biome.json                # Biome（lint / format）共通設定
└── .github/
    ├── copilot-instructions.md  # GitHub Copilot カスタム指示
    ├── prompts/                 # 再利用可能なプロンプト
    │   └── add-pattern.prompt.md
    └── workflows/
        └── ci.yml            # CI パイプライン
```

実装パターンはまだ存在しません。パターンを追加するときは、以下のような構成でルート直下にディレクトリを追加します。

```
patternA/                     # 実装パターン A（例）
├── package.json              # パターン単位のスクリプト集約
└── apps/
    ├── backend/              # バックエンド（例: Express.js）
    │   └── package.json
    └── frontend/             # フロントエンド（例: Vue.js + Vite）
        ├── package.json
        └── vite.config.js
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

ルートで実行すると、全ワークスペースの依存関係が一括でインストールされます。

---

## 開発コマンド（ルートから実行）

| コマンド | 内容 |
|---------|------|
| `npm test` | 全パッケージのテストを実行 |
| `npm run build` | 全パッケージをビルド |
| `npm run lint` | Biome で lint チェック |
| `npm run lint:fix` | Biome で lint チェック＋自動修正 |
| `npm run format` | Biome でフォーマット |

特定のパターン・パッケージのみ操作したい場合は `--workspace` オプションを使います（パターンを追加した後）。

```bash
# patternA のバックエンドをテスト（例）
npm test --workspace=patternA/apps/backend

# patternA のフロントエンドをテスト（例）
npm test --workspace=patternA/apps/frontend

# patternA のフロントエンド開発サーバーを起動（例）
npm run dev --workspace=patternA/apps/frontend
```

---

## 新しいパターンを追加する方法

以下の手順では `patternA` を例に説明します。実際のパターン名に読み替えてください。

### 1. ディレクトリと `package.json` を作成する

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

### 2. ルートの `package.json` の `workspaces` を更新する

```json
{
  "workspaces": [
    "patternA", "patternA/apps/*"
  ]
}
```

### 3. バックエンドパッケージを追加する（TDD）

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

### 4. フロントエンドパッケージを追加する（TDD）

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

### 5. 依存関係をインストールして Green を確認する

```bash
npm install

npm test --workspace=patternA/apps/backend
npm test --workspace=patternA/apps/frontend
```

### 6. CI ジョブを追加する

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

設定は `biome.json`（ルート）で管理されており、全パターン・全パッケージに一括適用されます。

---

## CI

`.github/workflows/ci.yml` に現在定義されているジョブは以下の通りです。

| ジョブ | 内容 |
|--------|------|
| `lint` | Biome によるコード品質チェック |

新しいパターンを追加したら、対応するテスト・ビルドジョブを CI に追記してください（上記「新しいパターンを追加する方法」の手順 6 を参照）。