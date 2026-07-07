/**
 * 生视频 · 原厂价 → Trinity 可对照的「元/秒」
 *
 * 两种原厂口径：
 * 1. **积分/秒（或 元/秒）** — 可灵 3.0 Turbo 等：1积分=¥1/秒，直接对照 AIGC
 * 2. **积分/次** — 混元/Vidu 等按次扣积分：元/秒(估)=积分/次×积分单价÷参考秒数
 *
 * AIGC 进货价：《AIGC价格指南（商务版报价文档）.xlsx》· AIGC生视频
 */

/** @typedef {{ min: number, max: number, mid: number } | null} PointsRange */

export const VIDEO_REFERENCE_CONVERSION = {
  /** 积分/次 → 元/秒(估) 时使用的单次参考时长 */
  referenceSeconds: 5,
  /** 1 积分 = ? 人民币（可灵按秒计价时通常为 1） */
  pointCnyByVendor: {
    tencent_hunyuan: 1,
    kling: 1,
    vidu: 1,
    tencent_youtu: 1,
    default: 1,
  },
  footnote:
    "Trinity 不计积分；可灵等「积分/秒=元/秒」直接对照；「积分/次」才用参考秒数折算",
};

/** @param {string} unit */
export function isOfficialPerSecondUnit(unit) {
  return /积分\/秒|元\/秒|美元\/秒|cny\/s|usd\/s/i.test(String(unit ?? ""));
}

/** @param {string} unit */
export function isOfficialPerGenerationPoints(unit) {
  return /积分\/次|积分·次|points\/gen/i.test(String(unit ?? ""));
}

/** @param {string|number|null|undefined} raw */
export function parsePointsPerGeneration(raw) {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { min: raw, max: raw, mid: raw };
  }
  const s = String(raw).trim();
  const range = s.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min, max, mid: Math.round(((min + max) / 2) * 10000) / 10000 };
  }
  const n = Number(s);
  if (Number.isFinite(n)) return { min: n, max: n, mid: n };
  return null;
}

/**
 * @param {object|null} offTier
 * @param {string} [vendor]
 * @param {typeof VIDEO_REFERENCE_CONVERSION} [cfg]
 * @param {number} [usdToCnyFx]
 */
export function impliedCnyPerSecondFromOfficialPoints(
  offTier,
  vendor,
  cfg = VIDEO_REFERENCE_CONVERSION,
  usdToCnyFx = 6.5,
) {
  if (!offTier) return null;
  const unit = String(offTier.unit ?? "");
  const points = parsePointsPerGeneration(
    offTier?.rawPrice ?? offTier?.price ?? offTier?.output,
  );
  if (!points) return null;

  const pointCny =
    cfg.pointCnyByVendor[vendor ?? ""] ?? cfg.pointCnyByVendor.default ?? 1;

  if (isOfficialPerSecondUnit(unit) && /美元|usd/i.test(unit)) {
    const toCny = (p) => Math.round(p * usdToCnyFx * 10000) / 10000;
    return {
      min: toCny(points.min),
      max: toCny(points.max),
      mid: toCny(points.mid),
      mode: "usd_per_second",
      usdToCnyFx,
      points,
      unit,
    };
  }

  // 可灵等：官网已写 0.8积分(¥0.8)/秒 — 1积分=1元/秒，无需 ÷参考秒数
  if (isOfficialPerSecondUnit(unit)) {
    const toCny = (p) => Math.round(p * pointCny * 10000) / 10000;
    return {
      min: toCny(points.min),
      max: toCny(points.max),
      mid: toCny(points.mid),
      mode: "per_second",
      pointCny,
      points,
      unit,
    };
  }

  if (!isOfficialPerGenerationPoints(unit)) return null;

  const sec = cfg.referenceSeconds;
  if (!sec || sec <= 0) return null;

  const toCnyPerSec = (p) => Math.round(((p * pointCny) / sec) * 10000) / 10000;

  return {
    min: toCnyPerSec(points.min),
    max: toCnyPerSec(points.max),
    mid: toCnyPerSec(points.mid),
    mode: "per_generation",
    referenceSeconds: sec,
    pointCny,
    points,
    unit,
  };
}

/** @param {ReturnType<typeof impliedCnyPerSecondFromOfficialPoints>} implied */
export function formatImpliedCnyPerSecond(implied) {
  if (!implied) return "—";
  const { min, max, mid, mode, pointCny } = implied;
  if (mode === "usd_per_second") {
    const tag = `(官网·美元/秒×${implied.usdToCnyFx ?? 6.5})`;
    if (min === max) return `¥${mid}/秒${tag}`;
    return `¥${min}~${max}/秒${tag}`;
  }
  if (mode === "per_second") {
    const tag = `(官网·按秒·1积分=¥${pointCny})`;
    if (min === max) return `¥${mid}/秒${tag}`;
    return `¥${min}~${max}/秒${tag}`;
  }
  const { referenceSeconds } = implied;
  const tag = `(估·${referenceSeconds}s/次·1积分=¥${pointCny})`;
  if (min === max) return `¥${mid}/秒${tag}`;
  return `¥${min}~${max}/秒${tag}`;
}

/** @param {object|null} offTier @param {string} [currency] */
export function formatOfficialDocPrice(offTier, currency = "CNY") {
  if (!offTier) return "—";
  const raw = offTier.rawPrice ?? offTier.price ?? offTier.output ?? offTier.input;
  if (raw == null || raw === "") return "—";
  const unit = String(offTier.unit ?? "");
  if (/积分\/秒/.test(unit)) {
    const p = parsePointsPerGeneration(raw);
    if (!p) return `${raw}积分/秒`;
    if (p.min === p.max) return `${p.mid}积分(¥${p.mid})/秒`;
    return `${p.min}~${p.max}积分/秒`;
  }
  if (/积分/.test(unit) && !/积分\/秒/.test(unit)) return `${raw}积分/次`;
  if (/美元\/秒|usd\/s/i.test(unit)) {
    const p = parsePointsPerGeneration(raw);
    if (!p) return `$${raw}/秒`;
    if (p.min === p.max) return `$${p.mid}/秒`;
    return `$${p.min}~${p.max}/秒`;
  }
  if (/元\/秒/.test(unit)) return `¥${raw}/秒`;
  if (/百万tokens|token/i.test(unit)) {
    const p = typeof raw === "number" ? raw : Number(String(raw).match(/[\d.]+/)?.[0]);
    if (Number.isFinite(p)) return `¥${p}/百万tokens`;
    return `${raw}元/百万tokens`;
  }
  return String(raw);
}
