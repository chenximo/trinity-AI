/**
 * 上游全量模型 · 接入覆盖盘点
 *
 * 产品口径：每家上游展示其抓取到的**全部**模型（不按 Trinity 裁剪）；
 * Trinity 已接入（同模态出现在 GET /v1/prices）→「接入」列标 `-`；
 * 未接入留空，便于长期扫可接清单。
 *
 *   node pricing/pipeline/gen-upstream-access-coverage.mjs
 *   npm run pricing:upstream:access
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readOnlinePricesCache } from "./lib/fetch-online-prices-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "output/upstream-access");

/** 已接入标记（产品：已接用 `-`） */
export const ACCESS_MARK = "-";

/**
 * @typedef {{
 *   key: string,
 *   title: string,
 *   modality: "text" | "image" | "video" | "mixed",
 *   jsonPath: string,
 *   pick: (raw: any) => Array<{ id: string, name?: string, brand?: string, modality?: string }>,
 * }} UpstreamSource
 */

/** @type {UpstreamSource[]} */
const SOURCES = [
  {
    key: "tokenhub",
    title: "腾讯云 TokenHub",
    modality: "text",
    jsonPath: "suppliers/tokenhub/output/pricing-console-api.json",
    pick: (raw) =>
      (raw.models ?? [])
        .filter((m) => String(m.modelType ?? m.modality ?? "Text").toLowerCase().includes("text") || !m.modelType)
        .map((m) => ({
          id: m.modelId,
          name: m.displayName || m.modelName,
          brand: m.brand,
          modality: "text",
        })),
  },
  {
    key: "bailian",
    title: "阿里云百炼 · 中国内地",
    modality: "text",
    jsonPath: "suppliers/bailian/output/pricing-api.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.id,
        name: m.displayName || m.modelName || m.name,
        brand: m.brand || m.vendor,
        modality: "text",
      })),
  },
  {
    key: "bailian-intl",
    title: "阿里云百炼 · 国际",
    modality: "text",
    jsonPath: "suppliers/bailian-intl/output/pricing-api.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.id,
        name: m.displayName || m.modelName || m.name,
        brand: m.brand || m.vendor,
        modality: "text",
      })),
  },
  {
    key: "aigc-text",
    title: "腾讯云 AIGC · 生文",
    modality: "text",
    jsonPath: "suppliers/aigc/output/pricing-api.json",
    pick: (raw) =>
      (raw.models ?? [])
        .filter((m) => (m.modality ?? "text") === "text" || !m.modality)
        .map((m) => ({
          id: m.modelId || m.trinityId || m.id,
          trinityId: m.trinityId || null,
          name: m.displayName || m.modelName,
          brand: m.brand,
          modality: "text",
        })),
  },
  {
    key: "aigc-image",
    title: "腾讯云 AIGC · 生图",
    modality: "image",
    jsonPath: "suppliers/aigc/output/pricing-api-image.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.trinityId || m.id,
        trinityId: m.trinityId || null,
        name: m.displayName || m.modelName,
        brand: m.brand,
        modality: "image",
      })),
  },
  {
    key: "aigc-video",
    title: "腾讯云 AIGC · 生视频",
    modality: "video",
    jsonPath: "suppliers/aigc/output/pricing-api-video.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.trinityId || m.id,
        trinityId: m.trinityId || null,
        name: m.displayName || m.modelName,
        brand: m.brand,
        modality: "video",
      })),
  },
  {
    key: "volcengine-text",
    title: "火山方舟 · 生文",
    modality: "text",
    jsonPath: "suppliers/volcengine/output/text/pricing-api.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.id,
        name: m.displayName || m.modelName,
        brand: m.brand || "火山",
        modality: "text",
      })),
  },
  {
    key: "volcengine-image",
    title: "火山方舟 · 生图",
    modality: "image",
    jsonPath: "suppliers/volcengine/output/image/pricing-api.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.id,
        name: m.displayName || m.modelName,
        brand: m.brand || "火山",
        modality: "image",
      })),
  },
  {
    key: "volcengine-video",
    title: "火山方舟 · 生视频",
    modality: "video",
    jsonPath: "suppliers/volcengine/output/video/pricing-api.json",
    pick: (raw) =>
      (raw.models ?? []).map((m) => ({
        id: m.modelId || m.id,
        name: m.displayName || m.modelName,
        brand: m.brand || "火山",
        modality: "video",
      })),
  },
  {
    key: "openrouter",
    title: "OpenRouter",
    modality: "text",
    jsonPath: "suppliers/openrouter/output/models-api.json",
    pick: (raw) => {
      const list = raw.data ?? raw.models ?? [];
      return list.map((m) => ({
        id: m.id || m.modelId,
        name: m.name || m.id,
        brand: (m.id || "").split("/")[0],
        modality: "text",
      }));
    },
  },
];

async function loadOnlineIds(modality) {
  try {
    const { raw } = await readOnlinePricesCache(modality);
    const models = raw.data || raw.models || [];
    return new Set(
      models
        .map((m) => String(m.model || m.id || m.model_id || "").toLowerCase())
        .filter(Boolean),
    );
  } catch {
    return new Set();
  }
}

/** @returns {Promise<Map<string, string>>} upstream/vendor id → trinity id */
async function loadJoinMaps() {
  const map = new Map();
  const files = [
    "suppliers/aigc/trinity-map.json",
    "suppliers/aigc/trinity-map-image.json",
    "suppliers/aigc/trinity-map-video.json",
    "suppliers/official/trinity-map.json",
    "suppliers/tokenhub/trinity-map.json",
    "suppliers/bailian/trinity-map.json",
    "suppliers/volcengine/trinity-map.json",
  ];
  for (const rel of files) {
    try {
      const raw = JSON.parse(await readFile(path.join(ROOT, rel), "utf8"));
      for (const [k, v] of Object.entries(raw)) {
        if (k.startsWith("_")) continue;
        if (typeof v === "string") {
          map.set(normId(k), v);
          map.set(normId(v), v);
        } else if (v && typeof v === "object") {
          const tid = v.trinityId || k;
          const vid = v.vendorModelId || v.modelId || k;
          map.set(normId(k), tid);
          map.set(normId(vid), tid);
          if (v.trinityId) map.set(normId(v.trinityId), v.trinityId);
        }
      }
    } catch {
      /* optional */
    }
  }
  return map;
}

function normId(id) {
  return String(id || "")
    .trim()
    .toLowerCase();
}

/**
 * 粗匹配：上游 id / map 到的 Trinity id ∈ 线上刊例
 * @param {string} upstreamId
 * @param {Set<string>} online
 * @param {Map<string, string>} joinMap
 * @param {string} [trinityIdHint]
 */
function isAccessed(upstreamId, online, joinMap = new Map(), trinityIdHint) {
  const candidates = new Set();
  const u = normId(upstreamId);
  if (u) candidates.add(u);
  if (trinityIdHint) candidates.add(normId(trinityIdHint));
  const mapped = joinMap?.get?.(u);
  if (mapped) candidates.add(normId(mapped));

  for (const c of [...candidates]) {
    // aigc-vidu-q3-domestic → vidu-q3
    candidates.add(c.replace(/^aigc-/, "").replace(/-(domestic|international)$/, ""));
    candidates.add(c.replace(/-\d{6,8}$/, ""));
    // vd-video-q3-pro → vidu-q3-pro（常见 AIGC 前缀）
    if (c.startsWith("vd-video-")) candidates.add(c.replace(/^vd-video-/, "vidu-"));
    if (c.startsWith("vd-")) candidates.add(c.replace(/^vd-/, "vidu-"));
  }

  for (const c of candidates) {
    if (!c) continue;
    if (online.has(c)) return true;
    for (const oid of online) {
      if (oid === c || oid.endsWith("/" + c) || c.endsWith("/" + oid)) return true;
    }
  }
  return false;
}

async function loadSource(src) {
  const full = path.join(ROOT, src.jsonPath);
  try {
    const raw = JSON.parse(await readFile(full, "utf8"));
    const items = src.pick(raw).filter((x) => x.id);
    // 按 id 去重
    const seen = new Set();
    const uniq = [];
    for (const it of items) {
      const k = normId(it.id);
      if (seen.has(k)) continue;
      seen.add(k);
      uniq.push(it);
    }
    uniq.sort((a, b) =>
      `${a.brand || ""}\0${a.id}`.localeCompare(`${b.brand || ""}\0${b.id}`, "zh"),
    );
    return { ok: true, items: uniq, path: src.jsonPath };
  } catch (e) {
    return { ok: false, items: [], path: src.jsonPath, error: e.message };
  }
}

async function main() {
  const onlineByMod = {
    text: await loadOnlineIds("text"),
    image: await loadOnlineIds("image"),
    video: await loadOnlineIds("video"),
  };
  const joinMap = await loadJoinMaps();

  await mkdir(OUT_DIR, { recursive: true });

  const summaries = [];
  const indexLines = [
    `# 上游全量模型 · 接入覆盖`,
    ``,
    `> 生成：${new Date().toISOString()}`,
    `> **规则**：行 = 该上游抓取目录全量；**已接入**（同模态 \`/v1/prices\`）标 \`${ACCESS_MARK}\`；未接入留空。`,
    `> 用途：看见还有哪些模型可长期接入。不替代刊例对比表。`,
    ``,
    `| 上游 | 模态 | 全量 | 已接入 | 未接入 | 明细 |`,
    `|---|---|---:|---:|---:|---|`,
  ];

  for (const src of SOURCES) {
    const loaded = await loadSource(src);
    const mod =
      src.modality === "mixed" ? "text" : src.modality;
    const online = onlineByMod[mod] ?? new Set();

    if (!loaded.ok) {
      summaries.push({
        key: src.key,
        title: src.title,
        modality: src.modality,
        total: 0,
        accessed: 0,
        pending: 0,
        error: loaded.error,
      });
      indexLines.push(
        `| ${src.title} | ${src.modality} | — | — | — | ⚠ 缺产物 \`${src.jsonPath}\` |`,
      );
      continue;
    }

    const rows = loaded.items.map((it) => {
      const accessed = isAccessed(it.id, online, joinMap, it.trinityId);
      return {
        ...it,
        access: accessed ? ACCESS_MARK : "",
        accessed,
      };
    });

    const accessedN = rows.filter((r) => r.accessed).length;
    const pendingN = rows.length - accessedN;
    const outName = `${src.key}.md`;
    const outPath = path.join(OUT_DIR, outName);

    const lines = [
      `# ${src.title} · 接入覆盖`,
      ``,
      `> 模态：**${src.modality}** · 全量 **${rows.length}** · 已接入 **${accessedN}**（\`${ACCESS_MARK}\`）· 未接入 **${pendingN}**`,
      `> 数据源：\`${src.jsonPath}\` · 对照：\`GET /v1/prices?modality=${mod}\``,
      ``,
      `| 接入 | 上游模型ID | 显示名 | 厂商 |`,
      `|---|---|---|---|`,
    ];
    for (const r of rows) {
      lines.push(
        `| ${r.access || ""} | ${r.id} | ${r.name || ""} | ${r.brand || ""} |`,
      );
    }

    lines.push(
      ``,
      `## 未接入清单（可长期评估）`,
      ``,
    );
    const pending = rows.filter((r) => !r.accessed);
    if (!pending.length) {
      lines.push(`_无 — 抓取目录均已在线上刊例出现（按粗匹配）。_`);
    } else {
      for (const r of pending) {
        lines.push(`- \`${r.id}\`${r.name ? ` · ${r.name}` : ""}`);
      }
    }
    lines.push("");

    await writeFile(outPath, lines.join("\n"), "utf8");
    await writeFile(
      path.join(OUT_DIR, `${src.key}.json`),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          source: src,
          total: rows.length,
          accessed: accessedN,
          pending: pendingN,
          rows,
        },
        null,
        2,
      ),
      "utf8",
    );

    summaries.push({
      key: src.key,
      title: src.title,
      modality: src.modality,
      total: rows.length,
      accessed: accessedN,
      pending: pendingN,
    });
    indexLines.push(
      `| ${src.title} | ${src.modality} | ${rows.length} | ${accessedN} | ${pendingN} | [${outName}](./${outName}) |`,
    );
  }

  indexLines.push(
    ``,
    `## 口径`,
    ``,
    `| 项 | 说明 |`,
    `|----|------|`,
    `| 行集合 | 上游 JSON **全量**，不按 Trinity 裁剪 |`,
    `| 接入=\`${ACCESS_MARK}\` | 同模态线上刊例已有对应模型（id 粗匹配） |`,
    `| 接入留空 | 尚未挂 \`/v1/prices\`，可作接入候选 |`,
    `| 与刊例表关系 | 上游价目分表仍出挂牌对比；本表专盯「还能接什么」 |`,
    ``,
  );

  await writeFile(path.join(OUT_DIR, "index.md"), indexLines.join("\n"), "utf8");
  await writeFile(
    path.join(OUT_DIR, "summary.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), accessMark: ACCESS_MARK, summaries }, null, 2),
    "utf8",
  );

  console.log(`Wrote ${path.join(OUT_DIR, "index.md")}`);
  for (const s of summaries) {
    if (s.error) console.log(`  ${s.key}: ERR ${s.error}`);
    else console.log(`  ${s.key}: total=${s.total} accessed=${s.accessed} pending=${s.pending}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
