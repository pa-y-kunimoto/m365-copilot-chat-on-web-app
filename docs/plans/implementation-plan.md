# M365 Copilot Chat on Web App — 2パターン実装計画

## Context

Microsoft Graph の Copilot Chat API（Beta）を使い、同一のユースケースを2つの異なるアーキテクチャで実装して比較する。
API 調査結果は `docs/research/microsoft-graph-copilot-chat-api.md` に記載済み。

---

## パターン命名

| ディレクトリ名 | 説明 |
|---------------|------|
| `spa-direct` | フロント完結パターン。MSAL.js で Implicit Flow を使い、SPA から直接 Graph API を呼び出す |
| `server-mediated` | バックエンド経由パターン。Authorization Code Flow でサーバーがトークンを管理し、Graph API を仲介呼び出し |

---

## Phase 1: スキャフォールド（両パターン共通）

### 1-1. ディレクトリ構成

各パターンとも既存の monorepo 規約に従う:

```
<pattern-name>/
├── package.json                # スクリプト集約
├── .env.example                # 必要な環境変数一覧
└── apps/
    ├── backend/
    │   ├── package.json
    │   └── src/
    │       ├── app.js          # createApp() ファクトリ
    │       ├── server.js       # startServer()
    │       └── __tests__/
    └── frontend/
        ├── package.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── main.js
            ├── App.vue
            ├── components/
            ├── composables/
            └── __tests__/
```

### 1-2. ルート `package.json` 更新

```json
"workspaces": [
  "spa-direct", "spa-direct/apps/*",
  "server-mediated", "server-mediated/apps/*"
]
```

### 1-3. パッケージ名

- `@m365-copilot-chat/spa-direct`, `-backend`, `-frontend`
- `@m365-copilot-chat/server-mediated`, `-backend`, `-frontend`

### 1-4. 最初の TDD サイクル

- バックエンド: `GET /health` → `{ status: "ok" }` のテストから開始
- フロントエンド: `App.vue` のレンダリングテストから開始

---

## Phase 2: 認証レイヤー

### spa-direct（フロント完結）

| ファイル | 役割 |
|---------|------|
| `src/msalConfig.js` | MSAL 設定（clientId, authority, redirectUri, scopes） |
| `src/msalInstance.js` | `PublicClientApplication` シングルトン |
| `src/composables/useAuth.js` | `login()`, `logout()`, `isAuthenticated`, `acquireToken()` |
| `src/components/LoginButton.vue` | ログインボタン UI |

- 依存: `@azure/msal-browser`
- トークン取得: `acquireTokenSilent()` → 失敗時 `acquireTokenPopup()`
- バックエンドは静的ファイル配信のみ（認証に関与しない）

### server-mediated（バックエンド経由）

**バックエンド:**

| ファイル | 役割 |
|---------|------|
| `src/middleware/session.js` | `express-session` 設定 |
| `src/routes/auth.js` | 認証エンドポイント群 |
| `src/services/tokenStore.js` | セッションキーに紐づくトークンキャッシュ |

| エンドポイント | 用途 |
|--------------|------|
| `GET /auth/login` | Azure AD へリダイレクト |
| `GET /auth/callback` | 認可コード → トークン交換、セッション保存 |
| `POST /auth/logout` | セッション破棄 |
| `GET /auth/me` | 認証状態・ユーザー情報返却（未認証時 401） |

- 依存: `@azure/msal-node`, `express-session`

**フロントエンド:**

| ファイル | 役割 |
|---------|------|
| `src/composables/useAuth.js` | `/auth/me` で状態取得、`/auth/login` へ遷移 |
| `src/components/LoginButton.vue` | ログインボタン（バックエンドへリダイレクト） |

- MSAL ライブラリ不要（認証はバックエンド担当）

---

## Phase 3: チャット機能

### spa-direct

| ファイル | 役割 |
|---------|------|
| `src/graphClient.js` | `fetch` で Graph API を直接呼び出し |
| `src/composables/useChat.js` | 会話作成 + メッセージ送信のロジック |
| `src/components/ChatView.vue` | チャット UI（入力欄 + メッセージ一覧） |
| `src/components/MessageBubble.vue` | メッセージ表示（user / assistant） |

フロー: `useAuth().acquireToken()` → `graphClient` でトークン付き fetch → Graph Beta API

### server-mediated

**バックエンド:**

| ファイル | 役割 |
|---------|------|
| `src/routes/chat.js` | チャット API プロキシ |
| `src/services/graphClient.js` | サーバーサイド Graph API 呼び出し |

| エンドポイント | 用途 |
|--------------|------|
| `POST /api/conversations` | Copilot 会話作成を代理 |
| `POST /api/conversations/:id/chat` | メッセージ送信を代理 |

**フロントエンド:**

| ファイル | 役割 |
|---------|------|
| `src/apiClient.js` | バックエンド API への fetch ラッパー |
| `src/composables/useChat.js` | バックエンド経由で会話・メッセージ操作 |
| `src/components/ChatView.vue` | チャット UI |
| `src/components/MessageBubble.vue` | メッセージ表示 |

フロー: フロントエンド → バックエンド `/api/*` → Graph Beta API（トークンはサーバー側のみ）

---

## Phase 4: 仕上げ

- `vite.config.js`（server-mediated フロントエンド）: 開発時に `/auth/*`, `/api/*` をバックエンドにプロキシ
- `.env.example` を両パターンに配置
- CI ジョブ追加（`.github/workflows/ci.yml`）: パターンごとに test-backend, test-frontend, build-frontend の 3 ジョブ × 2 = 計 6 ジョブ

---

## 依存パッケージまとめ

| パッケージ | spa-direct | server-mediated |
|-----------|:---:|:---:|
| `express` | backend | backend |
| `@azure/msal-browser` | frontend | — |
| `@azure/msal-node` | — | backend |
| `express-session` | — | backend |
| `vue` | frontend | frontend |
| `vite` / `@vitejs/plugin-vue` | frontend (dev) | frontend (dev) |
| `vitest` | both (dev) | both (dev) |
| `supertest` | backend (dev) | backend (dev) |
| `@vue/test-utils` / `happy-dom` | frontend (dev) | frontend (dev) |

---

## 環境変数

### spa-direct

```
AZURE_CLIENT_ID=          # Azure AD アプリの Client ID
AZURE_TENANT_ID=          # Azure AD テナント ID
```

### server-mediated

```
AZURE_CLIENT_ID=          # Azure AD アプリの Client ID
AZURE_CLIENT_SECRET=      # Azure AD アプリの Client Secret
AZURE_TENANT_ID=          # Azure AD テナント ID
SESSION_SECRET=           # express-session の署名キー
REDIRECT_URI=             # OAuth コールバック URL
```

---

## 検証方法

1. `npm install` で全ワークスペースの依存解決を確認
2. `npm run lint` でリント通過を確認
3. `npm test` で全テスト通過を確認
4. 各パターンの `npm run dev` でフロントエンド開発サーバー起動を確認
5. 実際の Azure AD アプリ登録を使った手動 E2E テスト（Phase 4）
