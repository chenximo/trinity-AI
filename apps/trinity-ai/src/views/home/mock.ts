/** 营销首屏 hero 供应商胶囊（与静态 `TrinityAI/index.html` 对齐；`gen:marketing` 再生成时勿丢） */

export type HomeHeroProvider = { label: string; muted?: boolean };

export const HOME_HERO_PROVIDERS: HomeHeroProvider[] = [
  { label: "Anthropic" },
  { label: "OpenAI" },
  { label: "Microsoft" },
  { label: "NVIDIA" },
  { label: "Meta" },
  { label: "Google" },
  { label: "Amazon" },
  { label: "DeepSeek" },
  { label: "Qwen" },
  { label: "Moonshot" },
  { label: "MiniMax" },
  { label: "Mistral" },
  { label: "Cohere" },
  { label: "xAI" },
  { label: "Hugging Face" },
  { label: "Together" },
  { label: "更多厂商持续接入", muted: true },
];
