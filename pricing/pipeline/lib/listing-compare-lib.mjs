/**
 * 刊例（L4）vs 官方锚 — 汇总校验与告警条目
 */

import { readFile } from "node:fs/promises";
import {
  UPSTREAM_PRICING_FILE,
  officialPricingFile,
  OFFICIAL_MAP_FILE,
  OFFICIAL_PRICES_API_IMAGE,
  OFFICIAL_PRICES_API_VIDEO,
  OUT_VALIDATE_DIR,
} from "./paths.mjs";
import {
  buildTextCompareHubFromModels,
  loadTextCompareHubContext,
} from "./compare-hub-lib.mjs";
import { findTierByKey } from "./tier-key.mjs";
import { annotationsForModel } from "../../config/pricing-annotations.mjs";
import { refreshOnlinePricesForCompare } from "./fetch-online-prices-lib.mjs";
import { compareImagePricesDocuments } from "./diff-image-prices-api.mjs";
import { compareVideoPricesDocuments } from "./diff-video-prices-api.mjs";
import { findImageOfficialListingGaps, findVideoOfficialListingGaps } from "./listing-official-coverage-lib.mjs";

export const LISTING_DECISION_ACTION =
  "需人工决策：跟价 / 维持战略价 / 登记 pricing-annotations 例外后重跑";

const FALSE_POSITIVE_PATTERNS = [
  /刊例vs官方_入.*\+100%/,
  /刊例vs官方_出.*-70%/,
];

function isFalsePositiveFlag(text) {
  if (!text) return false;
  return FALSE_POSITIVE_PATTERNS.some((re) => re.test(text));
}

function baseAlert(overrides) {
  return {
    schema: "trinity.pricing.alert/v1",
    severity: "warn",
    blocking: true,
    suggestedAction: LISTING_DECISION_ACTION,
    ...overrides,
  };
}

/**
 * @param {object} row
 */
function alertFromTextRow(row) {
  return baseAlert({
    type: "listing_price_gap",
    phase: "L1_vs_L4",
    modality: "text",
    trinityId: row.trinityId,
    title: "生文刊例与官方锚不一致",
    detail: `${row.tierLabel ?? "—"} · ${row.listingConclusion}`,
    refs: {
      excel: "pricing/output/trinity-pricing-text.xlsx",
      sheet: "刊例对比校验-生文",
    },
  });
}

/**
 * @param {object} item
 */
function alertFromMissingTier(item) {
  return baseAlert({
    type: "listing_tier_gap",
    phase: "L1_vs_L4",
    modality: "text",
    trinityId: item.trinityId,
    title: "生文线上档位在官方锚中缺失",
    detail: `${item.tierLabel} · ${item.tierKey}`,
    tierKey: item.tierKey,
    refs: {
      excel: "pricing/output/trinity-pricing-text.xlsx",
      sheet: "刊例对比校验-生文",
    },
  });
}

/**
 * @param {"image"|"video"} modality
 * @param {object} tier
 * @param {string} model
 */
function alertFromOfficialCoverageGap(gap, modality) {
  const isImage = modality === "image";
  return baseAlert({
    type: "listing_official_coverage_gap",
    phase: "L1_vs_L4",
    modality,
    trinityId: gap.trinityId,
    title: isImage ? "生图刊例未覆盖官网档位" : "生视频刊例未覆盖官网档位",
    detail: gap.detail,
    capability: gap.capability,
    resolution: gap.resolution,
    vendorModelId: gap.vendorModelId,
    suggestedAction: isImage
      ? "对照 klingai.com/document-api/pricing/base/image 等官网价目，补齐 Trinity 能力/分辨率刊例；或确认下架"
      : "对照官网价目补齐 Trinity 分辨率/模型刊例；或确认下架",
    refs: {
      official: `pricing/suppliers/official/output/${modality}/vendor-pricing.json`,
      online: `pricing/output/online/prices-api-${modality}.json`,
    },
  });
}

function alertFromModalityTier(modality, tier, model) {
  const isMissing = tier.verdict === "缺项";
  const type = isMissing ? "listing_tier_gap" : "listing_price_gap";
  const title = isMissing
    ? `生${modality === "image" ? "图" : "视频"}刊例缺档`
    : `生${modality === "image" ? "图" : "视频"}刊例与官方草案不一致`;
  const detail = isMissing
    ? `${tier.tierLabel} · 线上/草案缺项`
    : `${tier.tierLabel} · 线上 $${tier.onlinePrice ?? "—"} vs 草案 $${tier.draftPrice ?? "—"} (${tier.deltaPct ?? "—"}%) · ${tier.verdict}`;

  return baseAlert({
    type,
    phase: "L1_vs_L4",
    modality,
    trinityId: model,
    title,
    detail,
    tierKey: tier.tierKey,
    refs: {
      draft: `pricing/output/draft/official-prices-api-${modality}-diff.json`,
      excel: `pricing/output/trinity-pricing-${modality}.xlsx`,
    },
  });
}

async function buildTextSection() {
  const upstream = JSON.parse(await readFile(UPSTREAM_PRICING_FILE, "utf8"));
  const official = JSON.parse(
    await readFile(officialPricingFile("text"), "utf8"),
  );
  const ctx = await loadTextCompareHubContext();
  const report = buildTextCompareHubFromModels(upstream.models ?? [], ctx);
  const mapObj = JSON.parse(await readFile(OFFICIAL_MAP_FILE, "utf8"));
  const officialById = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );

  const falsePositives = [];
  const missingOfficialTier = [];
  const unannotatedWarnings = [];
  const alerts = [];

  for (const m of upstream.models ?? []) {
    const tid = m.trinityId?.toLowerCase();
    const vendorId = mapObj[tid]?.vendorModelId?.toLowerCase() ?? tid;
    const off = officialById.get(vendorId);
    for (const t of m.tiers ?? []) {
      if (!t.tierKey || t.tierKey === "uniform") continue;
      if (!off?.tiers?.length) continue;
      if (!findTierByKey(off.tiers, t.tierKey)) {
        missingOfficialTier.push({
          trinityId: m.trinityId,
          tierLabel: t.tierLabel,
          tierKey: t.tierKey,
        });
      }
    }
  }

  for (const row of report.rows) {
    const tid = row.trinityId?.toLowerCase();
    const listing = row.listingConclusion ?? "";

    if (isFalsePositiveFlag(row.deltaOnlineVsOfficialIn)) {
      falsePositives.push({
        trinityId: row.trinityId,
        tierLabel: row.tierLabel,
        deltaIn: row.deltaOnlineVsOfficialIn,
      });
    }

    if (
      row.listingMaterialInOut &&
      !listing.startsWith("ℹ") &&
      !listing.startsWith("—") &&
      row.trinityId !== "—" &&
      !annotationsForModel(tid, "compare-hub").length
    ) {
      unannotatedWarnings.push({
        trinityId: row.trinityId,
        tierLabel: row.tierLabel,
        listingConclusion: listing,
      });
      alerts.push(alertFromTextRow(row));
    }
  }

  for (const item of missingOfficialTier) {
    if (item.tierKey?.startsWith("t:idx-")) continue;
    if (annotationsForModel(item.trinityId?.toLowerCase(), "compare-hub").length) {
      continue;
    }
    alerts.push(alertFromMissingTier(item));
  }

  return {
    rowCount: report.rowCount,
    falsePositives,
    missingOfficialTier,
    unannotatedWarnings,
    alerts,
  };
}

/**
 * @param {"image"|"video"} modality
 */
async function buildModalitySection(modality) {
  const draftPath =
    modality === "image" ? OFFICIAL_PRICES_API_IMAGE : OFFICIAL_PRICES_API_VIDEO;
  const compareFn =
    modality === "image"
      ? compareImagePricesDocuments
      : compareVideoPricesDocuments;

  try {
    // 对比前默认 GET /v1/prices 拉最新；PRICING_SKIP_ONLINE_FETCH=1 才读缓存
    const [{ raw: onlineDoc }, draftRaw] = await Promise.all([
      refreshOnlinePricesForCompare(modality, { quiet: true }),
      readFile(draftPath, "utf8"),
    ]);
    const draftDoc = JSON.parse(draftRaw);
    const doc = compareFn(onlineDoc, draftDoc);
    const alerts = [];

    for (const row of doc.rows ?? []) {
      const tid = String(row.model ?? "").toLowerCase();
      if (annotationsForModel(tid, "compare-hub").length) continue;
      for (const tier of row.tiers ?? []) {
        if (tier.verdict === "一致") continue;
        alerts.push(alertFromModalityTier(modality, tier, row.model));
      }
    }

    let officialCoverage = { gapCount: 0, gaps: [], ok: true };
    if (modality === "image" || modality === "video") {
      try {
        const [officialRaw, mapRaw] = await Promise.all([
          readFile(officialPricingFile(modality), "utf8"),
          readFile(OFFICIAL_MAP_FILE, "utf8"),
        ]);
        const findGaps =
          modality === "image"
            ? findImageOfficialListingGaps
            : findVideoOfficialListingGaps;
        officialCoverage = findGaps({
          officialModels: JSON.parse(officialRaw).models ?? [],
          trinityMap: JSON.parse(mapRaw),
          onlineDoc,
        });
        for (const gap of officialCoverage.gaps) {
          alerts.push(alertFromOfficialCoverageGap(gap, modality));
        }
      } catch (coverErr) {
        officialCoverage = {
          status: "skipped",
          reason:
            coverErr instanceof Error ? coverErr.message : String(coverErr),
          gapCount: 0,
          gaps: [],
          ok: true,
        };
      }
    }

    return {
      status: "ok",
      summary: {
        ...doc.summary,
        officialCoverageGaps: officialCoverage.gapCount ?? 0,
      },
      officialCoverage,
      alerts,
    };
  } catch (e) {
    return {
      status: "skipped",
      reason: e instanceof Error ? e.message : String(e),
      alerts: [],
    };
  }
}

/**
 * 构建刊例对比 bundle（生文 + 生图 + 生视频）
 */
export async function buildListingCompareBundle() {
  const text = await buildTextSection();
  const image = await buildModalitySection("image");
  const video = await buildModalitySection("video");

  const alerts = [
    ...text.alerts,
    ...image.alerts,
    ...video.alerts,
  ];

  const summary = {
    text: {
      rowCount: text.rowCount,
      unannotatedWarnings: text.unannotatedWarnings.length,
      missingOfficialTier: text.missingOfficialTier.length,
      falsePositives: text.falsePositives.length,
    },
    image: image.summary ?? { status: image.status, reason: image.reason },
    video: video.summary ?? { status: video.status, reason: video.reason },
    alertCount: alerts.length,
    ok:
      alerts.length === 0 &&
      text.falsePositives.length === 0 &&
      text.missingOfficialTier.filter((m) => !m.tierKey?.startsWith("t:idx-"))
        .length === 0,
  };

  return {
    schema: "trinity.pricing.listing-compare/v1",
    generatedAt: new Date().toISOString(),
    validateDir: OUT_VALIDATE_DIR,
    summary,
    text: {
      falsePositives: text.falsePositives,
      missingOfficialTier: text.missingOfficialTier,
      unannotatedWarnings: text.unannotatedWarnings,
    },
    image,
    video,
    alerts,
  };
}
