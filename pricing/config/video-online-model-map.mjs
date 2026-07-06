/**
 * Trinity 生视频 ID → GET /v1/prices?modality=video 的 model 字段
 * @deprecated 新映射请写入 `video-model-registry.mjs`；本文件保留兼容导出
 */

import {
  VIDEO_MODEL_REGISTRY,
  getVideoRegistryByTrinityId,
} from "./video-model-registry.mjs";

/** @type {Record<string, string|null>} */
export const VIDEO_ONLINE_MODEL_BY_TRINITY = Object.fromEntries(
  VIDEO_MODEL_REGISTRY.filter((e) => e.trinityId).map((e) => [
    e.trinityId,
    e.onlineSlug ?? null,
  ]),
);

/** @param {string|null|undefined} trinityId */
export function resolveVideoOnlineModelId(trinityId) {
  if (!trinityId) return null;
  const key = trinityId.toLowerCase();
  const reg = getVideoRegistryByTrinityId(key);
  if (reg) return reg.onlineSlug?.toLowerCase() ?? null;
  if (key in VIDEO_ONLINE_MODEL_BY_TRINITY) {
    return VIDEO_ONLINE_MODEL_BY_TRINITY[key];
  }
  return key;
}
