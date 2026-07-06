/**
 * 刊例对比 vs 线上 prices-api 覆盖报告（P6 铁律可视化）
 */

import { findMissingOnlineListingSlugs } from "./compare-online-coverage-lib.mjs";

/**
 * @param {{
 *   modality: string,
 *   label?: string,
 *   onlineByModel: Map<string, unknown>,
 *   coveredSlugs: Iterable<string>,
 *   compareReport?: {
 *     compareUnitCount?: number,
 *     fullGovernanceCount?: number,
 *     rowCount?: number,
 *     modelCount?: number,
 *     trinityOnlineCount?: number,
 *     generatedAt?: string,
 *     tierCoverage?: { ok?: boolean, violations?: { modelId: string, missing: string[], expectedCount: number, compareCount: number }[] },
 *   },
 * }} ctx
 */
export function buildOnlineCoverageReport(ctx) {
  const coverage = findMissingOnlineListingSlugs(
    ctx.onlineByModel,
    ctx.coveredSlugs,
    { modality: ctx.modality, label: ctx.label ?? `刊例对比校验-${ctx.modality}` },
  );
  const tierCoverage = ctx.compareReport?.tierCoverage ?? { ok: true, violations: [] };
  return {
    ...coverage,
    ok: coverage.missing.length === 0 && tierCoverage.ok !== false,
    tierCoverage,
    compareUnitCount: ctx.compareReport?.compareUnitCount ?? null,
    fullGovernanceCount: ctx.compareReport?.fullGovernanceCount ?? null,
    rowCount: ctx.compareReport?.rowCount ?? null,
    officialModelCount: ctx.compareReport?.modelCount ?? null,
    trinityOnlineCount: ctx.compareReport?.trinityOnlineCount ?? null,
    generatedAt: ctx.compareReport?.generatedAt ?? new Date().toISOString(),
  };
}

/**
 * @param {ReturnType<typeof buildOnlineCoverageReport>} report
 */
export function renderOnlineCoverageMd(report) {
  const lines = [
    `# 刊例覆盖 · ${report.modality}`,
    "",
    `> 生成于 ${report.generatedAt}`,
    "",
    "## P6 铁律",
    "",
    `刊例对比表 **不得少于** \`GET /v1/prices?modality=${report.modality}\` 返回模型数；可多加官方补行，不能少。`,
    "",
    "## P7 铁律",
    "",
    "同一模型刊例对比行 **不得少于** 官方 ∪ 线上 ∪ AIGC ∪ TokenHub 的 `tierKey` 并集；官方缺档可留空，**不能删行**.",
    "",
    "## 摘要",
    "",
    "| 指标 | 值 |",
    "|------|-----|",
    `| 线上 prices-api 模型数 | ${report.onlineCount} |`,
    `| 对比表已覆盖线上 slug | ${report.coveredCount} |`,
    `| 缺失（blocking） | ${report.missing.length} |`,
    `| P6 状态 | ${report.missing.length === 0 ? "✅ 通过" : "❌ 未通过"} |`,
    `| P7 档位削减 | ${report.tierCoverage?.violations?.length ?? 0} |`,
    `| P7 状态 | ${report.tierCoverage?.ok !== false ? "✅ 通过" : "❌ 未通过"} |`,
    `| 综合 | ${report.ok ? "✅ 通过" : "❌ 未通过"} |`,
  ];

  if (report.compareUnitCount != null) {
    lines.push(`| 对比表模型单元 | ${report.compareUnitCount} |`);
  }
  if (report.fullGovernanceCount != null) {
    lines.push(`| 完整治理档 | ${report.fullGovernanceCount} |`);
  }
  if (report.rowCount != null) {
    lines.push(`| 对比行数 | ${report.rowCount} |`);
  }
  if (report.officialModelCount != null) {
    lines.push(`| 官方 catalog 模型 | ${report.officialModelCount} |`);
  }
  if (report.trinityOnlineCount != null) {
    lines.push(`| Trinity /models 上架 | ${report.trinityOnlineCount} |`);
  }

  if (report.onlineCount === 0 && (report.trinityOnlineCount ?? 0) > 0) {
    lines.push(
      "",
      "> ⚠ **线上 prices-api 为空** — 可能未拉取成功（网络/API）。P6「通过」不可信，请重跑 `npm run pricing:upstream:video` 并确认 `output/online/prices-api.json`。",
    );
  }

  lines.push("", "## 缺失线上 slug", "");
  if (!report.missing.length) {
    lines.push("_无 — 对比表已 ⊇ 线上刊例。_");
  } else {
    lines.push("", "| slug |", "|------|");
    for (const slug of report.missing.sort()) {
      lines.push(`| \`${slug}\` |`);
    }
  }

  lines.push("", "## 档位削减（P7）", "");
  const tierViolations = report.tierCoverage?.violations ?? [];
  if (!tierViolations.length) {
    lines.push("_无 — 各模型对比行已 ⊇ 官方∪线上∪AIGC∪TokenHub 并集。_");
  } else {
    lines.push("", "| slug | 表内档 | 至少应 | 缺少 tierKey |", "|------|--------|--------|--------------|");
    for (const v of tierViolations) {
      lines.push(
        `| \`${v.modelId}\` | ${v.compareCount} | ${v.expectedCount} | ${v.missing.join(", ")} |`,
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * @param {Parameters<typeof buildOnlineCoverageReport>[0]} ctx
 */
export function renderOnlineCoverageFromContext(ctx) {
  return renderOnlineCoverageMd(buildOnlineCoverageReport(ctx));
}
