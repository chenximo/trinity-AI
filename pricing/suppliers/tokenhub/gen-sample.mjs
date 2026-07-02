#!/usr/bin/env node
/**
 * 从 pricing-console-api.json 生成 Markdown 价目表
 *
 * 用法：
 *   node pricing/suppliers/tokenhub/gen-sample.mjs           # 全量 → pricing-table.md
 *   node pricing/suppliers/tokenhub/gen-sample.mjs --count=10  # 打样 → pricing-sample-10.md
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONSOLE_API_OUT } from "./lib/pricing-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");

function priceFromTier(t, name) {
  const top = { Input: t.input, Output: t.output, Cache: t.cache }[name];
  if (top != null && top !== "") return top;
  return (t.items ?? []).find((i) => i.name === name)?.price ?? null;
}

const esc = (s) => String(s ?? "—").replace(/\|/g, "\\|");
const fmt = (v) => (v == null || v === "" ? "—" : v);
const short = (s, n = 36) => {
  if (!s) return "—";
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};
const ioTypes = (m) => {
  const io = m.inputOutputTypes ?? {};
  const input = (io.input ?? []).join("、") || "—";
  const output = (io.output ?? []).join("、") || "—";
  return { input, output };
};

const countArg = process.argv.find((a) => a.startsWith("--count="))?.split("=")[1];
const isSample = countArg != null;

const inFile = path.join(OUT_DIR, CONSOLE_API_OUT);
const data = JSON.parse(await readFile(inFile, "utf8"));
const allModels = data.models ?? [];
const models = isSample
  ? allModels.slice(0, Number(countArg))
  : allModels;

const outFile = isSample
  ? path.join(OUT_DIR, `pricing-sample-${countArg}.md`)
  : path.join(OUT_DIR, "pricing-table.md");

const tierRowCount = models.reduce(
  (n, m) => n + (m.tiers?.length ? m.tiers.length : 1),
  0,
);

const lines = [
  isSample
    ? `# TokenHub 模型价目表（示例 ${countArg} 条）`
    : `# TokenHub 模型价目表（全量）`,
  "",
  isSample
    ? `> 数据来源：\`${CONSOLE_API_OUT}\` · 抓取时间 ${data.scrapedAt?.slice(0, 10) ?? "—"} · 共 ${data.modelCount} 模型，此处展示前 ${models.length} 个`
    : `> 数据来源：\`${CONSOLE_API_OUT}\` · 抓取时间 ${data.scrapedAt?.slice(0, 10) ?? "—"} · 共 ${data.modelCount} 模型 · ${data.pricingTierCount ?? tierRowCount} 价格档位`,
  "",
  "| # | 模型 ID | 显示名 | 厂商 | 类型 | 标签 | 模型能力 | 输入类型 | 输出类型 | 最大输入 | 最大输出 | 上下文 | TPM | QPM | 价格档位 | 输入价 | 输出价 | 缓存价 |",
  "|---|---------|--------|------|------|------|----------|----------|----------|----------|----------|--------|-----|-----|----------|--------|--------|--------|",
];

let rowNum = 0;
for (const m of models) {
  const lim = m.limits ?? {};
  const tags = (m.tags ?? []).join("、") || "—";
  const { input, output } = ioTypes(m);

  if (!m.tiers?.length) {
    rowNum++;
    lines.push(
      `| ${rowNum} | ${esc(m.modelId)} | ${esc(m.displayName)} | ${esc(m.brand)} | ${esc(m.modelType)} | ${esc(tags)} | ${esc(short(m.capability))} | ${esc(input)} | ${esc(output)} | ${fmt(lim.maxInputTokens)} | ${fmt(lim.maxOutputTokens)} | ${fmt(lim.contextWindow)} | ${fmt(lim.maxTpm)} | ${fmt(lim.maxQpm)} | — | — | — | — |`,
    );
    continue;
  }

  for (let i = 0; i < m.tiers.length; i++) {
    const t = m.tiers[i];
    rowNum++;
    const showModel = i === 0;
    const tierLabel = t.tierName?.trim() || "统一价";
    lines.push(
      `| ${rowNum} | ${showModel ? esc(m.modelId) : ""} | ${showModel ? esc(m.displayName) : ""} | ${showModel ? esc(m.brand) : ""} | ${showModel ? esc(m.modelType) : ""} | ${showModel ? esc(tags) : ""} | ${showModel ? esc(short(m.capability)) : ""} | ${showModel ? esc(input) : ""} | ${showModel ? esc(output) : ""} | ${showModel ? fmt(lim.maxInputTokens) : ""} | ${showModel ? fmt(lim.maxOutputTokens) : ""} | ${showModel ? fmt(lim.contextWindow) : ""} | ${showModel ? fmt(lim.maxTpm) : ""} | ${showModel ? fmt(lim.maxQpm) : ""} | ${esc(tierLabel)} | ${fmt(priceFromTier(t, "Input"))} | ${fmt(priceFromTier(t, "Output"))} | ${fmt(priceFromTier(t, "Cache"))} |`,
    );
  }
}

lines.push(
  "",
  "## 模型能力与输入输出（完整）",
  "",
  "| 模型 ID | 模型能力（Summary） | 输入类型 | 输出类型 |",
  "|---------|---------------------|----------|----------|",
);
for (const m of models) {
  const { input, output } = ioTypes(m);
  lines.push(
    `| ${esc(m.modelId)} | ${esc(m.capability)} | ${esc(input)} | ${esc(output)} |`,
  );
}

lines.push(
  "",
  "## 模型限制汇总",
  "",
  "| 模型 ID | 最大输入 Tokens | 最大输出 Tokens | 上下文窗口 | 最大 TPM | 最大 QPM | 并发 |",
  "|---------|-----------------|-----------------|------------|----------|----------|------|",
);
for (const m of models) {
  const lim = m.limits ?? {};
  lines.push(
    `| ${esc(m.modelId)} | ${fmt(lim.maxInputTokens)} | ${fmt(lim.maxOutputTokens)} | ${fmt(lim.contextWindow)} | ${fmt(lim.maxTpm)} | ${fmt(lim.maxQpm)} | ${fmt(lim.concurrency)} |`,
  );
}

lines.push(
  "",
  "## 说明",
  "",
  "- 价格单位：**元 / 百万 tokens**（积分/次计费的模型见 JSON `tiers`）",
  "- **模型能力** = API 字段 `Summary`；**标签** = `Tags`",
  "- **输入/输出类型**：列表 API 无独立字段，按 `ModelType` + `Tags` + 计费单位推断（`inputOutputTypes.source: inferred`）",
  "- **最大 TPM** 为数值（`1000000` = 控制台 `1000k`）",
  "- 分段计价模型按档位分行；同一模型后续行留空模型信息列",
  `- 机器可读全量见 \`${CONSOLE_API_OUT}\``,
  "",
);

await writeFile(outFile, lines.join("\n"), "utf8");
console.log(
  `已写入 ${outFile}（${rowNum} 行价格，${models.length} 个模型）`,
);
