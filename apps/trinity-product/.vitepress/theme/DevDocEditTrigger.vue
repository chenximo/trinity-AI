<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vitepress";
import { useDevDocEditor } from "./useDevDocEditor";

const EDIT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;

const route = useRoute();
const { canEdit, open, openEditor } = useDevDocEditor();

let attachTimer: ReturnType<typeof setTimeout> | null = null;
let attaching = false;

function findDocH1(): HTMLElement | null {
  const root = document.querySelector<HTMLElement>(".VPDoc .content-container .vp-doc");
  if (!root) return null;
  return root.querySelector("h1");
}

function cleanupTitleRow() {
  document.querySelectorAll(".tdocs-doc-title-row").forEach((row) => {
    const h1 = row.querySelector("h1");
    if (h1?.parentNode === row) {
      row.parentNode?.insertBefore(h1, row);
      row.remove();
    }
  });
}

function attachEditIcon() {
  if (attaching || typeof document === "undefined") return;
  attaching = true;
  try {
    cleanupTitleRow();
    if (!canEdit.value || open.value) return;

    const h1 = findDocH1();
    if (!h1 || h1.closest(".tdocs-doc-title-row")) return;
    if (h1.parentElement?.querySelector(".tdocs-dev-edit-icon")) return;

    const row = document.createElement("div");
    row.className = "tdocs-doc-title-row";
    h1.parentNode?.insertBefore(row, h1);
    row.appendChild(h1);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tdocs-dev-edit-icon";
    btn.title = "编辑本页 Markdown（dev · 写入 apps/trinity-product/docs）";
    btn.setAttribute("aria-label", "编辑本页");
    btn.innerHTML = EDIT_ICON_SVG;
    btn.addEventListener("click", () => {
      void openEditor();
    });
    row.appendChild(btn);
  } finally {
    attaching = false;
  }
}

function scheduleAttach() {
  if (typeof window === "undefined") return;
  attachEditIcon();
  requestAnimationFrame(attachEditIcon);
  if (attachTimer) clearTimeout(attachTimer);
  attachTimer = window.setTimeout(attachEditIcon, 100);
  window.setTimeout(attachEditIcon, 350);
}

watch(() => route.path, () => scheduleAttach());
watch(open, () => scheduleAttach());

onMounted(() => {
  scheduleAttach();
});

onUnmounted(() => {
  if (attachTimer) clearTimeout(attachTimer);
  cleanupTitleRow();
});
</script>

<template />
