<script setup lang="ts">
import TrinityLegalBlocks from "./TrinityLegalBlocks.vue";
import TrinityLegalDocLayout from "./TrinityLegalDocLayout.vue";
import { termsOfServiceBlocks, termsOfServiceMeta } from "./content/terms-of-service.zh";
</script>

<template>
  <TrinityLegalDocLayout title="服务条款" :updated="termsOfServiceMeta.updated">
    <TrinityLegalBlocks :blocks="termsOfServiceBlocks" />
  </TrinityLegalDocLayout>
</template>
