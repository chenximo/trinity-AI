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
