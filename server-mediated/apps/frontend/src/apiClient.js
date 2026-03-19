const BASE = "";

export async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
  });
  return res;
}

export async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}
