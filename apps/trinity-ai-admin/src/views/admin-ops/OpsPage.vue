<script setup lang="ts">
import { computed, useId } from "vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./ops.css";
import { OPS_CALL_TREND_7D, OPS_ERROR_DIST_24H, OPS_SUMMARY } from "./mock";

const lineGradId = `ops-ln-${useId().replace(/:/g, "")}`;
const lineFillId = `ops-ln-fill-${useId().replace(/:/g, "")}`;

const trendSvgPoints = computed(() => {
  const pts = OPS_CALL_TREND_7D.points;
  if (!pts.length) return "";
  const w = 280;
  const h = 88;
  const padX = 8;
  const padY = 10;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  return pts
    .map((p, i) => {
      const x = padX + innerW * (pts.length === 1 ? 0.5 : i / (pts.length - 1));
      const y = padY + innerH * (1 - (p - min) / span);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const trendFillPoints = computed(() => {
  const line = trendSvgPoints.value;
  if (!line) return "";
  const first = line.split(" ")[0] ?? "8,78";
  const last = line.split(" ").at(-1) ?? "272,78";
  const [lx] = last.split(",");
  return `${first} ${line} ${lx},78 8,78`;
});

const pieConic = computed(() => {
  let acc = 0;
  const parts = OPS_ERROR_DIST_24H.segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
});

const errRateTone = computed(() => {
  const n = Number.parseFloat(OPS_SUMMARY.errRate);
  if (Number.isNaN(n)) return "";
  if (n >= 1) return "is-bad";
  if (n >= 0.5) return "is-warn";
  return "";
});
</script>

<template>
  <div class="ops-page">
    <el-card shadow="never" class="admin-ep-card ops-page__panel" aria-label="实时大盘">
      <AdminSectionHead toolbar-only title="运行态势">
        <template #annot>
          <AdminInternalTip heading="实时大盘 · 原型" explain="运营大盘对内说明（原型）">
            <p>
              指标与图表为占位 mock；工程期接时序库、日志分析与可配置时间窗。面包屑「实时大盘」对应当前模块入口。
            </p>
          </AdminInternalTip>
        </template>
</AdminSectionHead>

      <div class="ops-page__kpis" aria-label="核心指标">
        <article class="ops-page__kpi">
          <div class="ops-page__kpi-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="ops-page__kpi-svg">
              <path
                d="M4 14.5 8 10l3 3 5-6 4 5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="ops-page__kpi-body">
            <div class="ops-page__kpi-label">QPS（{{ OPS_SUMMARY.windowLabel }}）</div>
            <p class="ops-page__kpi-value">{{ OPS_SUMMARY.qps }}</p>
            <p class="ops-page__kpi-meta">更新 {{ OPS_SUMMARY.updatedAt }}</p>
          </div>
        </article>
        <article class="ops-page__kpi" :class="errRateTone">
          <div class="ops-page__kpi-ico ops-page__kpi-ico--shield" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="ops-page__kpi-svg">
              <path
                d="M12 3 5 6v5c0 4 3.2 7.4 7 8 3.8-.6 7-4 7-8V6l-7-3Z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="ops-page__kpi-body">
            <div class="ops-page__kpi-label">错误率</div>
            <p class="ops-page__kpi-value">{{ OPS_SUMMARY.errRate }}</p>
            <p class="ops-page__kpi-meta">全平台聚合</p>
          </div>
        </article>
        <article class="ops-page__kpi">
          <div class="ops-page__kpi-ico ops-page__kpi-ico--clock" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="ops-page__kpi-svg">
              <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.75" />
              <path d="M12 8v4l2.5 2.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
            </svg>
          </div>
          <div class="ops-page__kpi-body">
            <div class="ops-page__kpi-label">P99 延迟</div>
            <p class="ops-page__kpi-value">{{ OPS_SUMMARY.p99 }}</p>
            <p class="ops-page__kpi-meta">网关出口测得</p>
          </div>
        </article>
      </div>

      <div class="ops-page__viz-grid" aria-label="趋势与错误分布">
        <article class="ops-page__viz-card">
          <h3 class="ops-page__viz-title">{{ OPS_CALL_TREND_7D.title }}</h3>
          <div class="ops-page__viz-canvas">
            <svg class="ops-page__line-svg" viewBox="0 0 280 88" role="img" aria-label="调用量折线图示意">
              <defs>
                <linearGradient :id="lineGradId" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="var(--blue)" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="var(--blue)" />
                </linearGradient>
                <linearGradient :id="lineFillId" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--blue)" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="var(--blue)" stop-opacity="0" />
                </linearGradient>
              </defs>
              <polygon v-if="trendFillPoints" :points="trendFillPoints" :fill="`url(#${lineFillId})`" />
              <polyline
                fill="none"
                :stroke="`url(#${lineGradId})`"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                :points="trendSvgPoints"
              />
            </svg>
          </div>
          <p class="ops-page__viz-foot">相对指数示意 · 工程期接时序库与可配置时间窗</p>
        </article>
        <article class="ops-page__viz-card">
          <h3 class="ops-page__viz-title">{{ OPS_ERROR_DIST_24H.title }}</h3>
          <div class="ops-page__pie-row">
            <div class="ops-page__pie" :style="{ background: pieConic }" role="img" aria-label="错误码分布饼图示意" />
            <ul class="ops-page__pie-legend">
              <li v-for="(s, i) in OPS_ERROR_DIST_24H.segments" :key="i" class="ops-page__pie-legend-item">
                <span class="ops-page__pie-dot" :style="{ background: s.color }" aria-hidden="true" />
                <span class="ops-page__pie-label">{{ s.label }}</span>
                <span class="ops-page__pie-pct">{{ s.pct }}%</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </el-card>
  </div>
</template>
