import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const trinityAiSrc = fileURLToPath(new URL("../trinity-ai/src", import.meta.url));

export default defineConfig({
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
