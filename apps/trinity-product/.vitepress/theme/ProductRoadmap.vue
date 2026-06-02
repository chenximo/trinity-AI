<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData } from "vitepress";
import {
  emptyRoadmapData,
  isMilestoneLocked,
  nodeForFeature,
  NODE_STATUS_OPTIONS,
  normalizeRoadmapData,
  parseRoadmapYaml,
  STATUS_OPTIONS,
  enrichFeatureNodes,
  type RoadmapData,
} from "../shared/roadmapSchema";
import { canEditRoadmapYaml, useRoadmapEditor } from "./useRoadmapEditor";
import "./product-roadmap.css";

const props = defineProps<{
  /**
   * docs 下路径，默认 `{当前子目录}/roadmap.yml`（一个子目录一个表）
   * 例：ai-api-platform/user/models/roadmap.yml
   */
  rel?: string;
  /** 与当前 md 同目录，默认 `roadmap.yml` */
  src?: string;
  /** 同一 roadmap.yml 多页共用时的行前缀，如 `营销首页` → 只显示以 `营销首页 ·` 开头的行 */
  prefix?: string;
}>();

const { page } = useData();

const roadmapRel = computed(() => {
  const r = props.rel?.trim();
  if (r && (r.includes("/") || r.endsWith("roadmap.yml")) && !r.startsWith("./")) {
    return r.replace(/^\//, "");
  }
  const file = (r || props.src || "roadmap.yml").replace(/^\.\//, "");
  const pageDir = (page.value.relativePath || "").replace(/\/[^/]+$/, "");
  if (file.includes("/") || file === "roadmap.yml") {
    return pageDir ? `${pageDir}/${file.replace(/^\//, "")}` : file;
  }
  return pageDir ? `${pageDir}/${file}` : file;
});

const rowPrefix = computed(() => {
  const p = props.prefix?.trim();
  return p ? `${p} · ` : "";
});

function matchesPrefix(name: string): boolean {
  const p = rowPrefix.value;
  if (!p) return true;
  return name.startsWith(p);
}

function filterByPrefix<T extends { name: string }>(rows: T[]): T[] {
  if (!rowPrefix.value) return rows;
  return rows.filter((r) => matchesPrefix(r.name));
}

function displayFeatureName(name: string): string {
  const p = rowPrefix.value;
  if (!p) return name;
  return name.startsWith(p) ? name.slice(p.length) : name;
}

function editorFeatureName(name: string): string {
  return displayFeatureName(name);
}

function onEditorFeatureNameInput(
  row: (typeof editorDraft.value.features)[number],
  event: Event,
) {
  const target = event.target as HTMLInputElement | null;
  const raw = (target?.value ?? "").trim();
  if (!rowPrefix.value) {
    row.name = raw;
    return;
  }
  row.name = raw ? `${rowPrefix.value}${raw}` : rowPrefix.value;
}

const rawYaml = ref("");
const loadError = ref("");

async function fetchDisplayYaml() {
  const rel = roadmapRel.value;
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

const data = computed<RoadmapData>(() => {
  if (!rawYaml.value) return emptyRoadmapData();
  try {
    return normalizeRoadmapData(parseRoadmapYaml(rawYaml.value));
  } catch {
    return emptyRoadmapData();
  }
});

const milestones = computed(() => data.value.milestones);
const features = computed(() => filterByPrefix(data.value.features));

const showEdit = computed(() => canEditRoadmapYaml() && Boolean(roadmapRel.value));

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
} = useRoadmapEditor(() => roadmapRel.value);

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

watch(roadmapRel, () => {
  void fetchDisplayYaml();
});

onMounted(() => {
  void fetchDisplayYaml();
});

async function onSaveEditor() {
  const ok =
    editorTab.value === "yaml" ? await saveFromRawYaml() : await saveFromDraft();
  if (!ok) return;
  closeEditor();
  await fetchDisplayYaml();
}

function addFeature() {
  const milestones = editorDraft.value.milestones;
  const row = enrichFeatureNodes(
    {
      name: rowPrefix.value ? `${rowPrefix.value}新子能力` : "新子能力",
      prototype: "⬜",
      backend: "⬜",
      note: "",
    },
    milestones,
  );
  editorDraft.value.features.push(row);
}

function removeFeature(idx: number) {
  editorDraft.value.features.splice(idx, 1);
}

function ensureMilestoneNode(row: (typeof editorDraft.value.features)[number], milestoneId: string): string {
  if (!row.nodes) row.nodes = {};
  const existing = row.nodes[milestoneId]?.trim();
  if (existing) return existing;
  const idx = editorDraft.value.milestones.findIndex((m) => m.id === milestoneId);
  const derived = nodeForFeature(row, milestoneId, idx >= 0 ? idx : 0);
  row.nodes[milestoneId] = derived;
  return derived;
}

function updateMilestoneNode(
  row: (typeof editorDraft.value.features)[number],
  milestoneId: string,
  value: string,
) {
  row.nodes = { ...(row.nodes || {}), [milestoneId]: value };
}

function onMilestoneNodeChange(
  row: (typeof editorDraft.value.features)[number],
  milestoneId: string,
  event: Event,
) {
  const target = event.target as HTMLSelectElement | null;
  updateMilestoneNode(row, milestoneId, target?.value ?? "⬜");
}

function nodeForMilestone(f: (typeof features.value)[number], mIdx: number): string {
  const m = milestones.value[mIdx];
  if (!m) return "⬜";
  return nodeForFeature(f, m.id, mIdx);
}
</script>

<template>
  <div class="product-roadmap-wrap">
    <div v-if="showEdit" class="product-roadmap-toolbar">
      <button type="button" class="product-roadmap-edit-btn" @click="openEditor">
        编辑子能力表
      </button>
      <span class="product-roadmap-toolbar-hint">
        仅 localhost · <code>docs/{{ roadmapRel }}</code>
        <template v-if="prefix"> · 本页筛选 <strong>{{ prefix }}</strong>（编辑为完整文件）</template>
      </span>
    </div>

    <p v-if="loadError" class="product-roadmap-error">{{ loadError }}</p>

    <div v-else class="product-roadmap">
      <table>
        <thead>
          <tr>
            <th class="pr-col-feature">功能</th>
            <th class="pr-col-status">原型</th>
            <th class="pr-col-status">后端</th>
            <th
              v-for="m in milestones"
              :key="m.id"
              class="pr-col-milestone"
              :class="{ locked: isMilestoneLocked(m.date) }"
            >
              {{ m.id }}
              <span v-if="isMilestoneLocked(m.date)" class="pr-lock" title="已锁死">🔒</span>
            </th>
            <th class="pr-col-note">备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(f, idx) in features" :key="idx">
            <td class="pr-col-feature">{{ displayFeatureName(f.name) }}</td>
            <td class="pr-col-status">{{ f.prototype || "⬜" }}</td>
            <td class="pr-col-status">{{ f.backend || "⬜" }}</td>
            <td
              v-for="(m, mIdx) in milestones"
              :key="m.id"
              class="pr-col-milestone"
              :class="{ locked: isMilestoneLocked(m.date) }"
            >
              {{ nodeForMilestone(f, mIdx) }}
            </td>
            <td class="pr-col-note">{{ f.note || "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="editorOpen"
      class="product-roadmap-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="编辑子能力表"
      @click.self="closeEditor"
    >
      <div class="product-roadmap-modal">
        <header class="product-roadmap-modal-head">
          <h3>编辑子能力表</h3>
          <code>docs/{{ roadmapRel }}</code>
          <span v-if="prefix" class="product-roadmap-modal-prefix">· 完整文件（非仅 {{ prefix }}）</span>
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
          <table class="product-roadmap-editor-table">
            <thead>
              <tr>
                <th>功能</th>
                <th>原型</th>
                <th>后端</th>
                <th v-for="m in editorDraft.milestones" :key="m.id">{{ m.id }}</th>
                <th>备注</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in editorDraft.features" :key="idx">
                <td>
                  <input
                    :value="editorFeatureName(row.name)"
                    type="text"
                    class="pr-input pr-input--wide"
                    @input="onEditorFeatureNameInput(row, $event)"
                  />
                </td>
                <td>
                  <select v-model="row.prototype" class="pr-select">
                    <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
                    <option value="🟡 80%">🟡 80%</option>
                    <option value="🟡 60%">🟡 60%</option>
                    <option value="🟡 40%">🟡 40%</option>
                  </select>
                </td>
                <td>
                  <select v-model="row.backend" class="pr-select">
                    <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
                    <option value="🟡 80%">🟡 80%</option>
                    <option value="🟡 60%">🟡 60%</option>
                    <option value="🟡 40%">🟡 40%</option>
                  </select>
                </td>
                <td
                  v-for="(m, mIdx) in editorDraft.milestones"
                  :key="m.id"
                  class="pr-col-milestone"
                >
                  <select
                    :value="ensureMilestoneNode(row, m.id)"
                    class="pr-select"
                    @change="onMilestoneNodeChange(row, m.id, $event)"
                  >
                    <option v-for="s in NODE_STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
                  </select>
                </td>
                <td>
                  <input v-model="row.note" type="text" class="pr-input pr-input--note" placeholder="备注" />
                </td>
                <td>
                  <button type="button" class="pr-btn pr-btn--danger" title="删除行" @click="removeFeature(idx)">
                    删
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="pr-btn pr-btn--add" @click="addFeature">+ 添加子能力</button>
          </div>

          <div v-show="editorTab === 'yaml'" class="product-roadmap-yaml-pane">
            <p class="product-roadmap-yaml-hint">
              每条 feature 含 <code>prototype</code>、<code>backend</code>、<code>5.30</code> / <code>6.30</code> 节点列与 <code>note</code>；节点可与表格互相同步。保存时会按规则补全并格式化。
            </p>
            <textarea
              v-model="editorRawYaml"
              class="product-roadmap-yaml-editor"
              spellcheck="false"
              aria-label="YAML 源文"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
