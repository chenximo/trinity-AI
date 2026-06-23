export interface ReleaseShippedItem {
  module: string;
  leaf?: string;
  change: string;
}

export interface ProductRelease {
  version: string;
  week?: string;
  title: string;
  summary?: string;
  shipped: ReleaseShippedItem[];
  deploy?: string;
  note?: string;
}

export interface ReleaseNotesData {
  releases: ProductRelease[];
}

function yamlQuote(s: string): string {
  if (/[:#\n"']/.test(s) || s !== s.trim() || /^\d+\.\d+$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

export function emptyReleaseNotesData(): ReleaseNotesData {
  return { releases: [] };
}

function readBlockScalar(lines: string[], startIdx: number, parentIndent: number): { value: string; nextIdx: number } {
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
    if (ind <= parentIndent) break;
    blockLines.push(ln);
    i += 1;
  }
  const nonempty = blockLines.filter((l) => l.trim());
  const minIndent =
    nonempty.length > 0
      ? Math.min(...nonempty.map((l) => (l.match(/^(\s*)/) || ["", ""])[1].length))
      : parentIndent + 2;
  const value = blockLines.map((l) => (l.trim() ? l.slice(minIndent) : "")).join("\n").trimEnd();
  return { value, nextIdx: i - 1 };
}

function applyShippedField(
  current: ReleaseShippedItem,
  key: string,
  rest: string,
  lines: string[],
  lineIdx: number,
  fieldIndent: number,
): number {
  if (rest === "|-" || rest === "|") {
    const { value, nextIdx } = readBlockScalar(lines, lineIdx + 1, fieldIndent);
    if (key === "change") current.change = value;
    return nextIdx;
  }
  const unquoted = rest.replace(/^["']|["']$/g, "");
  if (key === "module") current.module = unquoted;
  else if (key === "leaf") current.leaf = unquoted;
  else if (key === "change") current.change = unquoted;
  return lineIdx;
}

export function parseReleaseNotesYaml(raw: string): ReleaseNotesData {
  const lines = raw.split("\n");
  const result: ReleaseNotesData = { releases: [] };
  let inReleases = false;
  let currentRelease: ProductRelease | null = null;
  let releaseIndent = 0;
  let inShipped = false;
  let currentShipped: ReleaseShippedItem | null = null;
  let shippedIndent = 0;

  function pushShipped() {
    if (!currentRelease || !currentShipped?.module) return;
    currentRelease.shipped.push(currentShipped);
    currentShipped = null;
  }

  function pushRelease() {
    pushShipped();
    if (!currentRelease?.version) return;
    result.releases.push(currentRelease);
    currentRelease = null;
    inShipped = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (/^releases:\s*$/.test(trimmed)) {
      inReleases = true;
      continue;
    }
    if (!inReleases) continue;

    const releaseMatch = line.match(/^(\s*)-\s+version:\s*(.*)$/);
    if (releaseMatch) {
      pushRelease();
      currentRelease = {
        version: releaseMatch[2].replace(/^["']|["']$/g, ""),
        title: "",
        shipped: [],
      };
      releaseIndent = releaseMatch[1].length;
      inShipped = false;
      continue;
    }

    if (!currentRelease) continue;

    const shippedListMatch = line.match(/^(\s*)shipped:\s*$/);
    if (shippedListMatch && shippedListMatch[1].length > releaseIndent) {
      inShipped = true;
      continue;
    }

    const shippedItemMatch = line.match(/^(\s*)-\s+module:\s*(.*)$/);
    if (inShipped && shippedItemMatch) {
      pushShipped();
      currentShipped = {
        module: shippedItemMatch[2].replace(/^["']|["']$/g, ""),
        change: "",
      };
      shippedIndent = shippedItemMatch[1].length;
      continue;
    }

    const fieldMatch = line.match(/^(\s*)(\w+):\s*(.*)$/);
    if (!fieldMatch) continue;

    const [, indent, key, rest] = fieldMatch;
    const fieldIndent = indent.length;

    if (inShipped && currentShipped && fieldIndent > shippedIndent) {
      i = applyShippedField(currentShipped, key, rest, lines, i, fieldIndent);
      continue;
    }

    if (fieldIndent <= releaseIndent) continue;

    if (key === "week") currentRelease.week = rest.replace(/^["']|["']$/g, "");
    else if (key === "title") currentRelease.title = rest.replace(/^["']|["']$/g, "");
    else if (key === "summary" || key === "deploy" || key === "note") {
      if (rest === "|-" || rest === "|") {
        const { value, nextIdx } = readBlockScalar(lines, i + 1, fieldIndent);
        if (key === "summary") currentRelease.summary = value;
        else if (key === "deploy") currentRelease.deploy = value;
        else currentRelease.note = value;
        i = nextIdx;
      } else {
        const unquoted = rest.replace(/^["']|["']$/g, "");
        if (key === "summary") currentRelease.summary = unquoted;
        else if (key === "deploy") currentRelease.deploy = unquoted;
        else currentRelease.note = unquoted;
      }
    }
  }

  pushRelease();
  return result;
}

function appendBlock(lines: string[], key: string, value: string | undefined, indent: string) {
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

export function stringifyReleaseNotesYaml(data: ReleaseNotesData): string {
  const lines: string[] = ["releases:"];
  for (const rel of data.releases) {
    lines.push(`  - version: ${yamlQuote(rel.version)}`);
    if (rel.week?.trim()) lines.push(`    week: ${yamlQuote(rel.week.trim())}`);
    if (rel.title?.trim()) lines.push(`    title: ${yamlQuote(rel.title.trim())}`);
    appendBlock(lines, "summary", rel.summary, "    ");
    if (rel.shipped.length) {
      lines.push("    shipped:");
      for (const item of rel.shipped) {
        lines.push(`      - module: ${yamlQuote(item.module)}`);
        if (item.leaf?.trim()) lines.push(`        leaf: ${yamlQuote(item.leaf.trim())}`);
        appendBlock(lines, "change", item.change, "        ");
      }
    }
    appendBlock(lines, "deploy", rel.deploy, "    ");
    appendBlock(lines, "note", rel.note, "    ");
  }
  return `${lines.join("\n")}\n`;
}

export function normalizeReleaseNotesData(data: ReleaseNotesData): ReleaseNotesData {
  return {
    releases: data.releases
      .filter((r) => r.version?.trim())
      .map((r) => ({
        version: r.version.trim(),
        week: r.week?.trim() || undefined,
        title: r.title?.trim() || r.version.trim(),
        summary: r.summary?.trim() || undefined,
        shipped: (r.shipped || [])
          .filter((s) => s.module?.trim())
          .map((s) => ({
            module: s.module.trim(),
            leaf: s.leaf?.trim() || undefined,
            change: s.change?.trim() || "—",
          })),
        deploy: r.deploy?.trim() || undefined,
        note: r.note?.trim() || undefined,
      })),
  };
}
