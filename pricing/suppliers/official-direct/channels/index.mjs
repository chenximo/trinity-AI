import { SUPPLIER_META as wangjuCloudportal } from "./wangju-cloudportal.mjs";
import { SUPPLIER_META as relayCust } from "./relay-cust.mjs";

/** 已登记的原厂直连渠道（新增渠道：加 channels/*.mjs 并列入此数组） */
export const OFFICIAL_DIRECT_CHANNELS = [wangjuCloudportal, relayCust];

/** @param {string} supplierId */
export function getOfficialDirectChannel(supplierId) {
  const meta = OFFICIAL_DIRECT_CHANNELS.find((c) => c.supplierId === supplierId);
  if (!meta) {
    throw new Error(
      `未知 official-direct 渠道: ${supplierId}。请在 pricing/suppliers/official-direct/channels/ 登记`,
    );
  }
  return meta;
}
