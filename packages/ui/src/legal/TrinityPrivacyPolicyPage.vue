<script setup lang="ts">
import { computed } from "vue";
import TrinityLegalBlocks from "./TrinityLegalBlocks.vue";
import TrinityLegalDocLayout from "./TrinityLegalDocLayout.vue";
import {
  privacyPolicyIntroEn,
  privacyPolicyMetaEn,
  privacyPolicySectionsEn,
} from "./content/privacy-policy.en";
import {
  privacyPolicyIntro,
  privacyPolicyMeta,
  privacyPolicySections,
} from "./content/privacy-policy.zh";
import { useLegalLocale } from "./legalLocale";

const locale = useLegalLocale();

const pageTitle = computed(() => (locale.value === "en" ? privacyPolicyMetaEn.title : "隐私政策"));
const updated = computed(() =>
  locale.value === "en" ? privacyPolicyMetaEn.updated : privacyPolicyMeta.updated
);
const intro = computed(() => (locale.value === "en" ? privacyPolicyIntroEn : privacyPolicyIntro));
const sections = computed(() =>
  locale.value === "en" ? privacyPolicySectionsEn : privacyPolicySections
);
</script>

<template>
  <TrinityLegalDocLayout :title="pageTitle" :updated="updated">
    <TrinityLegalBlocks :blocks="intro" />
    <section v-for="(section, i) in sections" :key="i" class="trinity-legal-section">
      <h2 class="trinity-legal-h2">{{ section.title }}</h2>
      <TrinityLegalBlocks :blocks="section.blocks" />
    </section>
  </TrinityLegalDocLayout>
</template>
