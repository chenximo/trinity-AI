/**
 * 官方价 vs 上游 vs 线上刊例 — join 与格式化（生文按全档位展开）
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  MERGE_OFFICIAL_MEDIA,
  MERGE_OFFICIAL_TEXT,
} from "./export-excel.mjs";
import { parseOnlinePricesTiers } from "./parse-online-prices.mjs";
import { alignTierPairs, tierLabelOf } from "./tier-align.mjs";
import {
  TOKENHUB_FILE,
  BAILIAN_FILE,
  AIGC_OUT_FILE,
  SUPPLIERS_DIR,
  PRICES_API_FILE,
  officialMasterSheetName,
} from "./paths.mjs";

export const MODALITIES = ["text", "image", "video"];
export const FX_ONLINE_DOMESTIC = Number(process.env.FX_ONLINE_DOMESTIC || "6.5");
export const FX_CNY_PER_USD = Number(process.env.FX_CNY_PER_USD || "7.25");

const OFFICIAL_MAP = path.join(SUPPLIERS_DIR, "official/trinity-map.json");

export function officialPricingPath(modality) {
  return path.join(
    SUPPLIERS_DIR,
    `official/output/${modality}/vendor-pricing.json`,
  );
}

export function num(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function esc(s) {
  return String(s ?? "—").replace(/\|/g, "\\|");
}

/** @param {{ tiers?: Array<{ tierLabel?: string, input?: number|null, output?: number|null, cache?: number|null }>, currency?: string }} model */
export function formatOfficialText(model) {
  const tiers = model?.tiers ?? [];
  if (!tiers.length) return "—";
  const sym = model?.currency === "CNY" ? "¥" : "$";
  if (tiers.length === 1) {
    return formatOfficialSingleTier(tiers[0], sym);
  }
  return tiers
    .map((t) => {
      const parts = [];
      if (t.input != null) parts.push(`入${sym}${t.input}`);
      if (t.output != null) parts.push(`出${sym}${t.output}`);
      return `${t.tierLabel ?? "—"}: ${parts.join("/") || "—"}`;
    })
    .join("; ");
}

export function formatOfficialSingleTier(tier, sym) {
  if (!tier) return "—";
  const parts = [];
  if (tier.input != null) parts.push(`入 ${sym}${tier.input}`);
  if (tier.output != null) parts.push(`出 ${sym}${tier.output}`);
  if (tier.cache != null) parts.push(`缓 ${sym}${tier.cache}`);
  return parts.length ? parts.join(" · ") : "—";
}

export function formatOfficialMedia(model) {
  const tiers = model?.tiers ?? [];
  if (!tiers.length) return "—";
  return tiers
    .map((t) => `${t.tierLabel || "—"}: ${t.price ?? "—"} ${t.unit ?? ""}`.trim())
    .join("; ");
}

export function formatTokenTextTier(tier, currency = "CNY") {
  if (!tier) return "—";
  const sym = currency === "USD" ? "$" : "¥";
  const inP = tier.input ?? tier.items?.find((i) => i.name === "Input")?.price;
  const outP = tier.output ?? tier.items?.find((i) => i.name === "Output")?.price;
  const cacheP =
    tier.cache ?? tier.items?.find((i) => i.name === "Cache")?.price;
  const parts = [];
  if (inP != null) parts.push(`入 ${sym}${inP}`);
  if (outP != null) parts.push(`出 ${sym}${outP}`);
  if (cacheP != null) parts.push(`缓 ${sym}${cacheP}`);
  return parts.length ? parts.join(" · ") : "—";
}

function formatTokenMediaTiers(tiers) {
  if (!tiers?.length) return "—";
  return tiers
    .map((t) => {
      const item = t.items?.[0];
      const label = t.tierName || t.tierLabel || "";
      const price = item?.price ?? t.input ?? "—";
      const unit = item?.unit ?? "";
      return `${label}: ${price} ${unit}`.trim();
    })
    .join("; ");
}

function formatOnlineSingleTier(tier) {
  if (!tier) return "—";
  const parts = [];
  if (tier.input != null) parts.push(`入 $${tier.input}`);
  if (tier.output != null) parts.push(`出 $${tier.output}`);
  if (tier.cache != null) parts.push(`缓 $${tier.cache}`);
  return parts.length ? parts.join(" · ") : "—";
}

function formatOnlineMedia(entry) {
  if (!entry) return "—";
  const groups = entry.price_groups ?? [];
  const g = groups.find((x) => x.type === "default") ?? groups[0];
  const prices = g?.prices ?? {};
  const pick = (k) => prices[k]?.display ?? prices[k]?.amount ?? null;
  const out = pick("output") ?? pick("generation");
  return out != null ? String(out) : "—";
}

/** 生文：按 input 价对齐官方与上游/线上档位后展开 */
function expandTextModelRow(base, sources) {
  const { off, thM, blM, aigcDom, aigcIntl, online } = sources;
  const offCurrency = off?.currency ?? "USD";
  const offTiers = off?.tiers ?? [];
  const onlineTiers = online ? parseOnlinePricesTiers(online) : [];
  const thTiers = thM?.tiers ?? [];
  const blTiers = blM?.tiers ?? [];
  const aigcDomTiers = aigcDom?.tiers ?? [];
  const aigcIntlTiers = aigcIntl?.tiers ?? [];

  const pairs = alignTierPairs(offTiers, onlineTiers, {
    fx: FX_ONLINE_DOMESTIC,
    currencyA: offCurrency,
  });
  if (!pairs.length) pairs.push({ a: null, b: null, match: "index" });

  const alignUpstream = (tiers, offTier, currency, fallbackIdx) => {
    if (!tiers.length) return null;
    if (offTier) {
      const hit = alignTierPairs([offTier], tiers, {
        fx: FX_ONLINE_DOMESTIC,
        currencyA: offCurrency,
      })[0]?.b;
      if (hit) return hit;
    }
    return tiers[fallbackIdx] ?? null;
  };

  const rows = [];
  for (let i = 0; i < pairs.length; i++) {
    const { a: offTier, b: onlineTierRaw, match } = pairs[i];
    const sym = offCurrency === "CNY" ? "¥" : "$";
    let note = base.note;
    if (match === "price") {
      note = note ? `${note}；官方/线上按价对齐` : "官方/线上按价对齐";
    }
    rows.push({
      ...base,
      tierIndex: i,
      tierLabel:
        tierLabelOf(onlineTierRaw, offTier) ||
        (pairs.length === 1 ? "标准价" : `档位${i + 1}`),
      official: offTier ? formatOfficialSingleTier(offTier, sym) : "—",
      tokenhub: formatTokenTextTier(
        alignUpstream(thTiers, offTier, thM?.currency, i),
        thM?.currency ?? "CNY",
      ),
      bailian: formatTokenTextTier(
        alignUpstream(blTiers, offTier, blM?.currency, i),
        blM?.currency ?? "CNY",
      ),
      aigcDomestic: formatTokenTextTier(
        alignUpstream(aigcDomTiers, offTier, aigcDom?.currency, i),
        aigcDom?.currency ?? "CNY",
      ),
      aigcIntl: formatTokenTextTier(
        alignUpstream(aigcIntlTiers, offTier, "USD", i),
        aigcIntl?.currency ?? "USD",
      ),
      online: formatOnlineSingleTier(onlineTierRaw),
      note,
    });
  }
  return rows;
}

function findByModelId(models, id) {
  if (!id) return null;
  const key = id.toLowerCase();
  return models.find((m) => (m.modelId ?? m.model ?? "").toLowerCase() === key) ?? null;
}

function findAigcModels(aigcData, trinityId) {
  const domestic =
    aigcData.models?.filter(
      (m) =>
        m.site === "domestic" &&
        (m.trinityId === trinityId || m.modelId === trinityId),
    ) ?? [];
  const intl =
    aigcData.models?.filter(
      (m) =>
        m.site === "international" &&
        (m.trinityId === trinityId || m.modelId === trinityId),
    ) ?? [];
  return { domestic: domestic[0] ?? null, intl: intl[0] ?? null };
}

/**
 * @param {string} modality
 * @param {string[]} filterIds Trinity model IDs（空 = map 内该模态全部）
 */
export async function buildCompareRows(modality, filterIds = []) {
  const mapRaw = JSON.parse(await readFile(OFFICIAL_MAP, "utf8"));
  const mapEntries = Object.entries(mapRaw).filter(([k]) => !k.startsWith("_"));

  let targets = mapEntries
    .map(([trinityId, meta]) => ({
      trinityId,
      modality: meta.modality ?? "text",
      vendor: meta.vendor,
      vendorModelId: meta.vendorModelId,
    }))
    .filter((e) => e.modality === modality);

  if (filterIds.length) {
    const set = new Set(filterIds.map((s) => s.toLowerCase()));
    targets = targets.filter(
      (e) =>
        set.has(e.trinityId.toLowerCase()) ||
        set.has(e.vendorModelId.toLowerCase()),
    );
  }

  const [officialRaw, thRaw, blRaw, aigcRaw, pricesRaw] = await Promise.all([
    readFile(officialPricingPath(modality), "utf8").catch(() => "{}"),
    readFile(TOKENHUB_FILE, "utf8").catch(() => "{}"),
    readFile(BAILIAN_FILE, "utf8").catch(() => "{}"),
    readFile(AIGC_OUT_FILE, "utf8").catch(() => "{}"),
      readFile(PRICES_API_FILE, "utf8").catch(() => "{}"),
  ]);

  const official = JSON.parse(officialRaw);
  const th = JSON.parse(thRaw);
  const bl = JSON.parse(blRaw);
  const aigc = JSON.parse(aigcRaw);
  const prices = JSON.parse(pricesRaw);

  const officialByVendorId = new Map(
    (official.models ?? []).map((m) => [m.vendorModelId.toLowerCase(), m]),
  );
  const onlineByModel = new Map(
    (prices.data ?? []).map((e) => [e.model.toLowerCase(), e]),
  );

  const rows = [];

  for (const t of targets) {
    const off =
      officialByVendorId.get(t.vendorModelId.toLowerCase()) ?? null;
    const thM = findByModelId(th.models ?? [], t.trinityId);
    const blM = findByModelId(bl.models ?? [], t.trinityId);
    const { domestic: aigcDom, intl: aigcIntl } = findAigcModels(aigc, t.trinityId);
    const online = onlineByModel.get(t.trinityId.toLowerCase()) ?? null;

    const base = {
      trinityId: t.trinityId,
      vendorModelId: t.vendorModelId,
      vendor: t.vendor,
      officialCurrency: off?.currency ?? (modality === "text" ? "USD" : "CNY"),
      officialStatus: off?.fetchStatus ?? "未拉取",
      docUrl: off?.docUrl ?? null,
      note: off?.trinityNote ?? null,
    };

    if (modality === "text") {
      rows.push(
        ...expandTextModelRow(base, {
          off,
          thM,
          blM,
          aigcDom,
          aigcIntl,
          online,
        }),
      );
    } else {
      rows.push({
        ...base,
        tierIndex: 0,
        tierLabel: "—",
        official: formatOfficialMedia(off),
        tokenhub: formatTokenMediaTiers(thM?.tiers),
        bailian: formatTokenMediaTiers(blM?.tiers),
        aigcDomestic: formatTokenMediaTiers(aigcDom?.tiers),
        aigcIntl: formatTokenMediaTiers(aigcIntl?.tiers),
        online: formatOnlineMedia(online),
      });
    }
  }

  return {
    modality,
    generatedAt: new Date().toISOString(),
    fxOnlineDomestic: FX_ONLINE_DOMESTIC,
    fxCnyPerUsd: FX_CNY_PER_USD,
    officialFetchedAt: official.fetchedAt ?? null,
    pricesFetchedAt: prices.fetchedAt ?? null,
    tokenhubScrapedAt: th.scrapedAt ?? null,
    modelCount: targets.length,
    rowCount: rows.length,
    rows,
  };
}

export function renderCompareMarkdown(report) {
  const label =
    report.modality === "text"
      ? "生文"
      : report.modality === "image"
        ? "生图"
        : "生视频";

  const lines = [
    `# 官方价 vs 上游 vs 线上刊例（${label}）`,
    "",
    `> 生成 ${report.generatedAt.slice(0, 19)}Z · 模型 ${report.modelCount} 个 · 行 ${report.rowCount}（生文按全档位展开）`,
    `> 官方价：\`suppliers/official/output/${report.modality}/vendor-pricing.json\`（${report.officialFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> 线上刊例：\`output/online/prices-api.json\`（${report.pricesFetchedAt?.slice(0, 19) ?? "—"}Z）`,
    `> TokenHub：${report.tokenhubScrapedAt?.slice(0, 19) ?? "—"}Z`,
    `> 国内 CNY→USD（平台线上一致）：÷${report.fxOnlineDomestic} · 粗算参考：÷${report.fxCnyPerUsd}`,
    "",
  ];

  if (report.modality === "text") {
    lines.push(
      "| Trinity ID | 原厂模型 | 档位 | 官方价 | TokenHub | 百炼 | AIGC国内 | AIGC国际 | 线上刊例 | 官方抓取 | 备注 |",
      "|------------|----------|------|--------|----------|------|----------|----------|----------|----------|------|",
    );
    for (const r of report.rows) {
      lines.push(
        `| ${esc(r.trinityId)} | ${esc(r.vendorModelId)} | ${esc(r.tierLabel)} | ${esc(r.official)} | ${esc(r.tokenhub)} | ${esc(r.bailian)} | ${esc(r.aigcDomestic)} | ${esc(r.aigcIntl)} | ${esc(r.online)} | ${esc(r.officialStatus)} | ${esc(r.note)} |`,
      );
    }
  } else {
    lines.push(
      "| Trinity ID | 原厂模型 | 官方价 | TokenHub | 百炼 | AIGC国内 | 线上刊例 | 官方抓取 | 备注 |",
      "|------------|----------|--------|----------|------|----------|----------|----------|------|",
    );
    for (const r of report.rows) {
      lines.push(
        `| ${esc(r.trinityId)} | ${esc(r.vendorModelId)} | ${esc(r.official)} | ${esc(r.tokenhub)} | ${esc(r.bailian)} | ${esc(r.aigcDomestic)} | ${esc(r.online)} | ${esc(r.officialStatus)} | ${esc(r.note)} |`,
      );
    }
  }

  lines.push(
    "",
    "## 说明",
    "",
    "- **官方价**：各模型厂商官网文档权威挂牌价（`official` 供应商）",
    "- **TokenHub / 百炼 / AIGC**：Trinity 转售上游挂牌价",
    "- **线上刊例**：`GET /v1/prices` 当前对用户扣费价（USD）",
    "- **生文多档**：每档单独一行，避免只比第一档造成误判（如 glm-5 输入长度档 vs 总 token 档）",
    "- 国内模型线上 USD ≈ 官方 CNY ÷ 6.5（`gen-65` 规则）",
    "- 官网 vs OpenRouter 对比见 `output/openrouter/text.md`",
    "- 对比前请确保已运行 `pricing:supplier:official:{modality}` 与 `pricing:fetch`",
    "- `官方抓取` 为 `未拉取` 表示 map 有映射但尚未写入 vendor-pricing.json",
    "- 生成命令：`npm run pricing:compare:official -- --modality=" +
      report.modality +
      "`",
  );

  return lines.join("\n");
}

const SHEET_NAMES = { text: "生文", image: "生图", video: "生视频" };

/** @deprecated 使用 officialMasterSheetName（总册 Sheet 名） */
export function officialCompareSheetName(modality) {
  return officialMasterSheetName(modality);
}

export function officialCompareMerge(modality) {
  return modality === "text" ? MERGE_OFFICIAL_TEXT : MERGE_OFFICIAL_MEDIA;
}

/** Excel / CSV 行（列与 Markdown 表一致） */
export function buildOfficialCompareExcelRows(report) {
  if (report.modality === "text") {
    const header = [
      "Trinity ID",
      "原厂模型",
      "档位",
      "官方价",
      "TokenHub",
      "百炼",
      "AIGC国内",
      "AIGC国际",
      "线上刊例",
      "官方抓取",
      "备注",
    ];
    const rows = [];
    let lastId = "";
    for (const r of report.rows) {
      const show = r.trinityId !== lastId;
      lastId = r.trinityId ?? "";
      rows.push([
        show ? (r.trinityId ?? "") : "",
        show ? (r.vendorModelId ?? "") : "",
        r.tierLabel ?? "",
        r.official ?? "",
        r.tokenhub ?? "",
        r.bailian ?? "",
        r.aigcDomestic ?? "",
        r.aigcIntl ?? "",
        r.online ?? "",
        show ? (r.officialStatus ?? "") : "",
        r.note ?? "",
      ]);
    }
    return [header, ...rows];
  }

  const header = [
    "Trinity ID",
    "原厂模型",
    "官方价",
    "TokenHub",
    "百炼",
    "AIGC国内",
    "线上刊例",
    "官方抓取",
    "备注",
  ];
  const rows = [];
  let lastId = "";
  for (const r of report.rows) {
    const show = r.trinityId !== lastId;
    lastId = r.trinityId ?? "";
    rows.push([
      show ? (r.trinityId ?? "") : "",
      show ? (r.vendorModelId ?? "") : "",
      r.official ?? "",
      r.tokenhub ?? "",
      r.bailian ?? "",
      r.aigcDomestic ?? "",
      r.online ?? "",
      show ? (r.officialStatus ?? "") : "",
      r.note ?? "",
    ]);
  }
  return [header, ...rows];
}
