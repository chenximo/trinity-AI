/**
 * 多档价对齐：按 input 单价匹配，避免「输入长度档 vs 总 token 档」索引错位
 */

export function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** @param {{ input?: number|null, output?: number|null, cache?: number|null, tierLabel?: string }} tier */
export function tierInputUsd(tier, currency = "USD", fx = 6.5) {
  if (!tier) return null;
  const raw = num(tier.input);
  if (raw == null) return null;
  return currency === "CNY" ? raw / fx : raw;
}

function relClose(a, b, relTol = 0.08) {
  if (a == null || b == null) return false;
  const base = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  return Math.abs(a - b) / base <= relTol;
}

/**
 * 按 input USD 价贪心配对两档列表（允许顺序颠倒）
 * @returns {Array<{ a: object|null, b: object|null, match: 'price'|'index'|'a-only'|'b-only' }>}
 */
export function alignTierPairs(tiersA, tiersB, { fx = 6.5, currencyA = "USD" } = {}) {
  const aList = tiersA ?? [];
  const bList = tiersB ?? [];
  if (!aList.length && !bList.length) return [];
  if (!aList.length) return bList.map((b) => ({ a: null, b, match: "b-only" }));
  if (!bList.length) return aList.map((a) => ({ a, b: null, match: "a-only" }));

  // 双方各一档时强制配对（即使价不同，便于展示同一模型对照）
  if (aList.length === 1 && bList.length === 1) {
    const au = tierInputUsd(aList[0], currencyA, fx);
    const bu = tierInputUsd(bList[0], "USD", fx);
    const match = relClose(au, bu) ? "index" : "price";
    return [{ a: aList[0], b: bList[0], match }];
  }

  const aUsd = aList.map((t) => tierInputUsd(t, currencyA, fx));
  const bUsd = bList.map((t) => tierInputUsd(t, "USD", fx));

  const usedB = new Set();
  const pairs = [];

  for (let i = 0; i < aList.length; i++) {
    let bestJ = -1;
    let bestDist = Infinity;
    for (let j = 0; j < bList.length; j++) {
      if (usedB.has(j)) continue;
      const au = aUsd[i];
      const bu = bUsd[j];
      if (au == null || bu == null) continue;
      const dist = Math.abs(au - bu);
      if (dist < bestDist) {
        bestDist = dist;
        bestJ = j;
      }
    }
    if (bestJ >= 0 && relClose(aUsd[i], bUsd[bestJ])) {
      usedB.add(bestJ);
      pairs.push({
        a: aList[i],
        b: bList[bestJ],
        match: i === bestJ ? "index" : "price",
      });
    } else if (aList[i]) {
      pairs.push({ a: aList[i], b: null, match: "a-only" });
    }
  }

  for (let j = 0; j < bList.length; j++) {
    if (!usedB.has(j)) {
      pairs.push({ a: null, b: bList[j], match: "b-only" });
    }
  }

  return pairs;
}

/** 与 OpenRouter 单档最相近的线上/官方档（按 input 价） */
export function pickTierClosestToRef(tiers, refInput, { currency = "USD", fx = 6.5 } = {}) {
  if (!tiers?.length || refInput == null) return null;
  let best = null;
  let bestDist = Infinity;
  for (const t of tiers) {
    const u = tierInputUsd(t, currency, fx);
    if (u == null) continue;
    const dist = Math.abs(u - refInput);
    if (dist < bestDist) {
      bestDist = dist;
      best = t;
    }
  }
  return best;
}

export function tierLabelOf(...candidates) {
  for (const t of candidates) {
    if (t?.tierLabel) return t.tierLabel;
  }
  return "—";
}

export function alignNote(match, orSingleTier, hasOr) {
  if (!hasOr) return null;
  if (match === "price") return "官方/线上按价对齐";
  if (orSingleTier && (match === "a-only" || match === "b-only")) {
    return "OR仅单档，此上下文无OR对照";
  }
  return null;
}
