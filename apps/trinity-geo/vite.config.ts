import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import type { Connect } from "vite";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const geoMarketingRoot = fileURLToPath(new URL("../trinity-geo-prototype/marketing", import.meta.url));
const watchPoll = process.env.VITE_WATCH_POLL === "1";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

/** 开发态托管 HTML 原型（只读对照），真源在 trinity-geo-prototype */
function geoPrototypeMarketingStatic(): Plugin {
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
    name: "geo-prototype-marketing-static",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [UnoCSS(), vue(), geoPrototypeMarketingStatic()],
  server: {
    port: 5203,
    strictPort: true,
    headers: { "Cache-Control": "no-store" },
    fs: { allow: [repoRoot] },
    watch: {
      followSymlinks: true,
      ignored: ["**/node_modules/**", "**/dist/**"],
      ...(watchPoll ? { usePolling: true, interval: 300 } : {}),
    },
  },
  preview: { port: 5203, strictPort: true },
  resolve: {
    alias: { "@repo": repoRoot },
  },
});
