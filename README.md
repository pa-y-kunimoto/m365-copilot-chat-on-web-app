# m365-copilot-chat-on-web-app

M365 Copilot Chat on Web App — monorepo

Microsoft Graph Copilot Chat API を利用した同一ユースケースを、複数の実装パターン（`spa-direct`, `spa-pkce`, `server-mediated`）で並走させ、比較・評価するためのモノレポです。

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
├── CLAUDE.md                 # Claude Code カスタム指示
├── docs/
│   ├── how-to-add-pattern.md # 新しいパターンの追加手順
│   ├── research/             # API 調査資料
│   │   └── microsoft-graph-copilot-chat-api.md
│   └── plans/                # 実装計画
│       └── implementation-plan.md
├── spa-direct/               # フロント完結パターン（Implicit Flow）
├── spa-pkce/                 # フロント完結パターン（PKCE）
├── server-mediated/          # バックエンド経由パターン
└── .github/
    ├── copilot-instructions.md  # GitHub Copilot カスタム指示
    ├── prompts/                 # 再利用可能なプロンプト
    │   └── add-pattern.prompt.md
    └── workflows/
        └── ci.yml            # CI パイプライン
```

### 実装パターン

| ディレクトリ名 | 説明 |
|---------------|------|
| `spa-direct` | フロント完結パターン。MSAL.js で Implicit Flow を使い、SPA から直接 Graph API を呼び出す |
| `spa-pkce` | フロント完結パターン（PKCE）。MSAL.js で Authorization Code Flow with PKCE を使い、SPA から直接 Graph API を呼び出す |
| `server-mediated` | バックエンド経由パターン。Authorization Code Flow でサーバーがトークンを管理し、Graph API を仲介呼び出し |

各パターンの詳細は、パターンごとの `README.md` を参照してください。

各パターンは以下の構成です。

```
<pattern-name>/               # 実装パターン（例: spa-direct）
├── package.json              # パターン単位のスクリプト集約
├── .env.example              # 必要な環境変数一覧
├── docker-compose.yml        # Docker Compose 定義
└── apps/
    ├── backend/              # バックエンド（Express.js）
    │   └── package.json
    └── frontend/             # フロントエンド（Vue.js + Vite）
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
# spa-direct のバックエンドをテスト（例）
npm test --workspace=spa-direct/apps/backend

# spa-direct のフロントエンドをテスト（例）
npm test --workspace=spa-direct/apps/frontend

# spa-direct のフロントエンド開発サーバーを起動（例）
npm run dev --workspace=spa-direct/apps/frontend
```

---

## 新しいパターンを追加する方法

詳細な手順は **[docs/how-to-add-pattern.md](docs/how-to-add-pattern.md)** を参照してください。

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
| `test-spa-pkce-backend` | spa-pkce バックエンドのテスト |
| `test-spa-pkce-frontend` | spa-pkce フロントエンドのテスト |
| `build-spa-pkce-frontend` | spa-pkce フロントエンドのビルド |

新しいパターンを追加したら、対応するテスト・ビルドジョブを CI に追記してください（[docs/how-to-add-pattern.md](docs/how-to-add-pattern.md) の手順 6 を参照）。