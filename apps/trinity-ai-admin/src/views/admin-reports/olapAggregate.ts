import type {
  ReportOlapDimensionId,
  ReportOlapFactRow,
  ReportOlapGrain,
  ReportOlapMetricId,
} from "./mock";

export type ReportOlapAggRow = {
  key: string;
  dateLabel?: string;
  tenantName?: string;
  modelName?: string;
  lineLabel?: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  costCny: number;
};

function grainLabel(date: string, grain: ReportOlapGrain): string {
  if (grain === "day") return date;
  if (grain === "month") return date.slice(0, 7);
  const d = new Date(`${date}T00:00:00`);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function dimKey(row: ReportOlapFactRow, dim: ReportOlapDimensionId, grain: ReportOlapGrain): string {
  switch (dim) {
    case "date":
      return grainLabel(row.date, grain);
    case "tenant":
      return row.tenantId;
    case "model":
      return row.modelId;
    case "line":
      return row.supplyLineId;
    default:
      return "";
  }
}

function applyDimLabels(agg: ReportOlapAggRow, row: ReportOlapFactRow, dim: ReportOlapDimensionId, grain: ReportOlapGrain): void {
  switch (dim) {
    case "date":
      agg.dateLabel = grainLabel(row.date, grain);
      break;
    case "tenant":
      agg.tenantName = row.tenantName;
      break;
    case "model":
      agg.modelName = row.modelName;
      break;
    case "line":
      agg.lineLabel = `${row.supplierName} · ${row.supplyLineId}`;
      break;
    default:
      break;
  }
}

export function aggregateOlapFacts(
  rows: ReportOlapFactRow[],
  dimensions: ReportOlapDimensionId[],
  grain: ReportOlapGrain,
): ReportOlapAggRow[] {
  const dims = dimensions.length > 0 ? dimensions : (["date", "tenant", "model"] as ReportOlapDimensionId[]);
  const map = new Map<string, ReportOlapAggRow>();

  for (const row of rows) {
    const parts = dims.map((d) => dimKey(row, d, grain));
    const key = parts.join("\u0001");
    let agg = map.get(key);
    if (!agg) {
      agg = {
        key,
        requests: 0,
        tokensIn: 0,
        tokensOut: 0,
        costCny: 0,
      };
      for (const d of dims) applyDimLabels(agg, row, d, grain);
      map.set(key, agg);
    }
    agg.requests += row.requests;
    agg.tokensIn += row.tokensIn;
    agg.tokensOut += row.tokensOut;
    agg.costCny += row.costCny;
  }

  return [...map.values()].sort((a, b) => {
    const da = a.dateLabel ?? "";
    const db = b.dateLabel ?? "";
    if (da !== db) return da < db ? -1 : 1;
    const ta = a.tenantName ?? "";
    const tb = b.tenantName ?? "";
    return ta.localeCompare(tb, "zh-CN");
  });
}

export function formatOlapMetric(value: number, metric: ReportOlapMetricId): string {
  if (metric === "costCny") return `¥${value.toFixed(2)}`;
  if (metric === "requests") return value.toLocaleString("zh-CN");
  return value.toLocaleString("zh-CN");
}

export function metricValue(row: ReportOlapAggRow, metric: ReportOlapMetricId): number {
  switch (metric) {
    case "requests":
      return row.requests;
    case "tokensIn":
      return row.tokensIn;
    case "tokensOut":
      return row.tokensOut;
    case "costCny":
      return row.costCny;
    default:
      return 0;
  }
}
