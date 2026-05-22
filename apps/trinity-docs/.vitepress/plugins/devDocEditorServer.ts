import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";
import { pageSlugToMdRel } from "../shared/docPath";

const PLUGIN_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const DOCS_DIR = path.join(PLUGIN_ROOT, "docs");
const API_PREFIX = "/__trinity_dev_docs";

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

async function readRequestBody(req: Connect.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf-8");
}

export function devDocEditorServer(): Plugin {
  return {
    name: "trinity-dev-doc-editor",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith(API_PREFIX)) {
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

          if (req.method === "GET" && parsed.pathname === `${API_PREFIX}/raw`) {
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

          if (req.method === "POST" && parsed.pathname === `${API_PREFIX}/save`) {
            const body = JSON.parse(await readRequestBody(req)) as { rel?: string; content?: string };
            const rel = body.rel?.trim();
            const content = body.content;
            if (!rel || typeof content !== "string") {
              res.statusCode = 400;
              res.end("Missing rel or content");
              return;
            }
            const filePath = resolveDocsMd(rel);
            if (!filePath) {
              res.statusCode = 400;
              res.end("Invalid rel");
              return;
            }
            await fs.writeFile(filePath, content, "utf-8");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ ok: true, rel }));
            return;
          }

          res.statusCode = 404;
          res.end("Not found");
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(err instanceof Error ? err.message : "Server error");
        }
      });
    },
  };
}
