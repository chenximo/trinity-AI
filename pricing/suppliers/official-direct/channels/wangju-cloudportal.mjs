/** @type {import('./types.mjs').OfficialDirectMeta} */
export const SUPPLIER_META = {
  supplierId: "wangju-cloudportal",
  brand: "网聚云联-云门户",
  label: "网聚云联 · 云门户",
  note: "原厂直连 · OpenAI GPT / Google Gemini，价目对齐 official 种子",
  vendors: ["openai", "google"],
  currency: "USD",
  priceUnit: "美元/百万tokens",
  region: "原厂直连",
  sourceNote: "筛选自 suppliers/official/output/text/vendor-pricing.json",
  mixedCurrency: false,
  mapComment: "Trinity modelId → 云门户 upstreamModelId（build 时由 official 筛选生成）",
};
