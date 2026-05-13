<script setup lang="ts">
/**
 * 对内说明（原型标注）：ⓘ 触发 + fixed 气泡，除小图标外不挤占主排版；随构建剥离时可整段移除（`data-trinity-internal-annotation`）。
 * 视觉与交互对齐 `TrinityAI/app/chat/index.html` + `chat-openrouter.css` 的 `.orc-help-tip-*`。
 */
import { nextTick, onMounted, onUnmounted, ref, useId, watch } from "vue";

withDefaults(
  defineProps<{
    /** 气泡标题（加粗首行） */
    title?: string;
    /** 触发器 `aria-label` */
    ariaLabel?: string;
    /**
     * `inline`：参与行内/ flex，仅占约 24×24。
     * `float` / `dock`：`position:absolute`，不占文档流（父级需 `position:relative` 等定位上下文）。
     */
    layout?: "inline" | "float" | "dock";
  }>(),
  { title: "说明", ariaLabel: "对内说明", layout: "inline" }
);

const open = ref(false);
const anchorRef = ref<HTMLElement | null>(null);
const popRef = ref<HTMLElement | null>(null);
const titleId = useId();
const popId = useId();

function position() {
  const btn = anchorRef.value;
  const pop = popRef.value;
  if (!btn || !pop || !open.value) return;
  const r = btn.getBoundingClientRect();
  const w = Math.min(360, window.innerWidth - 16);
  pop.style.width = `${w}px`;
  const ph = pop.offsetHeight || 160;
  const spaceBelow = window.innerHeight - r.bottom - 12;
  const placeBelow = spaceBelow >= ph + 8 || spaceBelow >= r.top - 12;
  let top = placeBelow ? r.bottom + 8 : r.top - ph - 8;
  if (top < 8) top = 8;
  if (top + ph > window.innerHeight - 8) top = Math.max(8, window.innerHeight - ph - 8);
  const left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

function toggle() {
  open.value = !open.value;
}

watch(open, async (v) => {
  if (v) {
    await nextTick();
    requestAnimationFrame(() => {
      position();
      requestAnimationFrame(position);
    });
  }
});

function onDocMouseDown(e: MouseEvent) {
  if (!open.value) return;
  const t = e.target as Node;
  if (anchorRef.value?.contains(t)) return;
  if (popRef.value?.contains(t)) return;
  open.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value) open.value = false;
}

function onResize() {
  if (open.value) position();
}

onMounted(() => {
  document.addEventListener("mousedown", onDocMouseDown);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("resize", onResize, { passive: true });
});
onUnmounted(() => {
  document.removeEventListener("mousedown", onDocMouseDown);
  document.removeEventListener("keydown", onKeydown);
  window.removeEventListener("resize", onResize);
});
</script>

<template>
  <span
    class="t-internal-help-tip"
    :class="{
      't-internal-help-tip--inline': layout === 'inline',
      't-internal-help-tip--float': layout === 'float',
      't-internal-help-tip--dock': layout === 'dock',
    }"
    data-trinity-internal-annotation
  >
    <button
      ref="anchorRef"
      type="button"
      class="t-internal-help-tip-btn"
      :class="{
        't-internal-help-tip-btn--inline': layout === 'inline',
        't-internal-help-tip-btn--float': layout === 'float',
        't-internal-help-tip-btn--dock': layout === 'dock',
      }"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      :aria-controls="popId"
      title="说明"
      @click.stop="toggle"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 16v-4M12 8h.01"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <Teleport to="body">
      <div
        v-show="open"
        :id="popId"
        ref="popRef"
        class="t-internal-help-tip-popover"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <p :id="titleId" class="t-internal-help-tip-title">{{ title }}</p>
        <div class="t-internal-help-tip-body">
          <slot />
        </div>
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
.t-internal-help-tip {
  flex-shrink: 0;
  line-height: 0;
}

.t-internal-help-tip--inline {
  display: inline-flex;
  vertical-align: middle;
}

.t-internal-help-tip--float,
.t-internal-help-tip--dock {
  position: absolute;
  z-index: 6;
}

.t-internal-help-tip--float {
  top: 0.35rem;
  right: 0.35rem;
}

.t-internal-help-tip--dock {
  right: 0.85rem;
  bottom: 0.65rem;
}

.t-internal-help-tip-btn {
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted-2);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

.t-internal-help-tip-btn:hover {
  color: var(--blue);
  border-color: rgba(37, 99, 235, 0.28);
  background: var(--blue-soft);
}

.t-internal-help-tip-btn:focus-visible {
  outline: 2px solid var(--blue-ring, rgba(37, 99, 235, 0.45));
  outline-offset: 2px;
}

.t-internal-help-tip-btn--inline {
  width: 24px;
  height: 24px;
}

.t-internal-help-tip-btn--float {
  width: 26px;
  height: 26px;
}

.t-internal-help-tip-btn--dock {
  width: 28px;
  height: 28px;
}

.t-internal-help-tip-popover {
  position: fixed;
  z-index: 430;
  width: min(360px, calc(100vw - 16px));
  max-height: min(52vh, 280px);
  overflow: auto;
  padding: 0.65rem 0.75rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius, 8px);
  background: var(--surface);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.16);
  -webkit-overflow-scrolling: touch;
}

.t-internal-help-tip-title {
  margin: 0 0 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.02em;
}

.t-internal-help-tip-body {
  font-size: 0.6875rem;
  line-height: 1.55;
  color: var(--muted-2);
}

.t-internal-help-tip-body :deep(p) {
  margin: 0 0 0.45rem;
}

.t-internal-help-tip-body :deep(p:last-child) {
  margin-bottom: 0;
}

.t-internal-help-tip-body :deep(strong) {
  color: var(--muted);
  font-weight: 600;
}

.t-internal-help-tip-body :deep(code) {
  font-size: 0.65rem;
  padding: 0.05rem 0.25rem;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.06);
}
</style>
