<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useData } from "vitepress";
import {
  emptyReleaseNotesData,
  normalizeReleaseNotesData,
  parseReleaseNotesYaml,
  stringifyReleaseNotesYaml,
  type ProductRelease,
  type ReleaseNotesData,
} from "../shared/releaseNotesSchema";
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
  const file = (r || props.src || "release-notes.yml").replace(/^\.\//, "");
  const pageDir = (page.value.relativePath || "").replace(/\/[^/]+$/, "");
  if (file.includes("/") || file === "release-notes.yml") {
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

const data = computed<ReleaseNotesData>(() => {
  if (!rawYaml.value) return emptyReleaseNotesData();
  try {
    return normalizeReleaseNotesData(parseReleaseNotesYaml(rawYaml.value));
  } catch {
    return emptyReleaseNotesData();
  }
});

const releasesOrdered = computed<ProductRelease[]>(() => data.value.releases);

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
  editorYaml.value = rawYaml.value || stringifyReleaseNotesYaml(emptyReleaseNotesData());
}

function closeEditor() {
  editorOpen.value = false;
  editorSaving.value = false;
  editorError.value = "";
}

async function onSaveEditor() {
  const trimmed = editorYaml.value.trim();
  if (!trimmed.includes("releases:")) {
    editorError.value = "缺少 releases: 段";
    return;
  }
  try {
    const parsed = normalizeReleaseNotesData(parseReleaseNotesYaml(trimmed));
    const normalized = stringifyReleaseNotesYaml(parsed);
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
  <div class="product-roadmap-wrap product-release-notes-wrap">
    <div v-if="showEdit" class="product-roadmap-toolbar">
      <button type="button" class="product-roadmap-edit-btn" @click="openEditor">
        编辑迭代版本
      </button>
      <span class="product-roadmap-toolbar-hint">
        仅 localhost · <code>docs/{{ fileRel }}</code> · 每周发布后在顶部新增一条
      </span>
    </div>

    <p v-if="loadError" class="product-roadmap-error">{{ loadError }}</p>

    <div v-else-if="!releasesOrdered.length" class="product-release-notes-empty product-roadmap-muted">
      暂无发布记录；每周发布后在此新增版本条目。
    </div>

    <div v-else class="product-release-notes-list">
      <article
        v-for="release in releasesOrdered"
        :key="release.version"
        class="product-release-notes-card"
      >
        <header class="product-release-notes-head">
          <div class="product-release-notes-version">
            <span class="product-release-notes-tag">{{ release.version }}</span>
            <span v-if="release.week" class="product-release-notes-week">{{ release.week }}</span>
          </div>
          <h3 class="product-release-notes-title">{{ release.title }}</h3>
        </header>

        <p v-if="release.summary" class="product-release-notes-summary">{{ release.summary }}</p>

        <div v-if="release.shipped.length" class="product-release-notes-shipped">
          <h4>本版发布</h4>
          <ul>
            <li v-for="(item, idx) in release.shipped" :key="idx">
              <strong>
                <a v-if="leafHref(item.leaf)" :href="leafHref(item.leaf)">{{ item.module }}</a>
                <span v-else>{{ item.module }}</span>
              </strong>
              <span class="product-release-notes-change">{{ item.change }}</span>
            </li>
          </ul>
        </div>

        <div v-if="release.deploy" class="product-release-notes-deploy">
          <h4>部署 / 可见环境</h4>
          <pre>{{ release.deploy }}</pre>
        </div>

        <p v-if="release.note" class="product-release-notes-note">{{ release.note }}</p>
      </article>
    </div>

    <div
      v-if="editorOpen"
      class="product-roadmap-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="编辑产品迭代版本"
      @click.self="closeEditor"
    >
      <div class="product-roadmap-modal">
        <header class="product-roadmap-modal-head">
          <h3>编辑产品迭代版本</h3>
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
            rows="22"
            spellcheck="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-release-notes-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 1rem 0 0;
}

.product-release-notes-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 1rem 1.15rem;
  background: var(--vp-c-bg-soft);
}

.product-release-notes-head {
  margin-bottom: 0.5rem;
}

.product-release-notes-version {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.product-release-notes-tag {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
}

.product-release-notes-week {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.product-release-notes-title {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.4;
}

.product-release-notes-summary {
  margin: 0.35rem 0 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
  white-space: pre-line;
}

.product-release-notes-shipped h4,
.product-release-notes-deploy h4 {
  margin: 0.75rem 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.product-release-notes-shipped ul {
  margin: 0;
  padding-left: 1.1rem;
}

.product-release-notes-shipped li {
  margin: 0.35rem 0;
  line-height: 1.55;
}

.product-release-notes-change {
  display: block;
  margin-top: 0.15rem;
  color: var(--vp-c-text-1);
  white-space: pre-line;
}

.product-release-notes-deploy pre {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.product-release-notes-note {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  white-space: pre-line;
}

.product-release-notes-empty {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  text-align: center;
}
</style>
