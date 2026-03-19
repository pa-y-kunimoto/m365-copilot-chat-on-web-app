import { http, HttpResponse } from "msw";

let turnCount = 0;

const mockResponses = [
  "こんにちは！M365 Copilot のモックモードです。何かお手伝いできることはありますか？",
  "これはモックの応答です。実際の環境では Microsoft Graph Copilot Chat API を通じて回答が返されます。",
  "モックモードでは、UI の動作確認ができます。Azure AD の設定なしで画面の流れを確認できます。",
  "Enterprise グラウンディングや Web 検索は、実際の API 接続時に利用可能になります。",
];

export const handlers = [
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
