<script setup lang="ts">
import { ref } from "vue";
import { SearchForm1Fixed, TabSwitch1Underline, TButton, type TabSwitchItem } from "@trinity/ui";

const q = ref("");
const tabs: TabSwitchItem[] = [
  { id: "a", label: "Tab A" },
  { id: "b", label: "Tab B" },
];
const tab = ref("a");
</script>

<template>
  <div class="ui-demo-page">
    <h1 class="ui-demo-title">@trinity/ui 独立入口</h1>
    <p class="ui-demo-lead">
      仅引入 <code>@trinity/tokens/core.css</code> 与 <code>@trinity/ui/styles/ui-base.css</code>（后者链到 <code>ui-kit.css</code>），<strong>未</strong>引入
      <code>assets/trinity-base.css</code>。下方组件为 scoped 或依赖上述全局类 / CSS 变量。
    </p>
    <section class="ui-demo-block">
      <h2 class="ui-demo-h2">TabSwitch1Underline</h2>
      <TabSwitch1Underline v-model="tab" :tabs="tabs" tablist-label="演示" />
    </section>
    <section class="ui-demo-block">
      <h2 class="ui-demo-h2">SearchForm1Fixed</h2>
      <SearchForm1Fixed v-model="q" input-id="ui-demo-q" placeholder="搜索…" />
    </section>
    <section class="ui-demo-block">
      <h2 class="ui-demo-h2">TButton</h2>
      <TButton variant="gradient">主按钮</TButton>
    </section>
  </div>
</template>

<style scoped>
.ui-demo-page {
  padding: 1.5rem;
  max-width: 36rem;
  font-family: var(--font, system-ui, sans-serif);
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
}
.ui-demo-title {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
  font-weight: 700;
}
.ui-demo-lead {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.55;
}
.ui-demo-block {
  margin-bottom: 1.25rem;
}
.ui-demo-h2 {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
  margin: 0 0 0.5rem;
}
code {
  font-size: 0.8125rem;
}
</style>
