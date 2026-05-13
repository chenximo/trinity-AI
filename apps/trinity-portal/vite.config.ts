import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const appSrc = (dir: string) => fileURLToPath(new URL(`../${dir}/src`, import.meta.url));

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  server: { port: 5173 },
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
