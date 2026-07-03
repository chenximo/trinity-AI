/**
 * @deprecated 已由 scrape-pricing.mjs + output/text/pricing-api.json 替代。
 * 保留仅供历史对照；勿再手工维护。
 */

export const SHEET_META = {
  source: "volcengine_ark_pricing_doc",
  docUrl: "https://www.volcengine.com/docs/82379/1544106?lang=zh",
  dataDate: "2026-06",
  priceUnit: "元/百万tokens",
  note: "按量付费刊例；Coding/Agent Plan 套餐价不在此表",
};

/**
 * @typedef {{
 *   vendorModelId: string,
 *   modelName: string,
 *   trinityId?: string|null,
 *   tiers: Array<{
 *     attribute: string,
 *     input?: number|null,
 *     output?: number|null,
 *     cache?: number|null,
 *   }>,
 * }} VolcSheetModel
 */

/** @type {VolcSheetModel[]} */
export const PRICING_SHEET = [
  {
    vendorModelId: "doubao-seed-2-1-pro",
    modelName: "Doubao-Seed-2.1-Pro",
    tiers: [
      { attribute: "标准价", input: 6, output: 30, cache: 1.2 },
    ],
  },
  {
    vendorModelId: "doubao-seed-2-1-turbo",
    modelName: "Doubao-Seed-2.1-Turbo",
    tiers: [
      { attribute: "标准价", input: 3, output: 15, cache: 0.6 },
    ],
  },
  {
    vendorModelId: "doubao-seed-2-0-pro",
    modelName: "Doubao-Seed-2.0-Pro",
    tiers: [
      { attribute: "输入≤32k", input: 3.2, output: 16, cache: 0.64 },
      { attribute: "输入>32k", input: 6.4, output: 32, cache: 1.28 },
    ],
  },
  {
    vendorModelId: "doubao-seed-2-0-lite",
    modelName: "Doubao-Seed-2.0-Lite",
    tiers: [
      { attribute: "输入≤32k", input: 0.6, output: 3.6, cache: 0.12 },
      { attribute: "输入>32k", input: 1.2, output: 7.2, cache: 0.24 },
    ],
  },
  {
    vendorModelId: "doubao-seed-2-0-mini",
    modelName: "Doubao-Seed-2.0-Mini",
    tiers: [
      { attribute: "输入≤32k", input: 0.2, output: 2, cache: 0.04 },
      { attribute: "输入>32k", input: 0.4, output: 4, cache: 0.08 },
    ],
  },
  {
    vendorModelId: "doubao-seed-1-8",
    modelName: "Doubao-Seed-1.8",
    tiers: [
      { attribute: "输入≤32k", input: 0.8, output: 2, cache: 0.16 },
      { attribute: "输入>32k", input: 1.6, output: 4, cache: 0.32 },
    ],
  },
  {
    vendorModelId: "doubao-seed-1-6",
    modelName: "Doubao-Seed-1.6",
    tiers: [
      { attribute: "输入≤32k", input: 0.8, output: 2, cache: 0.16 },
      { attribute: "输入>32k", input: 1.6, output: 4, cache: 0.32 },
    ],
  },
  {
    vendorModelId: "doubao-pro-32k",
    modelName: "Doubao-Pro-32k",
    tiers: [
      { attribute: "标准价", input: 0.8, output: 2, cache: 0.16 },
    ],
  },
  {
    vendorModelId: "doubao-lite-32k",
    modelName: "Doubao-Lite-32k",
    tiers: [
      { attribute: "标准价", input: 0.3, output: 0.6, cache: 0.06 },
    ],
  },
];
