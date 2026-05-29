export type ParsedApiResponseBody = {
  preview: string;
  isGatewayHtml: boolean;
  apiErrorMessage: string | null;
};

function extractHtmlTitle(text: string): string | null {
  const match = text.match(/<title>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

export function isGatewayHtmlBody(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith("<") ||
    /<html[\s>]/i.test(trimmed) ||
    /Bad Gateway|nginx/i.test(trimmed)
  );
}

export function extractApiErrorMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const root = json as { error?: { message?: unknown }; message?: unknown };
  if (typeof root.error?.message === "string" && root.error.message.trim()) {
    return root.error.message.trim();
  }
  if (typeof root.message === "string" && root.message.trim()) {
    return root.message.trim();
  }
  return null;
}

export function parseApiResponseBody(httpStatus: number, text: string): ParsedApiResponseBody {
  const trimmed = text.trim();

  if (isGatewayHtmlBody(trimmed)) {
    const title = extractHtmlTitle(trimmed) ?? `HTTP ${httpStatus}`;
    return {
      preview: `网关 ${httpStatus}：${title}（HTML 错误页，非 API JSON）`,
      isGatewayHtml: true,
      apiErrorMessage: null,
    };
  }

  try {
    const json = JSON.parse(trimmed) as unknown;
    const apiErrorMessage = extractApiErrorMessage(json);
    if (apiErrorMessage) {
      return {
        preview: `[${httpStatus}] ${apiErrorMessage}`,
        isGatewayHtml: false,
        apiErrorMessage,
      };
    }
  } catch {
    /* plain text or partial body */
  }

  return {
    preview: trimmed.slice(0, 500),
    isGatewayHtml: false,
    apiErrorMessage: null,
  };
}

export function isUnsupportedParamError(httpStatus: number | null, message: string | null | undefined): boolean {
  if (httpStatus !== 400 || !message) return false;
  return /not supported|unsupported|invalid.*param|不支持|未开放|invalid_request/i.test(message);
}

export function isGatewayError(httpStatus: number | null, isGatewayHtml: boolean): boolean {
  if (isGatewayHtml) return true;
  return httpStatus != null && httpStatus >= 502 && httpStatus <= 504;
}
