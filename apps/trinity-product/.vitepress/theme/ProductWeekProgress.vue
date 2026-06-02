<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData } from "vitepress";
import {
  emptyWeekProgressData,
  normalizeWeekProgressData,
  parseWeekProgressYaml,
  WEEK_RESULT_OPTIONS,
  type WeekProgressData,
  type WeekProgressMonth,
} from "../shared/weekProgressSchema";
import { canEditRoadmapYaml } from "./useRoadmapEditor";
import { useWeekProgressEditor } from "./useWeekProgressEditor";
import "./product-roadmap.css";

const props = defineProps<{
  /** docs 下路径，默认 `{当前页目录}/week-progress.yml` */
  rel?: string;
  src?: string;
}>();

const { page } = useData();

const fileRel = computed(() => {
  const r = props.rel?.trim();
  if (r && (r.includes("/") || r.endsWith(".yml")) && !r.startsWith("./")) {
    return r.replace(/^\//, "");
  }
  const file = (r || props.src || "week-progress.yml").replace(/^\.\//, "");
  const pageDir = (page.value.relativePath || "").replace(/\/[^/]+$/, "");
  if (file.includes("/") || file === "week-progress.yml") {
    return pageDir ? `${pageDir}/${file.replace(/^\//, "")}` : file;
  }
  return pageDir ? `${pageDir}/${file}` : file;
});

const rawYaml = ref("");
const loadError = ref("");

async function fetchDisplayYaml() {
  const rel = fileRel.value;
  if (!rel) return;
  loadError.value = "";
  try {
    if (canEditRoadmapYaml()) {
      const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;
      const res = await fetch(`${API}/raw?rel=${encodeURIComponent(rel)}`);
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      rawYaml.value = data.content ?? "";
      return;
    }
    const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
    const res = await fetch(`${base}${rel}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rawYaml.value = await res.text();
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : "加载失败";
    rawYaml.value = "";
  }
}

const data = computed<WeekProgressData>(() => {
  if (!rawYaml.value) return emptyWeekProgressData();
  try {
    return normalizeWeekProgressData(parseWeekProgressYaml(rawYaml.value));
  } catch {
    return emptyWeekProgressData();
  }
});

const showEdit = computed(() => canEditRoadmapYaml() && Boolean(fileRel.value));

const {
  open: editorOpen,
  loading: editorLoading,
  saving: editorSaving,
  error: editorError,
  draft: editorDraft,
  rawYaml: editorRawYaml,
  openEditor,
  closeEditor,
  syncYamlFromDraft,
  applyYamlToDraft,
  saveFromDraft,
  saveFromRawYaml,
} = useWeekProgressEditor(() => fileRel.value);

type EditorTab = "table" | "yaml";
const editorTab = ref<EditorTab>("table");

watch(editorOpen, (open) => {
  if (open) editorTab.value = "table";
});

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

watch(fileRel, () => {
  void fetchDisplayYaml();
});

onMounted(() => {
  void fetchDisplayYaml();
});

async function onSaveEditor() {
  const ok = editorTab.value === "yaml" ? await saveFromRawYaml() : await saveFromDraft();
  if (!ok) return;
  closeEditor();
  await fetchDisplayYaml();
}

function monthHeading(m: WeekProgressMonth): string {
  const goal = m.goal?.trim();
  return goal ? `${m.id}（${goal}）` : m.id;
}

function isHttpLink(v: string): boolean {
  return /^https?:\/\//.test(v.trim());
}

function focusItems(v: string): string[] {
  const raw = (v || "").trim();
  if (!raw || raw === "—") return [];
  return raw
    .split(/[、,，]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function focusHref(item: string): string | null {
  if (item.includes("用户侧模块")) return "./user/";
  if (item.includes("平台侧模块")) return "./platform/";
  if (item.includes("运营后台管理平台")) return "./operations/";
  return null;
}

function addMonth() {
  editorDraft.value.months.unshift({
    id: "2026-07",
    goal: "",
    archived: false,
    weeks: [],
  });
}

function removeMonth(mIdx: number) {
  editorDraft.value.months.splice(mIdx, 1);
}

function addWeek(mIdx: number) {
  const month = editorDraft.value.months[mIdx];
  if (!month) return;
  month.weeks.push({
    id: "W00",
    period: "",
    focus: "",
    owner: "—",
    plan: "",
    result: "⬜",
    dependencies: "—",
    testLink: "—",
    bugList: "—",
    blockers: "—",
  });
}

function removeWeek(mIdx: number, wIdx: number) {
  editorDraft.value.months[mIdx]?.weeks.splice(wIdx, 1);
}
</script>

<template>
  <div class="product-roadmap-wrap product-week-progress-wrap">
    <div v-if="showEdit" class="product-roadmap-toolbar">
      <button type="button" class="product-roadmap-edit-btn" @click="openEditor">
        编辑周进度
      </button>
      <span class="product-roadmap-toolbar-hint">
        仅 localhost · <code>docs/{{ fileRel }}</code>
      </span>
    </div>

    <p v-if="loadError" class="product-roadmap-error">{{ loadError }}</p>

    <template v-else>
      <section
        v-for="(month, mIdx) in data.months"
        :key="month.id + mIdx"
        class="product-week-progress-month"
      >
        <h3 class="product-week-progress-month-title">
          {{ monthHeading(month) }}
          <span v-if="month.archived" class="product-week-progress-archived">归档</span>
        </h3>
        <div class="product-roadmap">
          <table>
            <thead>
              <tr>
                <th class="pw-col-week">周</th>
                <th class="pw-col-period">周期</th>
                <th class="pw-col-focus">重点模块</th>
                <th class="pw-col-owner">负责人</th>
                <th class="pw-col-plan">计划</th>
                <th class="pw-col-result">结果</th>
                <th class="pw-col-dependencies">依赖</th>
                <th class="pw-col-link">测试链接</th>
                <th class="pw-col-link">Bug 列表</th>
                <th class="pw-col-blockers">备注</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(w, wIdx) in month.weeks" :key="w.id + wIdx">
                <td class="pw-col-week"><strong>{{ w.id }}</strong></td>
                <td class="pw-col-period">{{ w.period || "—" }}</td>
                <td class="pw-col-focus">
                  <template v-if="focusItems(w.focus).length">
                    <span v-for="(item, itemIdx) in focusItems(w.focus)" :key="item + itemIdx" class="pw-focus-item">
                      <a v-if="focusHref(item)" :href="focusHref(item) || '#'" class="pw-focus-link">{{ item }}</a>
                      <span v-else>{{ item }}</span>
                    </span>
                  </template>
                  <span v-else>—</span>
                </td>
                <td class="pw-col-owner">{{ w.owner || "—" }}</td>
                <td class="pw-col-plan">{{ w.plan || "—" }}</td>
                <td class="pw-col-result">{{ w.result || "⬜" }}</td>
                <td class="pw-col-dependencies">{{ w.dependencies || "—" }}</td>
                <td class="pw-col-link">
                  <a v-if="isHttpLink(w.testLink)" :href="w.testLink" target="_blank" rel="noreferrer">打开</a>
                  <span v-else>{{ w.testLink || "—" }}</span>
                </td>
                <td class="pw-col-link">
                  <a v-if="isHttpLink(w.bugList)" :href="w.bugList" target="_blank" rel="noreferrer">打开</a>
                  <span v-else>{{ w.bugList || "—" }}</span>
                </td>
                <td class="pw-col-blockers">{{ w.blockers || "—" }}</td>
              </tr>
              <tr v-if="!month.weeks.length">
                <td colspan="10" class="product-roadmap-muted">暂无周记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <p v-if="!data.months.length" class="product-roadmap-muted">周进度为空，localhost 下点击「编辑周进度」添加。</p>
    </template>

    <div
      v-if="editorOpen"
      class="product-roadmap-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="编辑周进度"
      @click.self="closeEditor"
    >
      <div class="product-roadmap-modal product-week-progress-modal">
        <header class="product-roadmap-modal-head">
          <h3>编辑周进度</h3>
          <code>docs/{{ fileRel }}</code>
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
            <div
              v-for="(month, mIdx) in editorDraft.months"
              :key="'em-' + mIdx"
              class="product-week-progress-editor-month"
            >
              <div class="product-week-progress-editor-month-head">
                <label>
                  月份 id
                  <input v-model="month.id" type="text" class="pr-input" />
                </label>
                <label>
                  说明 goal
                  <input v-model="month.goal" type="text" class="pr-input pr-input--wide" placeholder="面向 6.30" />
                </label>
                <label class="product-week-progress-check">
                  <input v-model="month.archived" type="checkbox" />
                  归档
                </label>
                <button type="button" class="pr-btn pr-btn--danger" @click="removeMonth(mIdx)">删除本月</button>
              </div>

              <table class="product-roadmap-editor-table">
                <thead>
                  <tr>
                    <th>周</th>
                    <th>周期</th>
                    <th>重点模块</th>
                    <th>负责人</th>
                    <th>计划</th>
                    <th>结果</th>
                    <th>依赖</th>
                    <th>测试链接</th>
                    <th>Bug 列表</th>
                    <th>备注</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(w, wIdx) in month.weeks" :key="'ew-' + wIdx">
                    <td><input v-model="w.id" type="text" class="pr-input" /></td>
                    <td><input v-model="w.period" type="text" class="pr-input" /></td>
                    <td><input v-model="w.focus" type="text" class="pr-input pr-input--wide" /></td>
                    <td><input v-model="w.owner" type="text" class="pr-input" /></td>
                    <td><input v-model="w.plan" type="text" class="pr-input pr-input--note" /></td>
                    <td>
                      <select v-model="w.result" class="pr-select">
                        <option v-for="s in WEEK_RESULT_OPTIONS" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </td>
                    <td><input v-model="w.dependencies" type="text" class="pr-input pr-input--wide" /></td>
                    <td><input v-model="w.testLink" type="text" class="pr-input pr-input--note" /></td>
                    <td><input v-model="w.bugList" type="text" class="pr-input pr-input--note" /></td>
                    <td><input v-model="w.blockers" type="text" class="pr-input pr-input--note" /></td>
                    <td>
                      <button type="button" class="pr-btn pr-btn--danger" @click="removeWeek(mIdx, wIdx)">删</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button type="button" class="pr-btn pr-btn--add" @click="addWeek(mIdx)">+ 本周块添加一行</button>
            </div>

            <button type="button" class="pr-btn pr-btn--add" @click="addMonth">+ 添加月份块</button>
          </div>

          <div v-show="editorTab === 'yaml'" class="product-roadmap-yaml-pane">
            <p class="product-roadmap-yaml-hint">
              结构：<code>months</code> → 每月 <code>id</code> / <code>goal</code> / <code>archived</code> /
              <code>weeks</code>（<code>id</code>、<code>period</code>、<code>focus</code>、<code>owner</code>、
              <code>plan</code>、<code>result</code>、<code>dependencies</code>、<code>testLink</code>、
              <code>bugList</code>、<code>blockers</code>（备注列）。结果符号：✅ 🟡 ⬜ ➖。
            </p>
            <textarea
              v-model="editorRawYaml"
              class="product-roadmap-yaml-editor"
              spellcheck="false"
              aria-label="周进度 YAML"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-week-progress-wrap :deep(.product-roadmap) {
  overflow-x: hidden;
}
.product-week-progress-wrap :deep(.product-roadmap table) {
  table-layout: fixed;
  width: 100%;
}
.product-week-progress-wrap :deep(.product-roadmap th),
.product-week-progress-wrap :deep(.product-roadmap td) {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.product-week-progress-month {
  margin: 1.25rem 0 1.75rem;
}
.product-week-progress-month-title {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.product-week-progress-archived {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
.pw-col-week {
  width: 5%;
}
.pw-col-period {
  width: 8%;
}
.pw-col-focus,
.pw-col-plan,
.pw-col-dependencies,
.pw-col-change,
.pw-col-delay,
.pw-col-impact,
.pw-col-blockers {
  width: 14%;
  min-width: 0;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.pw-focus-item {
  display: block;
  margin-bottom: 0.2rem;
}
.pw-focus-item:last-child {
  margin-bottom: 0;
}
.pw-focus-link {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}
.pw-col-owner,
.pw-col-link {
  width: 8%;
  min-width: 0;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.pw-col-result {
  width: 5%;
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
</style>
