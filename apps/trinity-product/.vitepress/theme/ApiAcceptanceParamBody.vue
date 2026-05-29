<script setup lang="ts">
import { computed } from "vue";
import {
  formatParamHint,
  formatParamValue,
  orderedBodyKeys,
} from "../../acceptance/config/chatParamHints";

const props = defineProps<{
  body: Record<string, unknown>;
  caseHints?: Record<string, string>;
  caseNote?: string;
}>();

const rows = computed(() =>
  orderedBodyKeys(props.body).map((key) => ({
    key,
    value: formatParamValue(props.body[key]),
    hint: formatParamHint(key, props.caseHints?.[key]),
  })),
);
</script>

<template>
  <div class="api-acc-param-body">
    <p v-if="caseNote" class="api-acc-drawer-hint api-acc-case-note">{{ caseNote }}</p>

    <h6 class="api-acc-drawer-sub api-acc-drawer-sub--tight">参数说明</h6>
    <p class="api-acc-drawer-hint">悬停参数名查看说明；「含义」列可直接阅读。</p>
    <div class="api-acc-param-table-wrap">
      <table class="api-acc-param-table">
        <thead>
          <tr>
            <th scope="col">参数</th>
            <th scope="col">值</th>
            <th scope="col">含义</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td>
              <span class="api-acc-param-key-wrap">
                <code class="api-acc-param-key">{{ row.key }}</code>
                <span v-if="row.hint" class="api-acc-param-tip" role="tooltip">{{ row.hint }}</span>
              </span>
            </td>
            <td class="api-acc-param-value">{{ row.value }}</td>
            <td class="api-acc-param-meaning">{{ row.hint || "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
