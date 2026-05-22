import { defineConfig } from "vitepress";
import type { DefaultTheme } from "vitepress";
import { devDocEditorServer } from "./plugins/devDocEditorServer";

/**
 * 部署路径：
 * - 主站子路径：base: '/docs/'（默认）
 * - 独立子域：base: '/'，由 Nginx 挂到 docs.example.com
 */
const BASE = process.env.VITEPRESS_BASE ?? "/docs/";

/** 左侧栏：API 轨（OpenRouter 式 Tree：一级 + 可折叠二级） */
const sidebarApi: DefaultTheme.SidebarItem[] = [
  { text: "概述", link: "/api/overview" },
  {
    text: "端点",
    collapsed: false,
    items: [
      { text: "对话补全（生文）", link: "/api/chat-completions" },
      { text: "图像生成（生图）", link: "/api/images-generations" },
      { text: "视频生成（生视频）", link: "/api/videos-generations" },
    ],
  },
];

/** 左侧栏：文档轨（产品 IA + 最小闭环合并） */
const sidebarDocs: DefaultTheme.SidebarItem[] = [
  { text: "快速入门", link: "/quickstart" },
  { text: "管理 API 密钥", link: "/manage-api-keys" },
  { text: "模块", link: "/modules" },
  {
    text: "多模态",
    collapsed: false,
    items: [
      { text: "概述", link: "/multimodal/" },
      { text: "图片输入", link: "/multimodal/image-input" },
      { text: "图片生成", link: "/multimodal/image-generation" },
      { text: "视频输入", link: "/multimodal/video-input" },
      { text: "视频生成", link: "/multimodal/video-generation" },
      { text: "音频", link: "/multimodal/audio" },
      { text: "PDF 文件", link: "/multimodal/pdf" },
    ],
  },
  {
    text: "指南",
    collapsed: false,
    items: [
      { text: "流式输出（SSE）", link: "/guides/streaming-sse" },
      { text: "请求参数", link: "/guides/request-parameters" },
    ],
  },
  {
    text: "参考",
    collapsed: false,
    items: [
      { text: "错误与调试", link: "/reference/error-codes" },
      { text: "速率与限额", link: "/guides/rate-limits" },
    ],
  },
  { text: "常见问题", link: "/faq" },
];

export default defineConfig({
  vite: {
    plugins: [devDocEditorServer()],
    server: { port: 5205, strictPort: true, host: "127.0.0.1" },
    preview: { port: 5202, strictPort: true },
  },
  lang: "zh-CN",
  title: "Trinity AI 文档",
  description: "Trinity AI API 文档：HTTP API、生文、生图、生视频快速入门与接口参考。",
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
    siteTitle: "Trinity AI",
    nav: [{ text: "官网", link: "https://trinity.ai/", target: "_blank", rel: "noreferrer" }],
    sidebar: {
      "/api/": sidebarApi,
      "/multimodal/": sidebarDocs,
      "/modules": sidebarDocs,
      "/guides/": sidebarDocs,
      "/reference/": sidebarDocs,
      "/manage-api-keys": sidebarDocs,
      "/faq": sidebarDocs,
      "/quickstart": sidebarDocs,
      "/": sidebarDocs,
    },
    socialLinks: [],
    footer: {
      message: "© Trinity AI · 文档内容真源为 Markdown",
      copyright: "静态构建 · 二期由运营后台发布 md 触发构建",
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: { noResultsText: "无匹配结果", resetButtonTitle: "清除" },
        },
      },
    },
    outline: { label: "On this page" },
    docFooter: { prev: "上一页", next: "下一页" },
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "浅色",
    darkModeSwitchTitle: "深色",
  },
});
