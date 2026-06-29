<script setup lang="ts">
import type { WeekProgressMonth } from "../shared/weekProgressSchema";
import { focusHrefForItem } from "../shared/weekProgressFocusLeaves";
import {
  focusItems,
  formatPeriodLabel,
  isHttpLink,
  isPlanTaskLine,
  monthHeading,
  planDisplayLines,
  planLineSegments,
} from "../shared/weekProgressDisplay";

defineProps<{
  month: WeekProgressMonth;
  fileRel: string;
  expanded: boolean;
  showEdit: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  edit: [];
}>();
</script>

<template>
  <section
    class="pw-month-item"
    :class="{
      'pw-month-item--open': expanded,
      'pw-month-item--archived': month.archived,
    }"
  >
    <div class="pw-month-head">
      <button
        type="button"
        class="pw-month-summary"
        :aria-expanded="expanded"
        @click="emit('toggle')"
      >
        <span class="pw-month-chevron" aria-hidden="true" />
        <span class="pw-month-summary-title">{{ monthHeading(month) }}</span>
        <span v-if="month.archived" class="pw-month-summary-badge">归档</span>
      </button>
      <button
        v-if="showEdit"
        type="button"
        class="pw-month-edit-btn"
        :title="`编辑 ${fileRel}`"
        @click="emit('edit')"
      >
        编辑周进度
      </button>
    </div>
    <div v-show="expanded" class="pw-month-panel">
      <div class="pw-table-wrap product-roadmap" role="region" :aria-label="`${monthHeading(month)} 周进度表`">
        <table>
          <thead>
            <tr>
              <th class="pw-col-week">周</th>
              <th class="pw-col-focus">重点模块</th>
              <th class="pw-col-owner">负责人</th>
              <th class="pw-col-plan">计划</th>
              <th class="pw-col-result">结果</th>
              <th class="pw-col-link">测试链接</th>
              <th class="pw-col-blockers">备注</th>
              <th class="pw-col-report">周汇报记录</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(w, wIdx) in month.weeks" :key="w.id + wIdx">
              <td class="pw-col-week">
                <div class="pw-week-cell">
                  <strong class="pw-week-id">{{ w.id }}</strong>
                  <span v-if="formatPeriodLabel(w.period)" class="pw-week-period">{{ formatPeriodLabel(w.period) }}</span>
                </div>
              </td>
              <td class="pw-col-focus">
                <template v-if="focusItems(w.focus).length">
                  <span v-for="(item, itemIdx) in focusItems(w.focus)" :key="item + itemIdx" class="pw-focus-item">
                    <a
                      v-if="focusHrefForItem(item)"
                      :href="focusHrefForItem(item) || '#'"
                      class="pw-focus-link"
                    >{{ item }}</a>
                    <span v-else class="pw-focus-unknown" :title="'非标准叶子名，请从编辑里重选'">{{ item }}</span>
                  </span>
                </template>
                <span v-else>—</span>
              </td>
              <td class="pw-col-owner">
                <template v-if="!w.owner?.trim() || w.owner === '—'">—</template>
                <span v-else class="pw-owner-body">
                  <template v-for="(seg, si) in planLineSegments(w.owner)" :key="si">
                    <span v-if="seg.kind === 'at'" class="pw-plan-at">{{ seg.value }}</span>
                    <span v-else>{{ seg.value }}</span>
                  </template>
                </span>
              </td>
              <td class="pw-col-plan">
                <template v-if="!w.plan?.trim()">—</template>
                <div v-else class="pw-plan-body">
                  <div
                    v-for="(line, li) in planDisplayLines(w.plan)"
                    :key="li"
                    class="pw-plan-line"
                    :class="{ 'pw-plan-line--task': isPlanTaskLine(line) }"
                  >
                    <template v-for="(seg, si) in planLineSegments(line)" :key="si">
                      <span v-if="seg.kind === 'at'" class="pw-plan-at">{{ seg.value }}</span>
                      <span v-else>{{ seg.value }}</span>
                    </template>
                  </div>
                </div>
              </td>
              <td class="pw-col-result">{{ w.result || "⬜" }}</td>
              <td class="pw-col-link">
                <a v-if="isHttpLink(w.testLink)" :href="w.testLink" target="_blank" rel="noreferrer">打开</a>
                <span v-else>{{ w.testLink || "—" }}</span>
              </td>
              <td class="pw-col-blockers">
                <template v-if="!w.blockers?.trim() || w.blockers === '—'">—</template>
                <div v-else class="pw-plan-body">
                  <div
                    v-for="(line, li) in planDisplayLines(w.blockers)"
                    :key="li"
                    class="pw-plan-line"
                    :class="{ 'pw-plan-line--task': isPlanTaskLine(line) }"
                  >
                    <template v-for="(seg, si) in planLineSegments(line)" :key="si">
                      <span v-if="seg.kind === 'at'" class="pw-plan-at">{{ seg.value }}</span>
                      <span v-else>{{ seg.value }}</span>
                    </template>
                  </div>
                </div>
              </td>
              <td class="pw-col-report">
                <template v-if="!w.weeklyReport?.trim() || w.weeklyReport === '—'">—</template>
                <a
                  v-else-if="isHttpLink(w.weeklyReport)"
                  :href="w.weeklyReport.trim()"
                  target="_blank"
                  rel="noreferrer"
                >打开</a>
                <div v-else class="pw-plan-body">
                  <div
                    v-for="(line, li) in planDisplayLines(w.weeklyReport)"
                    :key="li"
                    class="pw-plan-line"
                    :class="{ 'pw-plan-line--task': isPlanTaskLine(line) }"
                  >
                    <template v-for="(seg, si) in planLineSegments(line)" :key="si">
                      <span v-if="seg.kind === 'at'" class="pw-plan-at">{{ seg.value }}</span>
                      <span v-else>{{ seg.value }}</span>
                    </template>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="!month.weeks.length">
              <td colspan="8" class="product-roadmap-muted">暂无周记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
