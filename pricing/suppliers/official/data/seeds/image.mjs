/**
 * 生图官网核实价目（种子）
 * 来源：腾讯云混元生图定价文档 97732
 */

/**
 * @typedef {{ tierLabel: string, price: number | string, unit: string, note?: string }} TierSeed
 * @typedef {{ tiers: TierSeed[], note?: string }} MediaSeedEntry
 */

/** @type {Record<string, MediaSeedEntry>} */
export const IMAGE_SEED = {
  "hy-image-v3.0": {
    tiers: [{ tierLabel: "输出", price: 0.2, unit: "元/张" }],
    note: "腾讯云混元生图 3.0 统一价",
  },
  "hy-image-lite": {
    tiers: [{ tierLabel: "输出", price: 0.099, unit: "元/张" }],
    note: "腾讯云混元生图 Lite 统一价",
  },
};
