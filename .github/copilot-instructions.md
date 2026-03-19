# GitHub Copilot Instructions

## プロジェクト概要

このリポジトリは **M365 Copilot Chat on Web App** のモノレポです。
同一のユースケースに対して複数の実装パターンを並走させ、比較・評価することを目的としています。

---

## リポジトリ構成

```
/
├── package.json              # ルート（NPM Workspaces・Volta・Biome）
├── biome.json                # Lint / Format 設定
├── .github/
│   ├── copilot-instructions.md
│   ├── prompts/              # 再利用可能なプロンプト
│   └── workflows/ci.yml
└── patternA/                 # 実装パターン A（Express.js + Vue.js）
    ├── package.json          # パターン単位のスクリプト集約
    └── apps/
        ├── backend/          # Express.js
        └── frontend/         # Vue.js + Vite
```

新しいパターンを追加するときは `patternB/`, `patternC/` のようにディレクトリを増やします。

---

## 技術スタック・バージョン

| 役割 | ライブラリ / ツール | バージョン |
|------|-------------------|-----------|
| ランタイム | Node.js | Volta ピン（`package.json` 参照） |
| パッケージ管理 | npm Workspaces | — |
| フロントエンド | Vue.js + Vite | `vue@^3`, `vite@^8` |
| バックエンド | Express.js | `express@^4` |
| テスト | Vitest | `vitest@^4` |
| DOM 環境 | happy-dom | `happy-dom@^20` |
| Lint / Format | Biome | `1.9.4` |

---

## コーディング規約

### 言語・スタイル

- JavaScript（ESM: `"type": "module"`）を使用する。TypeScript への移行は各パターンの判断に委ねる。
- インデント: スペース 2 つ（Biome 設定に従う）
- 引用符: ダブルクォート（Biome 設定に従う）
- 末尾カンマ: ES5 スタイル（Biome 設定に従う）
- 行幅: 100 文字（Biome 設定に従う）

### テスト

- **TDD（テスト駆動開発）** を採用する（古典派 / Classical School）。
- Red → Green → Refactor のサイクルを厳守する。
- Behavior Change（振る舞いの変更）と Structure Change（リファクタリング）を同時に行わない。
- バックエンドのテストは `supertest` を使い、ポートを開かずに HTTP をテストする。
- フロントエンドのテストは `@vue/test-utils` + `happy-dom` でコンポーネント単位でテストする。
- テストファイルは `src/__tests__/` に配置する。

### アーキテクチャ

- バックエンドは `createApp()` ファクトリ（アプリ生成）と `startServer()` 起動関数を分離し、テスト容易性を確保する。
- フロントエンドは Vue SFC（Single File Component）で実装する。

---

## 新しいパターンを追加する際の指針

1. `patternX/apps/backend/` と `patternX/apps/frontend/` を作成する。
2. `patternX/package.json` を作成し、パターン単位のスクリプトをまとめる。
3. ルートの `package.json` の `workspaces` に `"patternX"` と `"patternX/apps/*"` を追加する。
4. CI（`.github/workflows/ci.yml`）に新パターン向けのジョブを追加する。
5. 詳細手順は `README.md` の「新しいパターンを追加する方法」セクションを参照する。

---

## よく使うコマンド

```bash
# 全パッケージの依存インストール
npm install

# 特定パターンのテスト
npm test --workspace=patternA/apps/backend
npm test --workspace=patternA/apps/frontend

# フロントエンドの開発サーバー
npm run dev --workspace=patternA/apps/frontend

# Lint チェック（全パッケージ）
npm run lint

# Lint 自動修正
npm run lint:fix
```
