import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const appSrc = (dir: string) => fileURLToPath(new URL(`../${dir}/src`, import.meta.url));
const watchPoll = process.env.VITE_WATCH_POLL === "1";

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
  plugins: [UnoCSS(), vue()],
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
