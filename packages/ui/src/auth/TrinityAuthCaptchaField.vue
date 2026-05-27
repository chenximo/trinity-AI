<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import {
  captchaMatches,
  drawDemoCaptcha,
  generateDemoCaptchaCode,
  readDemoCaptchaColors,
} from "./demoCaptcha";

const props = withDefaults(
  defineProps<{
    idPrefix?: string;
    label?: string;
    refreshLabel?: string;
    placeholder?: string;
    canvasLabel?: string;
  }>(),
  {
    idPrefix: "or-auth",
    label: "验证码",
    refreshLabel: "换一张",
    placeholder: "图中数字",
    canvasLabel: "图形验证码，点击可刷新",
  }
);

const code = ref("");
const userInput = ref("");
const canvasRef = ref<HTMLCanvasElement | null>(null);

const inputId = computed(() => `${props.idPrefix}-captcha-input`);
const refreshId = computed(() => `${props.idPrefix}-captcha-refresh`);

function paint() {
  const canvas = canvasRef.value;
  if (!canvas || !code.value) return;
  drawDemoCaptcha(canvas, code.value, readDemoCaptchaColors());
}

function refresh() {
  code.value = generateDemoCaptchaCode();
  userInput.value = "";
  nextTick(paint);
}

function validate(): boolean {
  const ok = captchaMatches(userInput.value, code.value);
  if (!ok) refresh();
  return ok;
}

function focusInput() {
  document.getElementById(inputId.value)?.focus();
}

onMounted(refresh);

defineExpose({ refresh, validate, focusInput });
</script>

<template>
  <div class="form-group or-auth-captcha-group">
    <div class="or-auth-label-row">
      <label class="or-auth-captcha-label" :for="inputId">{{ label }}</label>
      <button
        :id="refreshId"
        type="button"
        class="or-auth-captcha-refresh"
        @click="refresh"
      >
        {{ refreshLabel }}
      </button>
    </div>
    <div class="or-auth-captcha-row">
      <canvas
        ref="canvasRef"
        class="or-auth-captcha-img"
        width="140"
        height="44"
        role="img"
        :aria-label="canvasLabel"
        tabindex="0"
        @click="refresh"
        @keydown.enter.prevent="refresh"
        @keydown.space.prevent="refresh"
      />
      <input
        :id="inputId"
        v-model="userInput"
        class="or-auth-captcha-input"
        type="text"
        inputmode="numeric"
        maxlength="8"
        autocomplete="off"
        :placeholder="placeholder"
        required
      />
    </div>
  </div>
</template>
