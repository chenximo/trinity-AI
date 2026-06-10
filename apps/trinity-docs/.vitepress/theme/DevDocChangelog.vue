<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { ChangelogRelease, PendingDocChange } from "../shared/changelogTypes";
import "./dev-changelog.css";

const API = `${(import.meta.env.BASE_URL || "/docs/").replace(/\/?$/, "")}/__trinity_dev_docs`;
const isDev = import.meta.env.DEV;

const open = ref(false);
const tab = ref<"publish" | "history">("publish");
const loading = ref(false);
const publishing = ref(false);
const error = ref("");
const status = ref("");

const releases = ref<ChangelogRelease[]>([]);
const pendingFiles = ref<PendingDocChange[]>([]);
const gitRef = ref<string | null>(null);
const gitDirty = ref(false);

const note = ref("");
const suggestedNote = ref("");
const author = ref("");
const selectedRels = ref<Set<string>>(new Set());
const expandedReleases = ref<Set<string>>(new Set());
const deletingId = ref<string | null>(null);

const isClient = typeof window !== "undefined";

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { error?: string };
    return data.error || text || `HTTP ${res.status}`;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

async function loadChangelog() {
  const res = await fetch(`${API}/changelog`);
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = (await res.json()) as { releases?: ChangelogRelease[] };
  releases.value = data.releases ?? [];
}

async function loadPending() {
  const res = await fetch(`${API}/pending-changes`);
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = (await res.json()) as {
    files?: PendingDocChange[];
    gitRef?: string | null;
    gitDirty?: boolean;
    suggestedNote?: string;
  };
  pendingFiles.value = data.files ?? [];
  gitRef.value = data.gitRef ?? null;
  gitDirty.value = Boolean(data.gitDirty);
  suggestedNote.value = data.suggestedNote?.trim() ?? "";
  selectedRels.value = new Set(pendingFiles.value.map((f) => f.rel));
}

async function refresh() {
  loading.value = true;
  error.value = "";
  try {
    await Promise.all([loadChangelog(), loadPending()]);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "加载失败";
  } finally {
    loading.value = false;
  }
}

async function openPanel() {
  open.value = true;
  tab.value = "publish";
  note.value = "";
  suggestedNote.value = "";
  status.value = "";
  await refresh();
}

function applySuggestedNote() {
  if (suggestedNote.value) note.value = suggestedNote.value;
}

function closePanel() {
  open.value = false;
  error.value = "";
  status.value = "";
}

function toggleFile(rel: string, checked: boolean) {
  const next = new Set(selectedRels.value);
  if (checked) next.add(rel);
  else next.delete(rel);
  selectedRels.value = next;
}

function toggleReleaseFiles(id: string) {
  const next = new Set(expandedReleases.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedReleases.value = next;
}

const selectedFiles = computed(() =>
  pendingFiles.value.filter((f) => selectedRels.value.has(f.rel)),
);

async function publishRelease() {
  publishing.value = true;
  error.value = "";
  status.value = "";
  try {
    const files = selectedFiles.value.map((f) => ({
      rel: f.rel,
      linesAdded: f.linesAdded,
      linesRemoved: f.linesRemoved,
      status: f.status,
    }));
    const res = await fetch(`${API}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        note: note.value.trim(),
        author: author.value.trim() || undefined,
        files,
      }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    status.value = "已记录本次发布（正文仍以 Git 为准，请记得 commit / push）";
    note.value = "";
    await refresh();
    tab.value = "history";
  } catch (e) {
    error.value = e instanceof Error ? e.message : "发布失败";
  } finally {
    publishing.value = false;
  }
}

async function deleteRelease(id: string) {
  if (!window.confirm("确定删除这条发布记录？（仅删 dev 便签，不影响 Git 正文）")) return;
  deletingId.value = id;
  error.value = "";
  try {
    const res = await fetch(`${API}/delete-release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error(await parseApiError(res));
    expandedReleases.value.delete(id);
    await loadChangelog();
    status.value = "已删除该条发布记录";
  } catch (e) {
    error.value = e instanceof Error ? e.message : "删除失败";
  } finally {
    deletingId.value = null;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return iso;
  }
}

watch(open, (active) => {
  document.documentElement.classList.toggle("tdocs-changelog-open", active);
});

onUnmounted(() => {
  document.documentElement.classList.remove("tdocs-changelog-open");
});
</script>

<template>
  <template v-if="isClient && isDev">
    <button
      v-if="!open"
      type="button"
      class="tdocs-dev-changelog-trigger"
      title="开发环境：文档发布记录（不部署线上）"
      @click="openPanel"
    >
      发布记录
    </button>

    <div v-else class="tdocs-changelog-backdrop" @click.self="closePanel">
      <section class="tdocs-changelog-panel" role="dialog" aria-label="文档发布记录">
        <header class="tdocs-changelog-head">
          <div>
            <h2 class="tdocs-changelog-title">文档发布记录（dev）</h2>
            <p class="tdocs-changelog-lead">
              只记一两句说明 + 文件清单；正文以 Git 为准。发布 ≠ 线上部署。
            </p>
          </div>
          <button type="button" class="tdocs-changelog-close" @click="closePanel">关闭</button>
        </header>

        <div class="tdocs-changelog-tabs">
          <button
            type="button"
            class="tdocs-changelog-tab"
            :class="{ 'is-active': tab === 'publish' }"
            @click="tab = 'publish'"
          >
            本次发布
          </button>
          <button
            type="button"
            class="tdocs-changelog-tab"
            :class="{ 'is-active': tab === 'history' }"
            @click="tab = 'history'"
          >
            历史记录
            <span v-if="releases.length" class="tdocs-changelog-tab__badge">{{ releases.length }}</span>
          </button>
        </div>

        <p v-if="loading" class="tdocs-changelog-status">加载中…</p>
        <p v-else-if="error" class="tdocs-changelog-status tdocs-changelog-status--error">{{ error }}</p>
        <p v-else-if="status" class="tdocs-changelog-status tdocs-changelog-status--ok">{{ status }}</p>

        <div v-if="!loading && tab === 'publish'" class="tdocs-changelog-body">
          <p class="tdocs-changelog-meta">
            Git：
            <code>{{ gitRef ?? "未知" }}</code>
            <span v-if="gitDirty" class="tdocs-changelog-tag">工作区有未提交变更</span>
            <span v-else class="tdocs-changelog-tag tdocs-changelog-tag--ok">工作区干净</span>
          </p>

          <label class="tdocs-changelog-field">
            <span class="tdocs-changelog-field__label-row">
              <span>发布说明（一两句话）</span>
              <button
                v-if="suggestedNote && note !== suggestedNote"
                type="button"
                class="tdocs-changelog-link-btn"
                @click="applySuggestedNote"
              >
                采用建议
              </button>
            </span>
            <textarea
              v-model="note"
              rows="2"
              maxlength="280"
              :placeholder="suggestedNote || '例如：同步工程师稿 §二生图；补补偿查询与中英镜像'"
            />
            <p v-if="suggestedNote" class="tdocs-changelog-hint">
              建议：<span>{{ suggestedNote }}</span>
            </p>
          </label>

          <label class="tdocs-changelog-field tdocs-changelog-field--inline">
            <span>发布人（可选）</span>
            <input v-model="author" type="text" placeholder="默认取 git user.name" />
          </label>

          <h3 class="tdocs-changelog-subtitle">变更文件（{{ pendingFiles.length }}）</h3>
          <p v-if="!pendingFiles.length" class="tdocs-changelog-empty">
            未检测到 <code>docs/</code> 下相对 HEAD 的变更。请先编辑并保存 Markdown，或执行 git 提交后再发布。
          </p>
          <ul v-else class="tdocs-changelog-file-list tdocs-changelog-file-list--compact">
            <li v-for="file in pendingFiles" :key="file.rel" class="tdocs-changelog-file">
              <label class="tdocs-changelog-file__check">
                <input
                  type="checkbox"
                  :checked="selectedRels.has(file.rel)"
                  @change="toggleFile(file.rel, ($event.target as HTMLInputElement).checked)"
                />
                <span class="tdocs-changelog-file__label">{{ file.label }}</span>
                <code class="tdocs-changelog-file__path">docs/{{ file.rel }}</code>
                <span class="tdocs-changelog-file__stat">+{{ file.linesAdded }} / -{{ file.linesRemoved }}</span>
              </label>
            </li>
          </ul>

          <div class="tdocs-changelog-actions">
            <button type="button" class="tdocs-changelog-btn" @click="refresh">刷新变更</button>
            <button
              type="button"
              class="tdocs-changelog-btn tdocs-changelog-btn--primary"
              :disabled="publishing || !note.trim() || !selectedFiles.length"
              @click="publishRelease"
            >
              {{ publishing ? "记录中…" : "确认发布（仅留记录）" }}
            </button>
          </div>
        </div>

        <div v-else-if="!loading && tab === 'history'" class="tdocs-changelog-body">
          <p v-if="!releases.length" class="tdocs-changelog-empty">尚无发布记录。</p>
          <ol v-else class="tdocs-changelog-history">
            <li v-for="item in releases" :key="item.id" class="tdocs-changelog-release">
              <div class="tdocs-changelog-release__head">
                <strong>{{ formatTime(item.publishedAt) }}</strong>
                <span>{{ item.author }}</span>
                <code v-if="item.gitRef">{{ item.gitRef }}</code>
                <span v-if="item.gitDirty" class="tdocs-changelog-tag">含未提交变更</span>
                <button
                  type="button"
                  class="tdocs-changelog-delete-btn"
                  :disabled="deletingId === item.id"
                  @click="deleteRelease(item.id)"
                >
                  {{ deletingId === item.id ? "删除中…" : "删除" }}
                </button>
              </div>
              <p class="tdocs-changelog-release__note">{{ item.note }}</p>
              <button
                type="button"
                class="tdocs-changelog-link-btn"
                @click="toggleReleaseFiles(item.id)"
              >
                {{ expandedReleases.has(item.id) ? "收起" : "展开" }}文件（{{ item.files.length }}）
              </button>
              <ul
                v-if="expandedReleases.has(item.id)"
                class="tdocs-changelog-release__files"
              >
                <li v-for="file in item.files" :key="`${item.id}-${file.rel}`">
                  <code>docs/{{ file.rel }}</code>
                  <span v-if="file.linesAdded != null" class="tdocs-changelog-file__stat">
                    (+{{ file.linesAdded }}/-{{ file.linesRemoved ?? 0 }})
                  </span>
                </li>
              </ul>
            </li>
          </ol>
        </div>
      </section>
    </div>
  </template>
</template>
