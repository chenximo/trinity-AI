export interface RoadmapFeature {
  name: string;
  prototype: string;
  backend: string;
  /** 里程碑节点列快照，键为 milestone id（如 5.30） */
  nodes?: Record<string, string>;
  note?: string;
}

export interface RoadmapMilestone {
  id: string;
  date: string;
}

export interface RoadmapData {
  milestones: RoadmapMilestone[];
  features: RoadmapFeature[];
}

const DEFAULT_MILESTONES: RoadmapMilestone[] = [
  { id: "5.30", date: "2026-05-30" },
  { id: "6.30", date: "2026-06-30" },
];

const NODE_LINE = /^['"]?(\d+\.\d+)['"]?\s*:\s*(.+)$/;

export function emptyRoadmapData(): RoadmapData {
  return { milestones: [], features: [] };
}

export function nodeForFeature(
  f: RoadmapFeature,
  milestoneId: string,
  milestoneIndex: number,
): string {
  const stored = f.nodes?.[milestoneId]?.trim();
  if (stored) return stored;
  const p = f.prototype || "⬜";
  const b = f.backend || "⬜";
  return milestoneIndex === 0 ? deriveNodeExact(p, b) : deriveNodeSimple(p, b);
}

/** 按原型/后端补全各里程碑节点（写入 nodes，供 YAML 与表格一致） */
export function enrichFeatureNodes(
  f: RoadmapFeature,
  milestones: RoadmapMilestone[],
): RoadmapFeature {
  const nodes: Record<string, string> = { ...(f.nodes ?? {}) };
  milestones.forEach((m, idx) => {
    nodes[m.id] = nodeForFeature({ ...f, nodes }, m.id, idx);
  });
  return { ...f, nodes };
}

export function normalizeRoadmapData(data: RoadmapData): RoadmapData {
  const milestones = data.milestones.length ? data.milestones : [...DEFAULT_MILESTONES];
  const features = data.features.map((f) => enrichFeatureNodes(f, milestones));
  return { milestones, features };
}

/** 解析叶子页 *.roadmap.yml（与手写格式一致） */
export function parseRoadmapYaml(raw: string): RoadmapData {
  const lines = raw.split("\n");
  const result: RoadmapData = { milestones: [], features: [] };
  let section = "";
  let current: Partial<RoadmapFeature> = {};

  function pushFeature() {
    if (!current.name) return;
    result.features.push(current as RoadmapFeature);
    current = {};
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed === "milestones:") {
      pushFeature();
      section = "milestones";
      continue;
    }
    if (trimmed === "features:") {
      pushFeature();
      section = "features";
      continue;
    }
    if (section === "milestones" && trimmed.startsWith("- id:")) {
      const id = unquote(trimmed.replace("- id:", "").trim());
      result.milestones.push({ id, date: "" });
    }
    if (section === "milestones" && trimmed.startsWith("date:") && result.milestones.length) {
      result.milestones[result.milestones.length - 1].date = unquote(
        trimmed.replace("date:", "").trim(),
      );
    }
    if (section === "features" && trimmed.startsWith("- name:")) {
      pushFeature();
      current = { name: unquote(trimmed.replace("- name:", "").trim()), nodes: {} };
    }
    if (section === "features" && trimmed.startsWith("prototype:")) {
      current.prototype = unquote(trimmed.replace("prototype:", "").trim());
    }
    if (section === "features" && trimmed.startsWith("backend:")) {
      current.backend = unquote(trimmed.replace("backend:", "").trim());
    }
    if (section === "features") {
      const nodeMatch = trimmed.match(NODE_LINE);
      if (nodeMatch) {
        if (!current.nodes) current.nodes = {};
        current.nodes[nodeMatch[1]] = unquote(nodeMatch[2].trim());
        continue;
      }
    }
    if (section === "features" && trimmed.startsWith("note:")) {
      current.note = unquote(trimmed.replace("note:", "").trim());
    }
  }
  pushFeature();
  return normalizeRoadmapData(result);
}

function unquote(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function yamlQuote(s: string): string {
  if (/[:#\n"']/.test(s) || s !== s.trim() || /^\d+\.\d+$/.test(s)) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

/** 序列化为手册约定的 YAML 格式（含 5.30 / 6.30 等节点列） */
export function stringifyRoadmapYaml(data: RoadmapData): string {
  const normalized = normalizeRoadmapData(data);
  const lines: string[] = [
    "milestones:",
    ...normalized.milestones.flatMap((m) => {
      const row = [`  - id: ${yamlQuote(m.id)}`];
      if (m.date) row.push(`    date: ${yamlQuote(m.date)}`);
      return row;
    }),
    "",
    "features:",
  ];

  for (const f of normalized.features) {
    const enriched = enrichFeatureNodes(f, normalized.milestones);
    lines.push(`  - name: ${yamlQuote(enriched.name)}`);
    lines.push(`    prototype: ${yamlQuote(enriched.prototype || "⬜")}`);
    lines.push(`    backend: ${yamlQuote(enriched.backend || "⬜")}`);
    for (let i = 0; i < normalized.milestones.length; i++) {
      const m = normalized.milestones[i];
      const sym = enriched.nodes?.[m.id] ?? nodeForFeature(enriched, m.id, i);
      lines.push(`    ${yamlQuote(m.id)}: ${yamlQuote(sym)}`);
    }
    if (enriched.note?.trim()) lines.push(`    note: ${yamlQuote(enriched.note.trim())}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function deriveNodeExact(proto: string, backend: string): string {
  const p = (proto || "⬜").trim();
  const b = (backend || "⬜").trim();
  if (p === "✅" && b === "✅") return "✅";
  if (p === "✅" && b !== "✅") return "🔵";
  if (p === "⬜" && b === "⬜") return "⬜";
  return "🟡";
}

export function deriveNodeSimple(proto: string, backend: string): string {
  const p = (proto || "⬜").trim();
  const b = (backend || "⬜").trim();
  if (p === "✅" && b === "✅") return "✅";
  if (p === "⬜" && b === "⬜") return "⬜";
  return "🟡";
}

export function isMilestoneLocked(dateStr: string, today = new Date()): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  d.setHours(23, 59, 59, 999);
  return today > d;
}

export const STATUS_OPTIONS = ["✅", "🟡", "⬜", "➖"] as const;
export const NODE_STATUS_OPTIONS = ["✅", "🟡", "🔵", "⬜", "➖", "-"] as const;
