/**
 * 跨供应商 / 官方 / 线上刊例的档位归一化 key
 * 用于按「模态（文本 vs 音频）」与「上下文长度」对齐，避免价近档错位
 */

/** @param {string} tierName @param {number} tierIndex @param {number} totalTiers */
export function tierToKey(tierName, tierIndex = 0, totalTiers = 1) {
  const raw = String(tierName ?? "").trim();
  if (!raw || /^统一|不区分|标准计价|标准价/i.test(raw) || totalTiers === 1) {
    return "uniform";
  }

  const n = raw
    .replace(/\s/g, "")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .toLowerCase();

  if (/音频|audio|has_audio|含音频/.test(n)) return "mod:audio";
  if (/文本|图片|视频|text\/image|text\/video|text\/img/.test(n)) {
    return "mod:text";
  }

  // 生图分辨率档
  if (/1k以下|512|sub.?1k|1k以下/i.test(n)) return "res:sub-1k";
  if (/^4k$/i.test(n) || /4k分辨率/.test(n)) return "res:4k";
  if (/^2k$/i.test(n) || /2k分辨率/.test(n)) return "res:2k";
  if (/^1k$/i.test(n) || /1k分辨率/.test(n)) return "res:1k";
  if (/^输出$|per.?image|元\/张|美元\/张/i.test(n) && totalTiers === 1) return "uniform";

  // GLM-4.7：≤32k 内按输出 token 分档（须先于通用 ≤32k）
  if (/≤32k|<=32k|<32k/i.test(n) && /输出/.test(n)) {
    if (/输出.*[≤<]=?0\.2k/i.test(n)) return "t:in32k-out-le0.2k";
    if (/输出.*[>＞]0\.2k/i.test(n)) return "t:in32k-out-gt0.2k";
  }

  if (/输入[<≤=]16k|输入<=16k|输入长度\(0,\s*16k|0,\s*16k\)/i.test(n))
    return "t:0-16k";
  if (
    /16k.*32k|16k<=输入<32k|16k≤输入|输入长度\[16k,\s*32k\)|输入长度\(16k,\s*32k/i.test(
      n,
    )
  )
    return "t:16k-32k";

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

  if (/输入<=512k|输入≤512k|0<输入<=512k|\(0,512k/i.test(n)) return "t:0-512k";
  if (/512k<|512k\+|输入>512k/i.test(n)) return "t:512k+";
  if (/0<输入<=32k|0,32k\]|0<token≤32k|输入<=32k|输入<32k/i.test(n))
    return "t:0-32k";
  if (/32k<token|32k<输入/i.test(n)) return "t:32k+";
  if (/32k<输入<=128k/i.test(n)) return "t:32k-128k";

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

  return `t:idx-${tierIndex}`;
}

export const TIER_KEY_ORDER = [
  "uniform",
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
 * @param {Array<{ tierLabel?: string, tierName?: string }>} tiers
 * @param {string} wantKey
 */
export function findTierByKey(tiers, wantKey) {
  if (!tiers?.length || !wantKey || wantKey === "uniform") return null;
  const total = tiers.length;
  for (let i = 0; i < total; i++) {
    const t = tiers[i];
    const label = t.tierLabel ?? t.tierName ?? "";
    const key = tierToKey(label, i, total);
    if (key === wantKey) return t;
  }
  return null;
}
