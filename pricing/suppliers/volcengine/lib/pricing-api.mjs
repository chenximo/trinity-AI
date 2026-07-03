/**
 * 火山方舟价目表 → 按 trinityId 索引（供 upstream 对比）
 */

/** @param {Array<{ trinityId?: string|null }>} models */
export function indexVolcengineByTrinity(models) {
  const byTrinity = new Map();
  for (const m of models) {
    if (!m.trinityId) continue;
    byTrinity.set(m.trinityId.toLowerCase(), m);
  }
  return byTrinity;
}
