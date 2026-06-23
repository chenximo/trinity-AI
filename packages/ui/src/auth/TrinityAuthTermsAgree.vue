<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { TRINITY_LEGAL_ROUTE_NAMES } from "../legal/types";

const agreed = defineModel<boolean>("agreed", { default: false });

const props = withDefaults(
  defineProps<{
    agreeId?: string;
    /** 协议链接是否新标签打开 */
    legalOpenInNewTab?: boolean;
  }>(),
  { agreeId: "or-auth-agree", legalOpenInNewTab: false }
);

const emit = defineEmits<{
  beforeLegalNavigate: [];
}>();

const router = useRouter();

const legalTarget = computed(() => (props.legalOpenInNewTab ? "_blank" : undefined));
const legalRel = computed(() => (props.legalOpenInNewTab ? "noopener noreferrer" : undefined));

const termsHref = computed(() => router.resolve({ name: TRINITY_LEGAL_ROUTE_NAMES.terms }).href);
const privacyHref = computed(() => router.resolve({ name: TRINITY_LEGAL_ROUTE_NAMES.privacy }).href);

function openLegal(routeName: string, href: string, e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (props.legalOpenInNewTab) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  emit("beforeLegalNavigate");
  void router.push({ name: routeName });
}
</script>

<template>
  <div class="or-auth-terms-row">
    <label class="or-auth-terms">
      <input :id="agreeId" v-model="agreed" class="or-auth-terms-check" type="checkbox" required />
      <span class="or-auth-terms-text">
        我已阅读并同意
        <a
          :href="termsHref"
          class="or-auth-terms-link text-link"
          :target="legalTarget"
          :rel="legalRel"
          @click="openLegal(TRINITY_LEGAL_ROUTE_NAMES.terms, termsHref, $event)"
        >《服务条款》</a>、
        <a
          :href="privacyHref"
          class="or-auth-terms-link text-link"
          :target="legalTarget"
          :rel="legalRel"
          @click="openLegal(TRINITY_LEGAL_ROUTE_NAMES.privacy, privacyHref, $event)"
        >《隐私政策》</a>
      </span>
    </label>
  </div>
</template>
