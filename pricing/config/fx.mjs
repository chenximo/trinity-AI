/**
 * 价目汇率真源
 *
 * - FX_LISTING：刊例 / official cascade / 生图·生视频 L1↔L2 交叉（默认 7.25）
 * - FX_LEGACY_065：生文 gen-65 / 部分 OpenRouter 对比标注（6.5）
 *
 * 环境变量 FX_CNY_PER_USD 覆盖 FX_LISTING。
 */

export const FX_LISTING = Number(process.env.FX_CNY_PER_USD ?? "7.25");

/** @deprecated 仅 gen-65 / legacy 对比；新模态请用 FX_LISTING */
export const FX_LEGACY_065 = 6.5;

export const FX_LISTING_NOTE =
  "平台 CNY 挂牌换算 USD 刊例时使用 1 USD = FX_LISTING CNY";
