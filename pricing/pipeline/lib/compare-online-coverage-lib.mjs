/**
 * 刊例对比表 vs 线上 prices-api 覆盖校验
 * 铁律：对比表模型数 ≥ 线上刊例，只能多不能少
 */

/**
 * @param {Map<string, unknown>} onlineByModel prices-api 按 model slug 索引
 * @param {Iterable<string>} coveredOnlineSlugs 对比表中已出现的线上 slug
 * @param {{ modality?: string, label?: string }} [opts]
 */
export function findMissingOnlineListingSlugs(
  onlineByModel,
  coveredOnlineSlugs,
  opts = {},
) {
  const covered = new Set(
    [...coveredOnlineSlugs]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase()),
  );
  const missing = [];
  for (const slug of onlineByModel.keys()) {
    const key = slug.toLowerCase();
    if (!covered.has(key)) missing.push(key);
  }
  return {
    modality: opts.modality ?? "unknown",
    label: opts.label ?? "刊例对比",
    onlineCount: onlineByModel.size,
    coveredCount: covered.size,
    missing,
  };
}

/**
 * @param {Map<string, unknown>} onlineByModel
 * @param {Iterable<string>} coveredOnlineSlugs
 * @param {{ modality?: string, label?: string }} [opts]
 */
export function assertOnlineListingCovered(
  onlineByModel,
  coveredOnlineSlugs,
  opts = {},
) {
  const report = findMissingOnlineListingSlugs(
    onlineByModel,
    coveredOnlineSlugs,
    opts,
  );
  if (report.missing.length) {
    throw new Error(
      `[${report.modality}] ${report.label} 缺少 ${report.missing.length} 个线上模型（线上 ${report.onlineCount}，表内仅 ${report.coveredCount}）：${report.missing.join(", ")}`,
    );
  }
  return report;
}

/** @param {Iterable<string | null | undefined>[]} lists */
export function unionTierKeySets(...lists) {
  const keys = new Set();
  for (const list of lists) {
    if (!list) continue;
    for (const k of list) {
      if (k && k !== "—") keys.add(String(k));
    }
  }
  return keys;
}

/**
 * 单模型：刊例对比档位是否 ⊇ 各源 tierKey 并集（P7）
 * @param {{
 *   modelId: string,
 *   compareTierKeys?: string[],
 *   sourceTierKeys?: Record<string, string[]>,
 * }} spec
 */
export function findCompareTierReduction(spec) {
  const sources = Object.values(spec.sourceTierKeys ?? {});
  const expected = unionTierKeySets(...sources);
  const compare = unionTierKeySets(spec.compareTierKeys ?? []);
  const missing = [...expected].filter((k) => !compare.has(k));
  return {
    modelId: spec.modelId,
    expectedCount: expected.size,
    compareCount: compare.size,
    missing,
    ok: missing.length === 0,
  };
}

/**
 * @param {Parameters<typeof findCompareTierReduction>[0][]} specs
 */
export function findCompareTierReductions(specs) {
  const violations = specs.map(findCompareTierReduction).filter((r) => !r.ok);
  return { violations, ok: violations.length === 0 };
}

/**
 * @param {Parameters<typeof findCompareTierReduction>[0] & { modality?: string }} spec
 */
export function assertCompareTierUnion(spec) {
  const report = findCompareTierReduction(spec);
  if (!report.ok) {
    throw new Error(
      `[${spec.modality ?? "compare"}] ${report.modelId} 档位被削减：缺少 tierKey [${report.missing.join(", ")}]（表内 ${report.compareCount} 档 · 并集至少 ${report.expectedCount} 档）`,
    );
  }
  return report;
}
