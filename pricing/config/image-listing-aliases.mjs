/**
 * 生图线上刊例 slug → Trinity ID（ID 不必字面一致，能对应即可）
 *
 * 自动规则（代码里另做）：trinity-map 的 vendorModelId === 线上 model 时，
 * 也会挂上对应 Trinity ID，无需在此重复（如 GG-2.5 ↔ gemini-2.5-flash-image）。
 *
 * 本表只补「map 原厂 id ≠ 线上 slug」的缺口。
 */
export const IMAGE_ONLINE_TO_TRINITY = {
  // 线上 model → Trinity ID（或数组）
  "viduq2-image": "Vidu-q2",
  "gemini-3.1-flash-image": "GG-3.1",
  // lite 暂无独立 Trinity 短名；先挂到 GG-3.1 仅便于看见线上价，产品若拆 SKU 再改 map
  // "gemini-3.1-flash-lite-image": "GG-3.1",
  // gpt-image-2 为 token 计价，与 OG-image2-low/med/high 按张分档形态不同，不自动并入
  // "gpt-image-2-discount": … 若日后有对应短名再补
};

/**
 * @param {object[]} onlineData GET /v1/prices image data[]
 * @param {Record<string, { vendorModelId?: string }>} vendorMap trinity-map（已小写 key 亦可）
 * @param {Record<string, string|string[]>} [aliases]
 * @returns {{ onlineByModel: Map<string, object>, onlineByJoinKey: Map<string, object> }}
 */
export function buildImageOnlineJoinIndex(
  onlineData,
  vendorMap,
  aliases = IMAGE_ONLINE_TO_TRINITY,
) {
  /** @type {Map<string, object>} 仅真实线上 slug，供 P6 */
  const onlineByModel = new Map();
  /** @type {Map<string, object>} slug + Trinity ID + vendorModelId，供刊例列 join */
  const onlineByJoinKey = new Map();

  const indexJoin = (key, entry) => {
    if (!key) return;
    const k = String(key).toLowerCase();
    if (!onlineByJoinKey.has(k)) onlineByJoinKey.set(k, entry);
  };

  for (const entry of onlineData ?? []) {
    const onlineId = entry.model?.toLowerCase();
    if (!onlineId) continue;
    onlineByModel.set(onlineId, entry);
    indexJoin(onlineId, entry);

    for (const [tid, meta] of Object.entries(vendorMap ?? {})) {
      if (tid.startsWith("_")) continue;
      const vendorId = meta?.vendorModelId?.toLowerCase();
      if (vendorId && vendorId === onlineId) {
        indexJoin(tid, entry);
        indexJoin(vendorId, entry);
      }
    }

    const targets = aliases[onlineId];
    if (targets) {
      for (const t of [].concat(targets)) {
        indexJoin(t, entry);
      }
    }
  }

  return { onlineByModel, onlineByJoinKey };
}

/**
 * @param {Map<string, object>} onlineByJoinKey
 * @param {string|null|undefined} trinityId
 * @param {string|null|undefined} vendorModelId
 */
export function resolveOnlineImageEntry(
  onlineByJoinKey,
  trinityId,
  vendorModelId,
) {
  if (!onlineByJoinKey?.size) return null;
  const tid = trinityId?.toLowerCase();
  if (tid && onlineByJoinKey.has(tid)) return onlineByJoinKey.get(tid);
  const vid = vendorModelId?.toLowerCase();
  if (vid && onlineByJoinKey.has(vid)) return onlineByJoinKey.get(vid);
  return null;
}

/**
 * P6：线上 slug 字面在表内，或能 join 到表内 Trinity ID，即算覆盖。
 * @param {Map<string, object>} onlineByModel
 * @param {Map<string, object>} onlineByJoinKey
 * @param {Iterable<string>} tableIds 对比表 trinityId / vendorModelId / slug
 * @returns {Set<string>}
 */
export function coveredOnlineImageSlugs(
  onlineByModel,
  onlineByJoinKey,
  tableIds,
) {
  const ids = [...(tableIds ?? [])]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  const covered = new Set();
  for (const [slug, entry] of onlineByModel?.entries() ?? []) {
    if (ids.includes(slug)) {
      covered.add(slug);
      continue;
    }
    for (const tid of ids) {
      const resolved = onlineByJoinKey?.get(tid);
      if (
        resolved &&
        (resolved === entry ||
          resolved.model?.toLowerCase() === entry.model?.toLowerCase())
      ) {
        covered.add(slug);
        break;
      }
    }
  }
  return covered;
}

/** @returns {string[]} 线上有、对比表仍盖不到的 slug */
export function unmatchedOnlineImageSlugs(
  onlineByModel,
  onlineByJoinKey,
  tableIds,
) {
  const covered = coveredOnlineImageSlugs(
    onlineByModel,
    onlineByJoinKey,
    tableIds,
  );
  return [...(onlineByModel?.keys() ?? [])].filter((slug) => !covered.has(slug));
}
