<script setup lang="ts">
import { computed, ref } from "vue";
import { useGeoStore } from "../../demo/useGeoStore";
import type { DemoStep } from "../../demo/types";

const {
  brand,
  questions,
  state,
  activeStep,
  r1Analysis,
  r2Analysis,
  activeAnalysis,
  pipelineStatus,
  addManualRecord,
  setActionStatus,
  resetDemo,
} = useGeoStore();

const formQuestionId = ref("Q01");
const formRound = ref("R1");
const formAnswer = ref("");
const detailAnswer = ref<string | null>(null);

const nav: { id: DemoStep; label: string; desc: string }[] = [
  { id: "dashboard", label: "总览", desc: "六环闭环状态" },
  { id: "strategy", label: "① 策略规划", desc: "品牌·问题集·竞品" },
  { id: "collect", label: "② 监测采集", desc: "豆包回答存档" },
  { id: "measure", label: "③ 测量", desc: "SOA·提及·位置" },
  { id: "diagnose", label: "④ 诊断", desc: "失声·落后·根因" },
  { id: "optimize", label: "⑤ 优化", desc: "可执行待办" },
  { id: "verify", label: "⑥ 验证", desc: "R1 vs R2" },
];

const pipe = computed(() => pipelineStatus());

function submitAnswer() {
  if (!formAnswer.value.trim()) return;
  addManualRecord({
    questionId: formQuestionId.value,
    answer: formAnswer.value,
    round: formRound.value,
  });
  formAnswer.value = "";
  activeStep.value = "measure";
}

function priorityClass(p: string) {
  if (p === "P0") return "bg-red-100 text-red-800";
  if (p === "P1") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-600";
}

function statusClass(s: string) {
  if (s === "已完成") return "bg-emerald-100 text-emerald-800";
  if (s === "进行中") return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-600";
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-57px)] bg-slate-100">
    <!-- Sidebar -->
    <aside class="w-56 shrink-0 border-r border-slate-200 bg-white p-3">
      <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        GEO MVP 演示
      </p>
      <p class="mb-4 text-sm font-medium text-slate-800">{{ brand.primary_name }} × 豆包</p>
      <nav class="space-y-1">
        <button
          v-for="item in nav"
          :key="item.id"
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm transition"
          :class="
            activeStep === item.id
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="activeStep = item.id"
        >
          <div class="font-medium">{{ item.label }}</div>
          <div
            class="text-xs"
            :class="activeStep === item.id ? 'text-slate-300' : 'text-slate-400'"
          >
            {{ item.desc }}
          </div>
        </button>
      </nav>
      <button
        type="button"
        class="mt-6 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
        @click="resetDemo"
      >
        重置演示数据
      </button>
    </aside>

    <!-- Main -->
    <div class="min-w-0 flex-1 p-6">
      <!-- Dashboard -->
      <section v-if="activeStep === 'dashboard'" class="space-y-6">
        <header>
          <h2 class="text-xl font-semibold text-slate-900">GEO 答案经营系统 · 演示总览</h2>
          <p class="mt-1 text-sm text-slate-500">
            完整六环：策略 → 采集 → 测量 → 诊断 → 优化 → 验证（非仅监测报表）
          </p>
        </header>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <p class="text-xs text-slate-500">R1 SOA（进答案正文）</p>
            <p class="mt-2 text-4xl font-bold text-slate-900">
              {{ r1Analysis.soa.toFixed(1) }}%
            </p>
            <p class="mt-1 text-xs text-slate-400">
              {{ r1Analysis.inBodyCount }} / {{ r1Analysis.total }} 条采样
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <p class="text-xs text-slate-500">诊断项</p>
            <p class="mt-2 text-4xl font-bold text-slate-900">
              {{ r1Analysis.diagnoses.length }}
            </p>
            <p class="mt-1 text-xs text-slate-400">规则引擎 D1–D4</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <p class="text-xs text-slate-500">待办优化</p>
            <p class="mt-2 text-4xl font-bold text-slate-900">
              {{ r1Analysis.actions.length }}
            </p>
            <p class="mt-1 text-xs text-slate-400">
              已完成
              {{ state.actions.filter((a) => a.status === "已完成").length }}
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h3 class="mb-4 text-sm font-semibold text-slate-800">六环完成度</h3>
          <div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <div
              v-for="(ok, key) in {
                策略: pipe.strategy,
                采集: pipe.collect,
                测量: pipe.measure,
                诊断: pipe.diagnose,
                优化: pipe.optimize,
                验证: pipe.verify,
              }"
              :key="key"
              class="rounded-lg border px-3 py-2 text-center text-sm"
              :class="ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'"
            >
              {{ key }}
              <span class="ml-1">{{ ok ? "✓" : "—" }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>演示提示：</strong>Q00「推荐两款 API 聚合平台」已录入——豆包首推
          OpenRouter + TokenHub，Trinity SOA=0%。从左侧进入「监测采集」可继续粘贴豆包回答。
        </div>
      </section>

      <!-- Strategy -->
      <section v-else-if="activeStep === 'strategy'" class="space-y-4">
        <h2 class="text-xl font-semibold">① 策略规划</h2>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h3 class="font-medium text-slate-800">{{ brand.primary_name }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ brand.tagline }}</p>
          <a
            :href="brand.product_url"
            class="mt-2 inline-block text-sm text-blue-600"
            target="_blank"
            rel="noopener"
            >{{ brand.product_url }}</a
          >
          <p class="mt-3 text-xs text-slate-400">
            别名：{{ brand.aliases.join(" · ") }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h3 class="mb-2 text-sm font-semibold">竞品实体</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="c in brand.competitors"
              :key="c.id"
              class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
              >{{ c.id }}</span
            >
          </div>
        </div>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th class="px-4 py-2">ID</th>
                <th class="px-4 py-2">类型</th>
                <th class="px-4 py-2">问法</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="q in questions"
                :key="q.id"
                class="border-t border-slate-100"
              >
                <td class="px-4 py-2 font-mono text-xs">{{ q.id }}</td>
                <td class="px-4 py-2">{{ q.type }}</td>
                <td class="px-4 py-2 text-slate-700">{{ q.text }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Collect -->
      <section v-else-if="activeStep === 'collect'" class="space-y-4">
        <h2 class="text-xl font-semibold">② 监测采集</h2>

        <div class="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          <p class="font-medium text-slate-800">工程师 · 自动采集（占位）</p>
          <p class="mt-1">
            定时任务 + 豆包消费端采集（Playwright/RPA 或官方 API）→ 原始回答与截图入库 →
            供 SOA/诊断消费。
          </p>
          <p class="mt-2 text-xs text-slate-400">
            演示阶段：人工在豆包 App 提问，将回答粘贴到下方表单即可。
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h3 class="mb-3 text-sm font-semibold">人工录入豆包回答</h3>
          <div class="grid gap-3 md:grid-cols-2">
            <label class="block text-sm">
              <span class="text-slate-500">问题</span>
              <select
                v-model="formQuestionId"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option v-for="q in questions" :key="q.id" :value="q.id">
                  {{ q.id }} — {{ q.text }}
                </option>
              </select>
            </label>
            <label class="block text-sm">
              <span class="text-slate-500">轮次</span>
              <select
                v-model="formRound"
                class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="R1">R1 首轮</option>
                <option value="R2">R2 优化后验证</option>
              </select>
            </label>
          </div>
          <label class="mt-3 block text-sm">
            <span class="text-slate-500">豆包回答全文</span>
            <textarea
              v-model="formAnswer"
              rows="8"
              class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
              placeholder="粘贴豆包 App 完整回答…"
            />
          </label>
          <button
            type="button"
            class="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            @click="submitAnswer"
          >
            存档并进入测量
          </button>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5">
          <h3 class="mb-3 text-sm font-semibold">已存档（{{ state.records.length }}）</h3>
          <ul class="space-y-2 text-sm">
            <li
              v-for="r in state.records"
              :key="`${r.question_id}-${r.round}`"
              class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <span
                ><span class="font-mono text-xs">{{ r.question_id }}</span>
                {{ r.question_text }}</span
              >
              <span class="text-xs text-slate-400">{{ r.round }} · 豆包</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Measure -->
      <section v-else-if="activeStep === 'measure'" class="space-y-4">
        <h2 class="text-xl font-semibold">③ 测量 · SOA</h2>
        <div class="flex items-end gap-4">
          <div>
            <p class="text-xs text-slate-500">SOA 公式</p>
            <p class="text-sm text-slate-600">含品牌且进答案正文的采样数 / 总采样数</p>
          </div>
          <p class="text-3xl font-bold text-slate-900">
            {{ activeAnalysis.soa.toFixed(1) }}%
          </p>
        </div>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th class="px-4 py-2">ID</th>
                <th class="px-4 py-2">类型</th>
                <th class="px-4 py-2">进答案</th>
                <th class="px-4 py-2">位置</th>
                <th class="px-4 py-2">竞品</th>
                <th class="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="a in activeAnalysis.annotations"
                :key="a.question_id + a.round"
                class="border-t border-slate-100"
              >
                <td class="px-4 py-2 font-mono text-xs">{{ a.question_id }}</td>
                <td class="px-4 py-2">{{ a.question_type }}</td>
                <td class="px-4 py-2">
                  <span
                    :class="
                      a.in_answer_body === 'Y'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    "
                    >{{ a.in_answer_body }}</span
                  >
                </td>
                <td class="px-4 py-2">{{ a.mention_position }}</td>
                <td class="px-4 py-2 text-xs">{{ a.competitor_mentioned }}</td>
                <td class="px-4 py-2">
                  <button
                    type="button"
                    class="text-xs text-blue-600"
                    @click="detailAnswer = a.answer_full"
                  >
                    原文
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Diagnose -->
      <section v-else-if="activeStep === 'diagnose'" class="space-y-4">
        <h2 class="text-xl font-semibold">④ 诊断</h2>
        <p v-if="!activeAnalysis.diagnoses.length" class="text-sm text-slate-500">
          暂无诊断项（或全部达标）。
        </p>
        <article
          v-for="d in activeAnalysis.diagnoses"
          :key="d.question_id"
          class="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded px-2 py-0.5 text-xs font-medium"
              :class="priorityClass(d.priority)"
              >{{ d.priority }}</span
            >
            <span class="font-mono text-xs text-slate-500">{{ d.question_id }}</span>
            <span class="text-xs text-slate-400">{{ d.diagnosis_ids.join(", ") }}</span>
          </div>
          <p class="mt-2 text-sm font-medium text-slate-800">{{ d.question_text }}</p>
          <p class="mt-1 text-sm text-slate-600">{{ d.evidence }}</p>
        </article>
      </section>

      <!-- Optimize -->
      <section v-else-if="activeStep === 'optimize'" class="space-y-4">
        <h2 class="text-xl font-semibold">⑤ 优化行动</h2>
        <article
          v-for="act in activeAnalysis.actions"
          :key="act.action_id"
          class="rounded-xl border border-slate-200 bg-white p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p class="font-medium text-slate-800">{{ act.title }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ act.detail }}</p>
              <p class="mt-2 text-xs text-slate-400">
                关联：{{ act.linked_questions.join(", ") }}
              </p>
            </div>
            <div class="flex gap-1">
              <button
                v-for="st in ['待办', '进行中', '已完成'] as const"
                :key="st"
                type="button"
                class="rounded px-2 py-1 text-xs"
                :class="statusClass(act.status === st ? st : '')"
                @click="setActionStatus(act.action_id, st)"
              >
                {{ st }}
              </button>
            </div>
          </div>
        </article>
      </section>

      <!-- Verify -->
      <section v-else-if="activeStep === 'verify'" class="space-y-4">
        <h2 class="text-xl font-semibold">⑥ 验证 · R1 vs R2</h2>
        <p class="text-sm text-slate-500">
          完成优化后，在豆包再问同一问题，采集轮次选 R2，对比 SOA 是否上升。
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <p class="text-sm font-medium">R1 首轮</p>
            <p class="mt-2 text-3xl font-bold">{{ r1Analysis.soa.toFixed(1) }}%</p>
            <p class="text-xs text-slate-400">
              {{ r1Analysis.inBodyCount }}/{{ r1Analysis.total }} 进答案
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-5">
            <p class="text-sm font-medium">R2 验证轮</p>
            <p class="mt-2 text-3xl font-bold">
              {{ r2Analysis.total ? r2Analysis.soa.toFixed(1) + "%" : "—" }}
            </p>
            <p class="text-xs text-slate-400">
              {{
                r2Analysis.total
                  ? `${r2Analysis.inBodyCount}/${r2Analysis.total} 进答案`
                  : "尚未录入 R2 数据"
              }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Answer modal -->
    <div
      v-if="detailAnswer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="detailAnswer = null"
    >
      <div
        class="max-h-[80vh] max-w-2xl overflow-auto rounded-xl bg-white p-5 text-sm shadow-xl"
      >
        <pre class="whitespace-pre-wrap font-sans text-slate-700">{{ detailAnswer }}</pre>
        <button
          type="button"
          class="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs text-white"
          @click="detailAnswer = null"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>
