<script setup lang="ts">
import TrinityLegalBlocks from "./TrinityLegalBlocks.vue";
import TrinityLegalDocLayout from "./TrinityLegalDocLayout.vue";
import TrinityLegalTbdBlock from "./TrinityLegalTbdBlock.vue";
import {
  privacyPolicyIntro,
  privacyPolicyMetaTbd,
  privacyPolicySections,
} from "./content/privacy-policy.zh";
</script>

<template>
  <TrinityLegalDocLayout title="隐私政策" updated="草案 · 待运营确认">
    <TrinityLegalTbdBlock :title="privacyPolicyMetaTbd.title" :table="privacyPolicyMetaTbd.table" />
    <TrinityLegalBlocks :blocks="privacyPolicyIntro" />
    <section v-for="(section, i) in privacyPolicySections" :key="i" class="trinity-legal-section">
      <h2 class="trinity-legal-h2">{{ section.title }}</h2>
      <TrinityLegalBlocks :blocks="section.blocks" />
    </section>
    <p class="trinity-legal-footnote">
      本文档为协同草案；对外发布前须经法务审核并替换全部「待运营确认」内容。
    </p>
  </TrinityLegalDocLayout>
</template>
