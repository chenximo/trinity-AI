/** 文档中心示例数据（与 `TrinityAI/app/docs.html` 对齐；本模块 mock 真源） */

export const DOCS_EYEBROW = "模块 5 · 文档中心 MVP";

export const DOCS_TITLE = "API 文档";

export const DOCS_LEAD =
  "OpenAI 兼容 /v1/chat/completions、SSE、错误码与示例；与 SDK 零改造迁移对齐。";

export interface DocsNavItem {
  /** 页内锚点 id；外链项无 hash */
  hash?: string;
  label: string;
  /** 站内路由 name（如模型目录） */
  routeName?: "tai-models";
  externalLabel?: string;
}

export const DOCS_NAV: DocsNavItem[] = [
  { hash: "quickstart", label: "快速开始" },
  { hash: "chat", label: "对话补全" },
  { hash: "sse", label: "流式 SSE" },
  { hash: "errors", label: "错误码" },
  { routeName: "tai-models", label: "模型列表", externalLabel: "→" },
];

export interface DocsSection {
  id: string;
  title: string;
  paragraphs: string[];
  /** 可选代码块（纯文本，模板内包 `<pre>`） */
  code?: string;
}

export const DOCS_SECTIONS: DocsSection[] = [
  {
    id: "quickstart",
    title: "快速开始",
    paragraphs: [
      "将 base_url 指向 Trinity 网关地址，使用原有 OpenAI 官方 SDK，仅替换 API Key。",
    ],
    code: `export OPENAI_API_KEY="sk-trinity-..."
export OPENAI_BASE_URL="https://api.trinity.example/v1"`,
  },
  {
    id: "chat",
    title: "对话补全",
    paragraphs: [
      "请求体与 OpenAI 一致；model 须为 provider/model 格式，例如 openai/gpt-4o。",
    ],
    code: `POST /v1/chat/completions
Content-Type: application/json

{ "model": "openai/gpt-4o", "messages": [{ "role": "user", "content": "hi" }] }`,
  },
  {
    id: "sse",
    title: "流式 SSE",
    paragraphs: [
      '设置 "stream": true；MVP 须保证首包延迟与 chunk 格式与 OpenAI 对齐，便于现有前端无感切换。',
    ],
  },
  {
    id: "errors",
    title: "错误码",
    paragraphs: [
      "上游 429 / 5xx 应透传，便于客户端重试；网关自身错误使用统一错误体（产品补充）。",
    ],
  },
];
