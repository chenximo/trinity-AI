/**
 * 生视频模型注册表 — 刊例对比 / 线上 slug / Trinity / 官方 / AIGC 统一入口
 *
 * **行主键策略（compare-hub）**：`prices-api` 全量线上 slug ∪ 官方 catalog 补行（取并集）
 * 新增模型：在此追加一条；未登记线上 slug 仍会出现行，但 AIGC/官方列为 — 直至补 map
 *
 * @typedef {{
 *   onlineSlug?: string|null,
 *   trinityId?: string|null,
 *   vendorModelId?: string|null,
 *   volcengineId?: string|null,
 *   displayName?: string,
 *   brand?: string,
 *   aigc?: { vendorCode: string, modelName: string, attribute?: string }|null,
 *   listingAttribute?: string|null,
 *   note?: string,
 * }} VideoModelRegistryEntry
 */

/** @type {VideoModelRegistryEntry[]} */
export const VIDEO_MODEL_REGISTRY = [
  // —— 完整治理：Trinity + 官方 + 线上 ——
  {
    onlineSlug: "kling-3",
    trinityId: "kl-video-v3",
    vendorModelId: "kl-video-v3",
    aigc: { vendorCode: "Kling", modelName: "3.0-turbo（new）", attribute: "标准价" },
  },
  {
    onlineSlug: "kling-2.6",
    trinityId: "kl-video-v2-6",
    vendorModelId: "kl-video-v2-6",
    aigc: { vendorCode: "Kling", modelName: "2.6", attribute: "无声" },
  },
  {
    onlineSlug: "kling-2.5-turbo",
    trinityId: "kl-video-v2-5-turbo",
    vendorModelId: "kl-video-v2-5-turbo",
    aigc: { vendorCode: "Kling", modelName: "2.5-turbo", attribute: "标准价" },
  },
  {
    onlineSlug: "vidu-q3-pro",
    trinityId: "vd-video-q3-pro",
    vendorModelId: "vd-video-q3-pro",
    aigc: { vendorCode: "Vidu", modelName: "q3-pro", attribute: "图生、文生、首尾帧生" },
  },
  {
    onlineSlug: "vidu-q3-turbo",
    trinityId: "vd-video-q3-turbo",
    vendorModelId: "vd-video-q3-turbo",
    aigc: { vendorCode: "Vidu", modelName: "q3-turbo", attribute: "图生、文生、首尾帧生" },
  },
  {
    onlineSlug: "vidu-q2",
    trinityId: "vd-video-q2",
    vendorModelId: "vd-video-q2",
    aigc: { vendorCode: "Vidu", modelName: "q2", attribute: "文生" },
  },
  {
    onlineSlug: "vidu-q2-turbo",
    trinityId: "vd-video-q2-turbo",
    vendorModelId: "vd-video-q2-turbo",
    aigc: { vendorCode: "Vidu", modelName: "q2-turbo", attribute: "图生、首尾帧生" },
  },

  // —— 仅刊例 + AIGC（线上有，官方 catalog 暂无 Trinity 行）——
  {
    onlineSlug: "gv-3.1",
    vendorModelId: "veo-3.1-generate-preview",
    aigc: { vendorCode: "GV", modelName: "3.1", attribute: "有声" },
    listingAttribute: "无声",
    brand: "Google DeepMind",
    displayName: "GV-3.1",
    note: "线上刊例为无声档（prices-api 无 has_audio 维）",
  },
  {
    onlineSlug: "gv-3.1-fast",
    vendorModelId: "veo-3.1-fast-generate-preview",
    aigc: { vendorCode: "GV", modelName: "3.1-fast", attribute: "有声" },
    listingAttribute: "无声",
    brand: "Google DeepMind",
    displayName: "GV-3.1-Fast",
    note: "线上刊例为无声档",
  },
  {
    onlineSlug: "gv-3.1-litenew",
    vendorModelId: "veo-3.1-lite-generate-preview",
    aigc: { vendorCode: "GV", modelName: "3.1-lite", attribute: "有声" },
    listingAttribute: "无声",
    brand: "Google DeepMind",
    displayName: "GV-3.1-Lite",
    note: "线上刊例为无声档",
  },
  {
    onlineSlug: "hailuo-2.3",
    vendorModelId: "hailuo-2.3",
    aigc: { vendorCode: "Hailuo", modelName: "02、2.3", attribute: "标准价" },
    brand: "Hailuo",
    displayName: "Hailuo-2.3",
  },
  {
    onlineSlug: "hailuo-2.3-fast",
    vendorModelId: "hailuo-2.3-fast",
    aigc: { vendorCode: "Hailuo", modelName: "2.3-fast", attribute: "标准价" },
    brand: "Hailuo",
    displayName: "Hailuo-2.3-Fast",
  },
  {
    onlineSlug: "h2new-1",
    vendorModelId: "hy-video-h2new",
    aigc: { vendorCode: "H2", modelName: "1", attribute: "标准价" },
    brand: "H2",
    displayName: "h2new-1",
    note: "⚠ TokenHub 未列 h2new SKU · 需人工核验",
  },
  {
    onlineSlug: "jv-3.0-pro",
    vendorModelId: "jimeng-jv-3.0-pro",
    aigc: { vendorCode: "JV", modelName: "3.0-pro", attribute: "标准价" },
    brand: "即梦",
    displayName: "Jimeng-3.0-Pro",
    note: "即梦 3.0 Pro · 火山计费页分档待核验",
  },
  {
    onlineSlug: "kling-3.0-omni",
    vendorModelId: "kl-video-v3-omni",
    aigc: { vendorCode: "Kling", modelName: "3.0-Omni", attribute: "无参考视频+无声" },
    brand: "可灵",
    displayName: "Kling-3.0-Omni",
    note: "官方 With Video Input · 2K 档 AIGC对齐",
  },
  {
    onlineSlug: "kling-o1",
    vendorModelId: "kl-video-o1",
    aigc: { vendorCode: "Kling", modelName: "O1", attribute: "无参考视频" },
    brand: "可灵",
    displayName: "Kling-O1",
    note: "官方 No Video Input · 2K/4K 档 AIGC对齐",
  },
  {
    onlineSlug: "os-2",
    vendorModelId: "sora-2",
    aigc: { vendorCode: "OS", modelName: "2", attribute: "标准价" },
    brand: "OS",
    displayName: "OS-2.0",
  },
  {
    onlineSlug: "pixversenew-c1",
    vendorModelId: "pixverse-c1",
    aigc: { vendorCode: "PixVerse", modelName: "C1", attribute: "标准价" },
    brand: "PixVerse",
    displayName: "PixVerse-c1",
  },
  {
    onlineSlug: "pixversenew-v5.6",
    vendorModelId: "pixverse-v5.6",
    aigc: { vendorCode: "PixVerse", modelName: "V5.6", attribute: "标准价" },
    brand: "PixVerse",
    displayName: "PixVerse-v5.6",
  },
  {
    onlineSlug: "pixversenew-v6.0",
    vendorModelId: "pixverse-v6",
    aigc: { vendorCode: "PixVerse", modelName: "V6.0", attribute: "标准价" },
    brand: "PixVerse",
    displayName: "PixVerse-v6.0",
  },
  {
    onlineSlug: "seedance-1.0-pro",
    vendorModelId: "doubao-seedance-1.0-pro",
    volcengineId: "doubao-seedance-1.0-pro",
    aigc: { vendorCode: "SV", modelName: "1.0-pro", attribute: "标准价" },
    brand: "Seedance",
    displayName: "Seedance 1.0 Pro",
    note: "官方/线上均为 token 刊例（¥/百万tokens · $/百万 video tokens）",
  },
  {
    onlineSlug: "seedance-1.0-pro-fast",
    vendorModelId: "doubao-seedance-1.0-pro-fast",
    volcengineId: "doubao-seedance-1.0-pro-fast",
    aigc: { vendorCode: "SV", modelName: "1.0-pro-fast", attribute: "标准价" },
    brand: "Seedance",
    displayName: "Seedance 1.0 Pro Fast",
    note: "官方/线上均为 token 刊例",
  },
  {
    onlineSlug: "seedance-1.5-pro",
    vendorModelId: "doubao-seedance-1.5-pro",
    volcengineId: "doubao-seedance-1.5-pro",
    aigc: { vendorCode: "SV", modelName: "1.5-pro", attribute: "标准价" },
    brand: "Seedance",
    displayName: "Seedance 1.5 Pro",
    note: "官方/线上 token 刊例 · 有声16/无声8 元/百万tokens · AIGC 仍为按秒",
  },
  {
    onlineSlug: "vidu-q2-pro",
    vendorModelId: "vd-video-q2-pro",
    aigc: { vendorCode: "Vidu", modelName: "q2-pro", attribute: "标准价" },
    brand: "Vidu",
    displayName: "Vidu Q2-Pro",
  },
  {
    onlineSlug: "vidu-q3",
    vendorModelId: "vd-video-q3",
    aigc: { vendorCode: "Vidu", modelName: "q3", attribute: "标准价" },
    brand: "Vidu",
    displayName: "Vidu Q3",
  },

  // —— 仅官方补行（Trinity catalog 有，线上 prices-api 无同 slug）——
  {
    trinityId: "hy-video-1.5",
    vendorModelId: "hy-video-1.5",
    onlineSlug: null,
    aigc: { vendorCode: "Hunyuan", modelName: "1.5", attribute: "标准价" },
  },
  {
    trinityId: "kl-video-v2-1",
    vendorModelId: "kl-video-v2-1",
    onlineSlug: null,
    aigc: { vendorCode: "Kling", modelName: "1.6、2.0、2.1", attribute: "标准价" },
  },
  {
    trinityId: "kl-video-v1",
    vendorModelId: "kl-video-v1",
    onlineSlug: null,
    aigc: { vendorCode: "Kling", modelName: "1.6、2.0、2.1", attribute: "标准价" },
  },
  {
    trinityId: "yt-video-2.0",
    vendorModelId: "yt-video-2.0",
    onlineSlug: null,
  },
  {
    trinityId: "yt-video-fx",
    vendorModelId: "yt-video-fx",
    onlineSlug: null,
  },
  {
    trinityId: "yt-video-humanactor",
    vendorModelId: "yt-video-humanactor",
    onlineSlug: null,
  },
  {
    vendorModelId: "doubao-seedance-2.0",
    onlineSlug: null,
    volcengineId: "doubao-seedance-2.0",
    brand: "豆包",
    displayName: "Doubao-seedance-2.0",
    note: "仅官方 · 线上无同 slug（见 seedance-* 刊例行）",
  },
  {
    vendorModelId: "doubao-seedance-2.0-fast",
    onlineSlug: null,
    volcengineId: "doubao-seedance-2.0-fast",
    brand: "豆包",
    displayName: "Doubao-seedance-2.0-fast",
    note: "仅官方 · volcengine connected:false 参照列",
  },
  {
    vendorModelId: "doubao-seedance-2.0-mini",
    onlineSlug: null,
    volcengineId: "doubao-seedance-2.0-mini",
    brand: "豆包",
    displayName: "Doubao-seedance-2.0-mini",
    note: "仅官方 · volcengine connected:false 参照列",
  },
  {
    vendorModelId: "doubao-seedance-1.5-pro",
    onlineSlug: null,
    volcengineId: "doubao-seedance-1.5-pro",
    brand: "豆包",
    displayName: "Doubao-seedance-1.5-pro",
    note: "仅官方 · 与 seedance-1.5-pro 刊例为不同计价轴",
  },
  {
    vendorModelId: "doubao-seedance-1.0-pro",
    onlineSlug: null,
    volcengineId: "doubao-seedance-1.0-pro",
    brand: "豆包",
    displayName: "Doubao-seedance-1.0-pro",
    note: "仅官方 · token 计价",
  },
  {
    vendorModelId: "doubao-seedance-1.0-pro-fast",
    onlineSlug: null,
    volcengineId: "doubao-seedance-1.0-pro-fast",
    brand: "豆包",
    displayName: "Doubao-seedance-1.0-pro-fast",
    note: "仅官方 · token 计价",
  },
];

const byOnline = new Map();
const byTrinity = new Map();
const byVendor = new Map();

for (const entry of VIDEO_MODEL_REGISTRY) {
  if (entry.onlineSlug) {
    byOnline.set(entry.onlineSlug.toLowerCase(), entry);
  }
  if (entry.trinityId) {
    byTrinity.set(entry.trinityId.toLowerCase(), entry);
  }
  if (entry.vendorModelId) {
    byVendor.set(entry.vendorModelId.toLowerCase(), entry);
  }
}

/** @param {string|null|undefined} onlineSlug */
export function getVideoRegistryByOnlineSlug(onlineSlug) {
  if (!onlineSlug) return null;
  return byOnline.get(onlineSlug.toLowerCase()) ?? null;
}

/** @param {string|null|undefined} trinityId */
export function getVideoRegistryByTrinityId(trinityId) {
  if (!trinityId) return null;
  return byTrinity.get(trinityId.toLowerCase()) ?? null;
}

/** @param {string|null|undefined} vendorModelId */
export function getVideoRegistryByVendorId(vendorModelId) {
  if (!vendorModelId) return null;
  return byVendor.get(vendorModelId.toLowerCase()) ?? null;
}

/**
 * 治理档位
 * @param {{ onlineSlug?: string|null, trinityId?: string|null, vendorModelId?: string|null }} unit
 * @param {object|null} officialModel
 */
export function videoGovernanceTier(unit, officialModel) {
  const hasOfficial = Boolean(officialModel);
  const hasOnline = Boolean(unit.onlineSlug);
  if (hasOfficial && hasOnline) return "完整";
  if (hasOnline) return "仅刊例";
  if (hasOfficial) return "仅官方";
  return "—";
}

/**
 * 刊例对比表 compare units：线上全量 ∪ 官方补行
 * @param {Map<string, object>} onlineByModel
 * @param {object[]} officialModels
 * @param {Map<string, string>} reverseTrinity vendorModelId → trinityId
 */
export function buildVideoCompareUnits(onlineByModel, officialModels, reverseTrinity) {
  /** @type {Map<string, object>} */
  const units = new Map();

  for (const [slug] of onlineByModel) {
    const reg = getVideoRegistryByOnlineSlug(slug);
    const vendorModelId =
      reg?.vendorModelId ??
      (reg?.trinityId ? reg.trinityId : null) ??
      reverseTrinity.get(slug) ??
      null;
    const trinityId =
      reg?.trinityId ??
      (vendorModelId ? reverseTrinity.get(vendorModelId.toLowerCase()) : null) ??
      null;
    units.set(`online:${slug}`, {
      onlineSlug: slug,
      trinityId: trinityId?.toLowerCase() ?? null,
      vendorModelId: vendorModelId?.toLowerCase() ?? null,
      volcengineId: reg?.volcengineId?.toLowerCase() ?? null,
      aigcRef: reg?.aigc ?? null,
      listingAttribute: reg?.listingAttribute ?? null,
      displayName: reg?.displayName ?? null,
      brand: reg?.brand ?? null,
      note: reg?.note ?? null,
    });
  }

  for (const off of officialModels) {
    const vendorModelId = off.vendorModelId?.toLowerCase();
    if (!vendorModelId) continue;
    const covered = [...units.values()].some(
      (u) => u.vendorModelId === vendorModelId,
    );
    if (covered) continue;

    const reg = getVideoRegistryByVendorId(vendorModelId);
    const trinityId =
      reg?.trinityId ??
      reverseTrinity.get(vendorModelId) ??
      null;
    units.set(`official:${vendorModelId}`, {
      onlineSlug: reg?.onlineSlug?.toLowerCase() ?? null,
      trinityId: trinityId?.toLowerCase() ?? null,
      vendorModelId,
      volcengineId: reg?.volcengineId?.toLowerCase() ?? vendorModelId,
      aigcRef: reg?.aigc ?? null,
      listingAttribute: reg?.listingAttribute ?? null,
      displayName: reg?.displayName ?? null,
      brand: reg?.brand ?? null,
      note: reg?.note ?? off.trinityNote ?? null,
    });
  }

  return [...units.values()];
}
