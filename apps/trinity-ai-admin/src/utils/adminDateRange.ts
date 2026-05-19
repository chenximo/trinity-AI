/** 运营后台日期范围：快捷项与行时间解析（mock 前端过滤，工程期换 API） */

export type AdminDateRange = [Date, Date];

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Element Plus `el-date-picker` shortcuts（若依式） */
export const ADMIN_DATE_RANGE_SHORTCUTS = [
  {
    text: "今天",
    value: (): AdminDateRange => {
      const now = new Date();
      return [startOfDay(now), endOfDay(now)];
    },
  },
  {
    text: "昨天",
    value: (): AdminDateRange => {
      const y = daysAgo(1);
      return [startOfDay(y), endOfDay(y)];
    },
  },
  {
    text: "近 7 天",
    value: (): AdminDateRange => {
      const end = endOfDay(new Date());
      const start = startOfDay(daysAgo(6));
      return [start, end];
    },
  },
  {
    text: "近 30 天",
    value: (): AdminDateRange => {
      const end = endOfDay(new Date());
      const start = startOfDay(daysAgo(29));
      return [start, end];
    },
  },
  {
    text: "本月",
    value: (): AdminDateRange => {
      const now = new Date();
      return [startOfMonth(now), endOfMonth(now)];
    },
  },
  {
    text: "上月",
    value: (): AdminDateRange => {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return [startOfMonth(prev), endOfMonth(prev)];
    },
  },
] as const;

export const ADMIN_DATE_RANGE_DEFAULT_TIME: [Date, Date] = [
  new Date(2000, 0, 1, 0, 0, 0),
  new Date(2000, 0, 1, 23, 59, 59),
];

/** 解析列表行时间：`YYYY-MM-DD HH:mm:ss` 或仅 `HH:mm:ss`（视为今天） */
export function parseAdminDateTime(raw: string): Date | null {
  const s = raw.trim();
  const full = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})$/.exec(s);
  if (full) {
    const t = Date.parse(`${full[1]}T${full[2]}`);
    return Number.isNaN(t) ? null : new Date(t);
  }
  const timeOnly = /^(\d{2}):(\d{2}):(\d{2})$/.exec(s);
  if (timeOnly) {
    const d = new Date();
    d.setHours(Number(timeOnly[1]), Number(timeOnly[2]), Number(timeOnly[3]), 0);
    return d;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

/** 将选择器返回值规范为整日边界（daterange 结束日含当天 23:59:59） */
export function normalizeAdminDateRange(range: AdminDateRange): AdminDateRange {
  return [startOfDay(range[0]), endOfDay(range[1])];
}

export function isWithinAdminDateRange(
  raw: string,
  range: AdminDateRange | null | undefined,
): boolean {
  if (!range) return true;
  const t = parseAdminDateTime(raw);
  if (!t) return true;
  const [start, end] = normalizeAdminDateRange(range);
  const ms = t.getTime();
  return ms >= start.getTime() && ms <= end.getTime();
}

/** 账期 `YYYY-MM` 与日期范围是否有交集（账单列表筛选） */
export function isBillingPeriodWithinAdminDateRange(
  period: string,
  range: AdminDateRange | null | undefined,
): boolean {
  if (!range) return true;
  const m = /^(\d{4})-(\d{2})$/.exec(period.trim());
  if (!m) return true;
  const monthStart = new Date(Number(m[1]), Number(m[2]) - 1, 1, 0, 0, 0, 0);
  const monthEnd = endOfMonth(monthStart);
  const [start, end] = normalizeAdminDateRange(range);
  return monthEnd.getTime() >= start.getTime() && monthStart.getTime() <= end.getTime();
}
