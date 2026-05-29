export type RequestHeaderRow = {
  key: string;
  value: string;
  enabled: boolean;
  note?: string;
};

/** 去掉用户误粘贴的 Bearer 前缀，只保留 xh-… token */
export function normalizeApiKey(raw: string): string {
  let key = raw.trim();
  while (/^Bearer\s+/i.test(key)) {
    key = key.replace(/^Bearer\s+/i, "").trim();
  }
  return key;
}

export function formatAuthorizationHeader(apiKey: string): string {
  const token = normalizeApiKey(apiKey);
  return token ? `Bearer ${token}` : "";
}

export function maskApiKeyToken(key: string): string {
  const token = normalizeApiKey(key);
  if (!token) return "（未填写 Key）";
  if (token.length <= 10) return "****";
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function resolveHost(baseUrl?: string): string {
  if (!baseUrl?.trim()) return "（见 BASE_URL）";
  try {
    return new URL(baseUrl.trim().replace(/\/+$/, "") || "http://localhost").host;
  } catch {
    return "（见 BASE_URL）";
  }
}

/** Postman 对齐的请求头清单（含客户端自动添加项说明） */
export function buildChatRequestHeaderRows(input: {
  apiKey?: string;
  skipAuth?: boolean;
  baseUrl?: string;
  userAgent?: string;
}): RequestHeaderRow[] {
  const host = resolveHost(input.baseUrl);
  const rows: RequestHeaderRow[] = [
    {
      key: "Content-Type",
      value: "application/json",
      enabled: true,
      note: "必填",
    },
    {
      key: "Content-Length",
      value: "（请求发送时自动计算）",
      enabled: true,
      note: "自动",
    },
    {
      key: "Host",
      value: host,
      enabled: true,
      note: "自动",
    },
    {
      key: "User-Agent",
      value: input.userAgent ?? "（HTTP 客户端自动）",
      enabled: true,
      note: "自动",
    },
    {
      key: "Accept",
      value: "*/*",
      enabled: true,
      note: "自动",
    },
    {
      key: "Accept-Encoding",
      value: "gzip, deflate, br",
      enabled: true,
      note: "自动",
    },
    {
      key: "Connection",
      value: "keep-alive",
      enabled: true,
      note: "自动",
    },
  ];

  if (input.skipAuth) {
    rows.push({
      key: "Authorization",
      value: "（本用例不发送）",
      enabled: false,
      note: "负例",
    });
    return rows;
  }

  const token = input.apiKey ? normalizeApiKey(input.apiKey) : "";
  rows.push({
    key: "Authorization",
    value: token ? `Bearer ${maskApiKeyToken(token)}` : "Bearer （未填写 Key）",
    enabled: Boolean(token),
    note: "必填",
  });

  return rows;
}

export function buildExplicitChatRequestHeaders(input: {
  apiKey?: string;
  skipAuth?: boolean;
}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!input.skipAuth && input.apiKey?.trim()) {
    const auth = formatAuthorizationHeader(input.apiKey);
    if (auth) headers.Authorization = auth;
  }
  return headers;
}

export function maskAuthorizationHeader(headers: Record<string, string>): Record<string, string> {
  const out = { ...headers };
  const auth = out.Authorization;
  if (!auth?.startsWith("Bearer ")) return out;

  const token = normalizeApiKey(auth.slice(7));
  if (!token) {
    out.Authorization = "Bearer （空）";
    return out;
  }
  out.Authorization = `Bearer ${maskApiKeyToken(token)}`;
  return out;
}
