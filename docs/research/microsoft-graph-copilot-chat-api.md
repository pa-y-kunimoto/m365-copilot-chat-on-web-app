# Microsoft Graph Copilot Chat API 調査結果

## 概要

Microsoft 365 Copilot Chat API は、Microsoft Graph の **Beta** エンドポイントとして提供されている。
プログラムから M365 Copilot にプロンプトを送信し、応答を受け取ることができる。

- テキストのみの応答（ファイル生成・メール送信・会議スケジュールは不可）
- **M365 Copilot ライセンスが必要**
- Enterprise 検索・Web 検索によるグラウンディングがデフォルトで有効

## API エンドポイント

ベース URL: `https://graph.microsoft.com/beta/copilot/`

| メソッド | パス | 用途 | レスポンス |
|---------|------|------|-----------|
| POST | `/conversations` | 会話を新規作成。空の `{}` を送信し、`{ id }` を受け取る | `201 Created` |
| POST | `/conversations/{id}/chat` | 同期的にメッセージを送信し、応答を受け取る | `200 OK` |
| POST | `/conversations/{id}/chatOverStream` | ストリーミングで応答を受け取る | `200 OK` |

### リクエストヘッダー

| ヘッダー | 値 | 必須 |
|---------|------|------|
| `Authorization` | `Bearer {token}` | Yes |
| `Content-Type` | `application/json` | Yes |

### 会話作成（POST /conversations）リクエストボディ

空の JSON オブジェクト `{}` を送信する。

### 会話作成レスポンス例

```json
{
  "id": "0d110e7e-2b7e-4270-a899-fd2af6fde333",
  "createdDateTime": "2025-09-30T15:28:46.1560062Z",
  "displayName": "",
  "status": "active",
  "turnCount": 0
}
```

### チャット（POST /conversations/{id}/chat）リクエストボディ

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `message` | object | **Required** | 送信するメッセージ。`message.text` にプロンプトテキストを指定 |
| `locationHint` | object | **Required** | ユーザーのロケーション情報。`locationHint.timeZone` にタイムゾーン（例: `"Asia/Tokyo"`）を指定 |
| `contextualResources` | object | Optional | OneDrive / SharePoint ファイルのコンテキスト指定や Web 検索の切り替え |
| `additionalContext` | array | Optional | 追加グラウンディング用のコンテキスト情報（ドキュメント抜粋等） |

### リクエスト例（同期チャット）

```http
POST https://graph.microsoft.com/beta/copilot/conversations/{conversationId}/chat
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": {
    "text": "プロンプトのテキスト"
  },
  "locationHint": {
    "timeZone": "Asia/Tokyo"
  },
  "contextualResources": {
    "files": [
      {
        "uri": "https://contoso.sharepoint.com/sites/site/path/file.docx"
      }
    ],
    "webContext": {
      "isWebEnabled": true
    }
  },
  "additionalContext": [
    {
      "text": "追加コンテキスト情報"
    }
  ]
}
```

### チャットレスポンス構造

```json
{
  "@odata.context": "https://graph.microsoft.com/beta/$metadata#microsoft.graph.copilotConversation",
  "id": "0d110e7e-...",
  "createdDateTime": "2025-09-30T15:55:53Z",
  "displayName": "What meeting do I have at 9 AM tomorrow morning?",
  "state": "active",
  "turnCount": 1,
  "messages": [
    {
      "@odata.type": "#microsoft.graph.copilotConversationResponseMessage",
      "id": "cc211f56-...",
      "text": "ユーザーのプロンプト",
      "createdDateTime": "2025-09-30T15:55:53Z",
      "adaptiveCards": [],
      "attributions": [],
      "sensitivityLabel": { ... }
    },
    {
      "@odata.type": "#microsoft.graph.copilotConversationResponseMessage",
      "id": "3fe6b260-...",
      "text": "Copilot の応答テキスト（Markdown 形式）",
      "createdDateTime": "2025-09-30T15:55:58Z",
      "adaptiveCards": [{}],
      "attributions": [
        {
          "attributionType": "citation",
          "providerDisplayName": "引用元の名前",
          "attributionSource": "model",
          "seeMoreWebUrl": "https://..."
        }
      ],
      "sensitivityLabel": { ... }
    }
  ]
}
```

> **注意**: `messages` 配列には送信したプロンプトと Copilot の応答が両方含まれる。マルチターン会話では直近のターンのメッセージのみが返却される。

### 主な機能

- **マルチターン会話**: 会話 ID を使って継続的な対話が可能
- **Enterprise グラウンディング**: 組織内の SharePoint / OneDrive / メール等をコンテキストとして利用
- **Web 検索**: ターンごとに有効/無効を切り替え可能
- **ファイルコンテキスト**: OneDrive / SharePoint のファイルを参照可能
- **セキュリティ**: M365 のアクセス許可・秘密度ラベルを尊重

## 必要な権限（Delegated Permissions）

この API は **Delegated（委任）権限のみ** をサポートする。Application 権限では利用不可。

| スコープ | 用途 |
|---------|------|
| `Sites.Read.All` | SharePoint サイトの読み取り |
| `Mail.Read` | メールの読み取り |
| `People.Read.All` | 連絡先の読み取り |
| `OnlineMeetingTranscript.Read.All` | 会議トランスクリプトの読み取り |
| `Chat.Read` | Teams チャットの読み取り |
| `ChannelMessage.Read.All` | チャネルメッセージの読み取り |
| `ExternalItem.Read.All` | 外部アイテムの読み取り |

> **注意**: すべてのスコープが **同時に** 必要。1つでも欠けると API 呼び出しは失敗する。Enterprise グラウンディングで組織内データを参照するために広範な読み取り権限が求められる。

### スコープの指定方法

MSAL でトークンを取得する際の `scopes` 配列:

```javascript
const scopes = [
  "Sites.Read.All",
  "Mail.Read",
  "People.Read.All",
  "OnlineMeetingTranscript.Read.All",
  "Chat.Read",
  "ChannelMessage.Read.All",
  "ExternalItem.Read.All",
];
```

> **管理者同意について**: `People.Read.All`, `ChannelMessage.Read.All`, `ExternalItem.Read.All` などは組織の管理者による同意（Admin Consent）が必要になる場合がある。Azure AD アプリ登録時に「管理者の同意を与える」を実施するか、テナント管理者に依頼する必要がある。

## 制約事項

- **Beta API**: 今後破壊的変更の可能性あり
- **テキストのみ**: ファイル作成、メール送信、会議スケジュール等は不可
- **コードインタープリタ / 画像生成は非対応**
- **長時間タスクはゲートウェイタイムアウトの可能性あり**
- **Graph Explorer はストリーミング会話に非対応**
- **Delegated 権限のみ**: ユーザーがサインインしている必要がある
- **個人アカウント非対応**: Delegated (personal Microsoft account) はサポートされていない
- **National Cloud 非対応**: Global サービスのみ利用可能（US Gov L4/L5、China 21Vianet は非対応）

## 認証フローの選択肢

Delegated 権限のみサポートされるため、以下の2つのフローが主な選択肢となる。

### 1. Implicit Flow（フロント完結）

```
ブラウザ → Azure AD → ブラウザ（トークン直接返却）→ Graph API
```

- MSAL.js (`@azure/msal-browser`) を使用
- トークンがブラウザに露出する
- トークンのライフタイムが短い（通常 1 時間）
- **注意**: Microsoft は SPA に対して Implicit Flow を非推奨としており、Authorization Code Flow with PKCE を推奨している

### 2. Authorization Code Flow（バックエンド経由）

```
ブラウザ → Azure AD → バックエンド（認可コード）→ Azure AD（トークン交換）→ Graph API
```

- バックエンドで `@azure/msal-node` の `ConfidentialClientApplication` を使用
- トークンはサーバー側のみで保持（クライアントに露出しない）
- Client Secret を使用可能（Confidential Client）
- リフレッシュトークンによるサイレント更新が可能

## アクセストークンの寿命設定

Entra ID の `TokenLifetimePolicy` を使うことで、アクセストークンの寿命をカスタマイズできる。

| 項目 | 値 |
|------|------|
| デフォルト | 60〜90 分（ランダム、平均 75 分） |
| 最小 | **10 分** |
| 最大 | 1 日（24 時間） |
| 必要ライセンス | **Microsoft Entra ID P1** |

### 設定方法（PowerShell）

```powershell
# 例: アクセストークンを 10 分に短縮するポリシーを作成
New-MgPolicyTokenLifetimePolicy -Definition @(
  '{"TokenLifetimePolicy":{"Version":1,"AccessTokenLifetime":"00:10:00"}}'
) -DisplayName "ShortLivedTokenPolicy"

# アプリにポリシーを紐づけ
New-MgApplicationTokenLifetimePolicyByRef -ApplicationId <app-object-id> -BodyParameter @{
  "@odata.id" = "https://graph.microsoft.com/v1.0/policies/tokenLifetimePolicies/<policy-id>"
}
```

### 注意点

- **アプリ側のコード変更は不要** — ポリシーは Entra ID 側の設定で、トークン発行時に自動適用される
- **トークン短縮はトレードオフ** — 短くすると `acquireTokenSilent()` の頻度が上がり、UX に影響する可能性がある
- **SPA（Implicit Flow）ではリフレッシュトークンが制限される**ため、サイレント更新は hidden iframe で行われるが制約がある
- **トークンが漏洩した場合の被害を時間的に抑える効果はある**が、ブラウザにトークンが露出する根本的なリスクは解消されない
- セキュリティを重視する場合は、トークン寿命の短縮よりも **server-mediated パターン（バックエンド経由）** の採用が本質的な解決策となる

### 参考

- [Configurable token lifetimes](https://learn.microsoft.com/en-us/entra/identity-platform/configurable-token-lifetimes)
- [Configure token lifetimes](https://learn.microsoft.com/en-us/entra/identity-platform/configure-token-lifetimes)

## 参考リンク

- [M365 Copilot Chat API Overview](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/overview)
- [copilotConversation: chat (同期)](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotconversation-chat)
- [copilotConversation: chatOverStream (ストリーミング)](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotconversation-chatoverstream)
- [会話の作成](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotroot-post-conversations)
- [M365 Copilot APIs 概要](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/copilot-apis-overview)
