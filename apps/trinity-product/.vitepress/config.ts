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
    text: "手册规范",
    collapsed: false,
    items: [
      { text: "文档规范", link: "/产品手册文档规范" },
      { text: "更新规范", link: "/产品手册更新规范" },
      { text: "产品线产品设计分析模板", link: "/产品线产品设计分析-模板" },
      { text: "产品经理工作手册", link: "/产品经理工作手册" },
      { text: "产品经理必备技能", link: "/产品经理必备技能" },
      { text: "子页 PRD 规范", link: "/geo/sub-page-prd-standard" },
      { text: "Cursor Skills 全景图", link: "/cursor-skills-全景图" },
    ],
  },
  {
    text: "智能助手工具",
    collapsed: false,
    items: [
      { text: "总览", link: "/assistant-tools/" },
      {
        text: "需求分析助手",
        collapsed: false,
        items: [
          { text: "工具简介", link: "/assistant-tools/requirement-inbox/" },
          { text: "待办清单", link: "/assistant-tools/requirement-inbox/todo" },
          { text: "产品需求分析", link: "/assistant-tools/requirement-inbox/prd" },
          { text: "路线 A 落地文档", link: "/assistant-tools/requirement-inbox/route-a" },
        ],
      },
    ],
  },
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
      { text: "产品总览", link: "/ai-cloud/" },
      { text: "营销首页", link: "/ai-cloud/marketing-home" },
      { text: "用户控制台", link: "/ai-cloud/account-console" },
    ],
  },
  {
    text: "AI API 聚合产品",
    collapsed: false,
    items: [
      { text: "产品总览", link: "/ai-api-platform/" },
      { text: "业务全景", link: "/ai-api-platform/business-overview" },
      { text: "能力地图", link: "/ai-api-platform/capability-map" },
      { text: "产品核心与架构", link: "/ai-api-platform/product-core" },
      {
        text: "模型价目与刊例治理",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/pricing-sources/" },
          { text: "模型原价折扣", link: "/ai-api-platform/pricing-sources/supplier-cost-discounts" },
          { text: "价目全流程", link: "/ai-api-platform/pricing-sources/workflow" },
          { text: "采购渠道真源", link: "/ai-api-platform/pricing-sources/suppliers" },
          { text: "原厂定价页链接", link: "/ai-api-platform/pricing-sources/official-pricing-urls" },
          { text: "日常操作（refresh / gate）", link: "/ai-api-platform/pricing-sources/operations" },
          { text: "三模态索引", link: "/ai-api-platform/pricing-sources/modality-index" },
          { text: "新增模型 SOP", link: "/ai-api-platform/pricing-sources/add-model-sop" },
          { text: "新增供应商 SOP", link: "/ai-api-platform/pricing-sources/add-supplier-sop" },
          { text: "生视频刊例发布 SOP", link: "/ai-api-platform/pricing-sources/video-rollout" },
          { text: "刊例上线部署", link: "/ai-api-platform/pricing-sources/listing-deploy" },
          { text: "厂商外链索引", link: "/ai-api-platform/pricing-sources/vendor-links" },
        ],
      },
      {
        text: "商用计费与充值",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/commercial-billing/" },
          { text: "MVP PRD（6.30 商用计费）", link: "/ai-api-platform/commercial-billing/commercial-billing-mvp-prd" },
          { text: "MVP 支付 UI 详规", link: "/ai-api-platform/commercial-billing/mvp-openrouter-payment" },
          { text: "行业报告（计费/支付/退款）", link: "/ai-api-platform/commercial-billing/industry-billing-payment-report" },
          { text: "OpenRouter 支付调研与佐证", link: "/ai-api-platform/commercial-billing/openrouter-payment-evidence" },
          { text: "全球化美金支付与 KYC（二期）", link: "/ai-api-platform/commercial-billing/global-payment" },
        ],
      },
      { text: "产品迭代版本", link: "/ai-api-platform/release-notes" },
      { text: "上游资料索引", link: "/ai-api-platform/upstream-references" },
      {
        text: "友商产品调研",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/competitor-research/" },
          { text: "OpenRouter", link: "/ai-api-platform/competitor-research/openrouter" },
          { text: "New API（开源）", link: "/ai-api-platform/competitor-research/new-api" },
          {
            text: "New API · Skill",
            collapsed: true,
            items: [
              { text: "落地方案（P0–P3）", link: "/ai-api-platform/competitor-research/new-api-skill" },
              { text: "P0 实施规格", link: "/ai-api-platform/competitor-research/new-api-skill-p0-spec" },
              { text: "设计要点（附录）", link: "/ai-api-platform/competitor-research/new-api-skill-design" },
              { text: "模型 API（附录）", link: "/ai-api-platform/competitor-research/new-api-skill-model-info" },
            ],
          },
        ],
      },
      {
        text: "Agent（二期 · 规划期）",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/agent/" },
          { text: "战略与架构（L0）", link: "/ai-api-platform/agent/positioning-and-architecture" },
          { text: "Agent SDK · P0 设计（L2）", link: "/ai-api-platform/agent/agent-sdk-product-design" },
          {
            text: "预研",
            collapsed: false,
            items: [
              { text: "落地报告", link: "/ai-api-platform/agent/agent-landing-report" },
              { text: "跨境投放", link: "/ai-api-platform/agent/preresearch-cross-border-ads-agent" },
            ],
          },
          { text: "附录 · 行业背景", link: "/ai-api-platform/agent/industry-cross-border" },
        ],
      },
      {
        text: "用户侧模块",
        collapsed: false,
        items: [
          { text: "总览", link: "/ai-api-platform/user/" },
          {
            text: "模型广场",
            collapsed: false,
            items: [
              { text: "模型域总览", link: "/ai-api-platform/user/models/" },
              { text: "列表", link: "/ai-api-platform/user/models/list" },
              { text: "模型详情", link: "/ai-api-platform/user/models/model-detail-requirements" },
              { text: "模型排名", link: "/ai-api-platform/user/models/rankings" },
            ],
          },
          {
            text: "身份与组织",
            collapsed: false,
            items: [
              { text: "总览", link: "/ai-api-platform/user/identity-org/" },
              { text: "工作区", link: "/ai-api-platform/user/identity-org/workspace" },
              { text: "成员", link: "/ai-api-platform/user/identity-org/members" },
              { text: "API 密钥", link: "/ai-api-platform/user/identity-org/api-keys" },
              { text: "配额与余额", link: "/ai-api-platform/user/identity-org/quota" },
              { text: "用量与活动", link: "/ai-api-platform/user/identity-org/usage-logs" },
            ],
          },
          { text: "Chat 在线体验", link: "/ai-api-platform/user/chat-experience" },
          {
            text: "文档与支持",
            collapsed: false,
            items: [
              { text: "总览", link: "/ai-api-platform/user/docs/" },
              { text: "对外文档站", link: "/ai-api-platform/user/developer-docs" },
            ],
          },
          { text: "用户控制台（归档）", link: "/ai-api-platform/user/account-console" },
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
  {
    text: "GEO 产品",
    collapsed: false,
    items: [
      { text: "产品总览", link: "/geo/" },
      { text: "GEO MVP 实践手册", link: "/geo/mvp-practice" },
      { text: "垂直行业 Playbook 最佳实践", link: "/geo/vertical-industry-playbooks" },
      { text: "业务全景（讨论稿）", link: "/geo/business-landscape" },
      { text: "原型页面清单", link: "/geo/v1-prototype-pages" },
      { text: "官网首页原型", link: "/geo/prototypes/v1-homepage" },
      { text: "控制台总览原型", link: "/geo/prototypes/v1-dashboard" },
      { text: "产品设计分析", link: "/geo/product-design-analysis" },
      { text: "技术架构分析", link: "/geo/tech-architecture" },
      { text: "PM 补充（GEO 专属）", link: "/geo/pm-handbook" },
      {
        text: "子页 PRD",
        collapsed: false,
        items: [
          { text: "通用规范", link: "/geo/sub-page-prd-standard" },
          { text: "参考样例 · 引用与信源", link: "/geo/samples/citations-prd-sample" },
        ],
      },
      { text: "GEO 业界计费", link: "/geo/geo-billing-industry" },
      { text: "Agent 多平台发文方案", link: "/geo/agent-multi-platform-publishing" },
      {
        text: "友商产品调研",
        collapsed: false,
        items: [
          { text: "总览", link: "/geo/competitor-research/" },
          { text: "Tier 1 竞品深度分析", link: "/geo/competitor-research/tier1-deep-dive" },
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
  description: "Trinity 产品能力树：AI 云、AI API 聚合产品、GEO 产品。",
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
      { text: "智能助手", link: "/assistant-tools/" },
      { text: "AI 云", link: "/ai-cloud/" },
      { text: "API 聚合产品", link: "/ai-api-platform/" },
      { text: "GEO 产品", link: "/geo/" },
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
