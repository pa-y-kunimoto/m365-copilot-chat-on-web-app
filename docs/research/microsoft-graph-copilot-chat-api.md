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

> **注意**: すべてのスコープが必要。Enterprise グラウンディングで組織内データを参照するために広範な読み取り権限が求められる。

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

## 参考リンク

- [M365 Copilot Chat API Overview](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/overview)
- [copilotConversation: chat (同期)](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotconversation-chat)
- [copilotConversation: chatOverStream (ストリーミング)](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotconversation-chatoverstream)
- [会話の作成](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/api/ai-services/chat/copilotroot-post-conversations)
- [M365 Copilot APIs 概要](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/copilot-apis-overview)
