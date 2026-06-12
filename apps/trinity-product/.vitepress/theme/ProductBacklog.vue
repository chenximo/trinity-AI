<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData } from "vitepress";
import {
  emptyProductBacklogData,
  normalizeProductBacklogData,
  parseProductBacklogYaml,
  stringifyProductBacklogYaml,
  type ProductBacklogData,
} from "../shared/productBacklogSchema";
import { canEditRoadmapYaml } from "./useRoadmapEditor";
import "./product-roadmap.css";

const props = defineProps<{
  rel?: string;
  src?: string;
}>();

const { page } = useData();

const fileRel = computed(() => {
  const r = props.rel?.trim();
  if (r && (r.includes("/") || r.endsWith(".yml")) && !r.startsWith("./")) {
    return r.replace(/^\//, "");
  }
  const file = (r || props.src || "product-backlog.yml").replace(/^\.\//, "");
  const pageDir = (page.value.relativePath || "").replace(/\/[^/]+$/, "");
  if (file.includes("/") || file === "product-backlog.yml") {
    return pageDir ? `${pageDir}/${file.replace(/^\//, "")}` : file;
  }
  return pageDir ? `${pageDir}/${file}` : file;
});

const rawYaml = ref("");
const loadError = ref("");

const API = `${(import.meta.env.BASE_URL || "/product/").replace(/\/?$/, "")}/__trinity_dev_product`;

async function fetchDisplayYaml() {
  const rel = fileRel.value;
  if (!rel) return;
  loadError.value = "";
  try {
    if (canEditRoadmapYaml()) {
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

const data = computed<ProductBacklogData>(() => {
  if (!rawYaml.value) return emptyProductBacklogData();
  try {
    return normalizeProductBacklogData(parseProductBacklogYaml(rawYaml.value));
  } catch {
    return emptyProductBacklogData();
  }
});

const showEdit = computed(() => canEditRoadmapYaml() && Boolean(fileRel.value));

const editorOpen = ref(false);
const editorSaving = ref(false);
const editorError = ref("");
const editorYaml = ref("");

function leafHref(leaf: string | undefined): string | null {
  if (!leaf?.trim()) return null;
  const clean = leaf.trim().replace(/^\/+/, "").replace(/^ai-api-platform\//, "");
  return `/ai-api-platform/${clean}`;
}

watch(fileRel, () => {
  void fetchDisplayYaml();
});

onMounted(() => {
  void fetchDisplayYaml();
});

function openEditor() {
  editorOpen.value = true;
  editorError.value = "";
  editorYaml.value = rawYaml.value || stringifyProductBacklogYaml(emptyProductBacklogData());
}

function closeEditor() {
  editorOpen.value = false;
  editorSaving.value = false;
  editorError.value = "";
}

async function onSaveEditor() {
  const trimmed = editorYaml.value.trim();
  if (!trimmed.includes("items:")) {
    editorError.value = "缺少 items: 段";
    return;
  }
  try {
    const parsed = normalizeProductBacklogData(parseProductBacklogYaml(trimmed));
    if (!parsed.items.length) {
      editorError.value = "至少保留一条待办";
      return;
    }
    const normalized = stringifyProductBacklogYaml(parsed);
    editorSaving.value = true;
    editorError.value = "";
    const res = await fetch(`${API}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rel: fileRel.value, content: normalized }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    rawYaml.value = normalized;
    closeEditor();
    await fetchDisplayYaml();
  } catch (e) {
    editorError.value = e instanceof Error ? e.message : "保存失败";
  } finally {
    editorSaving.value = false;
  }
}
</script>

<template>
  <div class="product-roadmap-wrap product-backlog-wrap">
    <div v-if="showEdit" class="product-roadmap-toolbar">
      <button type="button" class="product-roadmap-edit-btn" @click="openEditor">
        编辑待办池
      </button>
      <span class="product-roadmap-toolbar-hint">
        仅 localhost · <code>docs/{{ fileRel }}</code> · 排期请写入周计划
      </span>
    </div>

    <p v-if="loadError" class="product-roadmap-error">{{ loadError }}</p>

    <div v-else class="product-roadmap product-backlog-table-wrap">
      <table>
        <thead>
          <tr>
            <th class="pr-col-feature">所属模块</th>
            <th class="pr-col-feature">具体任务</th>
            <th class="pr-col-milestone">目标</th>
            <th class="pr-col-note">备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!data.items.length">
            <td colspan="4" class="product-roadmap-muted">暂无待办</td>
          </tr>
          <tr v-for="(item, idx) in data.items" :key="idx">
            <td class="pr-col-feature">
              <a v-if="leafHref(item.leaf)" :href="leafHref(item.leaf)">{{ item.module }}</a>
              <span v-else>{{ item.module }}</span>
            </td>
            <td class="pr-col-feature">{{ item.task }}</td>
            <td class="pr-col-milestone">{{ item.target || "—" }}</td>
            <td class="pr-col-note product-backlog-note">{{ item.note || "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="editorOpen"
      class="product-roadmap-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="编辑产品待办池"
      @click.self="closeEditor"
    >
      <div class="product-roadmap-modal">
        <header class="product-roadmap-modal-head">
          <h3>编辑产品待办池</h3>
          <code>docs/{{ fileRel }}</code>
          <div class="product-roadmap-modal-actions">
            <button type="button" class="pr-btn" @click="closeEditor">取消</button>
            <button
              type="button"
              class="pr-btn pr-btn--primary"
              :disabled="editorSaving"
              @click="onSaveEditor"
            >
              {{ editorSaving ? "保存中…" : "保存" }}
            </button>
          </div>
        </header>

        <p v-if="editorError" class="product-roadmap-error">{{ editorError }}</p>

        <div class="product-roadmap-modal-body">
          <textarea
            v-model="editorYaml"
            class="product-roadmap-yaml-editor"
            rows="18"
            spellcheck="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-backlog-wrap :deep(.product-backlog-table-wrap) {
  overflow-x: visible;
  max-width: 100%;
}

.product-backlog-wrap :deep(.product-backlog-table-wrap table) {
  table-layout: fixed;
  width: 100%;
  line-height: 1.55;
}

.product-backlog-wrap :deep(.product-backlog-table-wrap th),
.product-backlog-wrap :deep(.product-backlog-table-wrap td) {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  vertical-align: top;
  text-align: left;
}

.product-backlog-wrap :deep(.product-backlog-table-wrap th) {
  text-align: center;
}

.product-backlog-wrap :deep(.product-backlog-table-wrap .pr-col-feature) {
  width: 18%;
}

.product-backlog-wrap :deep(.product-backlog-table-wrap .pr-col-milestone) {
  width: 8%;
  text-align: center;
}

.product-backlog-wrap :deep(.product-backlog-note) {
  white-space: pre-line;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
</style>
