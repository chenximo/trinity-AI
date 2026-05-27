<script setup lang="ts">
import TrinityLegalBlocks from "./TrinityLegalBlocks.vue";
import TrinityLegalDocLayout from "./TrinityLegalDocLayout.vue";
import { modelTermsStubBlocks } from "./content/model-terms-stub.zh";
</script>

<template>
  <TrinityLegalDocLayout title="模型使用条款" updated="草案 · 待运营确认">
    <TrinityLegalBlocks :blocks="modelTermsStubBlocks" />
  </TrinityLegalDocLayout>
</template>
