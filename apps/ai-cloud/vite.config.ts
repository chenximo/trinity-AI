import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const trinityAiSrc = fileURLToPath(new URL("../trinity-ai/src", import.meta.url));

/** 部署子路径（COS / Nginx 目录 `trinityai-demo`）；本地根路径 dev 可设 `VITE_APP_BASE=/` */
const appBase = (() => {
  const raw = process.env.VITE_APP_BASE ?? "/trinityai-demo/";
  return raw.endsWith("/") ? raw : `${raw}/`;
})();

export default defineConfig({
  base: appBase,
  plugins: [UnoCSS(), vue()],
  server: {
    port: 5202,
    strictPort: true,
    headers: { "Cache-Control": "no-store" },
    fs: { allow: [repoRoot] },
  },
  preview: { port: 5202, strictPort: true },
  resolve: {
    alias: {
      "@repo": repoRoot,
      "@trinity-ai": trinityAiSrc,
    },
  },
});
