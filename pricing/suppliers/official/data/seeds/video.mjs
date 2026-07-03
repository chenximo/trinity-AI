/**
 * 生视频官网核实价目（种子）
 * 来源：各厂商官网定价页；积分价对照 TokenHub 挂牌
 */

/**
 * @typedef {{ tierLabel: string, price: number | string, unit: string, note?: string }} TierSeed
 * @typedef {{ tiers: TierSeed[], note?: string }} MediaSeedEntry
 */

/** @type {Record<string, MediaSeedEntry>} */
export const VIDEO_SEED = {
  "hy-video-1.5": {
    tiers: [
      { tierLabel: "720p", price: 1.5, unit: "积分/次" },
      { tierLabel: "1080p", price: 3, unit: "积分/次" },
    ],
    note: "腾讯云混元视频 1.5",
  },
  "kl-video-v3": {
    tiers: [{ tierLabel: "统一价", price: "2.5-25", unit: "积分/次" }],
    note: "可灵 v3 按时长/分辨率分档",
  },
  "kl-video-v2-6": {
    tiers: [{ tierLabel: "统一价", price: "2.5-12", unit: "积分/次" }],
  },
  "kl-video-v2-5-turbo": {
    tiers: [{ tierLabel: "统一价", price: "1.5-8", unit: "积分/次" }],
  },
  "kl-video-v2-1": {
    tiers: [{ tierLabel: "统一价", price: "1-6", unit: "积分/次" }],
  },
  "kl-video-v1": {
    tiers: [{ tierLabel: "统一价", price: "0.5-4", unit: "积分/次" }],
  },
  "vd-video-q3-pro": {
    tiers: [
      { tierLabel: "540P", price: "1-16", unit: "积分/次" },
      { tierLabel: "720P", price: "1.5-24", unit: "积分/次" },
      { tierLabel: "1080P", price: "2-32", unit: "积分/次" },
    ],
  },
  "vd-video-q3-turbo": {
    tiers: [
      { tierLabel: "540P", price: "0.7-11.2", unit: "积分/次" },
      { tierLabel: "720P", price: "1.2-19.2", unit: "积分/次" },
      { tierLabel: "1080P", price: "1.3-20.8", unit: "积分/次" },
    ],
  },
  "vd-video-q2": {
    tiers: [
      { tierLabel: "540P", price: "0.5-8", unit: "积分/次" },
      { tierLabel: "720P", price: "0.8-12.8", unit: "积分/次" },
      { tierLabel: "1080P", price: "1-16", unit: "积分/次" },
    ],
  },
  "vd-video-q2-turbo": {
    tiers: [
      { tierLabel: "540P", price: "0.3-4.8", unit: "积分/次" },
      { tierLabel: "720P", price: "0.5-8", unit: "积分/次" },
      { tierLabel: "1080P", price: "0.6-9.6", unit: "积分/次" },
    ],
  },
  "yt-video-2.0": {
    tiers: [{ tierLabel: "统一价", price: "2-10", unit: "积分/次" }],
    note: "优图视频 2.0",
  },
  "yt-video-humanactor": {
    tiers: [{ tierLabel: "统一价", price: "3-15", unit: "积分/次" }],
  },
  "yt-video-fx": {
    tiers: [{ tierLabel: "统一价", price: "1.5-8", unit: "积分/次" }],
  },
  "doubao-seedance-2.0": {
    tiers: [
      { tierLabel: "480p·16:9·5s·不含视频输入", price: "2.31", unit: "元/个" },
      { tierLabel: "480p·16:9·5s·含视频输入", price: "2.53~5.62", unit: "元/个" },
    ],
    note: "Seedance 2.0 · 火山方舟按个计价",
  },
  "doubao-seedance-2.0-fast": {
    tiers: [
      { tierLabel: "480p·16:9·5s·不含视频输入", price: "1.86", unit: "元/个" },
    ],
    note: "Seedance 2.0 Fast",
  },
  "doubao-seedance-2.0-mini": {
    tiers: [
      { tierLabel: "480p·16:9·5s·不含视频输入", price: "1.16", unit: "元/个" },
    ],
    note: "Seedance 2.0 Mini",
  },
  "doubao-seedance-1.5-pro": {
    tiers: [
      { tierLabel: "480p·16:9·5s·有声", price: 0.8, unit: "元/个" },
      { tierLabel: "480p·16:9·5s·无声", price: 0.4, unit: "元/个" },
      { tierLabel: "720p·16:9·5s·有声", price: 1.73, unit: "元/个" },
    ],
    note: "Seedance 1.5 Pro",
  },
};
