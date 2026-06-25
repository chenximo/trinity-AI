import type { DefaultTheme } from "vitepress";

/** 侧栏文案：中文 → 英文 */
const LABEL_EN: Record<string, string> = {
  概述: "Overview",
  端点: "Endpoints",
  "获取模型": "List models",
  "创建对话补全": "Create chat completion",
  "对话补全（生文）": "Chat completions",
  "创建图像生成": "Create image generation",
  "图像生成（生图 · chat）": "Image generation (chat)",
  "创建视频生成任务": "Create video generation",
  "视频生成（生视频）": "Video generation",
  "高级参数": "Advanced parameters",
  模型参数: "Models",
  生文: "Text",
  生图: "Images",
  生视频: "Video",
  快速入门: "Quickstart",
  "管理 API 密钥": "Manage API keys",
  多模态: "Multimodal",
  图片输入: "Image input",
  图片生成: "Image generation",
  视频输入: "Video input",
  视频生成: "Video generation",
  指南: "Guides",
  "流式输出（SSE）": "Streaming (SSE)",
  请求参数: "Request parameters",
  参考: "Reference",
  "错误与调试": "Errors & debugging",
  "速率与限额": "Rate limits",
  "计费与 Credits": "Billing & Credits",
  常见问题: "FAQ",
  "编程 IDE / CLI": "IDE & CLI",
  智能体工作台: "Agent workbench",
  Cursor: "Cursor",
  "Claude Code": "Claude Code",
  "Codex CLI": "Codex CLI",
  CodeBuddy: "CodeBuddy",
};

function enLink(link: string): string {
  if (link.startsWith("http")) return link;
  const path = link.startsWith("/") ? link : `/${link}`;
  if (path === "/") return "/en/";
  return `/en${path}`;
}

function localizeSidebar(
  items: DefaultTheme.SidebarItem[],
  locale: "zh" | "en",
): DefaultTheme.SidebarItem[] {
  return items.map((item) => {
    const text =
      locale === "en" && typeof item.text === "string"
        ? (LABEL_EN[item.text] ?? item.text)
        : item.text;
    const link =
      item.link && locale === "en" ? enLink(String(item.link)) : item.link;
    return {
      ...item,
      text,
      link,
      items: item.items ? localizeSidebar(item.items, locale) : undefined,
    };
  });
}

const sidebarApiZh: DefaultTheme.SidebarItem[] = [
  { text: "概述", link: "/api/overview" },
  {
    text: "端点",
    collapsed: false,
    items: [
      { text: "获取模型", link: "/api/models" },
      { text: "创建对话补全", link: "/api/chat-completions" },
      { text: "创建图像生成", link: "/api/images-generations" },
      { text: "创建视频生成任务", link: "/api/videos-generations" },
    ],
  },
  {
    text: "高级参数",
    collapsed: false,
    items: [
      { text: "模型参数", link: "/api/models-parameters" },
      { text: "生文", link: "/api/chat-completions-parameters" },
      { text: "生图", link: "/api/image-generation-parameters" },
      { text: "生视频", link: "/api/video-generation-parameters" },
    ],
  },
];

const sidebarDocsZh: DefaultTheme.SidebarItem[] = [
  { text: "快速入门", link: "/quickstart" },
  { text: "管理 API 密钥", link: "/manage-api-keys" },
  {
    text: "多模态",
    collapsed: false,
    items: [
      { text: "概述", link: "/multimodal/" },
      { text: "图片输入", link: "/multimodal/image-input" },
      { text: "图片生成", link: "/multimodal/image-generation" },
      { text: "视频输入", link: "/multimodal/video-input" },
      { text: "视频生成", link: "/multimodal/video-generation" },
    ],
  },
  {
    text: "指南",
    collapsed: false,
    items: [
      { text: "请求参数", link: "/guides/request-parameters" },
      { text: "流式输出（SSE）", link: "/guides/streaming-sse" },
      { text: "计费与 Credits", link: "/guides/billing-and-credits" },
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

const sidebarCookbookZh: DefaultTheme.SidebarItem[] = [
  { text: "概述", link: "/cookbook/" },
  {
    text: "编程 IDE / CLI",
    collapsed: false,
    items: [
      { text: "Cursor", link: "/cookbook/coding-agents/cursor" },
      { text: "CodeBuddy", link: "/cookbook/coding-agents/codebuddy" },
      { text: "Claude Code", link: "/cookbook/coding-agents/claude-code" },
      { text: "CC Switch", link: "/cookbook/coding-agents/cc-switch" },
      { text: "CC Switch · Codex", link: "/cookbook/coding-agents/codex-cc-switch" },
      { text: "Codex CLI", link: "/cookbook/coding-agents/codex-cli" },
    ],
  },
  {
    text: "智能体工作台",
    collapsed: false,
    items: [{ text: "WorkBuddy", link: "/cookbook/agent-workbench/workbuddy" }],
  },
];

export const sidebarApiEn = localizeSidebar(sidebarApiZh, "en");
export const sidebarDocsEn = localizeSidebar(sidebarDocsZh, "en");
export const sidebarCookbookEn = localizeSidebar(sidebarCookbookZh, "en");

/** 合并中英文侧栏路由前缀（供 themeConfig.sidebar） */
export function buildMergedSidebar(): DefaultTheme.Sidebar {
  const zh = buildSidebarForLocale("zh");
  const en = buildSidebarForLocale("en");
  return { ...zh, ...en };
}

function buildSidebarForLocale(locale: "zh" | "en"): DefaultTheme.Sidebar {
  const p = locale === "en" ? "/en" : "";
  const docs = locale === "en" ? sidebarDocsEn : sidebarDocsZh;
  const api = locale === "en" ? sidebarApiEn : sidebarApiZh;
  const cookbook = locale === "en" ? sidebarCookbookEn : sidebarCookbookZh;

  return {
    [`${p}/api/`]: api,
    [`${p}/cookbook/`]: cookbook,
    [`${p}/multimodal/`]: docs,
    [`${p}/guides/`]: docs,
    [`${p}/reference/`]: docs,
    [`${p}/manage-api-keys`]: docs,
    [`${p}/faq`]: docs,
    [`${p}/quickstart`]: docs,
    [`${p}/`]: docs,
  };
}
