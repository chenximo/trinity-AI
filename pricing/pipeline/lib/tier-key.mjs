/**
 * 跨供应商 / 官方 / 线上刊例的档位归一化 key
 * 用于按「模态（文本 vs 音频）」与「上下文长度」对齐，避免价近档错位
 *
 * 线上展示常见 `≤ 512K`（数字对齐即可，不必写成「输入≤512k」）。
 * 524.29K / 32.77K 是 N×1024 token 的千分位写法，与 512k / 32k 同档。
 */

const CANON_K = [16, 32, 64, 128, 200, 256, 272, 512, 1024];

/** @param {number} n 展示用的 K 数字（512 或 524.29） */
function snapK(n) {
  if (!Number.isFinite(n)) return null;
  let best = null;
  let bestD = Infinity;
  for (const b of CANON_K) {
    const d = Math.min(Math.abs(n - b), Math.abs(n - b * 1.024));
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  if (best != null && (bestD < 1 || bestD / (best * 1.024) < 0.015)) return best;
  return null;
}

function keyLe(k) {
  if (k === 16) return "t:0-16k";
  if (k === 32) return "t:0-32k";
  if (k === 128) return "t:0-128k";
  if (k === 200) return "ctx:0-200k";
  if (k === 256) return "t:0-256k";
  if (k === 272) return "ctx:0-272k";
  if (k === 512) return "t:0-512k";
  return null;
}

function keyGt(k) {
  if (k === 32) return "t:32k+";
  if (k === 128) return "t:128k-256k";
  if (k === 200) return "ctx:200k+";
  if (k === 256) return "t:256k-1m";
  if (k === 272) return "ctx:272k+";
  if (k === 512) return "t:512k+";
  return null;
}

function keySpan(a, b) {
  if (a === 16 && b === 32) return "t:16k-32k";
  if (a === 32 && b === 128) return "t:32k-128k";
  if (a === 32 && b === 256) return "t:32k-256k";
  if (a === 128 && b === 256) return "t:128k-256k";
  if (a === 256 && b === 1024) return "t:256k-1m";
  return null;
}

/** 紧凑文案：`≤512k` `>32k` `16k–32k` `≤524.29k` */
function keyFromShortKDisplay(compact) {
  const le = compact.match(/^[≤<=]+([\d.]+)k$/i);
  if (le) return keyLe(snapK(Number(le[1])));
  const gt = compact.match(/^[>＞]([\d.]+)k$/i);
  if (gt) return keyGt(snapK(Number(gt[1])));
  const span = compact.match(/^([\d.]+)k[–\-−~到至]([\d.]+)k$/i);
  if (span) return keySpan(snapK(Number(span[1])), snapK(Number(span[2])));
  return null;
}

/** 二进制档（32×1024）与十进制档（32×1000，刊例 API 改文案后常见）都要对上 */
const TOKEN_BOUNDS = [
  16000, 16384, 32000, 32768, 128000, 131072, 199999, 200000, 256000, 262144,
  272000, 512000, 524288, 1000000, 1048576,
];

/** @param {number} tokens */
export function snapTokenBound(tokens) {
  if (tokens == null || !Number.isFinite(Number(tokens))) return null;
  const t = Number(tokens);
  let best = null;
  let bestD = Infinity;
  for (const k of TOKEN_BOUNDS) {
    const d = Math.abs(k - t);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  if (best != null && (bestD <= 2 || bestD / best <= 0.002)) return best;
  return Math.round(t);
}

/**
 * 线上 API range.min / range.max（token）→ 与官网 seed 相同的 key。
 * @param {number|null|undefined} min
 * @param {number|null|undefined} max
 */
export function tierKeyFromTokenBounds(min, max) {
  const lo = min == null || min === "" ? 0 : Number(min);
  const hi =
    max == null || max === "" || !Number.isFinite(Number(max))
      ? Infinity
      : Number(max);
  if (!Number.isFinite(lo)) return null;
  if (lo <= 1 && Number.isFinite(hi)) {
    const s = snapTokenBound(hi);
    if (s === 16000 || s === 16384) return "t:0-16k";
    if (s === 32000 || s === 32768) return "t:0-32k";
    if (s === 128000 || s === 131072) return "t:0-128k";
    if (s === 199999 || s === 200000) return "ctx:0-200k";
    if (s === 256000 || s === 262144) return "t:0-256k";
    if (s === 272000) return "ctx:0-272k";
    if (s === 512000 || s === 524288) return "t:0-512k";
    return null;
  }
  if (Number.isFinite(lo) && !Number.isFinite(hi)) {
    const prev = snapTokenBound(lo - 1);
    if (prev === 32000 || prev === 32768) return "t:32k+";
    if (prev === 128000 || prev === 131072) return "t:128k-256k";
    if (prev === 199999 || prev === 200000) return "ctx:200k+";
    if (prev === 256000 || prev === 262144) return "t:256k-1m";
    if (prev === 272000) return "ctx:272k+";
    if (prev === 512000 || prev === 524288) return "t:512k+";
    return null;
  }
  if (Number.isFinite(lo) && Number.isFinite(hi)) {
    const prev = snapTokenBound(lo - 1);
    const s = snapTokenBound(hi);
    const prev32 = prev === 32000 || prev === 32768;
    const prev16 = prev === 16000 || prev === 16384;
    const prev128 = prev === 128000 || prev === 131072;
    const prev256 = prev === 256000 || prev === 262144;
    const hi32 = s === 32000 || s === 32768;
    const hi128 = s === 128000 || s === 131072;
    const hi256 = s === 256000 || s === 262144;
    if (prev16 && hi32) return "t:16k-32k";
    if (prev32 && hi128) return "t:32k-128k";
    if (prev32 && hi256) return "t:32k-256k";
    if (prev128 && hi256) return "t:128k-256k";
    if (prev256 && (s === 1048576 || s === 1000000)) return "t:256k-1m";
    return null;
  }
  return null;
}

/** @param {string} tierName @param {number} tierIndex @param {number} totalTiers */
export function tierToKey(tierName, tierIndex = 0, totalTiers = 1) {
  const raw = String(tierName ?? "").trim();
  if (!raw || /^统一|不区分|标准计价|标准价$/i.test(raw)) {
    return "uniform";
  }

  const n = raw
    .replace(/\s/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .toLowerCase();

  const fromShort = keyFromShortKDisplay(n);
  if (fromShort) return fromShort;

  if (/音频|audio|has_audio|含音频/.test(n)) return "mod:audio";
  if (/文本|图片|视频|text\/image|text\/video|text\/img/.test(n)) {
    return "mod:text";
  }

  // 生视频分辨率档
  if (/480p|540p/i.test(n)) return "res:540p";
  if (/720p|768p/i.test(n)) return "res:720p";
  if (/1080p/i.test(n)) return "res:1080p";

  // GLM-4.7：≤32k 内按输出 token 分档（须先于通用 ≤32k）
  if (/≤32k|<=32k|<32k/i.test(n) && /输出/.test(n)) {
    if (/输出.*[≤<]=?0\.2k/i.test(n)) return "t:in32k-out-le0.2k";
    if (/输出.*[>＞]0\.2k/i.test(n)) return "t:in32k-out-gt0.2k";
  }

  // 上下文 token 档（须先于生图分辨率；512k 不可被裸 512 误伤）
  if (/输入[<≤=]16k|输入<=16k|输入长度\(0,\s*16k|0,\s*16k\)/i.test(n))
    return "t:0-16k";
  if (
    /16k.*32k|16k<=输入<32k|16k≤输入|输入长度\[16k,\s*32k\)|输入长度\(16k,\s*32k/i.test(
      n,
    )
  )
    return "t:16k-32k";

  if (/输入\(32k,\s*128k\]|32k,\s*128k\]/i.test(n) || /32k<输入<=128k/i.test(n))
    return "t:32k-128k";

  // 智谱 GLM：仅按输入长度（≤32k / >32k），排除混元 16k–32k 区间
  if (/输入[:：]?[≤<]=?32k/i.test(n) && !/输出/.test(n) && !/16k/i.test(n))
    return "t:0-32k";
  if (/输入[:：]?[>＞≥]=?32k/i.test(n) && !/166k/.test(n)) return "t:32k+";

  if (
    /输入>=32k|输入≥32k|32k\+|32k<=输入|32k<=|输入长度\(32k|输入长度\[32k|输入长度\[32k\+\)|输入>32k/i.test(
      n,
    )
  )
    return "t:32k+";

  if (
    /0<token≤128k|0<token<128k|输入<=128k|输入≤128k|0<输入<=128k/i.test(n)
  )
    return "t:0-128k";
  if (/128k<token≤256k|128k<token<256k|128k.*256k|128k<输入<=256k/i.test(n))
    return "t:128k-256k";
  if (/256k<token≤1m|256k<token<1m|256k.*1m|256k<输入<=1m/i.test(n))
    return "t:256k-1m";

  if (/0<token≤256k|0<token<256k|输入<=256k|输入≤256k/i.test(n) && !/128k/i.test(n))
    return "t:0-256k";

  if (/输入<=512k|输入≤512k|0<输入<=512k|\(0,\s*512k|input length \(0,\s*512k/i.test(n))
    return "t:0-512k";
  if (/512k<|512k\+|输入>512k|input length 512k\+/i.test(n)) return "t:512k+";
  if (/0<输入<=32k|0,32k\]|0<token≤32k|输入<=32k|输入<32k/i.test(n))
    return "t:0-32k";
  if (/32k<token|32k<输入/i.test(n)) return "t:32k+";

  // 生图分辨率档（勿用裸 512，会误伤 512k 上下文）
  if (/1k以下|sub.?1k|512\s*px|≤\s*512(?!k)/i.test(n)) return "res:sub-1k";
  if (/^4k$/i.test(n) || /4k分辨率/.test(n)) return "res:4k";
  if (/^2k$/i.test(n) || /2k分辨率/.test(n)) return "res:2k";
  if (/^1k$/i.test(n) || /1k分辨率/.test(n)) return "res:1k";
  if (/^输出$|per.?image|元\/张|美元\/张/i.test(n) && totalTiers === 1) return "uniform";

  if (/<=1\.28m|≤1\.28m|0–1\.28m/i.test(n)) return "ctx:0-1.28m";
  if (/>1\.28m|1\.28m\+/i.test(n)) return "ctx:1.28m+";

  if (/>272k|272k\+/i.test(n)) return "ctx:272k+";
  if (/<=272k|≤272k|0–272k|0-272k/i.test(n) && !/32k</i.test(n))
    return "ctx:0-272k";

  if (/>20万|>200k|200k\+/i.test(n)) return "ctx:200k+";
  if (
    (/<=20万|≤200k|0–200k|0-200k/i.test(n) ||
      (/20万个token/i.test(n) && !/>/.test(n))) &&
    !/32k</i.test(n)
  )
    return "ctx:0-200k";

  if (totalTiers === 1) return "uniform";
  return `t:idx-${tierIndex}`;
}

export const TIER_KEY_ORDER = [
  "uniform",
  "res:540p",
  "res:720p",
  "res:1080p",
  "res:sub-1k",
  "res:1k",
  "res:2k",
  "res:4k",
  "mod:text",
  "mod:audio",
  "t:0-16k",
  "t:16k-32k",
  "t:0-32k",
  "t:in32k-out-le0.2k",
  "t:in32k-out-gt0.2k",
  "t:32k+",
  "t:32k-128k",
  "t:32k-256k",
  "ctx:0-200k",
  "ctx:200k+",
  "ctx:0-272k",
  "ctx:272k+",
  "ctx:0-1.28m",
  "ctx:1.28m+",
  "t:0-128k",
  "t:128k-256k",
  "t:0-256k",
  "t:256k-1m",
  "t:0-512k",
  "t:512k+",
];

/** @param {string} key */
export function tierSortKey(key) {
  const i = TIER_KEY_ORDER.indexOf(key);
  return i >= 0 ? i : 100 + (key?.charCodeAt?.(0) ?? 0);
}

/**
 * 在官方/线上 tiers 中按 tierKey 查找
 * @param {Array<{ tierLabel?: string, tierName?: string, tierKey?: string }>} tiers
 * @param {string} wantKey
 */
export function findTierByKey(tiers, wantKey) {
  if (!tiers?.length || !wantKey || wantKey === "uniform") return null;
  const total = tiers.length;
  for (let i = 0; i < total; i++) {
    const t = tiers[i];
    const label = t.tierLabel ?? t.tierName ?? "";
    const key = t.tierKey || tierToKey(label, i, total);
    if (key === wantKey) return t;
  }
  return null;
}
