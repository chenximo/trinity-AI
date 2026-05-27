<script setup lang="ts">
import { useRouter } from "vue-router";

const props = withDefaults(
  defineProps<{
    title: string;
    updated?: string;
    backLabel?: string;
  }>(),
  {
    updated: "",
    backLabel: "返回",
  }
);

const router = useRouter();

function onBack() {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
    return;
  }
  router.push({ path: "/" });
}
</script>

<template>
  <article class="trinity-legal-doc">
    <header class="trinity-legal-doc__head">
      <button type="button" class="trinity-legal-doc__back" @click="onBack">{{ backLabel }}</button>
      <h1 class="trinity-legal-doc__title">{{ title }}</h1>
      <p v-if="updated" class="trinity-legal-doc__updated">最后更新：{{ updated }}</p>
    </header>
    <div class="trinity-legal-doc__body">
      <slot />
    </div>
  </article>
</template>
