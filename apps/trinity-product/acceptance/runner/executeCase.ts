import {
  buildChatRequestHeaderRows,
  buildExplicitChatRequestHeaders,
  maskAuthorizationHeader,
  type RequestHeaderRow,
} from "./chatRequestHeaders";
import { parseApiResponseBody } from "./parseApiResponseBody";
import { extractTokenUsage, type TokenUsage } from "./tokenUsage";

export type CaseExpect = {
  httpStatus?: number;
  httpStatusMin?: number;
  httpStatusMax?: number;
  assertions?: string[];
};

export type RunResult = {
  pass: boolean;
  httpStatus: number;
  durationMs: number;
  tokenUsage: TokenUsage | null;
  requestMethod: string;
  requestUrl: string;
  requestHeaders: Record<string, string>;
  requestHeaderRows: RequestHeaderRow[];
  requestBody: Record<string, unknown>;
  responsePreview: string;
  responseRaw: string;
  isGatewayHtml?: boolean;
  apiErrorMessage?: string | null;
  error?: string;
  assertionErrors: string[];
};

export function chatCompletionsUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/v1/chat/completions`;
}

function extractAssistantContent(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const choices = (json as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0]) return "";
  const msg = (choices[0] as { message?: { content?: unknown } }).message;
  const content = msg?.content;
  return typeof content === "string" ? content : "";
}

function statusMatches(status: number, expect: CaseExpect): boolean {
  if (expect.httpStatus != null) return status === expect.httpStatus;
  const min = expect.httpStatusMin ?? 200;
  const max = expect.httpStatusMax ?? 299;
  return status >= min && status <= max;
}

function formatStatusMismatch(
  status: number,
  expect: CaseExpect,
  parsed: ReturnType<typeof parseApiResponseBody>,
): string {
  const expected = expect.httpStatus ?? `${expect.httpStatusMin ?? 200}-${expect.httpStatusMax ?? 299}`;
  if (parsed.isGatewayHtml) {
    return `HTTP ${status} 为网关 HTML 错误页（非 API JSON）；期望 ${expected}`;
  }
  return `HTTP ${status} 不符合期望 (${expected})`;
}

function runAssertions(
  assertions: string[] | undefined,
  ctx: {
    httpStatus: number;
    assistantText: string;
    sseDone: boolean;
    sseHasDelta: boolean;
  },
): string[] {
  const errors: string[] = [];
  for (const id of assertions ?? []) {
    if (id === "has_assistant_content" && !ctx.assistantText.trim()) {
      errors.push("缺少非空 assistant 文本");
    }
    if (id === "has_delta_content" && !ctx.sseHasDelta) {
      errors.push("流式响应未收到 content delta");
    }
    if (id === "sse_completed" && !ctx.sseDone) {
      errors.push("流式响应未正常结束");
    }
    if (id === "http_error" && ctx.httpStatus >= 200 && ctx.httpStatus < 400) {
      errors.push(`期望 HTTP 错误，实际 ${ctx.httpStatus}`);
    }
  }
  return errors;
}

async function readSseResponse(res: Response): Promise<{
  assistantText: string;
  sseDone: boolean;
  sseHasDelta: boolean;
  tokenUsage: TokenUsage | null;
  raw: string;
}> {
  const reader = res.body?.getReader();
  if (!reader) {
    return { assistantText: "", sseDone: false, sseHasDelta: false, tokenUsage: null, raw: "" };
  }

  const decoder = new TextDecoder();
  let raw = "";
  let assistantText = "";
  let sseDone = false;
  let sseHasDelta = false;
  let tokenUsage: TokenUsage | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    raw += chunk;

    for (const line of chunk.split("\n")) {
      const trimmed = line.trim();
      if (trimmed === "data: [DONE]") {
        sseDone = true;
        continue;
      }
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") {
        if (payload === "[DONE]") sseDone = true;
        continue;
      }
      try {
        const json = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const usage = extractTokenUsage(json);
        if (usage) tokenUsage = usage;

        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) {
          sseHasDelta = true;
          assistantText += delta;
        }
      } catch {
        /* ignore partial JSON */
      }
    }
  }

  if (!sseDone && raw.includes("[DONE]")) sseDone = true;

  return { assistantText, sseDone, sseHasDelta, tokenUsage, raw };
}

function buildRunResultBase(input: {
  requestBody: Record<string, unknown>;
  url: string;
  requestHeaders: Record<string, string>;
  requestHeaderRows: RequestHeaderRow[];
}): Pick<
  RunResult,
  "requestMethod" | "requestUrl" | "requestHeaders" | "requestHeaderRows" | "requestBody"
> {
  return {
    requestMethod: "POST",
    requestUrl: input.url,
    requestHeaders: input.requestHeaders,
    requestHeaderRows: input.requestHeaderRows,
    requestBody: input.requestBody,
  };
}

export async function executeChatCase(input: {
  baseUrl: string;
  apiKey?: string;
  skipAuth?: boolean;
  requestBody: Record<string, unknown>;
  expect: CaseExpect;
}): Promise<RunResult> {
  const url = chatCompletionsUrl(input.baseUrl);
  const headers = buildExplicitChatRequestHeaders({
    apiKey: input.apiKey,
    skipAuth: input.skipAuth,
  });
  const requestHeaders = maskAuthorizationHeader(headers);
  const requestHeaderRows = buildChatRequestHeaderRows({
    apiKey: input.apiKey,
    skipAuth: input.skipAuth,
    baseUrl: input.baseUrl,
  });
  const base = buildRunResultBase({
    requestBody: input.requestBody,
    url,
    requestHeaders,
    requestHeaderRows,
  });

  const stream = input.requestBody.stream === true;
  const started = Date.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(input.requestBody),
    });
    const durationMs = Date.now() - started;

    if (stream) {
      const sse = await readSseResponse(res);
      const assertionErrors = runAssertions(input.expect.assertions, {
        httpStatus: res.status,
        assistantText: sse.assistantText,
        sseDone: sse.sseDone,
        sseHasDelta: sse.sseHasDelta,
      });
      if (!statusMatches(res.status, input.expect)) {
        assertionErrors.unshift(
          `HTTP ${res.status} 不符合期望 (${input.expect.httpStatus ?? `${input.expect.httpStatusMin}-${input.expect.httpStatusMax}`})`,
        );
      }
      return {
        pass: assertionErrors.length === 0,
        httpStatus: res.status,
        durationMs,
        tokenUsage: sse.tokenUsage,
        ...base,
        responsePreview: sse.assistantText.slice(0, 500) || sse.raw.slice(0, 500),
        responseRaw: sse.raw.slice(0, 8000),
        assertionErrors,
      };
    }

    const text = await res.text();
    const parsed = parseApiResponseBody(res.status, text);
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-json error body */
    }

    const assistantText = extractAssistantContent(json);
    const tokenUsage = extractTokenUsage(json);
    const assertionErrors = runAssertions(input.expect.assertions, {
      httpStatus: res.status,
      assistantText,
      sseDone: false,
      sseHasDelta: false,
    });
    if (!statusMatches(res.status, input.expect)) {
      assertionErrors.unshift(formatStatusMismatch(res.status, input.expect, parsed));
    }

    const responsePreview =
      assistantText.trim() ||
      parsed.preview ||
      (parsed.isGatewayHtml ? parsed.preview : text.slice(0, 500));

    return {
      pass: assertionErrors.length === 0,
      httpStatus: res.status,
      durationMs,
      tokenUsage,
      ...base,
      responsePreview: responsePreview.slice(0, 500),
      responseRaw: text.slice(0, 8000),
      isGatewayHtml: parsed.isGatewayHtml,
      apiErrorMessage: parsed.apiErrorMessage,
      assertionErrors,
    };
  } catch (err) {
    return {
      pass: false,
      httpStatus: 0,
      durationMs: Date.now() - started,
      tokenUsage: null,
      ...base,
      responsePreview: "",
      responseRaw: "",
      error: err instanceof Error ? err.message : String(err),
      assertionErrors: ["网络或代理请求失败"],
    };
  }
}
