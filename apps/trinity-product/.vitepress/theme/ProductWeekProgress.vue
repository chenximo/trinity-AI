<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData } from "vitepress";
import {
  normalizeWeekProgressMonth,
  parseWeekProgressIndex,
  parseWeekProgressMonthFile,
  stringifyWeekProgressIndex,
  WEEK_RESULT_OPTIONS,
  type WeekProgressMonth,
  type WeekProgressRow,
} from "../shared/weekProgressSchema";
import {
  FOCUS_GROUPS,
  focusLeavesByGroup,
  isKnownFocusLabel,
} from "../shared/weekProgressFocusLeaves";
import { canEditRoadmapYaml } from "./useRoadmapEditor";
import { useWeekProgressEditor } from "./useWeekProgressEditor";
import ProductWeekProgressMonth from "./ProductWeekProgressMonth.vue";
import {
  focusItems,
  formatPeriodLabel,
  monthHeading,
  textPreview,
} from "../shared/weekProgressDisplay";
import "./product-roadmap.css";

const props = defineProps<{
  /** 周进度前缀或索引路径：`week-progress` / `ai-api-platform/week-progress` → 同目录 `week-progress-index.yml` */
  rel?: string;
  src?: string;
}>();

const { page } = useData();

interface MonthEntry {
  fileRel: string;
  month: WeekProgressMonth;
}

const indexRel = computed(() => {
  const r = (props.rel || props.src || "week-progress").trim().replace(/^\.\//, "").replace(/^\//, "");
  if (r.endsWith("week-progress-index.yml")) return r;
  if (/week-progress(-\d+)?\.yml$/i.test(r)) {
    return r.replace(/week-progress(-\d+)?\.yml$/i, "week-progress-index.yml");
  }

  const pageDir = (page.value.relativePath || "").replace(/\/[^/]+$/, "");

  // `week-progress` 为文件名前缀，非子目录 → 同目录 `week-progress-index.yml`
  if (r === "week-progress") {
    return pageDir ? `${pageDir}/week-progress-index.yml` : "week-progress-index.yml";
  }
  if (r.endsWith("/week-progress")) {
    const dir = r.slice(0, -"/week-progress".length);
    return `${dir}/week-progress-index.yml`;
  }

  // 显式目录前缀（如 `ai-api-platform`）
  const base = r.includes("/") ? r.replace(/\/$/, "") : pageDir ? `${pageDir}/${r}` : r;
  return `${base}/week-progress-index.yml`;
});

const indexDir = computed(() => {
  const idx = indexRel.value;
  const i = idx.lastIndexOf("/");
  return i >= 0 ? idx.slice(0, i + 1) : "";
});

function resolveMonthFileRel(name: string): string {
  const n = name.trim().replace(/^\//, "");
  if (n.includes("/")) return n;
  return `${indexDir.value}${n}`;
}

const monthEntries = ref<MonthEntry[]>([]);
const loadError = ref("");
const editingFileRel = ref("");
const pendingIndexFile = ref("");

async function fetchYamlText(rel: string): Promise<string> {
  if (canEditRoadmapYaml()) {
    const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;
    const res = await fetch(`${API}/raw?rel=${encodeURIComponent(rel)}`);
    const data = (await res.json()) as { content?: string; error?: string };
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data.content ?? "";
  }
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
  const res = await fetch(`${base}${rel.replace(/^\//, "")}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function saveYamlText(rel: string, content: string): Promise<void> {
  const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;
  const res = await fetch(`${API}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rel, content }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `HTTP ${res.status}`);
  }
}

async function fetchAllMonths() {
  loadError.value = "";
  try {
    const indexRaw = await fetchYamlText(indexRel.value);
    const { files } = parseWeekProgressIndex(indexRaw);
    const entries: MonthEntry[] = [];
    for (const name of files) {
      const fileRel = resolveMonthFileRel(name);
      const raw = await fetchYamlText(fileRel);
      const month = normalizeWeekProgressMonth(parseWeekProgressMonthFile(raw));
      entries.push({ fileRel, month });
    }
    monthEntries.value = entries;
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : "加载失败";
    monthEntries.value = [];
  }
}

const showEdit = computed(() => canEditRoadmapYaml() && Boolean(indexRel.value));

const {
  open: editorOpen,
  loading: editorLoading,
  saving: editorSaving,
  error: editorError,
  draft: editorDraft,
  rawYaml: editorRawYaml,
  openEditor,
  openEditorWithSeed,
  closeEditor,
  syncYamlFromDraft,
  applyYamlToDraft,
  saveFromDraft,
  saveFromRawYaml,
} = useWeekProgressEditor(() => editingFileRel.value);

type EditorTab = "table" | "yaml";
const editorTab = ref<EditorTab>("table");
const editingMonthIdx = ref(0);

const editingMonthLabel = computed(() => {
  const m = editorDraft.value.months[editingMonthIdx.value];
  return m ? monthHeading(m) : "";
});

type TextEditField = "plan" | "blockers" | "weeklyReport";
const textEditOpen = ref(false);
const textEditField = ref<TextEditField>("plan");
const textEditDraft = ref("");
const textEditMonthIdx = ref(-1);
const textEditWeekIdx = ref(-1);

const textEditTitle = computed(() => {
  if (textEditField.value === "plan") return "编辑计划";
  if (textEditField.value === "weeklyReport") return "编辑周汇报记录";
  return "编辑备注";
});
const textEditWeekLabel = computed(() => {
  const m = editorDraft.value.months[textEditMonthIdx.value];
  const w = m?.weeks[textEditWeekIdx.value];
  if (!w?.id) return "";
  const period = formatPeriodLabel(w.period);
  return period ? `${w.id} · ${period}` : w.id;
});

watch(editorOpen, (open) => {
  if (!open) {
    editingFileRel.value = "";
    pendingIndexFile.value = "";
    return;
  }
  editorTab.value = "table";
});

function openEditorForEntry(entry: MonthEntry) {
  pendingIndexFile.value = "";
  editingFileRel.value = entry.fileRel;
  editingMonthIdx.value = 0;
  editorTab.value = "table";
  openEditor();
}

function nextMonthFileNum(): number {
  const nums = monthEntries.value.map((e) => {
    const m = e.fileRel.match(/week-progress-(\d+)\.yml$/i);
    return m ? Number.parseInt(m[1], 10) : 0;
  });
  return Math.max(6, ...nums, 0) + 1;
}

function openEditorForNewMonth() {
  const n = nextMonthFileNum();
  const fileName = `week-progress-${n}.yml`;
  pendingIndexFile.value = fileName;
  editingFileRel.value = resolveMonthFileRel(fileName);
  editingMonthIdx.value = 0;
  editorTab.value = "table";
  const now = new Date();
  openEditorWithSeed({
    id: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    goal: "",
    archived: false,
    weeks: [],
  });
}

function switchEditorTab(tab: EditorTab) {
  if (tab === editorTab.value) return;
  if (tab === "yaml") {
    syncYamlFromDraft();
    editorTab.value = "yaml";
    return;
  }
  const err = applyYamlToDraft(editorRawYaml.value);
  if (err) {
    editorError.value = err;
    return;
  }
  editorError.value = "";
  editorTab.value = "table";
}

watch(indexRel, () => {
  void fetchAllMonths();
});

onMounted(() => {
  void fetchAllMonths();
});

async function onSaveEditor() {
  const ok = editorTab.value === "yaml" ? await saveFromRawYaml() : await saveFromDraft();
  if (!ok) return;
  if (pendingIndexFile.value) {
    try {
      const indexRaw = await fetchYamlText(indexRel.value);
      const index = parseWeekProgressIndex(indexRaw);
      if (!index.files.includes(pendingIndexFile.value)) {
        index.files.unshift(pendingIndexFile.value);
        await saveYamlText(indexRel.value, stringifyWeekProgressIndex(index));
      }
    } catch (e) {
      editorError.value = e instanceof Error ? e.message : "更新索引失败";
      return;
    }
  }
  pendingIndexFile.value = "";
  closeEditor();
  await fetchAllMonths();
}

const monthExpanded = ref<Record<string, boolean>>({});

function syncMonthExpanded(months: WeekProgressMonth[]) {
  const next: Record<string, boolean> = {};
  const firstActiveIdx = months.findIndex((m) => !m.archived);
  months.forEach((m, i) => {
    const prev = monthExpanded.value[m.id];
    next[m.id] = prev !== undefined ? prev : m.archived ? false : i === firstActiveIdx;
  });
  monthExpanded.value = next;
}

watch(
  () => monthEntries.value.map((e) => `${e.month.id}:${e.month.archived ? 1 : 0}`).join("|"),
  () => syncMonthExpanded(monthEntries.value.map((e) => e.month)),
  { immediate: true },
);

function toggleMonth(id: string) {
  monthExpanded.value = { ...monthExpanded.value, [id]: !monthExpanded.value[id] };
}

function isMonthExpanded(id: string): boolean {
  return Boolean(monthExpanded.value[id]);
}

function joinFocus(items: string[]): string {
  return items.join("、");
}

function addFocusLabel(week: WeekProgressRow, label: string) {
  const name = label.trim();
  if (!name) return;
  const cur = focusItems(week.focus);
  if (cur.includes(name)) return;
  week.focus = joinFocus([...cur, name]);
}

function removeFocusLabel(week: WeekProgressRow, label: string) {
  week.focus = joinFocus(focusItems(week.focus).filter((x) => x !== label));
}

function onFocusPick(week: WeekProgressRow, e: Event) {
  const el = e.target as HTMLSelectElement;
  const val = el.value;
  if (val) addFocusLabel(week, val);
  el.value = "";
}

function focusPickOptions(week: WeekProgressRow, group: (typeof FOCUS_GROUPS)[number]) {
  const selected = new Set(focusItems(week.focus));
  return focusLeavesByGroup(group).filter((l) => !selected.has(l.label));
}

function addWeek() {
  const mIdx = editingMonthIdx.value;
  const month = editorDraft.value.months[mIdx];
  if (!month || mIdx < 0) return;
  month.weeks.push({
    id: "W00",
    period: "",
    focus: "",
    owner: "—",
    plan: "",
    acceptance: "",
    result: "⬜",
    testLink: "—",
    blockers: "—",
    weeklyReport: "—",
  });
}

function removeWeek(wIdx: number) {
  const mIdx = editingMonthIdx.value;
  if (mIdx < 0) return;
  editorDraft.value.months[mIdx]?.weeks.splice(wIdx, 1);
}

function removeEditingMonth() {
  closeEditor();
}

function openTextEdit(wIdx: number, field: TextEditField) {
  const mIdx = editingMonthIdx.value;
  const week = editorDraft.value.months[mIdx]?.weeks[wIdx];
  if (!week || mIdx < 0) return;
  textEditMonthIdx.value = mIdx;
  textEditWeekIdx.value = wIdx;
  textEditField.value = field;
  textEditDraft.value = week[field] ?? "";
  textEditOpen.value = true;
}

function closeTextEdit() {
  textEditOpen.value = false;
  textEditDraft.value = "";
  textEditMonthIdx.value = -1;
  textEditWeekIdx.value = -1;
}

function saveTextEdit() {
  const week = editorDraft.value.months[textEditMonthIdx.value]?.weeks[textEditWeekIdx.value];
  if (!week) return;
  week[textEditField.value] = textEditDraft.value.trimEnd();
  closeTextEdit();
}
</script>

<template>
  <div class="product-roadmap-wrap product-week-progress-wrap">
    <p v-if="loadError" class="product-roadmap-error">{{ loadError }}</p>

    <template v-else>
      <div v-if="monthEntries.length" class="pw-month-accordion">
        <ProductWeekProgressMonth
          v-for="entry in monthEntries"
          :key="entry.fileRel"
          :month="entry.month"
          :file-rel="entry.fileRel"
          :expanded="isMonthExpanded(entry.month.id)"
          :show-edit="showEdit"
          @toggle="toggleMonth(entry.month.id)"
          @edit="openEditorForEntry(entry)"
        />
      </div>
      <p v-else class="product-roadmap-muted">周进度为空，localhost 下点击「添加新月」创建。</p>
      <div v-if="showEdit" class="pw-month-accordion-footer">
        <button type="button" class="pr-btn pr-btn--add" @click="openEditorForNewMonth">+ 添加新月</button>
        <span class="product-roadmap-toolbar-hint">
          索引 <code>docs/{{ indexRel }}</code> · 每月独立 YAML（如 <code>week-progress-7.yml</code>）
        </span>
      </div>
    </template>

    <div
      v-if="editorOpen"
      class="product-roadmap-modal-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="`编辑周进度 ${editingMonthLabel}`"
      @click.self="closeEditor"
    >
      <div class="product-roadmap-modal product-week-progress-modal">
        <header class="product-roadmap-modal-head">
          <h3>编辑周进度 · {{ editingMonthLabel || "YAML" }}</h3>
          <code>docs/{{ editingFileRel || indexRel }}</code>
          <div class="product-roadmap-modal-actions">
            <button type="button" class="pr-btn" @click="closeEditor">取消</button>
            <button
              type="button"
              class="pr-btn pr-btn--primary"
              :disabled="editorLoading || editorSaving"
              @click="onSaveEditor"
            >
              {{ editorSaving ? "保存中…" : "保存" }}
            </button>
          </div>
        </header>

        <p v-if="editorError" class="product-roadmap-error">{{ editorError }}</p>
        <p v-if="editorLoading" class="product-roadmap-muted">加载中…</p>

        <div v-else class="product-roadmap-modal-body">
          <nav class="product-roadmap-tabs" aria-label="编辑方式">
            <button
              type="button"
              class="product-roadmap-tab"
              :class="{ 'is-active': editorTab === 'table' }"
              @click="switchEditorTab('table')"
            >
              表格
            </button>
            <button
              type="button"
              class="product-roadmap-tab"
              :class="{ 'is-active': editorTab === 'yaml' }"
              @click="switchEditorTab('yaml')"
            >
              YAML
            </button>
          </nav>

          <div v-show="editorTab === 'table'" class="product-roadmap-editor-scroll">
            <p class="product-week-progress-editor-hint">
              仅编辑<strong>当前月文件</strong> <code>{{ editingFileRel }}</code>；保存后写回该 YAML，并更新索引。
              <strong>重点模块</strong>从下拉多选；<strong>计划 / 备注</strong>点按钮多行编辑。见 <code>产品手册更新规范.md</code> §四。
            </p>
            <div
              v-if="editorDraft.months[editingMonthIdx]"
              :key="'em-' + editingMonthIdx"
              class="product-week-progress-editor-month"
            >
              <div class="product-week-progress-editor-month-head">
                <label>
                  月份 id
                  <input v-model="editorDraft.months[editingMonthIdx].id" type="text" class="pr-input" />
                </label>
                <label>
                  说明 goal
                  <input
                    v-model="editorDraft.months[editingMonthIdx].goal"
                    type="text"
                    class="pr-input pr-input--wide"
                    placeholder="7 月商用运营与体验完善"
                  />
                </label>
                <label class="product-week-progress-check">
                  <input v-model="editorDraft.months[editingMonthIdx].archived" type="checkbox" />
                  归档
                </label>
                <button type="button" class="pr-btn pr-btn--danger" @click="removeEditingMonth">删除本月</button>
              </div>

              <table class="product-roadmap-editor-table">
                <thead>
                  <tr>
                    <th>周 / 周期</th>
                    <th>重点模块</th>
                    <th>负责人</th>
                    <th>计划</th>
                    <th>结果</th>
                    <th>测试链接</th>
                    <th>备注</th>
                    <th>周汇报记录</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(w, wIdx) in editorDraft.months[editingMonthIdx].weeks" :key="'ew-' + wIdx">
                    <td class="pw-week-editor-cell">
                      <input v-model="w.id" type="text" class="pr-input" placeholder="W23" />
                      <input
                        v-model="w.period"
                        type="text"
                        class="pr-input pw-period-input"
                        placeholder="06-01～06-07"
                      />
                    </td>
                    <td class="pw-editor-focus-td">
                      <div class="pw-focus-editor">
                        <div v-if="focusItems(w.focus).length" class="pw-focus-editor-tags">
                          <span
                            v-for="tag in focusItems(w.focus)"
                            :key="tag"
                            class="pw-focus-editor-tag"
                            :class="{ 'is-unknown': !isKnownFocusLabel(tag) }"
                          >
                            {{ tag }}
                            <button
                              type="button"
                              class="pw-focus-editor-tag-remove"
                              aria-label="移除"
                              @click="removeFocusLabel(w, tag)"
                            >
                              ×
                            </button>
                          </span>
                        </div>
                        <select
                          class="pr-select pw-focus-editor-select"
                          aria-label="添加重点模块叶子页"
                          @change="onFocusPick(w, $event)"
                        >
                          <option value="">+ 添加标准叶子页</option>
                          <optgroup v-for="g in FOCUS_GROUPS" :key="g" :label="g">
                            <option
                              v-for="leaf in focusPickOptions(w, g)"
                              :key="leaf.label"
                              :value="leaf.label"
                            >
                              {{ leaf.label }}
                            </option>
                          </optgroup>
                        </select>
                      </div>
                    </td>
                    <td><input v-model="w.owner" type="text" class="pr-input pr-input--owner" /></td>
                    <td class="pw-editor-text-td">
                      <button type="button" class="pr-btn pw-editor-text-btn" @click="openTextEdit(wIdx, 'plan')">
                        编辑计划
                      </button>
                      <span v-if="w.plan?.trim()" class="pw-editor-text-badge" :title="textPreview(w.plan)">已填</span>
                      <span v-else class="pw-editor-text-badge is-empty">未填</span>
                    </td>
                    <td>
                      <select v-model="w.result" class="pr-select">
                        <option v-for="s in WEEK_RESULT_OPTIONS" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </td>
                    <td><input v-model="w.testLink" type="text" class="pr-input pr-input--note" /></td>
                    <td class="pw-editor-text-td">
                      <button type="button" class="pr-btn pw-editor-text-btn" @click="openTextEdit(wIdx, 'blockers')">
                        编辑备注
                      </button>
                      <span v-if="w.blockers?.trim() && w.blockers !== '—'" class="pw-editor-text-badge" :title="textPreview(w.blockers)">已填</span>
                      <span v-else class="pw-editor-text-badge is-empty">未填</span>
                    </td>
                    <td class="pw-editor-text-td">
                      <button type="button" class="pr-btn pw-editor-text-btn" @click="openTextEdit(wIdx, 'weeklyReport')">
                        编辑周汇报
                      </button>
                      <span v-if="w.weeklyReport?.trim() && w.weeklyReport !== '—'" class="pw-editor-text-badge" :title="textPreview(w.weeklyReport)">已填</span>
                      <span v-else class="pw-editor-text-badge is-empty">未填</span>
                    </td>
                    <td>
                      <button type="button" class="pr-btn pr-btn--danger" @click="removeWeek(wIdx)">删</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="pr-btn pr-btn--add" @click="addWeek">+ 添加一行</button>
            </div>
          </div>

          <div v-show="editorTab === 'yaml'" class="product-roadmap-yaml-pane">
            <p class="product-roadmap-yaml-hint">
              结构：<code>months</code> → 每月 <code>id</code> / <code>goal</code> / <code>archived</code> /
              <code>weeks</code>（<code>id</code>、<code>period</code>、<code>focus</code>、<code>owner</code>、
              <code>plan</code>、<code>result</code>、<code>testLink</code>、<code>blockers</code>（备注）、
              <code>weeklyReport</code>（周汇报记录）。
              结果符号：✅ 🟡 ⬜ ➖。
            </p>
            <textarea
              v-model="editorRawYaml"
              class="product-roadmap-yaml-editor"
              spellcheck="false"
              aria-label="周进度 YAML"
            />
          </div>
        </div>

        <div
          v-if="textEditOpen"
          class="pw-text-modal-backdrop"
          role="dialog"
          aria-modal="true"
          :aria-label="textEditTitle"
          @click.self="closeTextEdit"
        >
          <div class="pw-text-modal">
            <header class="pw-text-modal-head">
              <div>
                <h4 class="pw-text-modal-title">{{ textEditTitle }}</h4>
                <p v-if="textEditWeekLabel" class="pw-text-modal-sub">{{ textEditWeekLabel }}</p>
              </div>
              <div class="pw-text-modal-actions">
                <button type="button" class="pr-btn" @click="closeTextEdit">取消</button>
                <button type="button" class="pr-btn pr-btn--primary" @click="saveTextEdit">确定</button>
              </div>
            </header>
            <textarea
              v-model="textEditDraft"
              class="pw-text-modal-area"
              spellcheck="false"
              :placeholder="'① 子项 @负责人\n模块：operations/…\n待依赖：…'"
            />
            <p class="pw-text-modal-hint">
              与<strong>计划</strong>相同书写与展示：子项 <code>①</code> <code>②</code> 分行，<code>@姓名</code> 蓝色高亮，续行缩进；多行写入
              <code>|-</code>。见手册 <code>产品手册更新规范.md</code> §四「plan 与 blockers」。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pw-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: visible;
}
.product-week-progress-wrap :deep(.pw-table-wrap.product-roadmap) {
  overflow-x: visible;
}
.product-week-progress-wrap :deep(.pw-table-wrap table) {
  table-layout: fixed;
  width: 100%;
  font-size: 0.875rem;
  line-height: 1.55;
}
.product-week-progress-wrap :deep(.pw-table-wrap th),
.product-week-progress-wrap :deep(.pw-table-wrap td) {
  font-size: inherit;
  line-height: inherit;
  font-weight: 400;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  vertical-align: top;
  text-align: left;
  padding: 8px 12px;
}
.product-week-progress-wrap :deep(.pw-table-wrap th) {
  font-weight: 600;
}
.product-week-progress-wrap :deep(.pw-col-focus),
.product-week-progress-wrap :deep(.pw-col-blockers),
.product-week-progress-wrap :deep(.pw-col-report) {
  white-space: pre-line;
}
.product-week-progress-wrap :deep(.pw-plan-body) {
  white-space: normal;
  line-height: 1.5;
}
.product-week-progress-wrap :deep(.pw-plan-line--task + .pw-plan-line--task),
.product-week-progress-wrap :deep(.pw-plan-line--task:not(:first-child)) {
  margin-top: 0.45em;
  padding-top: 0.4em;
  border-top: 1px dashed var(--vp-c-divider);
}
.product-week-progress-wrap :deep(.pw-plan-line:not(.pw-plan-line--task)) {
  margin-top: 0.12em;
  padding-left: 0.15em;
  color: var(--vp-c-text-2);
  font-size: 0.92em;
}
.product-week-progress-wrap :deep(.pw-plan-at) {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.product-week-progress-wrap :deep(.pw-col-owner .pw-plan-at) {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-week) {
  width: 5%;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-focus) {
  width: 10%;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-owner) {
  width: 6%;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-plan) {
  width: 34%;
  min-width: 10rem;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-result) {
  width: 4%;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-link) {
  width: 5%;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-blockers) {
  width: 14%;
  min-width: 6rem;
}
.product-week-progress-wrap :deep(.pw-table-wrap .pw-col-report) {
  width: 14%;
  min-width: 6rem;
}
.pw-week-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.12rem;
}
.pw-week-id {
  font-size: inherit;
  font-weight: 600;
  line-height: inherit;
}
.pw-week-period {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.35;
  color: var(--vp-c-text-2);
}
.pw-col-week {
  width: 5%;
}
.pw-week-editor-cell {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 6.5rem;
}
.pw-period-input {
  font-size: 0.8rem;
}
.pw-col-owner {
  width: 7%;
}
.product-week-progress-wrap :deep(.pr-input--owner) {
  width: 100%;
  max-width: 100%;
}
.pw-focus-item {
  display: block;
  margin: 0;
  font-size: inherit;
  line-height: inherit;
}
.pw-focus-item + .pw-focus-item {
  margin-top: 0.15em;
}
.pw-focus-link {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
}
.pw-focus-unknown {
  color: var(--vp-c-text-2);
}
.pw-focus-editor {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 11rem;
}
.pw-focus-editor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.pw-focus-editor-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 2px 6px;
  font-size: 0.8rem;
  line-height: 1.35;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}
.pw-focus-editor-tag.is-unknown {
  border-style: dashed;
  color: var(--vp-c-text-2);
}
.pw-focus-editor-tag-remove {
  padding: 0 0.15rem;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.pw-focus-editor-tag-remove:hover {
  color: var(--vp-c-text-1);
}
.pw-focus-editor-select {
  width: 100%;
  min-width: 10rem;
}
.pw-col-link a {
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
}
.pw-col-result {
  text-align: center;
  white-space: nowrap;
}
.product-week-progress-wrap :deep(.pw-table-wrap th.pw-col-result),
.product-week-progress-wrap :deep(.pw-table-wrap th.pw-col-link) {
  text-align: center;
}
.product-week-progress-wrap :deep(.pw-table-wrap td.pw-col-link) {
  text-align: center;
}
.product-week-progress-editor-month {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.product-week-progress-editor-month-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}
.product-week-progress-editor-month-head label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.product-week-progress-check {
  flex-direction: row !important;
  align-items: center;
  gap: 0.35rem !important;
}
.product-week-progress-modal {
  max-width: min(112rem, 96vw);
}
.product-week-progress-editor-hint {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
.product-week-progress-editor-hint code {
  font-size: 0.78rem;
}
.product-week-progress-wrap :deep(.product-roadmap-modal-backdrop) {
  background: rgba(15, 23, 42, 0.72);
}
.product-week-progress-modal .product-roadmap-editor-scroll {
  overflow-x: auto;
  background: var(--vp-c-bg);
}
.product-week-progress-modal .product-roadmap-editor-table {
  table-layout: fixed;
  width: 100%;
}
.product-week-progress-modal .product-roadmap-editor-table th,
.product-week-progress-modal .product-roadmap-editor-table td {
  overflow: hidden;
  vertical-align: top;
}
.product-week-progress-modal .pw-editor-focus-td {
  min-width: 12rem;
}
.product-week-progress-modal .pw-week-editor-cell {
  min-width: 7rem;
}
.product-week-progress-modal .pr-input--owner {
  min-width: 5rem;
  max-width: 8rem;
}
.product-week-progress-modal .pw-editor-text-td {
  width: 8%;
  min-width: 5.25rem;
  vertical-align: middle;
  text-align: center;
}
.pw-editor-text-btn {
  display: block;
  width: 100%;
  margin: 0 auto 0.25rem;
  padding: 0.25rem 0.4rem;
  font-size: 0.78rem;
}
.pw-editor-text-badge {
  display: block;
  font-size: 0.7rem;
  line-height: 1.2;
  color: var(--vp-c-text-2);
}
.pw-editor-text-badge.is-empty {
  color: var(--vp-c-text-3);
}
.pw-text-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.pw-text-modal {
  width: min(92vw, 40rem);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}
.pw-text-modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.pw-text-modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.pw-text-modal-sub {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.pw-text-modal-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
.pw-text-modal-area {
  flex: 1;
  min-height: 14rem;
  max-height: 50vh;
  margin: 0;
  padding: 1rem 1.15rem;
  border: none;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.55;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.pw-text-modal-area:focus {
  outline: none;
}
.pw-text-modal-hint {
  margin: 0;
  padding: 0.65rem 1.15rem 1rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider);
}
.pw-text-modal-hint code {
  font-size: 0.72rem;
}
</style>
