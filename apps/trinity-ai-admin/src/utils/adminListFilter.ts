/** 列表页本地检索（mock 前端过滤，工程期换 API） */
export function filterByQuery<T>(
  rows: readonly T[],
  query: string,
  pickText: (row: T) => string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...rows];
  return rows.filter((row) => pickText(row).toLowerCase().includes(q));
}

export function uniqueFieldValues<T>(
  rows: readonly T[],
  pick: (row: T) => string,
): string[] {
  return [...new Set(rows.map(pick).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}
