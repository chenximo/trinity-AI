#!/usr/bin/env node
/**
 * 对比线上刊例 prices-api.json vs 爬虫官网换算 0.725_prices-api.json
 *
 *   npm run compare:diff-prices
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  comparePriceEntries,
  summarizeDiffs,
  fmtUsd,
  fmtPct,
} from "./lib/pricing-diff.mjs";
import { writeCsv } from "./lib/export-excel.mjs";

import {
  OUT_DRAFT_DIR,
  PRICES_API_FILE,
  UPSTREAM_PRICING_FILE,
  DRAFT_065_FILE,
  DRAFT_065_DIFF_MD,
  DRAFT_065_DIFF_JSON,
  DRAFT_065_DIFF_CSV,
  resolveOutPath,
} from "./lib/paths.mjs";

const ONLINE_FILE = PRICES_API_FILE;
const DEFAULT_SCRAPED_FILE = DRAFT_065_FILE;
const UPSTREAM_FILE = UPSTREAM_PRICING_FILE;

function parseArgs() {
  const args = process.argv.slice(2);
  let scrapedFile = DEFAULT_SCRAPED_FILE;
  let outMd = DRAFT_065_DIFF_MD;
  let outJson = DRAFT_065_DIFF_JSON;
  let outCsv = DRAFT_065_DIFF_CSV;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--scraped" && args[i + 1]) {
      scrapedFile = resolveOutPath(args[++i]);
      const base = path.join(
        OUT_DRAFT_DIR,
        path.basename(scrapedFile, ".json") + "-diff",
      );
      outMd = `${base}.md`;
      outJson = `${base}.json`;
      outCsv = `${base}.csv`;
    }
  }
  return { scrapedFile, outMd, outJson, outCsv };
}

function renderMd(doc) {
  const s = doc.summary;
  const fx = doc.fxCnyPerUsd ?? 7.25;
  const scrapedName = path.basename(doc.scrapedFile);
  const lines = [
    `# 线上刊例 vs 爬虫换算价（÷${fx}）差异`,
    "",
    `> 线上：\`prices-api.json\`（${doc.onlineFetchedAt ?? "—"}）`,
    `> 爬虫换算：\`${scrapedName}\`（${doc.scrapedGeneratedAt ?? "—"}${doc.scrapedPolicy ? ` · ${doc.scrapedPolicy}` : ""}）`,
    `> 上游汇总：\`upstream-pricing.json\`（${doc.upstreamScrapedAt ?? "—"}）`,
    `> 汇率：**1 USD = ${fx} CNY**（CNY 官网 ÷ ${fx}；见 \`${scrapedName}\` 内 \`fxCnyPerUsd\`）`,
    "",
    "## 汇总",
    "",
    `| 指标 | 数量 |`,
    `|------|------|`,
    `| 生文模型总数 | ${s.total} |`,
    `| 有爬虫官网价 | ${s.withScrape} |`,
    `| 无爬虫官网价 | ${s.withoutScrape} |`,
    `| 主档 **一致**（入/出/缓） | ${s.match} |`,
    `| 主档 **接近**（≤0.5%） | ${s.close} |`,
    `| 主档 **偏差** | ${s.diff} |`,
    "",
    "## 全量主档对比",
    "",
    "| Trinity ID | 显示名 | 上游来源 | 判定 | 线上入 | 爬虫入 | 入Δ% | 线上出 | 爬虫出 | 出Δ% | 线上缓 | 爬虫缓 | 缓Δ% |",
    "|------------|--------|----------|------|--------|--------|------|--------|--------|------|--------|--------|------|",
  ];

  for (const r of doc.rows) {
    const t = r.tiers[0];
    const f = Object.fromEntries(t.fields.map((x) => [x.key, x]));
    const src = r.hasScrapedUpstream ? (r.scrapeSource ?? "—") : "无爬虫";
    lines.push(
      `| ${r.model} | ${r.displayName} | ${src} | ${r.primaryVerdict} | ` +
        `${fmtUsd(f.input?.online)} | ${fmtUsd(f.input?.scraped)} | ${fmtPct(f.input?.deltaPct)} | ` +
        `${fmtUsd(f.output?.online)} | ${fmtUsd(f.output?.scraped)} | ${fmtPct(f.output?.deltaPct)} | ` +
        `${fmtUsd(f.cache?.online)} | ${fmtUsd(f.cache?.scraped)} | ${fmtPct(f.cache?.deltaPct)} |`,
    );
  }

  const diffs = doc.rows.filter(
    (r) => r.hasScrapedUpstream && r.primaryVerdict === "偏差",
  );
  if (diffs.length) {
    lines.push("", "## 偏差明细（主档）", "");
    for (const r of diffs) {
      const t = r.tiers[0];
      lines.push(`### ${r.model}（${r.displayName}）· ${r.scrapeSource}`);
      lines.push("");
      for (const f of t.fields) {
        if (f.status === "无" || f.status === "一致") continue;
        lines.push(
          `- **${f.key}**：线上 ${fmtUsd(f.online)} · 爬虫 ${fmtUsd(f.scraped)} · Δ ${fmtPct(f.deltaPct)} · ${f.status}`,
        );
      }
      lines.push("");
    }
  }

  const tiered = doc.rows.filter((r) => r.tierCount > 1 && r.hasScrapedUpstream);
  if (tiered.length) {
    lines.push("", "## 阶梯模型（多档）", "");
    for (const r of tiered) {
      lines.push(`### ${r.model}（${r.displayName}）`);
      lines.push("");
      lines.push(
        "| 档位 | 判定 | 线上入/出/缓 | 爬虫入/出/缓 | 入Δ% | 出Δ% | 缓Δ% |",
        "|------|------|--------------|--------------|------|------|------|",
      );
      for (const t of r.tiers) {
        const f = Object.fromEntries(t.fields.map((x) => [x.key, x]));
        const onTriple = `${fmtUsd(f.input?.online)}/${fmtUsd(f.output?.online)}/${fmtUsd(f.cache?.online)}`;
        const scTriple = `${fmtUsd(f.input?.scraped)}/${fmtUsd(f.output?.scraped)}/${fmtUsd(f.cache?.scraped)}`;
        lines.push(
          `| ${t.tierLabel} | ${t.verdict} | ${onTriple} | ${scTriple} | ${fmtPct(f.input?.deltaPct)} | ${fmtPct(f.output?.deltaPct)} | ${fmtPct(f.cache?.deltaPct)} |`,
        );
      }
      lines.push("");
    }
  }

  lines.push(
    "## 说明",
    "",
    "- **线上**：`GET /v1/prices` 平台刊例（扣费价）。",
    `- **爬虫侧**：\`${scrapedName}\`；CNY 官网价 ÷ **${fx}** 得 USD（AIGC 国际为 USD 直用；0.65 优化版另有入/出国际站规则）。`,
    "- **无爬虫**：upstream 汇总无官网价，爬虫文件中未改写，不参与偏差统计。",
    "- **一致**：绝对差 < 0.000001；**接近**：相对差 ≤ 0.5%；其余为 **偏差**。",
    "",
  );
  return lines.join("\n");
}

function buildCsvRows(rows) {
  const header = [
    "Trinity ID",
    "显示名",
    "有爬虫",
    "上游来源",
    "计价模式",
    "档位",
    "判定",
    "线_入(USD/M)",
    "爬_入(USD/M)",
    "入Δ%",
    "线_出(USD/M)",
    "爬_出(USD/M)",
    "出Δ%",
    "线_缓(USD/M)",
    "爬_缓(USD/M)",
    "缓Δ%",
  ];
  const body = [];
  for (const r of rows) {
    for (const t of r.tiers) {
      const f = Object.fromEntries(t.fields.map((x) => [x.key, x]));
      body.push([
        r.model,
        r.displayName,
        r.hasScrapedUpstream ? "是" : "否",
        r.scrapeSource ?? "",
        r.pricingMode,
        t.tierLabel,
        t.verdict,
        f.input?.online ?? "",
        f.input?.scraped ?? "",
        f.input?.deltaPct ?? "",
        f.output?.online ?? "",
        f.output?.scraped ?? "",
        f.output?.deltaPct ?? "",
        f.cache?.online ?? "",
        f.cache?.scraped ?? "",
        f.cache?.deltaPct ?? "",
      ]);
    }
  }
  return [header, ...body];
}

async function readJsonIfExists(p) {
  try {
    return await readFile(p, "utf8").then(JSON.parse);
  } catch {
    return null;
  }
}

async function main() {
  const { scrapedFile, outMd, outJson, outCsv } = parseArgs();

  const metaFile = scrapedFile.replace(/\.json$/i, ".meta.json");
  const [onlineDoc, scrapedDoc, upstreamDoc, scrapedMeta] = await Promise.all([
    readFile(ONLINE_FILE, "utf8").then(JSON.parse),
    readFile(scrapedFile, "utf8").then(JSON.parse),
    readFile(UPSTREAM_FILE, "utf8").then(JSON.parse),
    readJsonIfExists(metaFile),
  ]);

  const upstreamById = new Map(
    (upstreamDoc.models ?? []).map((m) => [m.trinityId.toLowerCase(), m]),
  );
  const scrapedById = new Map(
    (scrapedDoc.data ?? []).map((e) => [e.model.toLowerCase(), e]),
  );

  const rows = [];
  for (const onlineEntry of onlineDoc.data ?? []) {
    const id = onlineEntry.model.toLowerCase();
    const scrapedEntry = scrapedById.get(id);
    if (!scrapedEntry) continue;
    rows.push(
      comparePriceEntries(
        onlineEntry,
        scrapedEntry,
        upstreamById.get(id),
      ),
    );
  }

  const summary = summarizeDiffs(rows);
  const out = {
    generatedAt: new Date().toISOString(),
    scrapedFile: path.basename(scrapedFile),
    onlineFetchedAt: onlineDoc.fetchedAt,
    scrapedGeneratedAt:
      scrapedDoc.fetchedAt ?? scrapedMeta?.generatedAt ?? scrapedDoc.generatedAt,
    scrapedPolicy:
      scrapedMeta?.pricingPolicy ?? scrapedDoc.pricingPolicy ?? null,
    upstreamScrapedAt: upstreamDoc.scrapedAt,
    fxCnyPerUsd: scrapedDoc.fxCnyPerUsd ?? 7.25,
    summary,
    rows,
  };

  await mkdir(OUT_DRAFT_DIR, { recursive: true });
  await writeFile(outJson, JSON.stringify(out, null, 2), "utf8");
  await writeFile(outMd, renderMd(out), "utf8");
  await writeCsv(outCsv, buildCsvRows(rows), writeFile);

  console.log(renderMd(out));
  console.log(`\nWrote ${outMd}`);
  console.log(`Wrote ${outJson}`);
  console.log(`Wrote ${outCsv}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
