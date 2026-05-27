<script setup lang="ts">
import TrinityLegalBlocks from "./TrinityLegalBlocks.vue";
import TrinityLegalDocLayout from "./TrinityLegalDocLayout.vue";
import { termsStubBlocks } from "./content/terms-stub.zh";
</script>

<template>
  <TrinityLegalDocLayout title="服务条款" updated="草案 · 待运营确认">
    <TrinityLegalBlocks :blocks="termsStubBlocks" />
  </TrinityLegalDocLayout>
</template>
