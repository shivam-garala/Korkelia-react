function normalizeBaseUrl(value) {
  if (!value) return null;
  return String(value).replace(/\/+$/, "");
}

export function getAdminApiBaseUrl() {
  const baseUrl = normalizeBaseUrl(
    process.env.NEXT_BASE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BASE_API_URL
  );
  if (!baseUrl) {
    throw new Error(
      "Missing env var NEXT_BASE_API_URL (or NEXT_PUBLIC_API_URL / NEXT_PUBLIC_BASE_API_URL)"
    );
  }
  return baseUrl;
}

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function extractToken(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload?.authToken === "string") return payload.authToken;
  if (typeof payload?.token === "string") return payload.token;
  if (typeof payload?.accessToken === "string") return payload.accessToken;
  if (typeof payload?.access_token === "string") return payload.access_token;
  if (typeof payload?.data?.authToken === "string") return payload.data.authToken;
  if (typeof payload?.data?.token === "string") return payload.data.token;
  if (typeof payload?.data?.accessToken === "string") return payload.data.accessToken;
  if (typeof payload?.data?.access_token === "string") return payload.data.access_token;
  return null;
}

export async function forwardJson({ url, method, body, headers }) {
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const raw = await response.text();
  let parsed = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = raw ? { message: raw } : null;
  }

  return { response, parsed };
}

export function getBearerAuthHeader(token) {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
