/**
 * 价目汇率真源
 *
 * - FX_LISTING：刊例 cascade / 生图·生视频部分交叉（默认 7.25）——**勿与 V1 国内刊例混用**
 * - FX_LEGACY_065：生文 V1 刊例 / gen-65 / 国内 CNY→USD（**6.5**）
 *   产品策略：刊例 V1=÷6.5；V2=官网国际站优先否则回退 V1。
 *   见 pricing/docs/刊例策略-V1-V2-国际站优先.md
 *
 * 环境变量 FX_CNY_PER_USD 覆盖 FX_LISTING。
 */

export const FX_LISTING = Number(process.env.FX_CNY_PER_USD ?? "7.25");

/** 生文 V1 刊例与国内÷汇率对照；新模态刊例策略回退路径亦用 6.5 */
export const FX_LEGACY_065 = 6.5;

export const FX_LISTING_NOTE =
  "FX_LISTING(默认7.25)用于部分 cascade；国内刊例 V1/V2 回退路径使用 FX_LEGACY_065=6.5，见刊例策略-V1-V2";
