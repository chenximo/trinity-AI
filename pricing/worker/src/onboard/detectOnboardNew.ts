/**
 * ④ 上新跟价 · 自动 detect-new
 *
 * 读 pricing/output/upstream-access/*.json（由 pricing:upstream:access 产出），
 * 找出「上游有、Trinity 未接入」候选，并按渠道是否已接 CLI 判定 B1/B2。
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { ReviewModality } from "../types.js";
import {
  channelKeyToSupplyId,
  hasSupplierCli,
} from "./supplierChannelMap.js";

const ACCESS_DIR = "pricing/output/upstream-access";

/** 与 gen-upstream-access-coverage.mjs 的 SOURCES key 对齐（按模态筛） */
const MODALITY_SOURCE_KEYS: Record<ReviewModality, string[]> = {
  text: ["tokenhub", "bailian", "bailian-intl", "aigc-text", "volcengine-text", "openrouter"],
  image: ["aigc-image", "volcengine-image"],
  video: ["aigc-video", "volcengine-video"],
};

type AccessRow = {
  id: string;
  name?: string;
  brand?: string;
  accessed?: boolean;
};

type ChannelDetect = {
  key: string;
  title: string;
  supplyId: string;
  subtype: "B1" | "B2";
  pendingCount: number;
  pendingUpstreamIds: string[];
  sourceReady: boolean;
  hasCli: boolean;
};

export type OnboardDetectResult = {
  modality: ReviewModality;
  subtype: "B1" | "B2";
  channelId: string;
  channelTitle: string;
  pendingCount: number;
  /** 候选 modelIds（上游 id；若后续有 trinity-map 可再映射） */
  modelIds: string[];
  pendingUpstreamIds: string[];
  summary: string;
  channels: ChannelDetect[];
};

async function readAccessJson(
  root: string,
  key: string,
): Promise<{ ok: boolean; title: string; rows: AccessRow[] }> {
  const file = path.join(root, ACCESS_DIR, `${key}.json`);
  try {
    const raw = JSON.parse(await fs.readFile(file, "utf8")) as {
      source?: { title?: string };
      rows?: AccessRow[];
    };
    return {
      ok: true,
      title: raw.source?.title ?? key,
      rows: Array.isArray(raw.rows) ? raw.rows : [],
    };
  } catch {
    return { ok: false, title: key, rows: [] };
  }
}

function isManualOnboardOverride(note?: string | null): boolean {
  const n = (note ?? "").trim();
  return /onboard\s*=\s*B[12]/i.test(n) || /(?:^|[^0-9A-Za-z])B2(?:[^0-9A-Za-z]|$)/.test(n);
}

export function isAutoOnboardDetect(note?: string | null): boolean {
  if (!note?.trim()) return true;
  if (/onboard\s*=\s*auto/i.test(note)) return true;
  return !isManualOnboardOverride(note);
}

export async function detectOnboardNew(
  root: string,
  modality: ReviewModality,
): Promise<OnboardDetectResult> {
  const keys = MODALITY_SOURCE_KEYS[modality];
  const channels: ChannelDetect[] = [];

  for (const key of keys) {
    const loaded = await readAccessJson(root, key);
    const supplyId = channelKeyToSupplyId(key);
    const pending = loaded.rows.filter((r) => r.id && !r.accessed);
    const sourceReady = loaded.ok && loaded.rows.length > 0;
    const cli = hasSupplierCli(supplyId);
    const subtype: "B1" | "B2" =
      pending.length > 0 && sourceReady && cli ? "B1" : pending.length > 0 ? "B2" : "B1";

    if (pending.length > 0 || !loaded.ok) {
      channels.push({
        key,
        title: loaded.title,
        supplyId,
        subtype: !loaded.ok || !cli ? "B2" : subtype,
        pendingCount: pending.length,
        pendingUpstreamIds: pending.map((r) => r.id),
        sourceReady,
        hasCli: cli,
      });
    }
  }

  // 优先：未接入数量最多的已就绪渠道；否则取第一个待接渠道
  const withPending = channels.filter((c) => c.pendingCount > 0);
  const primary =
    [...withPending].sort((a, b) => b.pendingCount - a.pendingCount)[0] ??
    channels.find((c) => !c.sourceReady || !c.hasCli) ??
    withPending[0];

  if (!primary) {
    return {
      modality,
      subtype: "B1",
      channelId: "tokenhub",
      channelTitle: "（未发现上游新增）",
      pendingCount: 0,
      modelIds: [],
      pendingUpstreamIds: [],
      summary: "未发现上游新增候选；将按 B1 主链出包（全量 diff）",
      channels,
    };
  }

  const modelIds = primary.pendingUpstreamIds.slice(0, 50);
  const summary =
    primary.pendingCount > 0
      ? `detect-new · ${primary.title} · ${primary.subtype} · 未接入 ${primary.pendingCount} 款`
      : `detect-new · ${primary.title} · 上游产物未就绪 → ${primary.subtype}`;

  return {
    modality,
    subtype: primary.subtype,
    channelId: primary.supplyId,
    channelTitle: primary.title,
    pendingCount: primary.pendingCount,
    modelIds,
    pendingUpstreamIds: primary.pendingUpstreamIds,
    summary,
    channels,
  };
}
