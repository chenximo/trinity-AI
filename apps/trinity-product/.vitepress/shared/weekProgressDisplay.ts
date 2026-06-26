import type { WeekProgressMonth } from "./weekProgressSchema";

export type PlanTextSeg = { kind: "text" | "at"; value: string };

const PLAN_TASK_RE = /^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]/;
const PLAN_AT_RE = /@[^@\s、，,；;（）()\n]+/g;

export function monthHeading(m: WeekProgressMonth): string {
  const goal = m.goal?.trim();
  return goal ? `${m.id}（${goal}）` : m.id;
}

export function focusItems(v: string): string[] {
  const raw = (v || "").trim();
  if (!raw || raw === "—") return [];
  return raw
    .split(/[、,，]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 看板展示：06-01～06-07 → 06.01～06.07 */
export function formatPeriodLabel(period: string): string {
  const p = (period || "").trim();
  if (!p || p === "—") return "";
  return p.replace(/(\d{1,2})-(\d{1,2})/g, "$1.$2");
}

export function isHttpLink(v: string): boolean {
  return /^https?:\/\//.test(v.trim());
}

export function planDisplayLines(plan: string): string[] {
  const v = (plan || "").trim();
  if (!v) return [];
  const rows: string[] = [];
  for (const raw of v.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const pieces = line
      .split(/(?=[①②③④⑤⑥⑦⑧⑨⑩⑪⑫])/)
      .map((s) => s.trim())
      .filter(Boolean);
    rows.push(...pieces);
  }
  return rows;
}

export function isPlanTaskLine(line: string): boolean {
  return PLAN_TASK_RE.test(line.trim());
}

export function planLineSegments(line: string): PlanTextSeg[] {
  const out: PlanTextSeg[] = [];
  let last = 0;
  for (const m of line.matchAll(PLAN_AT_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ kind: "text", value: line.slice(last, idx) });
    out.push({ kind: "at", value: m[0] });
    last = idx + m[0].length;
  }
  if (last < line.length) out.push({ kind: "text", value: line.slice(last) });
  return out.length ? out : [{ kind: "text", value: line }];
}

export function textPreview(value: string, maxLen = 56): string {
  const v = (value || "").trim();
  if (!v) return "（空，点击编辑）";
  const oneLine = v.replace(/\s*\n\s*/g, " / ");
  return oneLine.length > maxLen ? `${oneLine.slice(0, maxLen)}…` : oneLine;
}
