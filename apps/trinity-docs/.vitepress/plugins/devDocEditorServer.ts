import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";
import { isCosUploadConfigured } from "../shared/cosEnv";
import { pageSlugToMdRel } from "../shared/docPath";
import { loadTrinityDocsDevEnv } from "../shared/loadDevEnv";

const PLUGIN_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const DOCS_DIR = path.join(PLUGIN_ROOT, "docs");

/** 与 VitePress `base` 一致；经 portal `/docs` 反代时 API 须在 base 下 */
const SITE_BASE = (process.env.VITEPRESS_BASE ?? "/docs/").replace(/\/+$/, "");
const API_PREFIXES = [
  "/__trinity_dev_docs",
  ...(SITE_BASE ? [`${SITE_BASE}/__trinity_dev_docs`] : []),
];

function isLocalhostHost(host: string | undefined): boolean {
  if (!host) return false;
  return /^127\.0\.0\.1:\d+$/i.test(host) || /^localhost:\d+$/i.test(host) || /^\[::1\]:\d+$/i.test(host);
}

/** 校验并解析为 docs 目录下的绝对路径 */
export function resolveDocsMd(rel: string): string | null {
  if (!rel.endsWith(".md")) return null;
  const normalized = path.normalize(rel);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;
  const full = path.resolve(DOCS_DIR, normalized);
  if (!full.startsWith(DOCS_DIR + path.sep) && full !== DOCS_DIR) return null;
  return full;
}

function normalizeApiPathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function matchApiRoute(pathname: string): "raw" | "save" | "upload-image" | "upload-config" | null {
  const path = normalizeApiPathname(pathname);
  for (const prefix of API_PREFIXES) {
    if (path === `${prefix}/raw`) return "raw";
    if (path === `${prefix}/save`) return "save";
    if (path === `${prefix}/upload-image`) return "upload-image";
    if (path === `${prefix}/upload-config`) return "upload-config";
  }
  return null;
}

function jsonResponse(
  res: Connect.ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function matchesApi(pathname: string): boolean {
  return API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf-8");
}

export function devDocEditorServer(): Plugin {
  loadTrinityDocsDevEnv(PLUGIN_ROOT);

  return {
    name: "trinity-dev-doc-editor",
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
          res.end("Dev doc editor is only available on localhost.");
          return;
        }

        try {
          const parsed = new URL(url, "http://127.0.0.1");
          const route = matchApiRoute(parsed.pathname);

          if (req.method === "OPTIONS" && route) {
            res.statusCode = 204;
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            res.end();
            return;
          }

          if (req.method === "GET" && route === "raw") {
            const relParam = parsed.searchParams.get("rel")?.trim();
            const pageParam = parsed.searchParams.get("page");
            const rel = relParam
              ? relParam.endsWith(".md")
                ? relParam
                : `${relParam}.md`
              : pageSlugToMdRel(pageParam ?? "");
            const filePath = resolveDocsMd(rel);
            if (!filePath) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Invalid page path", rel }));
              return;
            }
            try {
              const content = await fs.readFile(filePath, "utf-8");
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ rel, content }));
            } catch (readErr) {
              const code = (readErr as NodeJS.ErrnoException).code;
              res.statusCode = code === "ENOENT" ? 404 : 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  error: code === "ENOENT" ? `File not found: docs/${rel}` : String(readErr),
                  rel,
                }),
              );
            }
            return;
          }

          if (req.method === "POST" && route === "save") {
            const body = JSON.parse(await readRequestBody(req)) as { rel?: string; content?: string };
            const rel = body.rel?.trim();
            const content = body.content;
            if (!rel || typeof content !== "string") {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Missing rel or content" }));
              return;
            }
            const filePath = resolveDocsMd(rel);
            if (!filePath) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Invalid rel", rel }));
              return;
            }
            await fs.writeFile(filePath, content, "utf-8");

            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: true, rel }));
            return;
          }

          if (req.method === "GET" && route === "upload-config") {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ cosEnabled: isCosUploadConfigured() }));
            return;
          }

          if (req.method === "POST" && route === "upload-image") {
            const body = JSON.parse(await readRequestBody(req)) as {
              mime?: string;
              filename?: string;
              dataBase64?: string;
            };
            const mime = body.mime?.trim();
            const dataBase64 = body.dataBase64?.trim();
            if (!mime || !dataBase64) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Missing mime or dataBase64" }));
              return;
            }
            let buffer: Buffer;
            try {
              buffer = Buffer.from(dataBase64, "base64");
            } catch {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Invalid base64 payload" }));
              return;
            }
            if (buffer.length === 0) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Empty image data" }));
              return;
            }

            try {
              const { uploadImageToCos } = await import("../shared/cosUpload");
              const { url, key } = await uploadImageToCos(
                buffer,
                mime,
                body.filename?.trim(),
              );
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ ok: true, url, key }));
            } catch (uploadErr) {
              const message =
                uploadErr instanceof Error ? uploadErr.message : "COS upload failed";
              res.statusCode = uploadErr instanceof Error && message.includes("未配置") ? 503 : 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: message }));
            }
            return;
          }

          jsonResponse(res, 404, {
            error: `Unknown dev docs API route: ${req.method} ${normalizeApiPathname(parsed.pathname)}`,
          });
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
