import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import type { Connect } from "vite";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const geoMarketingRoot = fileURLToPath(new URL("./marketing", import.meta.url));

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

function repoPackagesStatic(): Plugin {
  const prefix = "/packages/tokens/src";
  const tokensRoot = path.join(repoRoot, "packages/tokens/src");
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const raw = req.url?.split("?")[0] ?? "";
    if (!raw.startsWith(prefix)) return next();
    const rel = decodeURIComponent(raw.slice(prefix.length).replace(/^\//, ""));
    const file = path.normalize(path.join(tokensRoot, rel));
    if (!file.startsWith(tokensRoot) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    res.setHeader("Content-Type", MIME[path.extname(file)] ?? "application/octet-stream");
    fs.createReadStream(file).pipe(res);
  };
  return {
    name: "repo-packages-tokens-static",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

function geoMarketingStatic(): Plugin {
  const prefix = "/__geo_marketing";
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const raw = req.url?.split("?")[0] ?? "";
    if (!raw.startsWith(prefix)) return next();
    let rel = decodeURIComponent(raw.slice(prefix.length).replace(/^\//, ""));
    if (!rel || rel.endsWith("/")) rel += "index.html";
    const file = path.normalize(path.join(geoMarketingRoot, rel));
    if (!file.startsWith(geoMarketingRoot) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    res.setHeader("Content-Type", MIME[path.extname(file)] ?? "application/octet-stream");
    fs.createReadStream(file).pipe(res);
  };
  return {
    name: "geo-marketing-static",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [vue(), UnoCSS(), repoPackagesStatic(), geoMarketingStatic()],
  server: { port: 5203 },
});
