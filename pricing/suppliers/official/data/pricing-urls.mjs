/**
 * 各厂商官网价目总页（多模态可共用；解析时按 modality 取对应章节）
 */
export const VENDOR_PRICING_URLS = {
  openai: {
    all: "https://developers.openai.com/api/docs/pricing",
  },
  google: {
    text: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn",
    image: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn",
    video: "https://ai.google.dev/gemini-api/docs/pricing?hl=zh-cn",
  },
  anthropic: {
    text: "https://platform.claude.com/docs/zh-CN/about-claude/models/overview",
  },
  xai: {
    text: "https://docs.x.ai/developers/models/grok-4.3",
  },
  deepseek: {
    text: "https://api-docs.deepseek.com/zh-cn/quick_start/pricing",
  },
  bailian: {
    text: "https://help.aliyun.com/zh/model-studio/model-pricing",
    image: "https://help.aliyun.com/zh/model-studio/model-pricing",
    video: "https://help.aliyun.com/zh/model-studio/model-pricing",
  },
  tencent_hunyuan: {
    text: "https://cloud.tencent.com/document/product/1823/130055",
    image: "https://cloud.tencent.com/document/product/1729/97732",
    video: "https://cloud.tencent.com/document/product/1729/97731",
  },
  zhipu: {
    text: "https://bigmodel.cn/pricing",
  },
  kimi: {
    text: "https://platform.kimi.com/docs/pricing/chat",
  },
  minimax: {
    text: "https://platform.minimaxi.com/docs/guides/pricing-paygo",
    image: "https://platform.minimaxi.com/docs/pricing/overview",
    video: "https://platform.minimaxi.com/docs/guides/pricing-video",
  },
  volcengine: {
    text: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    image: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    video: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
  },
  kling: {
    video: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
  },
  vidu: {
    video: "https://platform.vidu.cn/docs/pricing",
  },
};
