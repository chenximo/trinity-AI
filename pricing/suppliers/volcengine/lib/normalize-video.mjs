import { cleanCell } from "./scrape-doc.mjs";

/**
 * @param {string} raw
 */
function parsePrice(raw) {
  const s = cleanCell(raw);
  if (!s || s === "-" || /不支持/.test(s)) return null;
  const range = s.match(/([\d.]+)\s*[~～]\s*([\d.]+)/);
  if (range) return { value: range[1], raw: s, isRange: true };
  const single = s.match(/^([\d.]+)/);
  if (single) return { value: single[1], raw: s, isRange: false };
  return null;
}

/**
 * @param {string} cell
 */
function extractModelIds(cell) {
  const s = cleanCell(cell);
  const ids = s.match(/doubao-seedance-[a-z0-9.-]+/gi) ?? [];
  return [...new Set(ids.map((id) => id.toLowerCase()))];
}

/**
 * @param {import('./scrape-doc.mjs').scrapeVolcengineDoc extends (...args: any) => Promise<infer R> ? R : never} raw
 */
export function normalizeVideoFromRaw(raw) {
  /** @type {Map<string, { vendorModelId: string, modelName: string, tiers: Array<{ attribute: string, price: string, unit: string, note?: string }> }>} */
  const byModel = new Map();

  const ensure = (id) => {
    if (!byModel.has(id)) {
      byModel.set(id, {
        vendorModelId: id,
        modelName: id.replace(/^doubao-/, "Doubao-"),
        tiers: [],
      });
    }
    return byModel.get(id);
  };

  for (const table of raw.tables ?? []) {
    const ctx = table.billingContext;
    const headers = table.headers;

    if (ctx === "按token单价") {
      for (const row of table.rows) {
        const ids = extractModelIds(row[0] ?? "");
        const online = cleanCell(row[1]);
        if (!ids.length || !online) continue;
        for (const id of ids) {
          ensure(id).tiers.push({
            attribute: "在线推理·按token",
            price: online.slice(0, 200),
            unit: "元/百万tokens",
            note: "分辨率/是否含视频输入分档，见官网表",
          });
        }
      }
      continue;
    }

    if (ctx === "输入不含视频" || ctx === "输入包含视频") {
      const modelCols = headers
        .map((h, i) => ({ h, i }))
        .filter(({ h }) => /doubao-seedance/i.test(h));
      for (const row of table.rows) {
        const resolution = row[0];
        const aspect = row[1];
        if (!resolution || !aspect || /元/.test(resolution)) continue;
        const duration = row[2] ?? row[3];
        for (const { h, i } of modelCols) {
          const idMatch = h.match(/doubao-seedance-[a-z0-9.-]+/i);
          if (!idMatch) continue;
          const id = idMatch[0].toLowerCase();
          const perClip = parsePrice(row[i]);
          const perSec = parsePrice(row[i + 1]);
          if (!perClip && !perSec) continue;
          const attr = `${ctx}·${resolution}·${aspect}·${duration}s`;
          const parts = [];
          if (perClip) parts.push(`${perClip.raw}元/个`);
          if (perSec) parts.push(`${perSec.raw}元/s`);
          ensure(id).tiers.push({
            attribute: attr,
            price: parts.join(" · "),
            unit: "元/个",
          });
        }
      }
      continue;
    }

    if (ctx === "doubao-seedance-1.5-pro" && /有声视频/.test(headers.join(" "))) {
      const id = "doubao-seedance-1.5-pro";
      for (const row of table.rows) {
        const resolution = row[0];
        const aspect = row[1];
        const duration = row[2];
        if (!resolution || !aspect) continue;
        const entry = ensure(id);
        const labels = [
          "有声视频",
          "Draft有声",
          "无声视频",
          "Draft无声",
        ];
        for (let i = 0; i < labels.length; i++) {
          const p = parsePrice(row[3 + i]);
          if (!p) continue;
          entry.tiers.push({
            attribute: `${resolution}·${aspect}·${duration}s·${labels[i]}`,
            price: p.value,
            unit: "元/个",
          });
        }
      }
    }
  }

  return [...byModel.values()].filter((m) => m.tiers.length > 0);
}

/**
 * @param {ReturnType<typeof normalizeVideoFromRaw>} sheet
 * @param {Record<string, { trinityId?: string }>} trinityMap
 */
export function buildVideoApiModels(sheet, trinityMap = {}) {
  return sheet.map((entry) => {
    const trinityId =
      trinityMap[entry.vendorModelId]?.trinityId ??
      trinityMap[entry.vendorModelId.toLowerCase()]?.trinityId ??
      null;

    return {
      modality: "video",
      modelId: entry.vendorModelId,
      trinityId,
      upstreamModelId: entry.vendorModelId,
      vendorCode: "Doubao",
      vendorName: "豆包",
      modelName: entry.modelName,
      displayName: `豆包 ${entry.modelName}`,
      brand: "火山方舟",
      modelType: "Video",
      currency: "CNY",
      priceUnit: "元/个",
      region: "中国内地",
      tiers: entry.tiers.map((t) => ({
        tierType: "Tiered",
        tierName: t.attribute,
        price: t.price,
        unit: t.unit,
        chargeUnit: "VIDEO",
        note: t.note ?? null,
      })),
    };
  });
}
