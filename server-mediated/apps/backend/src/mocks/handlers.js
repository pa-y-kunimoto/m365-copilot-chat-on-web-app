import { http, HttpResponse } from "msw";

let turnCount = 0;

const mockResponses = [
  "こんにちは！M365 Copilot のモックモードです。何かお手伝いできることはありますか？",
  "これはモックの応答です。実際の環境では Microsoft Graph Copilot Chat API を通じて回答が返されます。",
  "モックモードでは、UI の動作確認ができます。Azure AD の設定なしで画面の流れを確認できます。",
  "Enterprise グラウンディングや Web 検索は、実際の API 接続時に利用可能になります。",
];

export const handlers = [
  // Azure AD: getAuthCodeUrl が内部で呼ぶ OpenID 設定
  http.get("https://login.microsoftonline.com/*/v2.0/.well-known/openid-configuration", () => {
    return HttpResponse.json({
      authorization_endpoint: "https://login.microsoftonline.com/mock/oauth2/v2.0/authorize",
      token_endpoint: "https://login.microsoftonline.com/mock/oauth2/v2.0/token",
      issuer: "https://login.microsoftonline.com/mock/v2.0",
    });
  }),

  // Azure AD: トークン交換
  http.post("https://login.microsoftonline.com/*/oauth2/v2.0/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token-from-msw",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "Sites.Read.All Mail.Read People.Read.All",
      id_token: "mock-id-token",
    });
  }),

  // Graph API: 会話作成
  http.post("https://graph.microsoft.com/beta/copilot/conversations", () => {
    return HttpResponse.json(
      {
        id: `mock-conv-${Date.now()}`,
        createdDateTime: new Date().toISOString(),
        displayName: "",
        status: "active",
        turnCount: 0,
      },
      { status: 201 }
    );
  }),

  // Graph API: チャット
  http.post(
    "https://graph.microsoft.com/beta/copilot/conversations/:id/chat",
    async ({ request }) => {
      const body = await request.json();
      const userText = body.message?.text || "";
      const responseText = mockResponses[turnCount % mockResponses.length];
      turnCount++;

      return HttpResponse.json({
        id: `mock-conv-${Date.now()}`,
        state: "active",
        turnCount,
        messages: [
          {
            "@odata.type": "#microsoft.graph.copilotConversationResponseMessage",
            id: `msg-user-${Date.now()}`,
            text: userText,
            createdDateTime: new Date().toISOString(),
            adaptiveCards: [],
            attributions: [],
            sensitivityLabel: {},
          },
          {
            "@odata.type": "#microsoft.graph.copilotConversationResponseMessage",
            id: `msg-assistant-${Date.now()}`,
            text: responseText,
            createdDateTime: new Date().toISOString(),
            adaptiveCards: [],
            attributions: [],
            sensitivityLabel: {},
          },
        ],
      });
    }
  ),
];
