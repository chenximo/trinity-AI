/**
 * 各厂商官网价目总页（多模态可共用；解析时按 modality 取对应章节）
 */
export const VENDOR_PRICING_URLS = {
  openai: {
    all: "https://developers.openai.com/api/docs/pricing",
    image: "https://developers.openai.com/api/docs/pricing",
    video: "https://developers.openai.com/api/docs/pricing",
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
    /** 混元生图产品（3.0 / 极速版 hy-image-lite） */
    image: "https://cloud.tencent.com/document/product/1668/90896",
    /** 混元大模型生图（旧版混元生图 0.5元/张） */
    image_legacy: "https://cloud.tencent.com/document/product/1729/105925",
    video: "https://cloud.tencent.com/document/product/1729/97731",
  },
  midjourney: {
    image: "https://docs.midjourney.com/docs/plans",
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
    image: "https://klingai.com/global/dev/pricing",
    image_api: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    video: "https://kling.ai/document-api/pricing/base/video",
  },
  vidu: {
    image: "https://platform.vidu.cn/docs/pricing",
    video: "https://platform.vidu.cn/docs/pricing",
  },
  pixverse: {
    video: "https://docs.platform.pixverse.ai/model-pricing-796039m0",
  },
  jimeng: {
    video: "https://www.volcengine.com/docs/85621/1544715?lang=zh",
  },
};
