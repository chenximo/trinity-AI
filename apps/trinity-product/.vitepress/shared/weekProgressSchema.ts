import { STATUS_OPTIONS } from "./roadmapSchema";

export interface WeekProgressRow {
  id: string;
  period: string;
  focus: string;
  owner: string;
  plan: string;
  result: string;
  dependencies: string;
  testLink: string;
  bugList: string;
  blockers: string;
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

export const WEEK_RESULT_OPTIONS = [...STATUS_OPTIONS] as const;

function yamlQuote(s: string): string {
  if (/[:#\n"']/.test(s) || s !== s.trim() || /^\d+\.\d+$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

export function emptyWeekProgressData(): WeekProgressData {
  return { months: [] };
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
      result: currentWeek.result ?? "⬜",
      dependencies: currentWeek.dependencies ?? "—",
      testLink: currentWeek.testLink ?? "—",
      bugList: currentWeek.bugList ?? "—",
      blockers: currentWeek.blockers ?? "—",
    });
    currentWeek = null;
  }

  function pushMonth() {
    pushWeek();
    if (currentMonth?.id) result.months.push(currentMonth);
    currentMonth = null;
    inWeeks = false;
  }

  for (const line of lines) {
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

    const kv = trimmed.match(/^(period|focus|owner|plan|result|dependencies|testLink|bugList|blockers):\s*(.*)$/);
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
      if (w.plan?.trim()) lines.push(`        plan: ${yamlQuote(w.plan.trim())}`);
      lines.push(`        result: ${yamlQuote(w.result || "⬜")}`);
      const dependencies = w.dependencies?.trim() || "—";
      lines.push(`        dependencies: ${yamlQuote(dependencies)}`);
      const testLink = w.testLink?.trim() || "—";
      lines.push(`        testLink: ${yamlQuote(testLink)}`);
      const bugList = w.bugList?.trim() || "—";
      lines.push(`        bugList: ${yamlQuote(bugList)}`);
      const blockers = w.blockers?.trim() || "—";
      lines.push(`        blockers: ${yamlQuote(blockers)}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function normalizeWeekProgressData(data: WeekProgressData): WeekProgressData {
  return {
    months: data.months.map((m) => ({
      id: m.id.trim(),
      goal: m.goal?.trim() ?? "",
      archived: Boolean(m.archived),
      weeks: m.weeks.map((w) => ({
        id: w.id.trim(),
        period: w.period?.trim() ?? "",
        focus: w.focus?.trim() ?? "",
        owner: w.owner?.trim() || "—",
        plan: w.plan?.trim() ?? "",
        result: w.result?.trim() || "⬜",
        dependencies: w.dependencies?.trim() || "—",
        testLink: w.testLink?.trim() || "—",
        bugList: w.bugList?.trim() || "—",
        blockers: w.blockers?.trim() || "—",
      })),
    })),
  };
}
