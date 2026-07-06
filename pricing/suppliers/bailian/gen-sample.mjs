#!/usr/bin/env node
/**
 * 从 pricing-api.json 生成示例 Markdown 表格
 * 用法：node scripts/bailian/gen-sample.mjs [--count=10]
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRICING_API_OUT } from "./lib/pricing-api.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "output");

function priceFromTier(t, name) {
  const top = { Input: t.input, Output: t.output, Cache: t.cache }[name];
  if (top != null && top !== "") return top;
  return (t.items ?? []).find((i) => i.name === name)?.price ?? null;
}

const esc = (s) => String(s ?? "—").replace(/\|/g, "\\|");
const fmt = (v) => (v == null || v === "" ? "—" : v);
const yn = (v) => (v ? "是" : "—");

const count = Number(
  process.argv.find((a) => a.startsWith("--count="))?.split("=")[1] ?? "10",
);
const inFile = path.join(OUT_DIR, PRICING_API_OUT);
const outFile = path.join(OUT_DIR, `pricing-sample-${count}.md`);

const data = JSON.parse(await readFile(inFile, "utf8"));

const pool = data.models.filter(
  (m) => m.region === "中国内地" && (m.tiers?.[0]?.chargeUnit ?? "TOKEN") === "TOKEN",
);
const byId = new Map(pool.map((m) => [m.modelId, m]));

/** 打样用：10 个有代表性的中国内地模型 */
const SAMPLE_IDS = [
  "qwen3.7-max",
  "qwen3-max",
  "qwen3.6-max-preview",
  "qwen3.5-plus",
  "qwen-flash",
  "qwen3-coder-plus",
  "deepseek-v3.2",
  "qwen3-vl-plus",
  "qwen-turbo",
  "qwen-long",
];

const models = [];
for (const id of SAMPLE_IDS) {
  if (byId.has(id)) models.push(byId.get(id));
}
if (models.length < count) {
  const seen = new Set(models.map((m) => m.modelId));
  for (const m of pool) {
    if (seen.has(m.modelId)) continue;
    models.push(m);
    seen.add(m.modelId);
    if (models.length >= count) break;
  }
} else {
  models.splice(count);
}

const lines = [
  `# 百炼模型价目表（示例 ${models.length} 条）`,
  "",
  `> 数据来源：\`${PRICING_API_OUT}\` · 抓取时间 ${data.scrapedAt?.slice(0, 10) ?? "—"} · 共 ${data.modelCount} 条目 · 打样 10 个中国内地代表模型`,
  `> 隐式缓存命中 = 输入价 × ${(data.cachePolicy?.hitRatio ?? 0.2) * 100}%`,
  "",
  "| # | 模型 ID | 系列 | 类型 | 地域 | 模式 | 章节 | 隐式缓存 | Batch | 价格档位 | 输入（元/百万 tokens） | 输出（元/百万 tokens） | 缓存（元/百万 tokens） |",
  "|---|---------|------|------|------|------|------|----------|-------|----------|------------------------|------------------------|------------------------|",
];

let rowNum = 0;
for (const m of models) {
  if (!m.tiers?.length) {
    rowNum++;
    lines.push(
      `| ${rowNum} | ${esc(m.modelId)} | ${esc(m.brand)} | ${esc(m.modelType)} | ${esc(m.region)} | ${esc(m.mode)} | ${esc(m.section)} | ${yn(m.supportsCache)} | ${yn(m.supportsBatch)} | — | — | — | — |`,
    );
    continue;
  }

  for (let i = 0; i < m.tiers.length; i++) {
    const t = m.tiers[i];
    rowNum++;
    const showModel = i === 0;
    const tierLabel = t.tierName?.trim() || "统一价";
    lines.push(
      `| ${rowNum} | ${showModel ? esc(m.modelId) : ""} | ${showModel ? esc(m.brand) : ""} | ${showModel ? esc(m.modelType) : ""} | ${showModel ? esc(m.region) : ""} | ${showModel ? esc(m.mode) : ""} | ${showModel ? esc(m.section) : ""} | ${showModel ? yn(m.supportsCache) : ""} | ${showModel ? yn(m.supportsBatch) : ""} | ${esc(tierLabel)} | ${fmt(priceFromTier(t, "Input"))} | ${fmt(priceFromTier(t, "Output"))} | ${fmt(priceFromTier(t, "Cache"))} |`,
    );
  }
}

lines.push(
  "",
  "## 模型汇总（每模型一行）",
  "",
  "| 模型 ID | 系列 | 模式 | 隐式缓存 | Batch | 免费额度 | 等效说明 | 档位数 |",
  "|---------|------|------|----------|-------|----------|----------|--------|",
);
for (const m of models) {
  lines.push(
    `| ${esc(m.modelId)} | ${esc(m.brand)} | ${esc(m.mode)} | ${yn(m.supportsCache)} | ${yn(m.supportsBatch)} | ${fmt(m.freeQuota)} | ${fmt(m.equivalenceNote)} | ${m.tiers?.length ?? 0} |`,
  );
}

lines.push(
  "",
  "## 说明",
  "",
  "- 价格单位：**元 / 百万 tokens**（图像/语音等见 JSON `chargeUnit`）",
  `- **缓存价**按百炼 Context Cache 分模型比例（默认 input×20%，见 \`lib/cache-policy.mjs\`）`,
  "- 阶梯计价：单次请求输入 Token 总量决定整单适用档位",
  "- 分段模型按档位分行；同一模型后续行留空模型信息列",
  `- 完整 ${data.modelCount} 条目见 \`${PRICING_API_OUT}\``,
  "",
);

await writeFile(outFile, lines.join("\n"), "utf8");
console.log(`已写入 ${outFile}（${rowNum} 行价格，${models.length} 个模型）`);
