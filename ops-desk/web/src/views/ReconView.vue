<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api, type ReconIndexOut } from "../api/client";

const data = ref<ReconIndexOut | null>(null);
const error = ref("");

onMounted(async () => {
  try {
    data.value = await api.reconIndex();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
});
</script>

<template>
  <section class="panel">
    <h2 style="margin-top: 0">账单对账（索引）</h2>
    <p class="muted">第一期只列 `pricing/账单对账/` 下目录；核对报告与状态机下一期再接。</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else class="meta">{{ data?.recon_dir }}</p>
    <div class="card-grid" style="margin-top: 14px">
      <div v-for="item in data?.items || []" :key="item.path" class="card">
        <h3>{{ item.name }}</h3>
        <p class="meta">{{ item.path }}</p>
        <ul>
          <li v-for="c in item.children.slice(0, 12)" :key="c">{{ c }}</li>
          <li v-if="item.children.length > 12">…共 {{ item.children.length }} 项</li>
        </ul>
      </div>
    </div>
  </section>
</template>
