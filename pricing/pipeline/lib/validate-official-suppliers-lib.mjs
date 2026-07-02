/**
 * 官方真源（L1）↔ 转售渠道（L3）：档位数、tierKey 覆盖、同档价格
 */

import {
  compareTierLists,
  normalizeAttrLabel,
  tierKeysFromTiers,
} from "./pricing-validate-lib.mjs";
import { pickBailianModels } from "./pricing-compare.mjs";
import { annotationsForModel } from "../../config/pricing-annotations.mjs";

export const SUPPLIER_CHANNELS = [
  {
    key: "bailian",
    label: "百炼",
    ref: "suppliers/bailian/output/pricing-api.json",
  },
  {
    key: "tokenhub",
    label: "TokenHub",
    ref: "suppliers/tokenhub/output/pricing-console-api.json",
  },
  {
    key: "aigc-domestic",
    label: "AIGC国内",
    ref: "suppliers/aigc/output/pricing-api.json",
  },
];

function officialTiersCny(off) {
  return (off?.tiers ?? []).map((t) => ({
    tierLabel: normalizeAttrLabel(t.tierLabel ?? t.tierName),
    input: t.input,
    output: t.output,
    cache: t.cache,
  }));
}

function supplierTiersFromModel(model) {
  return (model?.tiers ?? []).map((t) => ({
    tierLabel: normalizeAttrLabel(t.tierName ?? t.tierLabel ?? ""),
    input: t.input,
    output: t.output,
    cache: t.cache,
  }));
}

function indexTokenhub(models) {
  const map = new Map();
  for (const m of models ?? []) {
    if (m.modelType !== "Text") continue;
    const id = m.modelId?.toLowerCase();
    if (id) map.set(id, m);
  }
  return map;
}

function indexAigcDomestic(models) {
  const map = new Map();
  for (const m of models ?? []) {
    if (m.site !== "domestic") continue;
    const key = (m.trinityId ?? m.modelId)?.toLowerCase();
    if (key) map.set(key, m);
  }
  return map;
}

function resolveSupplierModel(channel, tid, vendorId, indexes) {
  const t = tid.toLowerCase();
  const v = vendorId?.toLowerCase() ?? t;
  if (channel === "bailian") {
    const hit = indexes.bailian.get(t) ?? indexes.bailian.get(v);
    return hit?.model ?? null;
  }
  if (channel === "tokenhub") {
    return indexes.tokenhub.get(t) ?? indexes.tokenhub.get(v) ?? null;
  }
  if (channel === "aigc-domestic") {
    return indexes.aigcDomestic.get(t) ?? null;
  }
  return null;
}

function issuesToAlerts(trinityId, vendorModelId, supplier, channel, issues, offTiers, supTiers) {
  const alerts = [];
  const offKeys = tierKeysFromTiers(offTiers);
  const supKeys = tierKeysFromTiers(supTiers);
  const missingInSupplier = issues
    .filter((i) => i.kind === "missing_tier" && i.left && !i.right)
    .map((i) => i.tierKey);

  if (issues.some((i) => i.kind === "tier_count") && offTiers.length > supTiers.length) {
    alerts.push({
      schema: "trinity.pricing.alert/v1",
      severity: "error",
      type: "supplier_tier_gap",
      trinityId,
      vendorModelId,
      phase: "L1_vs_L3",
      supplier: channel,
      title: `${supplier.label}档位数少于官方`,
      detail: `官方 ${offTiers.length} 档 · ${supplier.label} ${supTiers.length} 档。官方 keys: ${offKeys.join(", ")}；供应商 keys: ${supKeys.join(", ")}`,
      officialTierCount: offTiers.length,
      supplierTierCount: supTiers.length,
      missingTierKeys: missingInSupplier,
      suggestedAction: `确认 ${supplier.label} scrape 完整后，联系商务确认渠道价目`,
      refs: { official: "suppliers/official/output/text/vendor-pricing.json", supplier: supplier.ref },
      blocking: true,
    });
  }

  for (const issue of issues) {
    if (issue.kind === "missing_tier" && issue.left && !issue.right) {
      if (alerts.some((a) => a.type === "supplier_tier_gap")) continue;
      alerts.push({
        schema: "trinity.pricing.alert/v1",
        severity: "error",
        type: "supplier_tier_gap",
        trinityId,
        vendorModelId,
        phase: "L1_vs_L3",
        supplier: channel,
        title: `${supplier.label}缺少官方档位 ${issue.tierKey}`,
        detail: `官方有档 ${issue.tierKey}，${supplier.label} 无同档`,
        missingTierKeys: [issue.tierKey],
        suggestedAction: `查 scrape；无误后联系 ${supplier.label} 商务`,
        refs: { official: "suppliers/official/output/text/vendor-pricing.json", supplier: supplier.ref },
        blocking: true,
      });
    }
    if (issue.kind === "price_mismatch") {
      const badFields = Object.entries(issue.deltas ?? {})
        .filter(([, d]) => d.status !== "ok")
        .map(([f, d]) => `${f}: 官方=${d.a} ${supplier.label}=${d.b}${d.pct != null ? ` (${d.pct}%)` : ""}`);
      if (!badFields.length) continue;
      alerts.push({
        schema: "trinity.pricing.alert/v1",
        severity: "warn",
        type: "supplier_price_gap",
        trinityId,
        vendorModelId,
        phase: "L1_vs_L3",
        supplier: channel,
        title: `${supplier.label}同档价格与官方不一致`,
        detail: `${issue.tierLabel ?? issue.tierKey}: ${badFields.join("; ")}`,
        tierKey: issue.tierKey,
        suggestedAction: `查 ${supplier.label} 抓取与 normalize；无误后联系商务`,
        refs: { official: "suppliers/official/output/text/vendor-pricing.json", supplier: supplier.ref },
        blocking: true,
      });
    }
  }
  return alerts;
}

/**
 * @param {object} opts
 * @param {Record<string, object>} opts.officialTrinityMap
 * @param {object} opts.official vendor-pricing.json
 * @param {object} opts.bailianData
 * @param {object} opts.tokenhubData
 * @param {object[]} opts.aigcModels
 */
export function buildOfficialVsSuppliersReport(opts) {
  const { officialTrinityMap, official, bailianData, tokenhubData, aigcModels } =
    opts;

  const officialByVendor = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const indexes = {
    bailian: pickBailianModels(bailianData?.models ?? []),
    tokenhub: indexTokenhub(tokenhubData?.models),
    aigcDomestic: indexAigcDomestic(aigcModels),
  };

  const comparisons = [];
  const alerts = [];
  let noCoverage = 0;

  for (const [tid, meta] of Object.entries(officialTrinityMap)) {
    if (tid.startsWith("_")) continue;
    if ((meta.modality ?? "text") !== "text") continue;

    const vendorId = meta.vendorModelId ?? tid;
    const off = officialByVendor.get(vendorId.toLowerCase());
    if (!off) continue;

    const currency = off.currency ?? "USD";
    if (currency !== "CNY") {
      for (const ch of SUPPLIER_CHANNELS) {
        comparisons.push({
          trinityId: tid,
          vendorModelId: vendorId,
          supplier: ch.key,
          status: "skipped",
          reason: "official_usd_skip_cny_suppliers",
        });
      }
      continue;
    }

    const offTiers = officialTiersCny(off);
    const annotated = annotationsForModel(tid, "official-suppliers");

    for (const ch of SUPPLIER_CHANNELS) {
      const model = resolveSupplierModel(
        ch.key,
        tid,
        vendorId,
        indexes,
      );

      if (!model) {
        noCoverage += 1;
        comparisons.push({
          trinityId: tid,
          vendorModelId: vendorId,
          supplier: ch.key,
          status: "no_coverage",
          officialTierCount: offTiers.length,
        });
        continue;
      }

      const supTiers = supplierTiersFromModel(model);
      const issues = compareTierLists(offTiers, supTiers, {
        fields: ["input", "output", "cache"],
      });

      const rowAlerts = issuesToAlerts(
        tid,
        vendorId,
        ch,
        ch.key,
        issues,
        offTiers,
        supTiers,
      );

      for (const a of rowAlerts) {
        if (annotated.length) {
          a.blocking = false;
          a.suppressedBy = annotated.map((x) => x.id);
          a.severity = "info";
        }
        alerts.push(a);
      }

      comparisons.push({
        trinityId: tid,
        vendorModelId: vendorId,
        supplier: ch.key,
        status: issues.length ? "issues" : "ok",
        officialTierCount: offTiers.length,
        supplierTierCount: supTiers.length,
        issueCount: issues.length,
        issues,
        annotated: annotated.length > 0,
      });
    }
  }

  const blockingAlerts = alerts.filter((a) => a.blocking !== false);
  const blockingCount = comparisons.filter(
    (c) => c.status === "issues" && !c.annotated,
  ).length;

  return {
    comparisons,
    alerts,
    summary: {
      modelChannels: comparisons.length,
      ok: comparisons.filter((c) => c.status === "ok").length,
      issues: comparisons.filter((c) => c.status === "issues" && !c.annotated)
        .length,
      noCoverage,
      skippedUsd: comparisons.filter((c) => c.status === "skipped").length,
      alertCount: alerts.length,
      blockingAlertCount: blockingAlerts.length,
      blockingComparisons: blockingCount,
    },
    ok: blockingCount === 0,
  };
}
