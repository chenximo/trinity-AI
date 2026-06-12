export interface ProductBacklogItem {
  module: string;
  /** docs 相对路径（不含 `ai-api-platform/` 前缀亦可），用于模块列链接 */
  leaf?: string;
  task: string;
  target?: string;
  note?: string;
}

export interface ProductBacklogData {
  items: ProductBacklogItem[];
}

function yamlQuote(s: string): string {
  if (/[:#\n"']/.test(s) || s !== s.trim() || /^\d+\.\d+$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

export function emptyProductBacklogData(): ProductBacklogData {
  return { items: [] };
}

function readBlockScalar(lines: string[], startIdx: number, itemIndent: number): { value: string; nextIdx: number } {
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
    if (ind <= itemIndent) break;
    blockLines.push(ln);
    i += 1;
  }
  const nonempty = blockLines.filter((l) => l.trim());
  const minIndent =
    nonempty.length > 0
      ? Math.min(...nonempty.map((l) => (l.match(/^(\s*)/) || ["", ""])[1].length))
      : itemIndent + 2;
  const value = blockLines.map((l) => (l.trim() ? l.slice(minIndent) : "")).join("\n").trimEnd();
  return { value, nextIdx: i - 1 };
}

function startBacklogItem(
  result: ProductBacklogData,
  current: ProductBacklogItem | null,
  indent: number,
): { current: ProductBacklogItem; itemIndent: number } {
  if (current) result.items.push(current);
  return { current: { module: "", task: "" }, itemIndent: indent };
}

function applyBacklogField(
  current: ProductBacklogItem,
  key: string,
  rest: string,
  lines: string[],
  lineIdx: number,
  fieldIndent: number,
): number {
  if (rest === "|-" || rest === "|") {
    const { value, nextIdx } = readBlockScalar(lines, lineIdx + 1, fieldIndent);
    if (key === "task") current.task = value;
    else if (key === "note") current.note = value;
    return nextIdx;
  }
  const unquoted = rest.replace(/^["']|["']$/g, "");
  if (key === "module") current.module = unquoted;
  else if (key === "leaf") current.leaf = unquoted;
  else if (key === "task") current.task = unquoted;
  else if (key === "target") current.target = unquoted;
  else if (key === "note") current.note = unquoted;
  return lineIdx;
}

export function parseProductBacklogYaml(raw: string): ProductBacklogData {
  const lines = raw.split("\n");
  const result: ProductBacklogData = { items: [] };
  let current: ProductBacklogItem | null = null;
  let itemIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed === "items:") continue;

    const dashMatch = line.match(/^(\s*)-\s*(.*)$/);
    if (dashMatch && dashMatch[1].length >= 2) {
      const indent = dashMatch[1].length;
      const afterDash = dashMatch[2];
      if (!afterDash.trim()) {
        const started = startBacklogItem(result, current, indent);
        current = started.current;
        itemIndent = started.itemIndent;
        continue;
      }
      const inlineKv = afterDash.trim().match(/^(\w+):\s*(.*)$/);
      if (inlineKv) {
        const started = startBacklogItem(result, current, indent);
        current = started.current;
        itemIndent = started.itemIndent;
        i = applyBacklogField(current, inlineKv[1], inlineKv[2], lines, i, indent + 2);
        continue;
      }
    }

    const kvMatch = line.match(/^(\s+)(\w+):\s*(.*)$/);
    if (!kvMatch || !current) continue;
    const key = kvMatch[2];
    const rest = kvMatch[3];
    const indent = kvMatch[1].length;
    if (indent <= itemIndent) continue;

    i = applyBacklogField(current, key, rest, lines, i, indent);
  }

  if (current) result.items.push(current);
  return result;
}

function appendField(lines: string[], indent: string, key: string, value: string | undefined) {
  const v = value?.trim();
  if (!v) return;
  if (v.includes("\n")) {
    lines.push(`${indent}${key}: |-`);
    for (const pl of v.split("\n")) {
      lines.push(`${indent}  ${pl}`);
    }
  } else {
    lines.push(`${indent}${key}: ${yamlQuote(v)}`);
  }
}

export function stringifyProductBacklogYaml(data: ProductBacklogData): string {
  const lines: string[] = ["items:"];
  for (const item of data.items) {
    lines.push("  -");
    lines.push(`    module: ${yamlQuote(item.module)}`);
    if (item.leaf?.trim()) lines.push(`    leaf: ${yamlQuote(item.leaf.trim())}`);
    appendField(lines, "    ", "task", item.task);
    if (item.target?.trim()) lines.push(`    target: ${yamlQuote(item.target.trim())}`);
    appendField(lines, "    ", "note", item.note);
  }
  return `${lines.join("\n")}\n`;
}

export function normalizeProductBacklogData(data: ProductBacklogData): ProductBacklogData {
  const items = data.items
    .map((item) => ({
      module: item.module?.trim() || "",
      leaf: item.leaf?.trim() || undefined,
      task: item.task?.trim() || "",
      target: item.target?.trim() || undefined,
      note: item.note?.trim() || undefined,
    }))
    .filter((item) => item.module || item.task);
  return { items };
}
