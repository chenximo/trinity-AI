import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";

const PLUGIN_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const DOCS_DIR = path.join(PLUGIN_ROOT, "docs");

const SITE_BASE = (process.env.VITEPRESS_BASE ?? "/product/").replace(/\/+$/, "");

function isProductYamlFilename(name: string): boolean {
  return (
    name.endsWith("roadmap.yml") ||
    name.endsWith(".roadmap.yml") ||
    name.endsWith("week-progress.yml") ||
    name.endsWith("product-backlog.yml")
  );
}

function listProductYamlFiles(): string[] {
  const out: string[] = [];
  function walk(dir: string) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (isProductYamlFilename(ent.name)) out.push(full);
    }
  }
  walk(DOCS_DIR);
  return out;
}

function docsRelFromAbs(abs: string): string {
  return path.relative(DOCS_DIR, abs).split(path.sep).join("/");
}

function tryServeProductYaml(pathname: string, res: Connect.ServerResponse): boolean {
  const prefixes = [SITE_BASE, ""].filter((p, i, a) => a.indexOf(p) === i);
  for (const prefix of prefixes) {
    const prefixPath = prefix ? `${prefix}/` : "/";
    const baseName = pathname.split("/").pop() ?? "";
    if (!isProductYamlFilename(baseName)) continue;
    if (prefix && !pathname.startsWith(prefixPath)) continue;
    const rel = prefix ? pathname.slice(prefixPath.length) : pathname.replace(/^\//, "");
    const normalized = path.normalize(rel);
    if (normalized.startsWith("..") || path.isAbsolute(normalized)) continue;
    const full = path.resolve(DOCS_DIR, normalized);
    if (!full.startsWith(DOCS_DIR + path.sep)) continue;
    if (!fs.existsSync(full)) continue;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(fs.readFileSync(full));
    return true;
  }
  return false;
}

function roadmapYamlMiddleware(
  req: Connect.IncomingMessage,
  res: Connect.ServerResponse,
  next: Connect.NextFunction,
) {
  const url = req.url ?? "";
  const pathname = new URL(url, "http://127.0.0.1").pathname;
  if (tryServeProductYaml(pathname, res)) return;
  next();
}

export function roadmapYamlPlugin(): Plugin {
  let outDir = path.join(PLUGIN_ROOT, ".vitepress", "dist");

  return {
    name: "trinity-roadmap-yaml-static",
    configResolved(config) {
      outDir = path.resolve(config.root ?? PLUGIN_ROOT, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use(roadmapYamlMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(roadmapYamlMiddleware);
    },
    async closeBundle() {
      const files = listProductYamlFiles();
      for (const abs of files) {
        const rel = docsRelFromAbs(abs);
        const dest = path.join(outDir, rel);
        await fsp.mkdir(path.dirname(dest), { recursive: true });
        await fsp.copyFile(abs, dest);
      }
    },
  };
}
