<script setup lang="ts">
import { computed, useId } from "vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./ops.css";
import {
  OPS_CALL_TREND_7D,
  OPS_ERROR_DIST_24H,
  OPS_SERIES_POINTS,
  OPS_SUMMARY,
} from "./mock";

const sparkMax = Math.max(...OPS_SERIES_POINTS.map((p) => p.qps), 1);

const lineGradId = `ops-ln-${useId().replace(/:/g, "")}`;

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

const pieConic = computed(() => {
  let acc = 0;
  const parts = OPS_ERROR_DIST_24H.segments.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
});

function sparkHeight(qps: number): string {
  const h = Math.round((qps / sparkMax) * 100);
  return `${Math.max(8, h)}%`;
}
</script>

<template>
  <div class="ops-page">
    <!-- 实时大盘 -->
    <section class="ops-page__panel" aria-label="实时大盘">
      <AdminSectionHead title="实时大盘">
        <template #annot>
          <AdminInternalTip heading="实时大盘 · 原型" explain="运营大盘对内说明（原型）">
            <p>
              指标与柱状为占位；<strong>调用量趋势（7 日）</strong>与<strong>近 24h 错误码分布</strong>为静态画板，工程期接时序库与日志分析。
            </p>
          </AdminInternalTip>
        </template>
        <template #desc>SLA 与止损视角的运行态可视化（<strong>§4.2</strong>，mock）。</template>
      </AdminSectionHead>
      <div class="ops-page__grid2">
        <div class="ops-page__stat">
          <div class="ops-page__stat-label">QPS（{{ OPS_SUMMARY.windowLabel }}）</div>
          <div class="ops-page__stat-value">{{ OPS_SUMMARY.qps }}</div>
          <div class="ops-page__stat-meta">更新 {{ OPS_SUMMARY.updatedAt }}</div>
        </div>
        <div class="ops-page__stat">
          <div class="ops-page__stat-label">错误率</div>
          <div class="ops-page__stat-value">{{ OPS_SUMMARY.errRate }}</div>
          <div class="ops-page__stat-meta">全平台聚合</div>
        </div>
        <div class="ops-page__stat">
          <div class="ops-page__stat-label">P99 延迟</div>
          <div class="ops-page__stat-value">{{ OPS_SUMMARY.p99 }}</div>
          <div class="ops-page__stat-meta">网关出口测得</div>
        </div>
      </div>
      <h3 class="ops-page__h3">QPS 示意（非真实图表）</h3>
      <div class="ops-page__spark" role="img" aria-label="QPS 柱状示意">
        <div
          v-for="(p, i) in OPS_SERIES_POINTS"
          :key="i"
          class="ops-page__spark-bar"
          :style="{ height: sparkHeight(p.qps) }"
          :title="`${p.t} ${p.qps}`"
        />
      </div>

      <div class="ops-page__charts" aria-label="趋势与错误分布">
        <div class="ops-page__chart-block">
          <h3 class="ops-page__h3 ops-page__h3--tight">{{ OPS_CALL_TREND_7D.title }}</h3>
          <svg class="ops-page__line-svg" viewBox="0 0 280 88" role="img" aria-label="调用量折线图示意">
            <defs>
              <linearGradient :id="lineGradId" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="var(--blue)" stop-opacity="0.35" />
                <stop offset="100%" stop-color="var(--blue)" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              :stroke="`url(#${lineGradId})`"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="trendSvgPoints"
            />
          </svg>
          <p class="ops-page__chart-foot">数据为 mock，工程期接时序库与可配置时间窗。</p>
        </div>
        <div class="ops-page__chart-block">
          <h3 class="ops-page__h3 ops-page__h3--tight">{{ OPS_ERROR_DIST_24H.title }}</h3>
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
        </div>
      </div>
    </section>
  </div>
</template>
