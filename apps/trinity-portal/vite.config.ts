import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import type { Connect } from "vite";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const geoMarketingRoot = fileURLToPath(new URL("../trinity-geo/marketing", import.meta.url));
const appSrc = (dir: string) => fileURLToPath(new URL(`../${dir}/src`, import.meta.url));
const watchPoll = process.env.VITE_WATCH_POLL === "1";

const GEO_MARKETING_MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
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
    res.setHeader("Content-Type", GEO_MARKETING_MIME[path.extname(file)] ?? "application/octet-stream");
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
    res.setHeader("Content-Type", GEO_MARKETING_MIME[path.extname(file)] ?? "application/octet-stream");
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

/** 开发：VitePress 仍跑在 :5205，经同源 `/docs` 反代，见 getTrinityDocsSiteUrl */
const docsDevProxy = {
  "/docs": {
    target: "http://127.0.0.1:5205",
    changeOrigin: true,
    ws: true,
  },
  /** 开发文档编辑 API（旧路径兼容；新客户端走 /docs/__trinity_dev_docs） */
  "/__trinity_dev_docs": {
    target: "http://127.0.0.1:5205",
    changeOrigin: true,
  },
} as const;

export default defineConfig({
  plugins: [UnoCSS(), vue(), repoPackagesStatic(), geoMarketingStatic()],
  server: {
    port: 5173,
    proxy: docsDevProxy,
    /** 占用时直接失败，避免静默换端口后仍刷 5173 却连到别的/旧的进程（「刷新无效」常见原因） */
    strictPort: true,
    headers: { "Cache-Control": "no-store" },
    fs: { allow: [repoRoot] },
    watch: {
      followSymlinks: true,
      ignored: ["**/node_modules/**", "**/dist/**"],
      ...(watchPoll ? { usePolling: true, interval: 300 } : {}),
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
    headers: { "Cache-Control": "no-store" },
    proxy: docsDevProxy,
  },
  resolve: {
    alias: {
      "@repo": repoRoot,
      "@trinity-design": appSrc("trinity-design"),
      "@trinity-ai": appSrc("trinity-ai"),
      "@app-ai-cloud": appSrc("ai-cloud"),
      "@trinity-geo": appSrc("trinity-geo"),
      "@trinity-ai-admin": appSrc("trinity-ai-admin"),
    },
  },
});
