/**
 * 生图刊例校验总表：厂商官方价（锚）· AIGC 国内/国际 · TokenHub · 火山 · 线上刊例
 */

import { readFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { writeCsv } from "./export-excel.mjs";
import { parseNum } from "./pricing-compare.mjs";
import {
  parseOnlineImageTiers,
  num,
} from "./parse-online-prices.mjs";
import {
  FIELD_MATCH_PCT,
  pctIsMaterial,
} from "./pricing-tolerance.mjs";
import { withVerifyFlag } from "./pricing-verify.mjs";
import {
  FX_ONLINE_DOMESTIC,
} from "./compare-official-lib.mjs";
import { refreshOnlinePricesForCompare } from "./fetch-online-prices-lib.mjs";
import { findTierByKey } from "./tier-key.mjs";
import {
  imageTierPrice,
  imageTierWithKey,
  officialImageTiersForCompare,
  aigcImageTiersForCompare,
  tokenhubImageTiersForCompare,
  volcengineImageTiersForCompare,
  evaluateImageDomesticVsOfficial,
  evaluateImageIntlVsOfficial,
  evaluateImagePriceVsOfficial,
  findCompareTierByKey,
} from "./image-pricing-validate-lib.mjs";
import {
  OFFICIAL_MAP_FILE,
  officialComparePaths,
  officialPricingFile,
  SUPPLIERS_DIR,
  TOKENHUB_FILE,
} from "./paths.mjs";

export const IMAGE_COMPARE_SHEET = "刊例对比校验-生图";

const RES_ORDER = ["1K以下", "1K", "2K", "4K", "输出", "标准价"];

function pctDelta(base, value) {
  if (base == null || value == null || base === 0) return null;
  return Math.round(((value - base) / base) * 1000) / 10;
}

function formatDeltaPct(pct) {
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function formatFieldVsOfficial(label, pct, present = true) {
  if (!present) return null;
  if (pct == null) return `${label}—`;
  if (!pctIsMaterial(pct, FIELD_MATCH_PCT)) return `${label}✅`;
  return `${label}⚠${formatDeltaPct(pct)}`;
}

function formatPriceVsOfficial(pct) {
  if (pct == null) return "—";
  if (!pctIsMaterial(pct, FIELD_MATCH_PCT)) return "✅";
  return `⚠${formatDeltaPct(pct)}`;
}

function symForCurrency(currency) {
  return currency === "CNY" ? "¥" : "$";
}

function formatImagePrice(price, currency) {
  if (price == null || price === "") return "—";
  const sym = symForCurrency(currency);
  return `${sym}${price}/张`;
}

function officialTierPrice(offTier) {
  if (!offTier) return null;
  return parseNum(offTier.price ?? offTier.output ?? offTier.input);
}

function normalizeResLabel(label) {
  const t = String(label ?? "").trim();
  if (!t) return t;
  const low = t.toLowerCase();
  if (low === "1k" || low === "1k ") return "1K";
  if (low === "2k") return "2K";
  if (low === "4k") return "4K";
  return t;
}

function pickOnlineTier(onlineTiers, offTier) {
  if (!onlineTiers?.length) return null;
  const wantKey = offTier.tierKey;
  if (wantKey) {
    const hit = onlineTiers.find(
      (t) => (t.tierKey ?? imageTierWithKey(t, 0, 1).tierKey) === wantKey,
    );
    if (hit) return hit;
    const byLabel = findTierByKey(onlineTiers, wantKey);
    if (byLabel) return byLabel;
  }
  const want = normalizeResLabel(offTier.tierLabel);
  const hit = onlineTiers.find(
    (t) => normalizeResLabel(t.tierLabel) === want,
  );
  if (hit) return hit;
  if (onlineTiers.length === 1) return onlineTiers[0];
  return null;
}

function tokenhubImagePriceAt(thModel, offTier) {
  const tiers = tokenhubImageTiersForCompare(thModel);
  const hit = findCompareTierByKey(tiers, offTier.tierKey);
  return hit?.price ?? tiers[0]?.price ?? null;
}

function volcengineImagePriceAt(volModel, offTier) {
  const tiers = volcengineImageTiersForCompare(volModel);
  const hit = findCompareTierByKey(tiers, offTier.tierKey);
  return hit?.price ?? tiers[0]?.price ?? null;
}

function aigcPriceAtSite(aigcModel, mapRef, offTier) {
  const tiers = aigcImageTiersForCompare(aigcModel, mapRef);
  const hit = findCompareTierByKey(tiers, offTier.tierKey);
  return hit?.price ?? null;
}

function officialImageTiers(off) {
  return officialImageTiersForCompare(off);
}

function buildReverseTrinityByVendor(vendorMap) {
  const byVendor = new Map();
  for (const [trinityId, meta] of Object.entries(vendorMap)) {
    const vendorModelId = meta?.vendorModelId;
    if (!vendorModelId) continue;
    const key = vendorModelId.toLowerCase();
    if (!byVendor.has(key)) byVendor.set(key, trinityId);
  }
  return byVendor;
}

function formatCompareBrand(off) {
  return off.vendorLabel ?? off.vendor ?? "—";
}

function isOfficialModelLinked(off, reverseTrinity) {
  const id = off.vendorModelId?.toLowerCase();
  return Boolean(id && reverseTrinity.has(id));
}

function buildVendorsWithTrinityLink(officialModels, reverseTrinity) {
  const linked = new Set();
  for (const off of officialModels) {
    if (isOfficialModelLinked(off, reverseTrinity)) {
      linked.add(formatCompareBrand(off));
    }
  }
  return linked;
}

function compareOfficialModels(a, b, reverseTrinity, vendorsWithLink) {
  const la = formatCompareBrand(a);
  const lb = formatCompareBrand(b);
  const vendorLinkedA = vendorsWithLink.has(la) ? 0 : 1;
  const vendorLinkedB = vendorsWithLink.has(lb) ? 0 : 1;
  if (vendorLinkedA !== vendorLinkedB) return vendorLinkedA - vendorLinkedB;
  if (la !== lb) return la.localeCompare(lb);
  const linkedA = isOfficialModelLinked(a, reverseTrinity) ? 0 : 1;
  const linkedB = isOfficialModelLinked(b, reverseTrinity) ? 0 : 1;
  if (linkedA !== linkedB) return linkedA - linkedB;
  return (a.vendorModelId ?? "").localeCompare(b.vendorModelId ?? "");
}

function tierSort(a, b) {
  const ia = RES_ORDER.indexOf(normalizeResLabel(a.tierLabel));
  const ib = RES_ORDER.indexOf(normalizeResLabel(b.tierLabel));
  const sa = ia === -1 ? 99 : ia;
  const sb = ib === -1 ? 99 : ib;
  if (sa !== sb) return sa - sb;
  return String(a.tierLabel).localeCompare(String(b.tierLabel));
}

function buildUnmappedRow(off, offTier, vendorModelId) {
  const sym = symForCurrency(off.currency ?? "CNY");
  return {
    trinityId: "—",
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel: offTier.tierLabel ?? "—",
    official: formatImagePrice(officialTierPrice(offTier), off.currency ?? "CNY"),
    aigcDom: "—",
    aigcIntl: "—",
    tokenhub: "—",
    volcengine: "—",
    online: "—",
    aigcDomVsOfficial: "—",
    aigcIntlVsOfficial: "—",
    thVsOfficial: "—",
    volVsOfficial: "—",
    listingConclusion: "— 未接入",
    note: off.trinityNote ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

function buildMappedNoListingRow(off, offTier, vendorModelId, trinityId) {
  const sym = symForCurrency(off.currency ?? "CNY");
  return {
    trinityId,
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel: offTier.tierLabel ?? "—",
    official: formatImagePrice(officialTierPrice(offTier), off.currency ?? "CNY"),
    aigcDom: "—",
    aigcIntl: "—",
    tokenhub: "—",
    volcengine: "—",
    online: "—",
    aigcDomVsOfficial: "—",
    aigcIntlVsOfficial: "—",
    thVsOfficial: "—",
    volVsOfficial: "—",
    listingConclusion: "— 未上架",
    note: off.trinityNote ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

function buildImageTierRow(ctx) {
  const {
    off,
    offTier,
    trinityId,
    vendorModelId,
    onlineTiers,
    aigcDom,
    aigcIntl,
    aigcMapRef,
    thModel,
    volModel,
    note,
  } = ctx;

  const currency = off.currency ?? "CNY";
  const region = off.region ?? "domestic";
  const isIntlOnly = region === "international_only";
  const tierLabel = offTier.tierLabel ?? "—";
  const offPrice = imageTierPrice(offTier);

  const domPrice = aigcPriceAtSite(aigcDom, aigcMapRef, offTier);
  const intlPrice = aigcPriceAtSite(aigcIntl, aigcMapRef, offTier);
  const thPrice = tokenhubImagePriceAt(thModel, offTier);
  const volPrice = volcengineImagePriceAt(volModel, offTier);

  const onlineTier = pickOnlineTier(onlineTiers, offTier);
  const onlinePrice = onlineTier?.price ?? null;

  // §3.1：国内 CNY↔CNY；国际 USD↔USD；国际站模型不比 AIGC 国内 vs 官方
  const domCmp = isIntlOnly
    ? { text: "—", comparable: false }
    : evaluateImageDomesticVsOfficial(offPrice, domPrice, currency);

  const intlCmp = evaluateImageIntlVsOfficial(offPrice, intlPrice, currency);

  const thCmp =
    currency === "CNY"
      ? evaluateImageDomesticVsOfficial(offPrice, thPrice, currency)
      : evaluateImageIntlVsOfficial(offPrice, thPrice, currency);

  const volCmp =
    currency === "CNY"
      ? evaluateImageDomesticVsOfficial(offPrice, volPrice, currency)
      : evaluateImageIntlVsOfficial(offPrice, volPrice, currency);

  const onlineCmp = evaluateImagePriceVsOfficial(
    offPrice,
    onlinePrice,
    currency,
    "USD",
  );

  let listingConclusion = "—";
  if (onlineTier && onlineCmp.comparable) {
    const base =
      formatFieldVsOfficial("价", onlineCmp.pct, true) ?? "—";
    listingConclusion = withVerifyFlag(
      trinityId,
      onlineCmp.pct != null ? Math.abs(onlineCmp.pct) : null,
      base,
      ["official-listing"],
    );
  } else if (trinityId && trinityId !== "—") {
    listingConclusion = "ℹ 线上无同档刊例";
  }

  const aigcDomVsOfficial =
    domCmp.comparable && domCmp.pct != null && pctIsMaterial(domCmp.pct, FIELD_MATCH_PCT)
      ? withVerifyFlag(trinityId, Math.abs(domCmp.pct), domCmp.text)
      : domCmp.text;
  const aigcIntlVsOfficial =
    intlCmp.comparable && intlCmp.pct != null && pctIsMaterial(intlCmp.pct, FIELD_MATCH_PCT)
      ? withVerifyFlag(trinityId, Math.abs(intlCmp.pct), intlCmp.text)
      : intlCmp.text;

  return {
    trinityId: trinityId ?? "—",
    displayName: formatCompareBrand(off),
    brand: formatCompareBrand(off),
    vendorModelId,
    tierLabel,
    tierKey: offTier.tierKey ?? "—",
    official: formatImagePrice(offPrice, currency),
    aigcDom: domPrice != null ? formatImagePrice(domPrice, "CNY") : "—",
    aigcIntl: intlPrice != null ? formatImagePrice(intlPrice, "USD") : "—",
    tokenhub: thPrice != null ? formatImagePrice(thPrice, "CNY") : "—",
    volcengine: volPrice != null ? formatImagePrice(volPrice, "CNY") : "—",
    online: onlinePrice != null ? formatImagePrice(onlinePrice, "USD") : "—",
    aigcDomVsOfficial,
    aigcIntlVsOfficial,
    thVsOfficial: thCmp.text,
    volVsOfficial: volCmp.text,
    listingConclusion,
    note: note ?? "",
    officialStatus: off.fetchStatus ?? "",
  };
}

/**
 * @param {object[]} trinityOnlineModels 已上架 Trinity 生图模型（可为空）
 * @param {object} hubCtx loadImageCompareHubContext 返回值
 */
export function buildImageCompareHubFromModels(trinityOnlineModels, hubCtx) {
  const {
    officialModels,
    vendorMap,
    reverseTrinity,
    vendorsWithLink,
    onlineByModel,
    aigcDomByTrinity,
    aigcIntlByTrinity,
    aigcTrinityMap,
    thById,
    volByTrinity,
    officialFetchedAt,
    pricesFetchedAt,
    generatedAt,
  } = hubCtx;

  const upstreamByTrinity = new Map(
    (trinityOnlineModels ?? []).map((m) => [m.id?.toLowerCase(), m]),
  );
  const trinityLinkedCount = reverseTrinity.size;
  const rows = [];

  const sorted = [...officialModels].sort((a, b) =>
    compareOfficialModels(a, b, reverseTrinity, vendorsWithLink),
  );

  for (const off of sorted) {
    const vendorModelId = off.vendorModelId ?? "—";
    const trinityId = reverseTrinity.get(vendorModelId.toLowerCase()) ?? null;
    const tiers = [...officialImageTiers(off)].sort(tierSort);

    if (!trinityId) {
      for (const offTier of tiers) {
        rows.push(buildUnmappedRow(off, offTier, vendorModelId));
      }
      continue;
    }

    const tid = trinityId.toLowerCase();
    const online = onlineByModel.get(tid) ?? null;
    const onlineTiers = online ? parseOnlineImageTiers(online) : [];
    const listed = upstreamByTrinity.has(tid);

    if (!listed && !online) {
      for (const offTier of tiers) {
        rows.push(buildMappedNoListingRow(off, offTier, vendorModelId, trinityId));
      }
      continue;
    }

    const aigcDom = aigcDomByTrinity.get(tid) ?? null;
    const aigcIntl = aigcIntlByTrinity.get(tid) ?? null;
    const aigcRef =
      aigcDom?._mapRef ??
      aigcIntl?._mapRef ??
      aigcTrinityMap[tid] ??
      aigcTrinityMap[trinityId] ??
      null;
    const thModel = thById.get(tid) ?? thById.get(vendorModelId.toLowerCase()) ?? null;
    const volModel = volByTrinity.get(tid) ?? null;

    for (const offTier of tiers) {
      rows.push(
        buildImageTierRow({
          off,
          offTier,
          trinityId,
          vendorModelId,
          onlineTiers,
          aigcDom,
          aigcIntl,
          aigcMapRef: aigcRef,
          thModel,
          volModel,
          note: off.trinityNote ?? vendorMap[tid]?.note ?? null,
        }),
      );
    }
  }

  return {
    modality: "image",
    generatedAt,
    officialFetchedAt,
    pricesFetchedAt,
    modelCount: officialModels.length,
    trinityLinkedCount,
    trinityOnlineCount: trinityOnlineModels?.length ?? 0,
    rowCount: rows.length,
    fxOnlineDomestic: FX_ONLINE_DOMESTIC,
    rows,
  };
}

export async function loadImageCompareHubContext(opts = {}) {
  const online =
    opts.preloaded ??
    (await refreshOnlinePricesForCompare("image", {
      quiet: opts.quiet ?? false,
    }));

  const aigcMapPath = path.join(SUPPLIERS_DIR, "aigc/trinity-map-image.json");
  const volcImagePath = path.join(
    SUPPLIERS_DIR,
    "volcengine/output/image/pricing-api.json",
  );

  const [mapRaw, officialRaw, aigcMapRaw, thRaw, volcRaw] = await Promise.all([
    readFile(OFFICIAL_MAP_FILE, "utf8").catch(() => "{}"),
    readFile(officialPricingFile("image"), "utf8").catch(() => "{}"),
    readFile(aigcMapPath, "utf8").catch(() => "{}"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
    readFile(volcImagePath, "utf8").catch(() => "{}"),
  ]);

  const mapObj = JSON.parse(mapRaw);
  const vendorMap = {};
  for (const [k, v] of Object.entries(mapObj)) {
    if (k.startsWith("_")) continue;
    if (v?.modality && v.modality !== "image") continue;
    vendorMap[k.toLowerCase()] = v;
  }

  const aigcMapObj = JSON.parse(aigcMapRaw);
  const aigcTrinityMap = {};
  for (const [k, v] of Object.entries(aigcMapObj)) {
    if (k.startsWith("_")) continue;
    aigcTrinityMap[k.toLowerCase()] = v;
  }

  const official = JSON.parse(officialRaw);
  const thData = JSON.parse(thRaw);
  const volcData = JSON.parse(volcRaw);
  const officialModels = official.models ?? [];
  const officialByVendorId = new Map(
    officialModels.map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const reverseTrinity = buildReverseTrinityByVendor(vendorMap);
  const vendorsWithLink = buildVendorsWithTrinityLink(
    officialModels,
    reverseTrinity,
  );

  const onlineByModel = new Map();
  for (const entry of online.raw?.data ?? []) {
    const id = entry.model?.toLowerCase();
    if (id) onlineByModel.set(id, entry);
  }

  const thById = new Map();
  for (const m of thData.models ?? []) {
    const isImage =
      /^hy-image/i.test(m.modelId ?? "") ||
      (m.tags ?? []).some((t) => /图片|image/i.test(t));
    if (!isImage) continue;
    const id = (m.trinityId ?? m.modelId)?.toLowerCase();
    if (id) thById.set(id, m);
    if (m.modelId) thById.set(m.modelId.toLowerCase(), m);
  }

  const volByTrinity = new Map();
  for (const m of volcData.models ?? []) {
    if (m.trinityId) volByTrinity.set(m.trinityId.toLowerCase(), m);
  }

  return {
    officialModels,
    officialByVendorId,
    vendorMap,
    reverseTrinity,
    vendorsWithLink,
    onlineByModel,
    aigcDomByTrinity: opts.aigcDomByTrinity ?? new Map(),
    aigcIntlByTrinity: opts.aigcIntlByTrinity ?? new Map(),
    aigcTrinityMap,
    thById,
    volByTrinity,
    officialFetchedAt: official.fetchedAt ?? null,
    pricesFetchedAt: online.fetchedAt ?? online.raw?.fetchedAt ?? null,
    generatedAt: new Date().toISOString(),
  };
}

export function buildImageCompareExcelRows(report) {
  const header = [
    "原厂 modelId",
    "Trinity ID",
    "显示名",
    "厂商",
    "分辨率档",
    "厂商官方",
    "AIGC国内",
    "AIGC国际",
    "TokenHub",
    "火山方舟",
    "线上刊例",
    "AIGC国内vs官方",
    "AIGC国际vs官方",
    "TokenHub vs官方",
    "火山vs官方",
    "刊例结论",
    "备注",
  ];

  const rows = [];
  let lastVendorId = "";
  for (const r of report.rows) {
    const vendorId = r.vendorModelId ?? "";
    const show = vendorId !== lastVendorId;
    lastVendorId = vendorId;
    rows.push([
      show ? vendorId : "",
      show ? (r.trinityId ?? "") : "",
      show ? (r.displayName ?? "") : "",
      show ? (r.brand ?? "") : "",
      r.tierLabel ?? "",
      r.official ?? "",
      r.aigcDom ?? "",
      r.aigcIntl ?? "",
      r.tokenhub ?? "",
      r.volcengine ?? "",
      r.online ?? "",
      r.aigcDomVsOfficial ?? "",
      r.aigcIntlVsOfficial ?? "",
      r.thVsOfficial ?? "",
      r.volVsOfficial ?? "",
      r.listingConclusion ?? "",
      r.note ?? "",
    ]);
  }
  return [header, ...rows];
}

export async function writeImageCompareHubExports(report, writeFile) {
  const excelRows = buildImageCompareExcelRows(report);
  const md = renderImageCompareHubMarkdown(report);
  const json = JSON.stringify(report, null, 2);
  const official = officialComparePaths("image");
  const summaryMd = path.join(
    path.dirname(official.md),
    "../upstream/image-summary.md",
  );
  const summaryCsv = path.join(
    path.dirname(official.csv),
    "../upstream/image-summary.csv",
  );

  await mkdir(path.dirname(official.md), { recursive: true });
  await mkdir(path.dirname(summaryMd), { recursive: true });

  await writeFile(summaryMd, md, "utf8");
  await writeFile(official.md, md, "utf8");
  await writeFile(official.json, json, "utf8");
  await writeCsv(summaryCsv, excelRows, writeFile);
  await writeCsv(official.csv, excelRows, writeFile);

  return {
    excelRows,
    paths: {
      summaryMd,
      summaryCsv,
      officialMd: official.md,
      officialJson: official.json,
      officialCsv: official.csv,
    },
  };
}

function esc(s) {
  return String(s ?? "—").replace(/\|/g, "\\|");
}

export function renderImageCompareHubMarkdown(report) {
  const [header, ...bodyRows] = buildImageCompareExcelRows(report);
  const lines = [
    "# 生图刊例对比校验（与 Excel「刊例对比校验-生图」同源）",
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z · 官方模型 ${report.modelCount} 个 · 行 ${report.rowCount}` +
      (report.trinityLinkedCount != null
        ? ` · Trinity 已映射 ${report.trinityLinkedCount} · 线上 ${report.trinityOnlineCount ?? "—"}`
        : ""),
    `> **行轴**：\`suppliers/official/output/image/vendor-pricing.json\` 全量`,
    `> 厂商官方价：\`suppliers/official/output/image/vendor-pricing.json\`（${report.officialFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> AIGC：\`suppliers/aigc\` · TokenHub · 火山方舟`,
    `> 线上刊例：\`output/online/prices-api.json\`（${report.pricesFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> 国内官方 CNY→USD：÷${report.fxOnlineDomestic}`,
  ];
  lines.push("", `| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`);
  for (const row of bodyRows) {
    lines.push(`| ${row.map((c) => esc(c)).join(" | ")} |`);
  }
  return lines.join("\n");
}

export const MERGE_COMPARE_IMAGE = {
  cols: [1, 2, 3, 4],
  rows: true,
};
