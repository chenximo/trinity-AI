import { defineConfig } from "vitepress";
import { devDocEditorServer } from "./plugins/devDocEditorServer";

/**
 * 部署路径：
 * - 主站子路径：base: '/docs/'（默认）
 * - 独立子域：base: '/'，由 Nginx 挂到 docs.example.com
 */
const BASE = process.env.VITEPRESS_BASE ?? "/docs/";

export default defineConfig({
  vite: {
    plugins: [devDocEditorServer()],
    server: { port: 5205, strictPort: true, host: "127.0.0.1" },
    preview: { port: 5202, strictPort: true },
  },
  lang: "zh-CN",
  title: "Trinity AI 文档",
  description: "Trinity AI API 文档：OpenAI 兼容接口、流式 SSE、错误码与快速开始。",
  base: BASE,
  srcDir: "./docs",
  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    lineNumbers: true,
    theme: {
      light: "github-light",
      dark: "github-dark",
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

  themeConfig: {
    /** 文字标题用 siteTitle；勿用 logo: { text }，否则 VPImage 会报 image=undefined */
    siteTitle: "Trinity AI 文档",
    nav: [
      { text: "快速开始", link: "/quickstart" },
      { text: "API", link: "/api/chat-completions" },
      { text: "官网", link: "https://trinity.ai/", target: "_blank", rel: "noreferrer" },
    ],
    sidebar: [
      {
        text: "入门",
        items: [
          { text: "文档首页", link: "/" },
          { text: "快速开始", link: "/quickstart" },
        ],
      },
      {
        text: "API",
        items: [{ text: "对话补全", link: "/api/chat-completions" }],
      },
      {
        text: "指南",
        items: [{ text: "流式 SSE", link: "/guides/streaming-sse" }],
      },
      {
        text: "参考",
        items: [{ text: "错误码", link: "/reference/error-codes" }],
      },
    ],
    socialLinks: [],
    footer: {
      message: "© Trinity AI · 文档内容真源为 Markdown",
      copyright: "静态构建 · 二期由运营后台发布 md 触发构建",
    },
    search: {
      provider: "local",
    },
    outline: { label: "本页目录" },
    docFooter: { prev: "上一页", next: "下一页" },
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "浅色",
    darkModeSwitchTitle: "深色",
  },
});
