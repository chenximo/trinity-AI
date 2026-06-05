import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitepress";
import { devDocEditorServer } from "./plugins/devDocEditorServer";
import { docsBaseRedirect } from "./plugins/docsBaseRedirect";
import { buildMergedSidebar } from "./config/sidebars";
import { themeEn, themeZh } from "./config/theme-locale";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

/**
 * 部署路径：
 * - 主站子路径：base: '/docs/'（默认）
 * - 独立子域：base: '/'，由 Nginx 挂到 docs.example.com
 */
const BASE = process.env.VITEPRESS_BASE ?? "/docs/";

const markdownShared = {
  lineNumbers: true,
  theme: {
    light: "github-light" as const,
    dark: "github-dark" as const,
  },
};

const sharedTheme = {
  siteTitle: "Trinity AI",
  /** 顶栏由 TrinityProductNav 渲染，对齐 trinitydesk.ai */
  nav: [] as const,
  sidebar: buildMergedSidebar(),
  socialLinks: [] as const,
  footer: {
    message: "© Trinity AI",
    copyright: "© Trinity AI",
  },
};

export default defineConfig({
  vite: {
    plugins: [docsBaseRedirect(), devDocEditorServer()],
    resolve: {
      alias: {
        "@repo": repoRoot,
      },
    },
    server: { port: 5205, strictPort: true, host: "127.0.0.1" },
    preview: { port: 5202, strictPort: true },
  },
  lang: "zh-CN",
  title: "Trinity AI 文档",
  description:
    "Trinity AI API 文档：HTTP API、生文、生图、生视频快速入门与接口参考。",
  base: BASE,
  srcDir: "./docs",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    ...sharedTheme,
    search: { provider: "local" },
  },

  locales: {
    root: {
      label: "中文",
      lang: "zh-CN",
      title: "Trinity AI 文档",
      description:
        "Trinity AI API 文档：HTTP API、生文、生图、生视频快速入门与接口参考。",
      themeConfig: {
        ...sharedTheme,
        ...themeZh,
      },
      markdown: {
        ...markdownShared,
        container: {
          tipLabel: "重要",
          infoLabel: "说明",
          warningLabel: "注意",
        },
      },
    },
    en: {
      label: "English",
      lang: "en",
      /** 语言根路径（勿写具体页面）；对应页路由会拼当前 slug，如 /en/quickstart */
      link: "/en/quickstart",
      title: "Trinity AI Docs",
      description:
        "Trinity AI API documentation: HTTP API, chat, image and video generation.",
      themeConfig: {
        ...sharedTheme,
        ...themeEn,
      },
      markdown: {
        ...markdownShared,
        container: {
          tipLabel: "Important",
          infoLabel: "Note",
          warningLabel: "Warning",
        },
      },
    },
  },

  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap",
      },
    ],
  ],
});
