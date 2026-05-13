import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  server: { port: 5201 },
  resolve: {
    alias: { "@repo": repoRoot },
  },
});
