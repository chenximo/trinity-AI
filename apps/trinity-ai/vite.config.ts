import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const watchPoll = process.env.VITE_WATCH_POLL === "1";

const docsDevProxy = {
  "/docs": {
    target: "http://127.0.0.1:5205",
    changeOrigin: true,
    ws: true,
  },
} as const;

export default defineConfig({
  /** UnoCSS 在 Vue 之前，避免部分环境下 SFC 热更新与扫描顺序冲突（见 unocss 各框架集成说明） */
  plugins: [UnoCSS(), vue()],
  server: {
    port: 5201,
    proxy: docsDevProxy,
    /** 占用时直接失败，避免静默换端口导致 HMR 连错 */
    strictPort: true,
    /** 开发态禁用缓存，避免「刷新了还是旧页面」 */
    headers: { "Cache-Control": "no-store" },
    /** 允许读 monorepo 根（@repo、workspace 包），并参与监听 */
    fs: { allow: [repoRoot] },
    /**
     * 监听通过 symlink 指回 monorepo 的包（如 @trinity/ui）。
     * 项目在 iCloud/网络盘时 chokidar 常丢事件：可 `VITE_WATCH_POLL=1 npm run dev -w @trinity/app-trinity-ai` 开轮询。
     */
    watch: {
      followSymlinks: true,
      ignored: ["**/node_modules/**", "**/dist/**"],
      ...(watchPoll ? { usePolling: true, interval: 300 } : {}),
    },
  },
  preview: { port: 5201, strictPort: true, proxy: docsDevProxy },
  resolve: {
    alias: { "@repo": repoRoot },
  },
});
