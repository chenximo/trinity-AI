import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const appSrc = (dir: string) => fileURLToPath(new URL(`../${dir}/src`, import.meta.url));

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  server: { port: 5210, strictPort: true },
  preview: { port: 5210, strictPort: true },
  resolve: {
    alias: {
      "@repo": repoRoot,
      "@trinity-ai": appSrc("trinity-ai"),
      "@trinity-ai-admin": appSrc("trinity-ai-admin"),
    },
  },
});
