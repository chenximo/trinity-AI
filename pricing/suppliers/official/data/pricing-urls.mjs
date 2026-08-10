/**
 * 各厂商官网价目总页（多模态可共用；解析时按 modality 取对应章节）
 *
 * 刊例 V2：优先 `*.international`（厂商官网国际站）；无则国内÷6.5。
 * 清单与核实记录：docs/刊例策略-V1-V2-国际站优先.md §7
 * 禁止用 bailian-intl 爬虫产物 / AIGC 国际转售页冒充厂商国际站。
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
    /** 官方全球 USD 价目（与中文页同卡）；V2 用此页 */
    international: "https://api-docs.deepseek.com/quick_start/pricing",
  },
  bailian: {
    text: "https://help.aliyun.com/zh/model-studio/model-pricing",
    image: "https://help.aliyun.com/zh/model-studio/model-pricing",
    video: "https://help.aliyun.com/zh/model-studio/model-pricing",
    /** 阿里云 Model Studio 国际文档（USD）；非 suppliers/bailian-intl 爬虫目录 */
    international: "https://www.alibabacloud.com/help/en/model-studio/model-pricing",
  },
  tencent_hunyuan: {
    text: "https://cloud.tencent.com/document/product/1823/130055",
    /** 混元生图产品（3.0 / 极速版 hy-image-lite） */
    image: "https://cloud.tencent.com/document/product/1668/90896",
    /** 混元大模型生图（旧版混元生图 0.5元/张） */
    image_legacy: "https://cloud.tencent.com/document/product/1729/105925",
    video: "https://cloud.tencent.com/document/product/1729/97731",
    /** 产品破例：无独立混元国际站时，V2 用腾讯云 TokenHub 国际价目 */
    international: "https://intl.cloud.tencent.com/document/product/1300/78937",
  },
  midjourney: {
    image: "https://docs.midjourney.com/docs/plans",
  },
  zhipu: {
    text: "https://bigmodel.cn/pricing",
    /** Z.AI 国际站 USD 价目（生文/视觉/图/视频同页） */
    international: "https://docs.z.ai/guides/overview/pricing",
  },
  kimi: {
    text: "https://platform.kimi.com/docs/pricing/chat",
    /** 国际开放平台 */
    international: "https://platform.kimi.ai/docs/pricing/chat-k26",
    international_k25: "https://platform.kimi.ai/docs/pricing/chat-k25",
    international_k27_code: "https://platform.kimi.ai/docs/pricing/chat-k27-code",
    international_k3: "https://platform.kimi.ai/docs/pricing/chat-k3",
  },
  minimax: {
    text: "https://platform.minimaxi.com/docs/guides/pricing-paygo",
    image: "https://platform.minimaxi.com/docs/pricing/overview",
    video: "https://platform.minimaxi.com/docs/guides/pricing-video",
    international: "https://platform.minimax.io/docs/guides/pricing-paygo",
    international_overview: "https://platform.minimax.io/docs/pricing/overview",
  },
  volcengine: {
    text: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    image: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    video: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
    /** 国际品牌 BytePlus ModelArk */
    international: "https://www.byteplus.com/en/product/ModelArk",
  },
  kling: {
    image: "https://klingai.com/global/dev/pricing",
    image_api: "https://app.klingai.com/cn/dev/document-api/apiReference/model/skillsMap",
    video: "https://kling.ai/document-api/pricing/base/video",
    international_image: "https://klingai.com/global/dev/pricing",
  },
  vidu: {
    image: "https://platform.vidu.cn/docs/pricing",
    video: "https://platform.vidu.cn/docs/pricing",
    /** 国际站（credits · USD） */
    international: "https://platform.vidu.com/docs/pricing",
  },
  pixverse: {
    video: "https://docs.platform.pixverse.ai/model-pricing-796039m0",
  },
  jimeng: {
    video: "https://www.volcengine.com/docs/85621/1544715?lang=zh",
  },
};
