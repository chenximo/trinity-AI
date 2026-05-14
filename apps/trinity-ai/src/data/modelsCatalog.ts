/** 模型目录示例数据（与 `TrinityAI/app/models.html` 对齐，供筛选 / 排序演示） */

export type ModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "meta"
  | "xai"
  | "mistral"
  | "cohere"
  | "stability"
  | "elevenlabs";

export interface CatalogModel {
  id: string;
  provider: ModelProvider;
  /** 上下文窗口上界，单位「K」（与静态 `data-ctx` 一致；0 表示不适用） */
  contextK: number;
  categories: string[];
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  released: string;
  /** 美元 / M tokens；≥500 视为特殊计价（排序时当作极大值） */
  priceInPerM: number;
  /** 列表元数据：输入侧计价（与静态 `m-meta` 一致） */
  inputPriceDisplay: string;
  priceOutLabel: string;
  trend: "up" | "down" | "flat";
  trendLabel: string;
  orgSlug: string;
}

export const CATALOG_MODELS: CatalogModel[] = [
  {
    id: "1",
    provider: "openai",
    contextK: 256,
    categories: ["文本", "图像"],
    slug: "openai/gpt-5.4",
    title: "OpenAI: GPT-5.4",
    description: "通用对话与工具调用均衡，吞吐高，适合产品与研发日常接入。",
    released: "2026-05-07",
    priceInPerM: 2.5,
    inputPriceDisplay: "$2.5/M 输入",
    priceOutLabel: "$10/M 输出",
    trend: "up",
    trendLabel: "+8.6%",
    orgSlug: "openai",
  },
  {
    id: "2",
    provider: "anthropic",
    contextK: 200,
    categories: ["文本"],
    slug: "anthropic/claude-opus-4.7",
    title: "Anthropic: Claude Opus 4.7",
    description: "长上下文推理与代码能力强，适合复杂分析与安全敏感场景。",
    released: "2026-04-28",
    priceInPerM: 15,
    inputPriceDisplay: "$15/M 输入",
    priceOutLabel: "$75/M 输出",
    trend: "flat",
    trendLabel: "—",
    orgSlug: "anthropic",
  },
  {
    id: "3",
    provider: "google",
    contextK: 1024,
    categories: ["文本", "图像"],
    slug: "google/gemini-3.1-pro-preview",
    title: "Google: Gemini 3.1 Pro Preview",
    description: "多模态与超长上下文预览版，适合研究、文档与媒体流水线。",
    released: "2026-04-27",
    priceInPerM: 2,
    inputPriceDisplay: "$2/M 输入",
    priceOutLabel: "$12/M 输出",
    trend: "up",
    trendLabel: "+3.1%",
    orgSlug: "google",
  },
  {
    id: "4",
    provider: "deepseek",
    contextK: 64,
    categories: ["文本"],
    slug: "deepseek/deepseek-r1",
    title: "DeepSeek: DeepSeek R1",
    description: "推理链与数学表现突出，性价比高，适合离线批处理与评测。",
    released: "2026-04-20",
    priceInPerM: 0.55,
    inputPriceDisplay: "$0.55/M 输入",
    priceOutLabel: "$2.19/M 输出",
    trend: "up",
    trendLabel: "+12.4%",
    orgSlug: "deepseek",
  },
  {
    id: "5",
    provider: "meta",
    contextK: 128,
    categories: ["文本", "图像"],
    slug: "meta/llama-4-maverick",
    title: "Meta: Llama 4 Maverick",
    description: "开放权重路线上的多模态旗舰，适合私有化与二次微调。",
    released: "2026-04-18",
    priceInPerM: 0.18,
    inputPriceDisplay: "$0.18/M 输入",
    priceOutLabel: "$0.59/M 输出",
    trend: "flat",
    trendLabel: "—",
    orgSlug: "meta",
  },
  {
    id: "6",
    provider: "xai",
    contextK: 128,
    categories: ["文本", "图像"],
    slug: "x-ai/grok-2",
    title: "xAI: Grok 2",
    description: "实时信息倾向与对话风格鲜明，适合营销与探索式任务。",
    released: "2026-04-15",
    priceInPerM: 2,
    inputPriceDisplay: "$2/M 输入",
    priceOutLabel: "$10/M 输出",
    trend: "down",
    trendLabel: "−2.0%",
    orgSlug: "x-ai",
  },
  {
    id: "7",
    provider: "mistral",
    contextK: 128,
    categories: ["文本"],
    slug: "mistral/mistral-large-latest",
    title: "Mistral: Mistral Large",
    description: "欧洲时区友好，工具调用与多语言均衡，适合合规混合云。",
    released: "2026-04-12",
    priceInPerM: 2,
    inputPriceDisplay: "$2/M 输入",
    priceOutLabel: "$6/M 输出",
    trend: "up",
    trendLabel: "+1.2%",
    orgSlug: "mistral",
  },
  {
    id: "8",
    provider: "cohere",
    contextK: 4,
    categories: ["重排", "文本"],
    slug: "cohere/rerank-v3.5",
    title: "Cohere: Rerank 3.5",
    description: "检索与 RAG 重排专用，延迟低，可与任意生成模型组合。",
    released: "2026-04-10",
    priceInPerM: 2,
    inputPriceDisplay: "$2/M 输入",
    priceOutLabel: "— 输出",
    trend: "flat",
    trendLabel: "—",
    orgSlug: "cohere",
  },
  {
    id: "9",
    provider: "openai",
    contextK: 8,
    categories: ["向量"],
    slug: "openai/text-embedding-3-large",
    title: "OpenAI: Embedding 3 Large",
    description: "高维向量检索与聚类，适合知识库与语义搜索底座。",
    released: "2026-04-08",
    priceInPerM: 0.13,
    inputPriceDisplay: "$0.13/M 输入",
    priceOutLabel: "— 输出",
    trend: "up",
    trendLabel: "+0.4%",
    orgSlug: "openai",
  },
  {
    id: "10",
    provider: "elevenlabs",
    contextK: 0,
    categories: ["语音", "音频"],
    slug: "elevenlabs/eleven-multilingual-v2",
    title: "ElevenLabs: Eleven Multilingual v2",
    description: "多语种语音合成，自然度高，适合客服与内容播报。",
    released: "2026-04-05",
    priceInPerM: 999,
    inputPriceDisplay: "按字符",
    priceOutLabel: "",
    trend: "flat",
    trendLabel: "—",
    orgSlug: "elevenlabs",
  },
  {
    id: "11",
    provider: "stability",
    contextK: 0,
    categories: ["图像"],
    slug: "stability/stable-diffusion-xl",
    title: "Stability: SDXL 1.0",
    description: "图像生成与编辑工作流，适合营销物料与概念稿快速迭代。",
    released: "2026-04-03",
    priceInPerM: 999,
    inputPriceDisplay: "按张",
    priceOutLabel: "",
    trend: "flat",
    trendLabel: "—",
    orgSlug: "stability",
  },
  {
    id: "12",
    provider: "google",
    contextK: 32,
    categories: ["视频", "文本"],
    slug: "google/veo-preview",
    title: "Google: Veo Preview",
    description: "短视频生成预览，适合脚本到分镜的创意验证。",
    released: "2026-04-01",
    priceInPerM: 999,
    inputPriceDisplay: "按秒",
    priceOutLabel: "",
    trend: "flat",
    trendLabel: "—",
    orgSlug: "google",
  },
];

export const PROVIDER_PILLS: { id: ModelProvider | "all"; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "meta", label: "Meta" },
  { id: "xai", label: "xAI" },
  { id: "mistral", label: "Mistral" },
  { id: "cohere", label: "Cohere" },
  { id: "stability", label: "Stability" },
  { id: "elevenlabs", label: "ElevenLabs" },
];

export const MODALITY_ORDER = [
  "all",
  "文本",
  "图像",
  "向量",
  "音频",
  "视频",
  "重排",
  "语音",
] as const;

export type ModalityFilter = (typeof MODALITY_ORDER)[number];

export const CTX_STEPS = [0, 4, 64, 256, 1024] as const;
export const CTX_MARK_LABELS = ["全部", "4K", "64K", "256K", "1M"] as const;

export function contextLabel(k: number): string {
  if (k <= 0) return "— 上下文";
  if (k >= 1024) return "1M 上下文";
  return `${k}K 上下文`;
}

export function priceInSortKey(p: number): number {
  if (Number.isNaN(p) || p >= 500) return Number.POSITIVE_INFINITY;
  return p;
}
