import { ref } from "vue";
import {
  emptyRoadmapData,
  enrichFeatureNodes,
  normalizeRoadmapData,
  parseRoadmapYaml,
  stringifyRoadmapYaml,
  type RoadmapData,
} from "../shared/roadmapSchema";

const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;

function isLocalhost(): boolean {
  if (import.meta.env.SSR) return false;
  const h = location.hostname;
  return h === "127.0.0.1" || h === "localhost" || h === "[::1]";
}

/** dev 或 preview@localhost：可读写 docs 下 .roadmap.yml */
export function canEditRoadmapYaml(): boolean {
  return isLocalhost();
}

export function useRoadmapEditor(getRel: () => string) {
  const open = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const draft = ref<RoadmapData>(emptyRoadmapData());
  /** 与文件一致的 YAML 原文（YAML 标签页编辑） */
  const rawYaml = ref("");

  async function parseApiError(res: Response): Promise<string> {
    const text = await res.text();
    try {
      const data = JSON.parse(text) as { error?: string };
      return data.error || text || `HTTP ${res.status}`;
    } catch {
      return text || `HTTP ${res.status}`;
    }
  }

  async function loadYaml(): Promise<string> {
    if (canEditRoadmapYaml()) {
      const res = await fetch(`${API}/raw?rel=${encodeURIComponent(getRel())}`);
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data.content ?? "";
    }
    const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
    const rel = getRel();
    const url = `${base}${rel.replace(/^\//, "")}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`无法加载 ${rel}（HTTP ${res.status}）`);
    return res.text();
  }

  async function loadTable() {
    loading.value = true;
    error.value = "";
    try {
      const raw = await loadYaml();
      rawYaml.value = raw;
      draft.value = normalizeRoadmapData(parseRoadmapYaml(raw));
    } catch (e) {
      error.value = e instanceof Error ? e.message : "加载失败";
      draft.value = emptyRoadmapData();
      rawYaml.value = "";
    } finally {
      loading.value = false;
    }
  }

  function openEditor() {
    open.value = true;
    void loadTable();
  }

  function closeEditor() {
    open.value = false;
    loading.value = false;
    saving.value = false;
    error.value = "";
  }

  function syncYamlFromDraft() {
    const normalized = normalizeRoadmapData(draft.value);
    draft.value = normalized;
    rawYaml.value = stringifyRoadmapYaml(normalized);
  }

  /** 将 YAML 原文解析进表格草稿；失败返回错误文案 */
  function applyYamlToDraft(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return "YAML 不能为空";
    if (!trimmed.includes("features:")) return "缺少 features: 段";
    try {
      const parsed = parseRoadmapYaml(text);
      if (!parsed.milestones.length) return "缺少 milestones: 或格式不正确";
      if (!parsed.features.length) return "至少保留一条 features";
      draft.value = normalizeRoadmapData(parsed);
      return null;
    } catch {
      return "YAML 解析失败，请检查缩进与字段名";
    }
  }

  async function persistYaml(content: string): Promise<boolean> {
    if (!canEditRoadmapYaml()) {
      error.value = "仅 localhost 下的 dev / preview 可保存";
      return false;
    }
    saving.value = true;
    error.value = "";
    try {
      const res = await fetch(`${API}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rel: getRel(), content }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      rawYaml.value = content;
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
      return false;
    } finally {
      saving.value = false;
    }
  }

  /** 从表格草稿保存（会按规范重新格式化 YAML） */
  async function saveFromDraft(): Promise<boolean> {
    syncYamlFromDraft();
    return persistYaml(rawYaml.value);
  }

  /** 从 YAML 原文保存（先校验能否解析） */
  async function saveFromRawYaml(): Promise<boolean> {
    const err = applyYamlToDraft(rawYaml.value);
    if (err) {
      error.value = err;
      return false;
    }
    return persistYaml(stringifyRoadmapYaml(draft.value));
  }

  return {
    open,
    loading,
    saving,
    error,
    draft,
    rawYaml,
    openEditor,
    closeEditor,
    loadTable,
    syncYamlFromDraft,
    applyYamlToDraft,
    saveFromDraft,
    saveFromRawYaml,
  };
}
