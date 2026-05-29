<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import bundledReport from "../../docs/ai-api-platform/api-test/reports/chat-api-test.data.json";
import {
  formatResultCellHtml,
  type ReportCaseRow,
} from "../../acceptance/runner/formatAcceptanceReport";
import {
  orderedModelIds,
  type ChatApiTestReportFile,
  type ChatApiTestReportRow,
} from "../../acceptance/runner/chatApiTestReport";
import "./api-validation-report.css";
import "./chat-api-test-hub.css";

type ResultFilter = "all" | "pass" | "fail";

const isClient = typeof window !== "undefined";
const apiBase = computed(() => {
  const base = import.meta.env.BASE_URL ?? "/";
  return `${base.replace(/\/+$/, "")}/__trinity_api_acceptance`;
});

const report = ref<ChatApiTestReportFile>(bundledReport as ChatApiTestReportFile);
const loading = ref(false);
const loadError = ref("");
const modelFilter = ref("all");
const resultFilter = ref<ResultFilter>("all");

function toReportCaseRow(row: ChatApiTestReportRow): ReportCaseRow {
  return {
    ...row,
    acceptance: "pending",
  };
}

function formatTestedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const modelOptions = computed(() =>
  orderedModelIds(report.value).map((id) => ({
    id,
    label: report.value.models[id]?.modelLabel ?? id,
  })),
);

const visibleSections = computed(() => {
  const ids = orderedModelIds(report.value).filter(
    (id) => modelFilter.value === "all" || modelFilter.value === id,
  );

  return ids
    .map((id) => {
      const section = report.value.models[id];
      if (!section) return null;
      const rows = section.rows.filter((row) => {
        if (resultFilter.value === "pass") return row.machinePass === true;
        if (resultFilter.value === "fail") return row.machinePass === false;
        return true;
      });
      return { id, section, rows };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item && item.rows.length > 0));
});

const reportPageUrl = computed(() => {
  const base = import.meta.env.BASE_URL ?? "/product/";
  return `${base.replace(/\/+$/, "")}/ai-api-platform/api-test/reports/chat-api-test`;
});

const consolePageUrl = computed(() => {
  const base = import.meta.env.BASE_URL ?? "/product/";
  return `${base.replace(/\/+$/, "")}/ai-api-platform/api-test/chat-completions`;
});

const totalModels = computed(() => orderedModelIds(report.value).length);

async function loadReport() {
  if (!isClient) return;
  loading.value = true;
  loadError.value = "";
  try {
    const res = await fetch(`${apiBase.value}/report`);
    if (res.ok) {
      report.value = (await res.json()) as ChatApiTestReportFile;
      return;
    }
  } catch {
    /* dev 未启动时回退到构建内置 JSON */
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadReport();
});
</script>

<template>
  <div v-if="!isClient" aria-hidden="true" />

  <div v-else class="chat-api-test-hub">
    <p class="chat-api-test-hub-lead">
      <code>{{ report.endpoint }}</code>
      · 各模型测试结果汇集于此；在
      <a :href="consolePageUrl">生文验收台</a>
      导出后会更新本页对应模型表格。
    </p>

    <div class="chat-api-test-hub-toolbar">
      <label class="chat-api-test-hub-field">
        <span>模型</span>
        <select v-model="modelFilter" class="chat-api-test-hub-select">
          <option value="all">全部（{{ totalModels }}）</option>
          <option v-for="m in modelOptions" :key="m.id" :value="m.id">
            {{ m.label }}（{{ m.id }}）
          </option>
        </select>
      </label>
      <label class="chat-api-test-hub-field">
        <span>结果</span>
        <select v-model="resultFilter" class="chat-api-test-hub-select">
          <option value="all">全部</option>
          <option value="pass">仅通过</option>
          <option value="fail">仅未通过</option>
        </select>
      </label>
      <button type="button" class="chat-api-test-hub-refresh" :disabled="loading" @click="loadReport">
        {{ loading ? "刷新中…" : "刷新" }}
      </button>
    </div>

    <p v-if="loadError" class="chat-api-test-hub-error">{{ loadError }}</p>
    <p v-else class="chat-api-test-hub-meta">
      最近更新 {{ formatTestedAt(report.updatedAt) }} · 共 {{ totalModels }} 个模型
    </p>

    <div v-if="!visibleSections.length" class="chat-api-test-hub-empty">
      当前筛选下无结果。请调整筛选，或在验收台运行测试后点击「导出测试汇总」。
    </div>

    <section
      v-for="block in visibleSections"
      :key="block.id"
      class="chat-api-test-hub-section"
    >
      <header class="chat-api-test-hub-section-head">
        <h2 class="chat-api-test-hub-section-title">
          {{ block.section.modelLabel }}
          <code class="chat-api-test-hub-model-id">{{ block.id }}</code>
        </h2>
        <p class="chat-api-test-hub-section-meta">
          {{ formatTestedAt(block.section.testedAt) }}
          · {{ block.section.summary.passed }}/{{ block.section.summary.total }} 通过
          <template v-if="block.section.summary.failed">
            · {{ block.section.summary.failed }} 未通过
          </template>
        </p>
      </header>

      <div class="api-val-report">
        <table>
          <thead>
            <tr>
              <th>场景</th>
              <th>关键参数</th>
              <th>结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in block.rows" :key="row.caseId">
              <td>{{ row.title }}</td>
              <td>
                <template v-if="row.paramKeys.length">
                  <template v-for="(key, i) in row.paramKeys" :key="key">
                    <code>{{ key }}</code><span v-if="i < row.paramKeys.length - 1">, </span>
                  </template>
                </template>
                <template v-else>—</template>
              </td>
              <td v-html="formatResultCellHtml(toReportCaseRow(row))" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
