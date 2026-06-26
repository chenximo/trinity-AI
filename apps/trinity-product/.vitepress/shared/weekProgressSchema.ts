import { STATUS_OPTIONS } from "./roadmapSchema";

export interface WeekProgressRow {
  id: string;
  period: string;
  focus: string;
  owner: string;
  plan: string;
  /** 本周验收达标口径（看板列「达标」） */
  acceptance: string;
  result: string;
  testLink: string;
  blockers: string;
  /** 周汇报记录（会后纪要、飞书链等） */
  weeklyReport: string;
}

export interface WeekProgressMonth {
  id: string;
  goal: string;
  archived: boolean;
  weeks: WeekProgressRow[];
}

export interface WeekProgressData {
  months: WeekProgressMonth[];
}

/** 索引：手风琴顺序（新→旧） */
export interface WeekProgressIndex {
  files: string[];
}

export const WEEK_RESULT_OPTIONS = [...STATUS_OPTIONS] as const;

const WEEK_ROW_SCALAR_KEYS =
  "period|focus|owner|plan|acceptance|result|testLink|blockers|weeklyReport";

function appendWeekTextField(lines: string[], key: string, value: string | undefined, indent = 8) {
  const pad = " ".repeat(indent);
  const v = value?.trim();
  if (!v) return;
  if (v.includes("\n")) {
    lines.push(`${pad}${key}: |-`);
    for (const pl of v.split("\n")) {
      lines.push(`${pad}  ${pl}`);
    }
  } else {
    lines.push(`${pad}${key}: ${yamlQuote(v)}`);
  }
}

function yamlQuote(s: string): string {
  if (/[:#\n"']/.test(s) || s !== s.trim() || /^\d+\.\d+$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

export function emptyWeekProgressData(): WeekProgressData {
  return { months: [] };
}

function readBlockScalar(lines: string[], startIdx: number, weekIndent: number): { value: string; nextIdx: number } {
  const blockLines: string[] = [];
  let i = startIdx;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim()) {
      blockLines.push("");
      i += 1;
      continue;
    }
    const ind = (ln.match(/^(\s*)/) || ["", ""])[1].length;
    if (ind <= weekIndent) break;
    blockLines.push(ln);
    i += 1;
  }
  const nonempty = blockLines.filter((l) => l.trim());
  const minIndent =
    nonempty.length > 0
      ? Math.min(...nonempty.map((l) => (l.match(/^(\s*)/) || ["", ""])[1].length))
      : weekIndent + 2;
  const value = blockLines.map((l) => (l.trim() ? l.slice(minIndent) : "")).join("\n").trimEnd();
  return { value, nextIdx: i - 1 };
}

export function parseWeekProgressYaml(raw: string): WeekProgressData {
  const lines = raw.split("\n");
  const result: WeekProgressData = { months: [] };
  let section = "";
  let currentMonth: WeekProgressMonth | null = null;
  let currentWeek: Partial<WeekProgressRow> | null = null;
  let inWeeks = false;

  function pushWeek() {
    if (!currentMonth || !currentWeek?.id) return;
    currentMonth.weeks.push({
      id: currentWeek.id,
      period: currentWeek.period ?? "",
      focus: currentWeek.focus ?? "",
      owner: currentWeek.owner ?? "—",
      plan: currentWeek.plan ?? "",
      acceptance: currentWeek.acceptance ?? "",
      result: currentWeek.result ?? "⬜",
      testLink: currentWeek.testLink ?? "—",
      blockers: currentWeek.blockers ?? "—",
      weeklyReport: currentWeek.weeklyReport ?? "—",
    });
    currentWeek = null;
  }

  function pushMonth() {
    pushWeek();
    if (currentMonth?.id) result.months.push(currentMonth);
    currentMonth = null;
    inWeeks = false;
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
    const line = lines[lineIdx];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed === "months:") {
      pushMonth();
      section = "months";
      continue;
    }

    if (section !== "months") continue;

    if (trimmed.startsWith("- id:") && !inWeeks) {
      pushMonth();
      const id = trimmed.slice("- id:".length).trim().replace(/^["']|["']$/g, "");
      currentMonth = { id, goal: "", archived: false, weeks: [] };
      continue;
    }

    if (!currentMonth) continue;

    if (trimmed.startsWith("goal:")) {
      currentMonth.goal = trimmed.slice(5).trim().replace(/^["']|["']$/g, "");
      continue;
    }
    if (trimmed.startsWith("archived:")) {
      const v = trimmed.slice(9).trim().toLowerCase();
      currentMonth.archived = v === "true" || v === "yes";
      continue;
    }
    if (trimmed === "weeks:") {
      inWeeks = true;
      continue;
    }

    if (!inWeeks) continue;

    if (trimmed.startsWith("- id:")) {
      pushWeek();
      const id = trimmed.slice("- id:".length).trim().replace(/^["']|["']$/g, "");
      currentWeek = { id };
      continue;
    }

    if (!currentWeek) continue;

    const weekIndent = (line.match(/^(\s*)/) || ["", ""])[1].length;
    const blockKey = trimmed.match(
      new RegExp(`^(${WEEK_ROW_SCALAR_KEYS}):\\s*(\\|[-+]?)?\\s*$`),
    );
    if (blockKey && blockKey[2] !== undefined) {
      const { value, nextIdx } = readBlockScalar(lines, lineIdx + 1, weekIndent);
      (currentWeek as Record<string, string>)[blockKey[1]] = value;
      lineIdx = nextIdx;
      continue;
    }

    const kv = trimmed.match(new RegExp(`^(${WEEK_ROW_SCALAR_KEYS}):\\s*(.*)$`));
    if (kv) {
      const val = kv[2].trim().replace(/^["']|["']$/g, "");
      (currentWeek as Record<string, string>)[kv[1]] = val;
    }
  }

  pushMonth();
  return result;
}

export function stringifyWeekProgressYaml(data: WeekProgressData): string {
  const lines: string[] = ["months:"];
  for (const m of data.months) {
    lines.push(`  - id: ${yamlQuote(m.id)}`);
    if (m.goal?.trim()) lines.push(`    goal: ${yamlQuote(m.goal.trim())}`);
    if (m.archived) lines.push(`    archived: true`);
    lines.push(`    weeks:`);
    for (const w of m.weeks) {
      lines.push(`      - id: ${yamlQuote(w.id)}`);
      if (w.period?.trim()) lines.push(`        period: ${yamlQuote(w.period.trim())}`);
      if (w.focus?.trim()) lines.push(`        focus: ${yamlQuote(w.focus.trim())}`);
      const owner = w.owner?.trim() || "—";
      lines.push(`        owner: ${yamlQuote(owner)}`);
      appendWeekTextField(lines, "plan", w.plan);
      appendWeekTextField(lines, "acceptance", w.acceptance);
      lines.push(`        result: ${yamlQuote(w.result || "⬜")}`);
      const testLink = w.testLink?.trim() || "—";
      lines.push(`        testLink: ${yamlQuote(testLink)}`);
      appendWeekTextField(lines, "blockers", w.blockers?.trim() ? w.blockers : "—");
      appendWeekTextField(lines, "weeklyReport", w.weeklyReport?.trim() ? w.weeklyReport : "—");
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function normalizeWeekProgressData(data: WeekProgressData): WeekProgressData {
  return {
    months: data.months.map((m) => normalizeWeekProgressMonth(m)),
  };
}

export function normalizeWeekProgressMonth(m: WeekProgressMonth): WeekProgressMonth {
  return {
    id: m.id.trim(),
    goal: m.goal?.trim() ?? "",
    archived: Boolean(m.archived),
    weeks: m.weeks.map((w) => ({
      id: w.id.trim(),
      period: w.period?.trim() ?? "",
      focus: w.focus?.trim() ?? "",
      owner: w.owner?.trim() || "—",
      plan: w.plan?.trim() ?? "",
      acceptance: w.acceptance?.trim() ?? "",
      result: w.result?.trim() || "⬜",
      testLink: w.testLink?.trim() || "—",
      blockers: w.blockers?.trim() || "—",
      weeklyReport: w.weeklyReport?.trim() || "—",
    })),
  };
}

/** 索引 `week-progress-index.yml` */
export function parseWeekProgressIndex(raw: string): WeekProgressIndex {
  const files: string[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^-\s+(.+)$/);
    if (m) {
      const f = m[1].trim().replace(/^["']|["']$/g, "");
      if (f) files.push(f);
      continue;
    }
    if (trimmed.startsWith("files:")) continue;
  }
  return { files };
}

export function stringifyWeekProgressIndex(data: WeekProgressIndex): string {
  const lines = ["files:"];
  for (const f of data.files) {
    lines.push(`  - ${yamlQuote(f)}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** 单月文件 `week-progress-N.yml`（根级 id / goal / weeks，无 months 包裹） */
export function parseWeekProgressMonthFile(raw: string): WeekProgressMonth {
  const trimmed = raw.trim();
  if (trimmed.startsWith("months:")) {
    const data = parseWeekProgressYaml(raw);
    const first = data.months[0];
    if (!first?.id) throw new Error("months 为空");
    return first;
  }

  const lines = raw.split("\n");
  let id = "";
  let goal = "";
  let archived = false;
  const weeks: WeekProgressRow[] = [];
  let inWeeks = false;
  let currentWeek: Partial<WeekProgressRow> | null = null;

  function pushWeek() {
    if (!currentWeek?.id) return;
    weeks.push({
      id: currentWeek.id,
      period: currentWeek.period ?? "",
      focus: currentWeek.focus ?? "",
      owner: currentWeek.owner ?? "—",
      plan: currentWeek.plan ?? "",
      acceptance: currentWeek.acceptance ?? "",
      result: currentWeek.result ?? "⬜",
      testLink: currentWeek.testLink ?? "—",
      blockers: currentWeek.blockers ?? "—",
      weeklyReport: currentWeek.weeklyReport ?? "—",
    });
    currentWeek = null;
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
    const line = lines[lineIdx];
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;

    if (t.startsWith("id:") && !inWeeks) {
      id = t.slice(3).trim().replace(/^["']|["']$/g, "");
      continue;
    }
    if (t.startsWith("goal:") && !inWeeks) {
      goal = t.slice(5).trim().replace(/^["']|["']$/g, "");
      continue;
    }
    if (t.startsWith("archived:") && !inWeeks) {
      const v = t.slice(9).trim().toLowerCase();
      archived = v === "true" || v === "yes";
      continue;
    }
    if (t === "weeks:") {
      inWeeks = true;
      continue;
    }
    if (!inWeeks) continue;

    if (t.startsWith("- id:")) {
      pushWeek();
      currentWeek = { id: t.slice("- id:".length).trim().replace(/^["']|["']$/g, "") };
      continue;
    }
    if (!currentWeek) continue;

    const weekIndent = (line.match(/^(\s*)/) || ["", ""])[1].length;
    const blockKey = t.match(new RegExp(`^(${WEEK_ROW_SCALAR_KEYS}):\\s*(\\|[-+]?)?\\s*$`));
    if (blockKey && blockKey[2] !== undefined) {
      const { value, nextIdx } = readBlockScalar(lines, lineIdx + 1, weekIndent);
      (currentWeek as Record<string, string>)[blockKey[1]] = value;
      lineIdx = nextIdx;
      continue;
    }
    const kv = t.match(new RegExp(`^(${WEEK_ROW_SCALAR_KEYS}):\\s*(.*)$`));
    if (kv) {
      (currentWeek as Record<string, string>)[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  pushWeek();
  if (!id) throw new Error("缺少 id");
  return { id, goal, archived, weeks };
}

export function stringifyWeekProgressMonthFile(m: WeekProgressMonth): string {
  const month = normalizeWeekProgressMonth(m);
  const lines: string[] = [`id: ${yamlQuote(month.id)}`];
  if (month.goal?.trim()) lines.push(`goal: ${yamlQuote(month.goal.trim())}`);
  if (month.archived) lines.push(`archived: true`);
  lines.push(`weeks:`);
  for (const w of month.weeks) {
    lines.push(`  - id: ${yamlQuote(w.id)}`);
    if (w.period?.trim()) lines.push(`    period: ${yamlQuote(w.period.trim())}`);
    if (w.focus?.trim()) lines.push(`    focus: ${yamlQuote(w.focus.trim())}`);
    lines.push(`    owner: ${yamlQuote(w.owner?.trim() || "—")}`);
    appendWeekTextField(lines, "plan", w.plan, 4);
    appendWeekTextField(lines, "acceptance", w.acceptance, 4);
    lines.push(`    result: ${yamlQuote(w.result || "⬜")}`);
    lines.push(`    testLink: ${yamlQuote(w.testLink?.trim() || "—")}`);
    appendWeekTextField(lines, "blockers", w.blockers?.trim() ? w.blockers : "—", 4);
    appendWeekTextField(lines, "weeklyReport", w.weeklyReport?.trim() ? w.weeklyReport : "—", 4);
  }
  lines.push("");
  return lines.join("\n");
}

export function isWeekProgressMonthFileRel(rel: string): boolean {
  return /week-progress-\d+\.yml$/i.test(rel.replace(/^\//, ""));
}

export function isWeekProgressIndexRel(rel: string): boolean {
  return rel.replace(/^\//, "").endsWith("week-progress-index.yml");
}
