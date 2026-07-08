/**
 * L4 刊例对比校验 · 三模态统一列约定
 *
 * - **锚点**：厂商官方价（L1）
 * - **进货参照**（L2 + OpenRouter）：仅下列四列进「刊例对比校验」主表
 * - **不含**：百炼、火山方舟等 L3（见供应商分表 · L3 校验）
 * - **线上刊例**：L4，被校验对象
 *
 * @see pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md §5.1
 */

/** 刊例对比主表 · 进货参照价列（三模态一致） */
export const L4_COMPARE_REF_PRICE_HEADERS = [
  "AIGC国内",
  "AIGC国际",
  "TokenHub",
  "OpenRouter",
];

/** 刊例对比主表 · 各参照渠道 vs 官方 */
export const L4_COMPARE_VS_OFFICIAL_HEADERS = [
  "AIGC国内vs官方",
  "AIGC国际vs官方",
  "TokenHub vs官方",
  "OpenRouter vs官方",
];

/** 刊例对比主表 · 模型身份列（前 4 列） */
export const L4_COMPARE_IDENTITY_HEADERS = [
  "原厂 modelId",
  "Trinity ID",
  "显示名",
  "厂商",
];

/** Excel 合并单元格：按原厂 modelId 合并身份列 */
export const MERGE_COMPARE_IDENTITY = {
  groupCol: 0,
  columns: [0, 1, 2, 3],
};
