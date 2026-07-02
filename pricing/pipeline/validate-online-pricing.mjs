#!/usr/bin/env node
/**
 * 校验 Trinity 线上价（GET /v1/prices）vs 上游爬虫价 / 摘要刊例
 *
 *   node pricing/pipeline/validate-online-pricing.mjs
 *   node pricing/pipeline/validate-online-pricing.mjs deepseek-v3.2 qwen3.5-plus gpt-4o
 *   FX_CNY_PER_USD=7.25 node pricing/pipeline/validate-online-pricing.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parseOnlinePricesPrimary } from "./lib/parse-online-prices.mjs";
import {
  UPSTREAM_PRICING_FILE,
  VALIDATE_SAMPLE_MD,
  VALIDATE_SAMPLE_JSON,
  OUT_VALIDATE_DIR,
} from "./lib/paths.mjs";

const UPSTREAM_FILE = UPSTREAM_PRICING_FILE;
const DEFAULT_BASE = "https://api.trinitydesk.ai/v1";
const DEFAULT_MODELS = ["deepseek-v3.2", "qwen3.5-plus", "gpt-4o"];

/** 1 USD = ? CNY；平台线上约 7.25 */
const FX_CNY_PER_USD = Number(process.env.FX_CNY_PER_USD || "7.25");

function num(v) {
  if (v == null || v === "" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function cnyToUsd(cny) {
  const n = num(cny);
  if (n == null || !FX_CNY_PER_USD) return null;
  return n / FX_CNY_PER_USD;
}

function pctDiff(online, ref) {
  const a = num(online);
  const b = num(ref);
  if (a == null || b == null || b === 0) return null;
  return Math.round(((a - b) / b) * 1000) / 10;
}

function fmt(n, digits = 4) {
  if (n == null) return "—";
  return String(Math.round(n * 10 ** digits) / 10 ** digits);
}

/** @deprecated use parseOnlinePricesPrimary from lib */
export function parseOnlinePrices(entry) {
  return parseOnlinePricesPrimary(entry);
}

function primaryUpstreamTier(tiers) {
  const priced = (tiers ?? []).filter(
    (t) =>
      t.thIn != null ||
      t.thOut != null ||
      t.blIn != null ||
      t.blOut != null ||
      t.aigcDomIn != null ||
      t.aigcDomOut != null ||
      t.aigcIntlIn != null ||
      t.aigcIntlOut != null,
  );
  return priced[0] ?? tiers?.[0] ?? null;
}

function buildSupplierRefs(tier) {
  if (!tier) return [];
  const refs = [];
  const push = (name, currency, input, output, cache) => {
    if (input == null && output == null) return;
    refs.push({
      name,
      currency,
      input: num(input),
      output: num(output),
      cache: num(cache),
      inputUsd:
        currency === "CNY" ? cnyToUsd(input) : num(input),
      outputUsd:
        currency === "CNY" ? cnyToUsd(output) : num(output),
      cacheUsd:
        currency === "CNY" ? cnyToUsd(cache) : num(cache),
    });
  };
  push("TokenHub", "CNY", tier.thIn, tier.thOut, tier.thCache);
  push("百炼", "CNY", tier.blIn, tier.blOut, tier.blCache);
  push("AIGC国内", "CNY", tier.aigcDomIn, tier.aigcDomOut, tier.aigcDomCache);
  push("AIGC国际", "USD", tier.aigcIntlIn, tier.aigcIntlOut, tier.aigcIntlCache);
  return refs;
}

function compareField(online, refUsd, label) {
  const delta = pctDiff(online, refUsd);
  if (online == null || refUsd == null) return { label, status: "无数据" };
  const abs = Math.abs(online - refUsd);
  const ok = abs < 0.0001;
  const warn = delta != null && Math.abs(delta) <= 5;
  return {
    label,
    online: fmt(online),
    refUsd: fmt(refUsd),
    deltaPct: delta != null ? `${delta > 0 ? "+" : ""}${delta}%` : "—",
    status: ok ? "一致" : warn ? "接近" : "偏差",
  };
}

async function fetchPrices(base, modelIds) {
  const headers = { Accept: "application/json" };
  const key = process.env.TRINITY_API_KEY;
  if (key) headers.Authorization = `Bearer ${key}`;

  if (modelIds.length === 1) {
    const res = await fetch(
      `${base}/prices?model=${encodeURIComponent(modelIds[0])}&modality=text`,
      { headers },
    );
    if (!res.ok) throw new Error(`prices ${modelIds[0]}: HTTP ${res.status}`);
    return [await res.json()];
  }

  const res = await fetch(`${base}/prices?modality=text`, { headers });
  if (!res.ok) throw new Error(`prices list: HTTP ${res.status}`);
  const body = await res.json();
  const map = new Map((body.data ?? []).map((e) => [e.model, e]));
  return modelIds.map((id) => {
    const e = map.get(id);
    if (!e) throw new Error(`prices: model not found ${id}`);
    return e;
  });
}

function renderReport(rows, meta) {
  const lines = [
    "# Trinity 线上价校验（样例）",
    "",
    `> 线上价：\`GET /v1/prices\`（${meta.fetchedAt}）`,
    `> 上游价：\`upstream-pricing.json\`（${meta.scrapedAt}）`,
    `> CNY→USD：÷ **${FX_CNY_PER_USD}**（1 USD = ${FX_CNY_PER_USD} CNY，可用环境变量 \`FX_CNY_PER_USD\` 调整）`,
    `> 模型：${meta.modelIds.join(" · ")}`,
    "",
  ];

  for (const r of rows) {
    lines.push(`## ${r.modelId}（${r.displayName}）`);
    lines.push("");
    lines.push(`- 档位：**${r.tierLabel}** · 计价模式：\`${r.pricingMode}\``);
    lines.push(
      `- **线上 /v1/prices（USD/M）**：入 ${fmt(r.online.input)} · 出 ${fmt(r.online.output)} · 缓 ${fmt(r.online.cache)}`,
    );
    if (r.summaryList) {
      lines.push(
        `- **摘要刊例（USD/M）**：入 ${fmt(r.summaryList.input)} · 出 ${fmt(r.summaryList.output)} · 缓 ${fmt(r.summaryList.cache)} · 与线上一致：${r.listMatch}`,
      );
    }
    lines.push("");
    lines.push("### 上游官网 → 换算 USD 后 vs 线上");
    lines.push("");
    lines.push(
      "| 上游 | 币种 | 官网入/出/缓 | 换算入(USD) | 换算出(USD) | 入Δ% | 出Δ% | 判定 |",
      "|------|------|--------------|-------------|-------------|------|------|------|",
    );

    for (const s of r.suppliers) {
      const inCmp = compareField(r.online.input, s.inputUsd, "入");
      const outCmp = compareField(r.online.output, s.outputUsd, "出");
      const verdict =
        inCmp.status === "一致" && outCmp.status === "一致"
          ? "✅"
          : inCmp.status === "无数据"
            ? "—"
            : inCmp.status === "接近" && outCmp.status === "接近"
              ? "≈"
              : "⚠️";
      lines.push(
        `| ${s.name} | ${s.currency} | ${fmt(s.input)}/${fmt(s.output)}/${fmt(s.cache)} | ${fmt(s.inputUsd)} | ${fmt(s.outputUsd)} | ${inCmp.deltaPct} | ${outCmp.deltaPct} | ${verdict} |`,
      );
    }

    lines.push("");
    if (r.notes?.length) {
      for (const n of r.notes) lines.push(`- ${n}`);
      lines.push("");
    }
  }

  lines.push("## 说明", "");
  lines.push(
    "- **线上价**为平台对用户价目（`GET /v1/prices`），与扣费一致。",
    "- **上游人民币**经 `÷ FX_CNY_PER_USD` 换算后与线上 USD **仅作粗算**，不代表官方定价公式。",
    "- 阶梯模型仅比**主档位**；完整档位见各 supplier 表。",
    "- `入Δ%` = (线上 − 换算上游) / 换算上游。",
    "",
  );
  return lines.join("\n");
}

async function main() {
  const modelIds = process.argv.slice(2).length
    ? process.argv.slice(2)
    : DEFAULT_MODELS;
  const base = (process.env.TRINITY_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");

  const upstream = JSON.parse(await readFile(UPSTREAM_FILE, "utf8"));
  const byId = new Map(upstream.models.map((m) => [m.trinityId, m]));

  const onlineEntries = await fetchPrices(base, modelIds);
  const rows = [];

  for (const entry of onlineEntries) {
    const id = entry.model;
    const up = byId.get(id);
    if (!up) {
      console.warn(`Skip ${id}: not in upstream-pricing.json`);
      continue;
    }

    const online = parseOnlinePricesPrimary(entry);
    const tier = primaryUpstreamTier(up.tiers);
    const suppliers = buildSupplierRefs(tier);
    const summaryList = {
      input: num(up.userPriceUsd?.input),
      output: num(up.userPriceUsd?.output),
      cache: num(up.userPriceUsd?.cache),
    };
    const matchField = (a, b) =>
      a != null && Math.abs(a - (b ?? NaN)) < 0.0001;
    const listMatch =
      matchField(summaryList.input, online.input) &&
      matchField(summaryList.output, online.output) &&
      (summaryList.cache == null ||
        online.cache == null ||
        matchField(summaryList.cache, online.cache))
        ? "是"
        : "否（请重跑 compare:fetch-prices + compare:pricing）";

    const notes = [];
    if (id === "deepseek-v3.2") {
      notes.push("三上游 TH/BL/AIGC国内 官网 CNY 一致；线上 USD 约为 2÷7.25≈0.28");
    }
    if (id === "qwen3.5-plus") {
      notes.push("主档 ≤128k；百炼缓存价高于 TH/AIGC国内");
    }
    if (id === "gpt-4o") {
      notes.push("TH/BL 无官网；仅 AIGC 有挂牌");
    }

    rows.push({
      modelId: id,
      displayName: up.displayName,
      tierLabel: tier?.tierLabel ?? online.tierLabel,
      pricingMode: online.pricingMode,
      online,
      summaryList,
      listMatch,
      suppliers,
      notes,
    });
  }

  const md = renderReport(rows, {
    fetchedAt: new Date().toISOString().slice(0, 19) + "Z",
    scrapedAt: upstream.scrapedAt ?? "—",
    modelIds,
  });

  await mkdir(OUT_VALIDATE_DIR, { recursive: true });
  await writeFile(VALIDATE_SAMPLE_MD, md, "utf8");
  await writeFile(
    VALIDATE_SAMPLE_JSON,
    JSON.stringify({ fxCnyPerUsd: FX_CNY_PER_USD, rows }, null, 2),
    "utf8",
  );

  console.log(md);
  console.log(`\nWrote ${VALIDATE_SAMPLE_MD}`);
  console.log(`Wrote ${VALIDATE_SAMPLE_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
