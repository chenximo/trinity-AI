import { ref } from "vue";
import {
  emptyWeekProgressData,
  normalizeWeekProgressData,
  parseWeekProgressYaml,
  stringifyWeekProgressYaml,
  type WeekProgressData,
} from "../shared/weekProgressSchema";
import { canEditRoadmapYaml } from "./useRoadmapEditor";

const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;

export function useWeekProgressEditor(getRel: () => string) {
  const open = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const draft = ref<WeekProgressData>(emptyWeekProgressData());
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
    const res = await fetch(`${base}${rel.replace(/^\//, "")}`);
    if (!res.ok) throw new Error(`无法加载 ${rel}（HTTP ${res.status}）`);
    return res.text();
  }

  async function loadTable() {
    loading.value = true;
    error.value = "";
    try {
      const raw = await loadYaml();
      rawYaml.value = raw;
      draft.value = normalizeWeekProgressData(parseWeekProgressYaml(raw));
    } catch (e) {
      error.value = e instanceof Error ? e.message : "加载失败";
      draft.value = emptyWeekProgressData();
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
    const normalized = normalizeWeekProgressData(draft.value);
    draft.value = normalized;
    rawYaml.value = stringifyWeekProgressYaml(normalized);
  }

  function applyYamlToDraft(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return "YAML 不能为空";
    if (!trimmed.includes("months:")) return "缺少 months: 段";
    try {
      const parsed = parseWeekProgressYaml(text);
      if (!parsed.months.length) return "至少保留一个月份块 months";
      draft.value = normalizeWeekProgressData(parsed);
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

  async function saveFromDraft(): Promise<boolean> {
    syncYamlFromDraft();
    return persistYaml(rawYaml.value);
  }

  async function saveFromRawYaml(): Promise<boolean> {
    const err = applyYamlToDraft(rawYaml.value);
    if (err) {
      error.value = err;
      return false;
    }
    return persistYaml(stringifyWeekProgressYaml(draft.value));
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
    syncYamlFromDraft,
    applyYamlToDraft,
    saveFromDraft,
    saveFromRawYaml,
  };
}
