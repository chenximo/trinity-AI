/**
 * 网聚云联 · 云门户 — 原厂直连（GPT / Gemini）
 * 价目与 official 种子对齐，由 build 从 official 筛选生成。
 */

export const SUPPLIER_META = {
  supplierId: "wangju-cloudportal",
  brand: "网聚云联-云门户",
  label: "网聚云联 · 云门户",
  note: "原厂直连 · OpenAI GPT / Google Gemini，价目对齐 official 种子",
  /** @type {string[]} official vendor key */
  vendors: ["openai", "google"],
  currency: "USD",
  priceUnit: "美元/百万tokens",
  region: "原厂直连",
  sourceNote: "筛选自 suppliers/official/output/text/vendor-pricing.json",
};
