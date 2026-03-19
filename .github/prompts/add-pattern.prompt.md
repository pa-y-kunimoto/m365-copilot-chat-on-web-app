---
mode: agent
description: 新しい実装パターンをモノレポに追加する手順をガイドします
---

新しい実装パターン `${input:patternName}` をこのモノレポに追加してください。

## 追加する構成

```
${patternName}/
├── package.json
└── apps/
    ├── backend/
    │   └── package.json
    └── frontend/
        ├── package.json
        └── vite.config.js
```

## 手順

1. **ディレクトリを作成する**

```bash
mkdir -p ${patternName}/apps/backend
mkdir -p ${patternName}/apps/frontend
```

2. **`${patternName}/package.json` を作成する**（パターン単位のスクリプト集約）

```json
{
  "name": "@m365-copilot-chat/${patternName}",
  "version": "0.0.1",
  "private": true,
  "description": "${patternName} — [技術スタックの説明を記載]",
  "scripts": {
    "dev:backend": "npm run dev --workspace=${patternName}/apps/backend",
    "dev:frontend": "npm run dev --workspace=${patternName}/apps/frontend",
    "test": "npm test --workspace=${patternName}/apps/backend --workspace=${patternName}/apps/frontend",
    "build": "npm run build --workspace=${patternName}/apps/frontend"
  }
}
```

3. **ルートの `package.json` を更新する**

`workspaces` 配列に以下を追加する：
```json
"${patternName}",
"${patternName}/apps/*"
```

4. **バックエンドの `package.json` を作成する**

README.md の「Express.js バックエンドパッケージを追加する手順」を参照してください。
パッケージ名は `@m365-copilot-chat/${patternName}-backend` とします。

5. **フロントエンドの `package.json` と `vite.config.js` を作成する**

README.md の「Vue.js フロントエンドパッケージを追加する手順」を参照してください。
パッケージ名は `@m365-copilot-chat/${patternName}-frontend` とします。

6. **依存関係をインストールする**

```bash
npm install
```

7. **CI ジョブを追加する**（`.github/workflows/ci.yml`）

既存の `test-backend` / `test-frontend` / `build-frontend` ジョブを参考に、
`${patternName}` 向けのジョブをコピーしてワークスペースパスを書き換えます。

8. **テストを実行して動作を確認する**

```bash
npm test --workspace=${patternName}/apps/backend
npm test --workspace=${patternName}/apps/frontend
```
