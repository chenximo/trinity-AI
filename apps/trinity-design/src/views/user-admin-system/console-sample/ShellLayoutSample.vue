<script setup lang="ts">
import SpecSampleFrame from "./SpecSampleFrame.vue";
</script>

<template>
  <SpecSampleFrame
    id="spec-sample-shell"
    caption="样例 · 控制台壳层（不含产品顶栏；顶栏见 TrinityAiShellLayout）"
  >
    <div class="or-shell user-console-spec-sample__shell">
      <aside class="or-side" aria-label="侧栏导航样例">
        <div class="or-side-heading">工作区</div>
        <a href="#" class="or-dash-nav is-active" @click.prevent>API 密钥</a>
        <a href="#" class="or-dash-nav" @click.prevent>角色管理</a>
        <div class="or-side-heading" style="margin-top: 0.65rem">账户</div>
        <a href="#" class="or-dash-nav" @click.prevent>额度</a>
      </aside>
      <div class="or-main">
        <p class="user-console-spec-sample__placeholder">
          主列内容见下方 §2 样例（面包屑 → 页头 → 搜索 → 表格）
        </p>
      </div>
    </div>
  </SpecSampleFrame>
</template>
