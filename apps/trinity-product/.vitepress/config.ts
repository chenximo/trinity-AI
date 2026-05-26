import { defineConfig } from "vitepress";
import type { DefaultTheme } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { devDocEditorServer } from "./plugins/devDocEditorServer";

/** 独立产品手册；默认 `/product/` 子路径，本地根路径：`VITEPRESS_BASE=/` */
const BASE = process.env.VITEPRESS_BASE ?? "/product/";

const sidebarProduct: DefaultTheme.SidebarItem[] = [
  { text: "总览", link: "/" },
  {
    text: "AI 云",
    collapsed: false,
    items: [{ text: "业务总览", link: "/ai-cloud/" }],
  },
  {
    text: "AI API 聚合平台",
    collapsed: false,
    items: [
      { text: "平台总览", link: "/ai-api-platform/" },
      {
        text: "用户侧模块",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/user/" },
          { text: "模型广场列表", link: "/ai-api-platform/user/model-catalog" },
          { text: "Chat 在线体验", link: "/ai-api-platform/user/chat-experience" },
          { text: "开发者文档", link: "/ai-api-platform/user/developer-docs" },
          { text: "用户控制台", link: "/ai-api-platform/user/account-console" },
        ],
      },
      {
        text: "平台侧模块",
        collapsed: false,
        items: [{ text: "总览", link: "/ai-api-platform/platform/" }],
      },
      {
        text: "运营侧模块",
        collapsed: false,
        items: [{ text: "总览", link: "/ai-api-platform/operations/" }],
      },
    ],
  },
];

export default withMermaid(
  defineConfig({
  vite: {
    plugins: [devDocEditorServer()],
    server: { port: 5206, strictPort: true, host: "127.0.0.1" },
    preview: { port: 5206, strictPort: true },
  },
  lang: "zh-CN",
  title: "Trinity 产品手册",
  description: "Trinity 产品能力树：AI 云、AI API 聚合平台（用户侧 / 平台侧 / 运营侧）。",
  base: BASE,
  srcDir: "./docs",
  cleanUrls: true,
  lastUpdated: true,
  /** 工程路径、本地文档站链接不参与死链检查 */
  ignoreDeadLinks: [/^https?:\/\/127\.0\.0\.1/, /\/src\//, /\.\.\/.*trinity-(ai|docs)/],
  markdown: {
    lineNumbers: false,
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
  mermaid: {
    theme: "default",
  },

  themeConfig: {
    siteTitle: "Trinity 产品手册",
    nav: [
      { text: "开发者文档", link: "http://127.0.0.1:5205/docs/", target: "_blank" },
      { text: "AI 云", link: "/ai-cloud/" },
      { text: "API 聚合平台", link: "/ai-api-platform/" },
    ],
    sidebar: sidebarProduct,
    footer: {
      message: "内容真源：Git Markdown · AI 维护结构与你补充业务说明",
      copyright: "对内 / 对外可选用脱敏 build 导出 PDF",
    },
    search: { provider: "local" },
    outline: { level: [2, 3] },
  },
  }),
);
