import { defineConfig } from "vitepress";
import type { DefaultTheme } from "vitepress";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withMermaid } from "vitepress-plugin-mermaid";
import { apiAcceptanceServer } from "./plugins/apiAcceptanceServer";
import { devDocEditorServer } from "./plugins/devDocEditorServer";
import { roadmapYamlPlugin } from "./plugins/roadmapYamlPlugin";

/** 独立产品手册；默认 `/product/` 子路径，本地根路径：`VITEPRESS_BASE=/` */
const BASE = process.env.VITEPRESS_BASE ?? "/product/";

const CONFIG_DIR = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = path.resolve(CONFIG_DIR, "../../..");
const ENGINEER_DOCS = path.join(REPO_ROOT, "docs/00-协作与工作流/工程师");

const sidebarProduct: DefaultTheme.SidebarItem[] = [
  { text: "总览", link: "/" },
  {
    text: "法律与合规（草案）",
    collapsed: true,
    items: [
      { text: "说明", link: "/legal/" },
      { text: "隐私政策", link: "/legal/privacy-policy" },
    ],
  },
  {
    text: "AI 云",
    collapsed: false,
    items: [
      { text: "业务总览", link: "/ai-cloud/" },
      { text: "营销首页", link: "/ai-cloud/marketing-home" },
      { text: "用户控制台", link: "/ai-cloud/account-console" },
    ],
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
          {
            text: "模型广场",
            collapsed: false,
            items: [
              { text: "列表", link: "/ai-api-platform/user/models/list" },
              { text: "模型详情页需求", link: "/ai-api-platform/user/models/model-detail-requirements" },
            ],
          },
          { text: "Chat 在线体验", link: "/ai-api-platform/user/chat-experience" },
          { text: "开发者文档", link: "/ai-api-platform/user/developer-docs" },
          { text: "用户控制台", link: "/ai-api-platform/user/account-console" },
        ],
      },
      {
        text: "平台侧模块",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/platform/" },
          { text: "统一 API 基座", link: "/ai-api-platform/platform/unified-api" },
          { text: "生文 API + 流式", link: "/ai-api-platform/platform/chat-completions" },
          { text: "多模态 API", link: "/ai-api-platform/platform/multimodal-api" },
          { text: "鉴权 · 限流 · 配额", link: "/ai-api-platform/platform/auth-rate-quota" },
          { text: "路由与 Fallback", link: "/ai-api-platform/platform/routing-fallback" },
          { text: "计量与计费", link: "/ai-api-platform/platform/metering-billing" },
          { text: "数据策略", link: "/ai-api-platform/platform/data-policies" },
          { text: "标准错误与可观测", link: "/ai-api-platform/platform/errors-observability" },
        ],
      },
      {
        text: "运营后台管理平台",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/operations/" },
          { text: "运营工作台", link: "/ai-api-platform/operations/dashboard" },
          { text: "供应商管理", link: "/ai-api-platform/operations/suppliers" },
          { text: "模型上架与供应线路", link: "/ai-api-platform/operations/models-routes" },
          { text: "密钥管理", link: "/ai-api-platform/operations/keys" },
          { text: "用量与计费", link: "/ai-api-platform/operations/billing" },
          { text: "监控与风控", link: "/ai-api-platform/operations/monitoring-risk" },
          { text: "用户注册与审核", link: "/ai-api-platform/operations/users" },
          { text: "权限与操作审计", link: "/ai-api-platform/operations/access-audit" },
          { text: "客户与合同", link: "/ai-api-platform/operations/customers" },
          { text: "文档中心（运营发布）", link: "/ai-api-platform/operations/docs-publish" },
          { text: "报表中心", link: "/ai-api-platform/operations/reports" },
        ],
      },
      {
        text: "API 测试",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/api-test/" },
          { text: "API 内测文档", link: "/ai-api-platform/api-test/internal-api-doc" },
          { text: "生文验收台", link: "/ai-api-platform/api-test/chat-completions" },
          { text: "验收路线图", link: "/ai-api-platform/api-test/roadmap" },
          { text: "Chat API Test", link: "/ai-api-platform/api-test/reports/chat-api-test" },
        ],
      },
    ],
  },
];

export default withMermaid(
  defineConfig({
  vite: {
    plugins: [roadmapYamlPlugin(), devDocEditorServer(), apiAcceptanceServer()],
    server: {
      port: 5206,
      strictPort: true,
      host: "127.0.0.1",
      fs: { allow: [REPO_ROOT] },
    },
    preview: { port: 5206, strictPort: true },
    resolve: {
      alias: {
        "@trinity-engineer-docs": ENGINEER_DOCS,
      },
    },
  },
  lang: "zh-CN",
  title: "Trinity 产品手册",
  description: "Trinity 产品能力树：AI 云、AI API 聚合平台（用户侧 / 平台侧 / 运营后台管理平台）。",
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
    outline: { level: [2, 3], label: "本页目录" },
  },
  }),
);
