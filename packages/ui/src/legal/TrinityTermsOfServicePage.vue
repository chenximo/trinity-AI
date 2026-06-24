<script setup lang="ts">
import { computed } from "vue";
import TrinityLegalBlocks from "./TrinityLegalBlocks.vue";
import TrinityLegalDocLayout from "./TrinityLegalDocLayout.vue";
import {
  termsOfServiceBlocksEn,
  termsOfServiceMetaEn,
} from "./content/terms-of-service.en";
import {
  termsOfServiceBlocks,
  termsOfServiceMeta,
} from "./content/terms-of-service.zh";
import { useLegalLocale } from "./legalLocale";

const locale = useLegalLocale();

const pageTitle = computed(() =>
  locale.value === "en" ? termsOfServiceMetaEn.title : "服务条款"
);
const updated = computed(() =>
  locale.value === "en" ? termsOfServiceMetaEn.updated : termsOfServiceMeta.updated
);
const blocks = computed(() =>
  locale.value === "en" ? termsOfServiceBlocksEn : termsOfServiceBlocks
);
</script>

<template>
  <TrinityLegalDocLayout :title="pageTitle" :updated="updated">
    <TrinityLegalBlocks :blocks="blocks" />
  </TrinityLegalDocLayout>
</template>
