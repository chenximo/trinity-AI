/**
 * TokenHub modelId 与 Trinity 一对多时，优先用与官方种子一致的 dated 条目
 * （控制台常同时存在 generic id 与带日期后缀的版本，后者价更准）
 */
export const TOKENHUB_TRINITY_ALIASES = {
  "deepseek-v4-flash": "deepseek-v4-flash-202605",
  "deepseek-v4-pro": "deepseek-v4-pro-202606",
};

/** @param {Map<string, object>} index @param {string} tid @param {string} [vendorId] */
export function resolveTokenhubModel(index, tid, vendorId) {
  const t = tid?.toLowerCase();
  const v = vendorId?.toLowerCase();
  const alias = TOKENHUB_TRINITY_ALIASES[t];
  if (alias) {
    const hit = index.get(alias.toLowerCase());
    if (hit) return hit;
  }
  return index.get(t) ?? (v ? index.get(v) : null) ?? null;
}
