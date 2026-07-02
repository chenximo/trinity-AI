#!/usr/bin/env node
/**
 * 从 vendor-pricing.json 生成 Markdown 价目表（按模态）
 *
 *   node gen-table.mjs --modality=text
 *   node gen-table.mjs --modality=all
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODALITIES, MODALITY_META, VENDOR_PRICING_OUT } from "./lib/modality.mjs";
import { isModality } from "./lib/modality.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.join(__dirname, "output");

const esc = (s) => String(s ?? "—").replace(/\|/g, "\\|");
const fmt = (v) => (v == null || v === "" ? "—" : v);

/** @param {string[]} argv */
function parseArgs(argv) {
  let modality = "text";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--modality=")) modality = arg.slice("--modality=".length);
    else if (arg === "--modality") modality = argv[++i] ?? "text";
  }
  return { modality };
}

/** @param {import("./lib/modality.mjs").Modality} modality */
async function genTable(modality) {
  const inFile = path.join(OUT_ROOT, modality, VENDOR_PRICING_OUT);
  const data = JSON.parse(await readFile(inFile, "utf8"));
  const label = MODALITY_META[modality].label;

  const lines = [
    `# 模型原厂权威价目（${label}）`,
    "",
    `> 真源：\`output/${modality}/${VENDOR_PRICING_OUT}\` · 抓取 ${data.fetchedAt?.slice(0, 19) ?? "—"}Z · live ${data.liveCount ?? "—"} · seed ${data.seedCount ?? "—"} / ${data.modelCount}` +
      (data.pricingTierCount != null
        ? ` · **${data.pricingTierCount} 档**`
        : ""),
    `> 单位：**${data.unit ?? "—"}**`,
    "",
  ];

  if (modality === "text") {
    lines.push(
      "| # | 厂商 | 原厂模型 ID | 币种 | 状态 | 抓取 | 档位 | 输入价 | 输出价 | 缓存价 | 价目来源 | 文档 |",
      "|---|------|-------------|------|------|------|------|--------|--------|--------|----------|------|",
    );
    data.models.forEach((m, i) => {
      const doc = m.docUrl ? `[链接](${m.docUrl})` : "—";
      const priceSrc = m.prices
        ? m.priceSource
          ? `[来源](${m.priceSource})`
          : "—"
        : esc(m.fetchError);
      const tiers = m.tiers?.length
        ? m.tiers
        : [{ tierLabel: "—", input: null, output: null, cache: null }];
      tiers.forEach((tier, j) => {
        lines.push(
          `| ${j === 0 ? i + 1 : ""} | ${j === 0 ? esc(m.vendorLabel) : ""} | ${j === 0 ? esc(m.vendorModelId) : ""} | ${j === 0 ? esc(m.currency) : ""} | ${j === 0 ? esc(m.status) : ""} | ${j === 0 ? esc(m.fetchStatus) : ""} | ${esc(tier.tierLabel)} | ${fmt(tier.input)} | ${fmt(tier.output)} | ${fmt(tier.cache)} | ${j === 0 ? priceSrc : ""} | ${j === 0 ? doc : ""} |`,
        );
      });
    });
  } else {
    lines.push(
      "| # | 厂商 | 原厂模型 ID | 状态 | 抓取 | 档位 | 价格 | 单位 | 价目来源 | 文档 |",
      "|---|------|-------------|------|------|------|------|------|----------|------|",
    );
    data.models.forEach((m, i) => {
      const doc = m.docUrl ? `[链接](${m.docUrl})` : "—";
      const priceSrc = m.prices ? (m.priceSource ? `[来源](${m.priceSource})` : "—") : esc(m.fetchError);
      const tiers = m.tiers?.length ? m.tiers : [{ tierLabel: "—", price: "—", unit: "—" }];
      tiers.forEach((tier, j) => {
        lines.push(
          `| ${j === 0 ? i + 1 : ""} | ${j === 0 ? esc(m.vendorLabel) : ""} | ${j === 0 ? esc(m.vendorModelId) : ""} | ${j === 0 ? esc(m.status) : ""} | ${j === 0 ? esc(m.fetchStatus) : ""} | ${esc(tier.tierLabel)} | ${fmt(tier.price)} | ${esc(tier.unit)} | ${j === 0 ? priceSrc : ""} | ${j === 0 ? doc : ""} |`,
        );
      });
    });
  }

  lines.push(
    "",
    "## 说明",
    "",
    `- **目录真源**：\`data/catalog/${modality}.mjs\``,
    `- **价目真源**：\`output/${modality}/${VENDOR_PRICING_OUT}\``,
    `- **种子备用**：\`data/seeds/${modality}.mjs\`（\`fetchStatus: seed\`）`,
    "- **上线真源**：`vendor-pricing.json` 内 `models[].tiers[]` 为完整阶梯价（单档模型也占 1 档）",
    "- `fetchStatus: ok` = 官网 live 解析成功；`seed` = 对照官网维护的种子价",
    "",
  );

  const outFile = path.join(OUT_ROOT, modality, "vendor-pricing-table.md");
  await writeFile(outFile, lines.join("\n"), "utf8");
  console.log(`已写入 ${outFile}`);
}

const { modality } = parseArgs(process.argv.slice(2));

if (modality === "all") {
  for (const m of MODALITIES) await genTable(m);
} else if (!isModality(modality)) {
  console.error(`无效 --modality=${modality}`);
  process.exit(1);
} else {
  await genTable(modality);
}
