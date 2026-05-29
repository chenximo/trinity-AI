import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";
import { normalizeApiKey } from "../../acceptance/runner/chatRequestHeaders";
import { executeChatCase } from "../../acceptance/runner/executeCase";
import { buildChatCompletionRequest } from "../../acceptance/runner/formatChatRequest";
import { resolveCaseExpect } from "../../acceptance/runner/resolveCaseExpect";

const PLUGIN_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const ACCEPTANCE_DIR = path.join(PLUGIN_ROOT, "acceptance");

const SITE_BASE = (process.env.VITEPRESS_BASE ?? "/product/").replace(/\/+$/, "");
const API_PREFIXES = [
  "/__trinity_api_acceptance",
  ...(SITE_BASE ? [`${SITE_BASE}/__trinity_api_acceptance`] : []),
];

type CaseFile = {
  cases: Array<{
    id: string;
    title: string;
    category: string;
    matrix?: boolean;
    skipAuth?: boolean;
    request: Record<string, unknown>;
    expect: {
      httpStatus?: number;
      httpStatusMin?: number;
      httpStatusMax?: number;
      assertions?: string[];
    };
    expectByModel?: Record<
      string,
      {
        httpStatus?: number;
        httpStatusMin?: number;
        httpStatusMax?: number;
        assertions?: string[];
      }
    >;
  }>;
};

type ModelsFile = {
  models: Array<{ id: string; label: string; provider: string }>;
};

function isLocalhostHost(host: string | undefined): boolean {
  if (!host) return false;
  return /^127\.0\.0\.1:\d+$/i.test(host) || /^localhost:\d+$/i.test(host) || /^\[::1\]:\d+$/i.test(host);
}

function matchesApi(pathname: string): boolean {
  return API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function stripApiPrefix(pathname: string): string {
  for (const prefix of API_PREFIXES) {
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

async function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf-8");
}

type CasesFile = CaseFile & { defaultModel?: string };

async function loadConfig() {
  const [casesRaw, modelsRaw, envExampleRaw] = await Promise.all([
    fs.readFile(path.join(ACCEPTANCE_DIR, "cases/chat-completions.json"), "utf-8"),
    fs.readFile(path.join(ACCEPTANCE_DIR, "config/models.mvp.json"), "utf-8"),
    fs.readFile(path.join(ACCEPTANCE_DIR, "config/env.example.json"), "utf-8"),
  ]);
  const cases = JSON.parse(casesRaw) as CasesFile;
  const modelsFile = JSON.parse(modelsRaw) as ModelsFile;
  const envExample = JSON.parse(envExampleRaw) as { baseUrl?: string };
  const baseUrl = process.env.TRINITY_API_BASE_URL ?? envExample.baseUrl ?? "http://43.159.57.43";
  const serverKey = process.env.TRINITY_API_KEY?.trim() || null;
  const defaultModel =
    cases.defaultModel?.trim() || modelsFile.models[0]?.id?.trim() || "gpt-5.5";
  return { cases, models: modelsFile.models, baseUrl, serverKey, defaultModel };
}

function resolveCase(cases: CaseFile["cases"], caseId: string) {
  return cases.find((c) => c.id === caseId) ?? null;
}

function resolveRunModel(
  bodyModel: string | undefined,
  caseDef: CaseFile["cases"][number],
  models: ModelsFile["models"],
  fileDefaultModel?: string,
): string {
  const fromBody = bodyModel?.trim();
  if (fromBody) return fromBody;
  const fromCase = typeof caseDef.request.model === "string" ? caseDef.request.model.trim() : "";
  if (fromCase) return fromCase;
  if (fileDefaultModel?.trim()) return fileDefaultModel.trim();
  const first = models[0]?.id?.trim();
  if (first) return first;
  throw new Error("未指定 model，且 models.mvp.json 为空");
}

function buildRequestBody(caseDef: CaseFile["cases"][number], model: string) {
  return buildChatCompletionRequest(caseDef.request, model, { forceModel: true });
}

function resolveBaseUrl(override: string | undefined, fallback: string): string {
  const raw = override?.trim() || fallback;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error("protocol");
    }
    return u.origin;
  } catch {
    throw new Error(`无效的内测 BASE_URL：${raw}`);
  }
}

export function apiAcceptanceServer(): Plugin {
  return {
    name: "trinity-api-acceptance",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const pathname = new URL(url, "http://127.0.0.1").pathname;

        if (!matchesApi(pathname)) {
          next();
          return;
        }

        if (!isLocalhostHost(req.headers.host)) {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("API acceptance console is only available on localhost.");
          return;
        }

        const subPath = stripApiPrefix(pathname);

        try {
          if (req.method === "GET" && subPath === "/config") {
            const config = await loadConfig();
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                baseUrl: config.baseUrl,
                hasServerKey: Boolean(config.serverKey),
                models: config.models,
                defaultModel: config.defaultModel,
                cases: config.cases.cases,
                endpoint: config.cases.endpoint ?? "/v1/chat/completions",
              }),
            );
            return;
          }

          if (req.method === "POST" && subPath === "/run") {
            const body = JSON.parse(await readRequestBody(req)) as {
              caseId?: string;
              model?: string;
              apiKey?: string;
              baseUrl?: string;
              requestOverride?: Record<string, unknown>;
            };
            const config = await loadConfig();
            const caseDef = body.caseId ? resolveCase(config.cases.cases, body.caseId) : null;
            if (!caseDef) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Unknown caseId" }));
              return;
            }

            let targetBaseUrl: string;
            try {
              targetBaseUrl = resolveBaseUrl(body.baseUrl, config.baseUrl);
            } catch (err) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : "无效的内测 BASE_URL",
                }),
              );
              return;
            }

            const rawKey = body.apiKey?.trim() || config.serverKey || "";
            const apiKey = rawKey ? normalizeApiKey(rawKey) : undefined;
            if (!caseDef.skipAuth && !apiKey) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "缺少 API Key（页内填写或设置 TRINITY_API_KEY）" }));
              return;
            }

            let runModel: string;
            try {
              runModel = resolveRunModel(
                body.model,
                caseDef,
                config.models,
                config.defaultModel,
              );
            } catch (err) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : "未指定 model",
                }),
              );
              return;
            }

            let requestBody: Record<string, unknown>;
            const override = body.requestOverride;
            if (override && typeof override === "object" && !Array.isArray(override)) {
              const modelFromOverride =
                typeof override.model === "string" ? override.model.trim() : "";
              if (modelFromOverride) runModel = modelFromOverride;
              requestBody = buildChatCompletionRequest(override, runModel, { forceModel: true });
            } else {
              requestBody = buildRequestBody(caseDef, runModel);
            }
            const result = await executeChatCase({
              baseUrl: targetBaseUrl,
              apiKey,
              skipAuth: caseDef.skipAuth,
              requestBody,
              expect: resolveCaseExpect(caseDef, runModel),
            });

            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                caseId: caseDef.id,
                model: (requestBody.model as string) ?? body.model ?? null,
                ...result,
              }),
            );
            return;
          }

          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Not found" }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Server error",
            }),
          );
        }
      });
    },
  };
}
