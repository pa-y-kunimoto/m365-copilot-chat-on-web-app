export function saveTokens(session, tokenResponse) {
  session.accessToken = tokenResponse.accessToken;
  session.account = {
    name: tokenResponse.account?.name || "",
    username: tokenResponse.account?.username || "",
  };
}

export function getAccessToken(session) {
  return session.accessToken || null;
}

export function getAccount(session) {
  return session.account || null;
}
