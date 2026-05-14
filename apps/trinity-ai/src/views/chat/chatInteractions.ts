/**
 * Chat 模块 · 原型级点击与键盘行为（对齐旧 `chat-openrouter.js` 子集）。
 * 路径：`src/views/chat/chatInteractions.ts`（见 `README.md`）。仅演示，正式开发可替换或删除。
 */

import type { Router } from "vue-router";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ACCOUNT_CONSOLE_HASH } from "../account/mock";
import { paintMockPickerList, paintMockRolePickerList } from "./mock";

const PRESET = "__TAI_CONSOLE_PRESET__";
const CREATE_PRESET = "__TAI_CONSOLE_CREATE_PRESET__";

/** 将静态 HTML 占位 href 换成当前 history base 下的路由地址 */
export function patchTaiChatAnchors(root: ParentNode, router: Router) {
  root.querySelectorAll<HTMLAnchorElement>(`a[href="${PRESET}"]`).forEach((a) => {
    a.setAttribute(
      "href",
      router.resolve({ name: "tai-account-console", hash: ACCOUNT_CONSOLE_HASH.PRESET }).href
    );
  });
  root.querySelectorAll<HTMLAnchorElement>(`a[href="${CREATE_PRESET}"]`).forEach((a) => {
    a.setAttribute(
      "href",
      router.resolve({
        name: "tai-account-console",
        query: { create: "1" },
        hash: ACCOUNT_CONSOLE_HASH.PRESET,
      }).href
    );
  });
}


/** 与静态 `chat-openrouter.js` 中说明气泡行为对齐的轻量版（无 legacy 脚本时使用） */
export function bindOrcHelpTipsLite(): () => void {
  let orcHelpTipAnchor: HTMLElement | null = null;

  function $(sel: string) {
    return document.querySelector(sel) as HTMLElement | null;
  }

  function closeOrcHelpTip() {
    const pop = $("#orc-help-tip-popover");
    if (pop) pop.hidden = true;
    document.querySelectorAll(".orc-help-tip-btn[aria-expanded='true']").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
    });
    orcHelpTipAnchor = null;
  }

  function positionOrcHelpTip() {
    const btn = orcHelpTipAnchor;
    const pop = $("#orc-help-tip-popover");
    if (!btn || !pop || pop.hidden) return;
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

  function openOrcHelpTip(btn: HTMLElement) {
    const tplId = btn.getAttribute("data-orc-help-tpl");
    const tpl = tplId ? document.getElementById(tplId) : null;
    const pop = $("#orc-help-tip-popover");
    const titleEl = $("#orc-help-tip-title");
    const bodyEl = $("#orc-help-tip-body");
    if (!tpl || !pop || !titleEl || !bodyEl || !(tpl instanceof HTMLTemplateElement)) return;
    closeOrcHelpTip();
    const title = btn.getAttribute("data-orc-help-title") || "说明";
    titleEl.textContent = title;
    bodyEl.innerHTML = "";
    bodyEl.appendChild(tpl.content.cloneNode(true));
    orcHelpTipAnchor = btn;
    pop.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      positionOrcHelpTip();
      window.requestAnimationFrame(positionOrcHelpTip);
    });
  }

  function onDocClick(e: MouseEvent) {
    const btn = (e.target as HTMLElement | null)?.closest?.(".orc-help-tip-btn[data-orc-help-tpl]");
    if (!btn || !(btn instanceof HTMLElement)) return;
    e.stopPropagation();
    const pop = $("#orc-help-tip-popover");
    if (!pop) return;
    if (!pop.hidden && orcHelpTipAnchor === btn) {
      closeOrcHelpTip();
      return;
    }
    openOrcHelpTip(btn);
  }

  function onResize() {
    const pop = $("#orc-help-tip-popover");
    if (pop && !pop.hidden) positionOrcHelpTip();
  }

  function onMouseDown(e: MouseEvent) {
    const pop = $("#orc-help-tip-popover");
    if (!pop || pop.hidden) return;
    const t = e.target as Node;
    if (pop.contains(t) || (t as HTMLElement).closest?.(".orc-help-tip-btn")) return;
    closeOrcHelpTip();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closeOrcHelpTip();
  }

  document.addEventListener("click", onDocClick);
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("keydown", onKeydown);

  return () => {
    document.removeEventListener("click", onDocClick);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("keydown", onKeydown);
    closeOrcHelpTip();
  };
}


export type ChatSideTab = "models" | "rooms";

export function useChatShellLayout() {
  const sideTab = ref<ChatSideTab>("models");
  const sideCollapsed = ref(false);
  const mobileDrawerOpen = ref(false);
  const narrow = ref(false);

  const mq = window.matchMedia("(max-width: 899px)");

  function readNarrow() {
    try {
      narrow.value = mq.matches;
    } catch {
      narrow.value = false;
    }
  }

  function onMq() {
    readNarrow();
    if (!narrow.value) mobileDrawerOpen.value = false;
  }

  onMounted(() => {
    readNarrow();
    mq.addEventListener("change", onMq);
  });

  onUnmounted(() => {
    mq.removeEventListener("change", onMq);
  });

  const drawer2Visible = computed(() => narrow.value);

  function closeMobileDrawer() {
    mobileDrawerOpen.value = false;
  }

  function openMobileDrawer() {
    mobileDrawerOpen.value = true;
  }

  function toggleSideCollapsed() {
    sideCollapsed.value = !sideCollapsed.value;
  }

  function expandSideFromRail() {
    sideCollapsed.value = false;
  }

  return {
    sideTab,
    sideCollapsed,
    mobileDrawerOpen,
    drawer2Visible,
    closeMobileDrawer,
    openMobileDrawer,
    toggleSideCollapsed,
    expandSideFromRail,
  };
}


export type OrcPrototypeBinderOptions = {
  getSelectedModelId: () => string;
  setSelectedModelId: (id: string) => void;
};

function syncOrcComposerTextareaHeight(root: HTMLElement) {
  const ta = root.querySelector<HTMLTextAreaElement>("#orc-msg");
  if (!ta) return;
  const cs = window.getComputedStyle(ta);
  let lh = parseFloat(cs.lineHeight);
  const fs = parseFloat(cs.fontSize);
  if (!Number.isFinite(lh) || lh <= 0) lh = (Number.isFinite(fs) ? fs : 15) * 1.5;
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBot = parseFloat(cs.paddingBottom) || 0;
  const minH = padTop + padBot + lh * 2;
  const maxH = padTop + padBot + lh * 5;
  ta.style.height = "1px";
  const sh = ta.scrollHeight;
  const h = Math.min(maxH, Math.max(minH, sh));
  ta.style.height = `${h}px`;
  ta.style.overflowY = sh > maxH ? "auto" : "hidden";
}

export function bindOrcPrototypeChatInteractions(
  root: HTMLElement,
  opt: OrcPrototypeBinderOptions
): () => void {
  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T | null;

  let pickerDraft = opt.getSelectedModelId();
  let rolePickerDraft = "preset_default_zh";
  let roomMenuTargetWrap: HTMLElement | null = null;

  const disposers: (() => void)[] = [];
  function on(target: EventTarget | null, type: string, fn: EventListener, options?: AddEventListenerOptions) {
    if (!target) return;
    target.addEventListener(type, fn, options);
    disposers.push(() => target.removeEventListener(type, fn, options));
  }

  function setConversationActive(has: boolean) {
    const empty = $("#orc-empty");
    const thread = $("#orc-thread");
    const asst = $("#orc-msg-assistant");
    if (!empty || !thread) return;
    thread.hidden = !has;
    empty.hidden = has;
    if (asst) asst.hidden = !has;
  }

  function closeMemoryPopover() {
    const pop = $("#orc-memory-popover");
    const btn = $("#orc-btn-memory");
    if (pop) {
      pop.hidden = true;
      pop.style.left = "";
      pop.style.top = "";
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function positionMemoryPopover() {
    const btn = $("#orc-btn-memory");
    const pop = $("#orc-memory-popover");
    if (!btn || !pop || pop.hidden) return;
    const r = btn.getBoundingClientRect();
    const w = pop.offsetWidth || 260;
    const h = pop.offsetHeight || 120;
    let left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    const topAbove = r.top - h - 8;
    let top = topAbove >= 8 ? topAbove : r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  function openMemoryPopover() {
    closeNetToolsPopover();
    const pop = $("#orc-memory-popover");
    const btn = $("#orc-btn-memory");
    const range = $("#orc-memory-range") as HTMLInputElement | null;
    if (pop) pop.hidden = false;
    if (btn) btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      positionMemoryPopover();
      range?.focus();
    });
  }

  function toggleMemoryPopover() {
    const pop = $("#orc-memory-popover");
    if (!pop) return;
    if (pop.hidden) openMemoryPopover();
    else closeMemoryPopover();
  }

  function syncMemoryDisplay(n: string) {
    const s = String(n);
    const badge = $("#orc-memory-badge");
    const pv = $("#orc-memory-pop-val");
    const hn = $("#orc-memory-hint-n");
    if (badge) badge.textContent = s;
    if (pv) pv.textContent = s;
    if (hn) hn.textContent = s;
  }

  function closeNetToolsPopover() {
    const pop = $("#orc-net-tools-popover");
    const btn = $("#orc-btn-net-tools");
    if (pop) {
      pop.hidden = true;
      pop.style.left = "";
      pop.style.top = "";
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function positionNetToolsPopover() {
    const btn = $("#orc-btn-net-tools");
    const pop = $("#orc-net-tools-popover");
    if (!btn || !pop || pop.hidden) return;
    const r = btn.getBoundingClientRect();
    const w = pop.offsetWidth || 320;
    const h = pop.offsetHeight || 280;
    let left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
    let top = r.top - h - 8;
    if (top < 8) top = r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  function openNetToolsPopover() {
    closeMemoryPopover();
    const pop = $("#orc-net-tools-popover");
    const btn = $("#orc-btn-net-tools");
    if (pop) pop.hidden = false;
    if (btn) btn.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => positionNetToolsPopover());
  }

  function toggleNetToolsPopover() {
    const pop = $("#orc-net-tools-popover");
    if (!pop) return;
    if (pop.hidden) openNetToolsPopover();
    else closeNetToolsPopover();
  }

  function closeRoomMenu() {
    const menu = $("#orc-room-menu");
    if (menu && !menu.hidden) menu.hidden = true;
    root.querySelectorAll(".orc-room-more").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
    });
    roomMenuTargetWrap = null;
  }

  function syncRoomMenuPinLabel(wrap: HTMLElement) {
    const menu = $("#orc-room-menu");
    if (!menu || !wrap) return;
    const span = menu.querySelector(".orc-room-menu-pin-label");
    if (span) span.textContent = wrap.classList.contains("is-pinned") ? "取消置顶" : "置顶";
  }

  function positionRoomMenu(anchor: HTMLElement) {
    const menu = $("#orc-room-menu");
    if (!menu || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const mw = menu.offsetWidth || 170;
    const mh = menu.offsetHeight || 200;
    let left = r.right - mw;
    if (left < 8) left = 8;
    if (left + mw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - mw - 8);
    let top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function openRoomMenu(wrap: HTMLElement, anchor: HTMLElement) {
    const menu = $("#orc-room-menu");
    if (!menu || !wrap) return;
    closeRoomMenu();
    roomMenuTargetWrap = wrap;
    anchor.setAttribute("aria-expanded", "true");
    syncRoomMenuPinLabel(wrap);
    menu.hidden = false;
    window.requestAnimationFrame(() => {
      positionRoomMenu(anchor);
      (menu.querySelector('[role="menuitem"]') as HTMLElement | null)?.focus();
    });
  }

  function closePresetMoreDetails() {
    document.getElementById("orc-preset-more-dd")?.removeAttribute("open");
  }

  function syncPresetChipsFromSelect() {
    const set = $("#orc-settings-preset") as HTMLSelectElement | null;
    const v = set?.value?.trim() ?? "";
    root.querySelectorAll(".orc-preset-chip").forEach((chip) => {
      chip.classList.toggle("is-active", (chip.getAttribute("data-orc-preset") || "") === v && v !== "");
    });
  }

  function setPresetValue(v: string) {
    const set = $("#orc-settings-preset") as HTMLSelectElement | null;
    if (set) set.value = v;
    syncPresetChipsFromSelect();
  }

  function cancelPicker() {
    const o = $("#orc-picker-overlay");
    if (o) {
      o.hidden = true;
      o.setAttribute("aria-hidden", "true");
    }
    $("#orc-compare-to-trigger")?.setAttribute("aria-expanded", "false");
    const roleOv = $("#orc-role-picker-overlay");
    if (!roleOv || roleOv.hidden) document.body.classList.remove("or-modal-open");
    closeRoomMenu();
  }

  function donePicker() {
    opt.setSelectedModelId(pickerDraft);
    cancelPicker();
  }

  function openPicker() {
    const o = $("#orc-picker-overlay");
    if (!o) return;
    closeRolePickerModal();
    closeSettings();
    closeMemoryPopover();
    closeNetToolsPopover();
    pickerDraft = opt.getSelectedModelId();
    o.hidden = false;
    o.setAttribute("aria-hidden", "false");
    document.body.classList.add("or-modal-open");
    $("#orc-compare-to-trigger")?.setAttribute("aria-expanded", "true");
    const inp = $("#orc-picker-search") as HTMLInputElement | null;
    if (inp) inp.value = "";
    paintMockPickerList({ currentModelId: pickerDraft, query: "" });
  }

  function closeSettings() {
    const o = $("#orc-settings-overlay");
    if (o) o.hidden = true;
  }

  function openSettings() {
    const o = $("#orc-settings-overlay");
    if (o) o.hidden = false;
    cancelPicker();
    closeMemoryPopover();
    closeNetToolsPopover();
    closeRoomMenu();
  }

  function closeRolePickerModal() {
    const o = $("#orc-role-picker-overlay");
    if (o) {
      o.hidden = true;
      o.setAttribute("aria-hidden", "true");
    }
    const pick = $("#orc-picker-overlay");
    if (!pick || pick.hidden) document.body.classList.remove("or-modal-open");
  }

  function openRolePickerModal() {
    cancelPicker();
    closePresetMoreDetails();
    const o = $("#orc-role-picker-overlay");
    if (!o) return;
    const set = $("#orc-settings-preset") as HTMLSelectElement | null;
    rolePickerDraft = (set?.value || "").trim() || "preset_default_zh";
    o.hidden = false;
    o.setAttribute("aria-hidden", "false");
    document.body.classList.add("or-modal-open");
    paintMockRolePickerList(rolePickerDraft);
    window.requestAnimationFrame(() => {
      ($("#orc-role-picker-close") as HTMLElement | null)?.focus();
    });
  }

  function repaintPickerFromSearch() {
    const inp = $("#orc-picker-search") as HTMLInputElement | null;
    const q = inp?.value ?? "";
    paintMockPickerList({ currentModelId: pickerDraft, query: q });
  }

  function showSendDemo(promptText: string) {
    const thread = $("#orc-thread");
    const bubble = $("#orc-msg-user-bubble");
    const ta = root.querySelector<HTMLTextAreaElement>("#orc-msg");
    const ab = $("#orc-msg-assistant-body");
    let t = promptText.trim();
    if (!t) t = "请介绍下西安天气与出行建议。";
    if (bubble) bubble.textContent = t;
    if (ab) {
      let short = t.trim();
      if (short.length > 180) short = `${short.slice(0, 180)}…`;
      ab.textContent = short
        ? `回复占位。你的消息：「${short}」。可在下方 Compare to 勾选参与对比的模型，确定后同步到侧栏。`
        : "回复占位。可在下方 Compare to 勾选参与对比的模型，确定后同步到侧栏。";
    }
    setConversationActive(true);
    if (ta) {
      ta.value = "";
      syncOrcComposerTextareaHeight(root);
    }
    window.requestAnimationFrame(() => {
      try {
        thread?.scrollIntoView({ block: "start", behavior: "smooth" });
      } catch {
        /* ignore */
      }
    });
  }

  function onRootClick(e: MouseEvent) {
    const t = e.target as HTMLElement | null;
    if (!t) return;

    if (t.closest("#orc-btn-model-compare")) {
      e.preventDefault();
      openPicker();
      return;
    }
    if (t.closest("#orc-compare-to-trigger")) {
      e.preventDefault();
      openPicker();
      return;
    }
    if (t.id === "orc-picker-cancel" || t.closest("#orc-picker-cancel")) {
      e.preventDefault();
      cancelPicker();
      return;
    }
    if (t.id === "orc-picker-dismiss" || t.closest("#orc-picker-dismiss")) {
      e.preventDefault();
      cancelPicker();
      return;
    }
    if (t.id === "orc-picker-done" || t.closest("#orc-picker-done")) {
      e.preventDefault();
      donePicker();
      return;
    }
    const pickRow = t.closest("button[data-model-id]") as HTMLButtonElement | null;
    if (pickRow && pickRow.closest("#orc-picker-list")) {
      e.preventDefault();
      pickerDraft = pickRow.getAttribute("data-model-id") || pickerDraft;
      repaintPickerFromSearch();
      return;
    }

    if (t.id === "orc-btn-settings" || t.closest("#orc-btn-settings")) {
      e.preventDefault();
      openSettings();
      return;
    }
    if (t.id === "orc-settings-close" || t.closest("#orc-settings-close")) {
      e.preventDefault();
      closeSettings();
      return;
    }
    const settingsOv = $("#orc-settings-overlay");
    if (t === settingsOv) {
      closeSettings();
      return;
    }

    if (t.id === "orc-preset-add-role" || t.closest("#orc-preset-add-role")) {
      e.preventDefault();
      e.stopPropagation();
      openRolePickerModal();
      return;
    }
    if (t.id === "orc-role-picker-close" || t.closest("#orc-role-picker-close")) {
      e.preventDefault();
      closeRolePickerModal();
      return;
    }
    if (t.id === "orc-role-picker-cancel" || t.closest("#orc-role-picker-cancel")) {
      e.preventDefault();
      closeRolePickerModal();
      return;
    }
    if (t.id === "orc-role-picker-done" || t.closest("#orc-role-picker-done")) {
      e.preventDefault();
      setPresetValue(rolePickerDraft || "");
      closeRolePickerModal();
      closePresetMoreDetails();
      return;
    }
    const roleCard = t.closest(".orc-role-card") as HTMLElement | null;
    if (roleCard && roleCard.closest("#orc-role-picker-list")) {
      e.preventDefault();
      rolePickerDraft = roleCard.getAttribute("data-orc-preset") || rolePickerDraft;
      paintMockRolePickerList(rolePickerDraft);
      return;
    }

    const presetChip = t.closest(".orc-preset-chip") as HTMLElement | null;
    if (presetChip && !t.closest(".orc-preset-chip-remove")) {
      e.preventDefault();
      setPresetValue(presetChip.getAttribute("data-orc-preset") || "");
      closePresetMoreDetails();
      return;
    }

    if (t.closest("#orc-btn-memory")) {
      e.stopPropagation();
      toggleMemoryPopover();
      return;
    }
    if (t.closest("#orc-btn-net-tools")) {
      e.stopPropagation();
      toggleNetToolsPopover();
      return;
    }

    if (t.id === "orc-btn-send" || t.closest("#orc-btn-send")) {
      e.preventDefault();
      const ta = root.querySelector<HTMLTextAreaElement>("#orc-msg");
      showSendDemo(ta?.value || "");
      return;
    }

    if (t.closest(".orc-chip")) {
      const chip = t.closest(".orc-chip") as HTMLElement;
      const ta = root.querySelector<HTMLTextAreaElement>("#orc-msg");
      if (ta) {
        ta.value = chip.getAttribute("data-prompt") || chip.textContent?.trim() || "";
        ta.focus();
        window.requestAnimationFrame(() => syncOrcComposerTextareaHeight(root));
      }
      return;
    }

    if (t.id === "orc-expand-sampling" || t.closest("#orc-expand-sampling")) {
      e.preventDefault();
      const expand = $("#orc-expand-sampling");
      const body = $("#orc-expand-sampling-body");
      if (!expand || !body) return;
      expand.classList.toggle("is-open");
      body.hidden = !expand.classList.contains("is-open");
      return;
    }

    if (t.id === "orc-name-toggle" || t.closest("#orc-name-toggle")) {
      e.preventDefault();
      $("#orc-name-toggle")?.classList.toggle("is-on");
      return;
    }

    const sysTab = t.closest(".orc-sys-tab") as HTMLElement | null;
    if (sysTab && sysTab.closest("#orc-settings-overlay")) {
      e.preventDefault();
      root.querySelectorAll(".orc-sys-tab").forEach((tab) => {
        tab.classList.toggle("is-active", tab === sysTab);
      });
      return;
    }

    if (t.id === "orc-user-btn-copy" || t.closest("#orc-user-btn-copy")) {
      e.preventDefault();
      const bubble = $("#orc-msg-user-bubble");
      const text = bubble?.textContent?.trim() ?? "";
      if (text) void navigator.clipboard.writeText(text);
      return;
    }

    const more = t.closest(".orc-room-more") as HTMLElement | null;
    if (more && more.closest("#orc-panel-rooms")) {
      e.preventDefault();
      e.stopPropagation();
      const wrap = more.closest(".orc-room-card-wrap") as HTMLElement | null;
      if (!wrap) return;
      const menu = $("#orc-room-menu");
      if (menu && !menu.hidden && roomMenuTargetWrap === wrap) {
        closeRoomMenu();
        return;
      }
      if (wrap) openRoomMenu(wrap, more);
      return;
    }

    const roomItem = t.closest("[data-orc-room-action]") as HTMLElement | null;
    if (roomItem && roomItem.closest("#orc-room-menu") && roomMenuTargetWrap) {
      e.stopPropagation();
      const action = roomItem.getAttribute("data-orc-room-action");
      const wrap = roomMenuTargetWrap;
      closeRoomMenu();
      if (action === "pin") wrap.classList.toggle("is-pinned");
      else if (action === "rename") {
        const titleEl = wrap.querySelector(".orc-room-card-title");
        const cur = titleEl?.textContent?.trim() ?? "";
        const next = window.prompt("会话名称", cur);
        if (titleEl && next !== null && String(next).trim() !== "") {
          const nt = String(next).trim();
          titleEl.textContent = nt;
          wrap.querySelector(".orc-room-card")?.setAttribute("aria-label", nt);
        }
      } else if (action === "duplicate") {
        const clone = wrap.cloneNode(true) as HTMLElement;
        clone.querySelectorAll(".orc-room-more").forEach((b) => b.setAttribute("aria-expanded", "false"));
        wrap.parentElement?.insertBefore(clone, wrap.nextSibling);
      } else if (action === "delete") {
        wrap.remove();
      }
    }
  }

  function onRootInput(e: Event) {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    if (t.id === "orc-picker-search") {
      repaintPickerFromSearch();
    }
    if (t.id === "orc-memory-range") {
      const range = t as HTMLInputElement;
      syncMemoryDisplay(range.value);
      window.requestAnimationFrame(() => positionMemoryPopover());
    }
  }

  function onBackdropClick(e: MouseEvent) {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    if (t.id === "orc-role-picker-backdrop" || t.closest("#orc-role-picker-backdrop")) {
      e.preventDefault();
      closeRolePickerModal();
    }
  }

  function onDocMouseDown(e: MouseEvent) {
    const t = e.target as Node | null;
    if (!t) return;
    const memWrap = root.querySelector(".orc-memory-wrap");
    const memPop = $("#orc-memory-popover");
    if (memWrap && memPop && !memPop.hidden && !memWrap.contains(t)) closeMemoryPopover();

    const netWrap = root.querySelector(".orc-net-tools-wrap");
    const netPop = $("#orc-net-tools-popover");
    if (netWrap && netPop && !netPop.hidden && !netWrap.contains(t)) closeNetToolsPopover();

    const menu = $("#orc-room-menu");
    if (menu && !menu.hidden) {
      if (!menu.contains(t) && !(t instanceof Element && t.closest?.(".orc-room-more"))) {
        closeRoomMenu();
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Escape") return;
    const helpPop = $("#orc-help-tip-popover");
    if (helpPop && !helpPop.hidden) return;
    const roleOv = $("#orc-role-picker-overlay");
    if (roleOv && !roleOv.hidden) {
      closeRolePickerModal();
      e.preventDefault();
      return;
    }
    const pickOv = $("#orc-picker-overlay");
    if (pickOv && !pickOv.hidden) {
      cancelPicker();
      e.preventDefault();
      return;
    }
    closeSettings();
    closeMemoryPopover();
    closeNetToolsPopover();
    closeRoomMenu();
    closePresetMoreDetails();
  }

  function onTaKeydown(e: KeyboardEvent) {
    if (e.key !== "Enter" || e.shiftKey) return;
    const ta = e.target as HTMLElement | null;
    if (!ta || ta.id !== "orc-msg") return;
    e.preventDefault();
    showSendDemo((ta as HTMLTextAreaElement).value || "");
  }

  function onResize() {
    const mp = $("#orc-memory-popover");
    if (mp && !mp.hidden) positionMemoryPopover();
    const np = $("#orc-net-tools-popover");
    if (np && !np.hidden) positionNetToolsPopover();
  }

  on(root, "click", onRootClick as EventListener);
  on(root, "input", onRootInput as EventListener);
  on(root, "click", onBackdropClick as EventListener);
  on(document, "mousedown", onDocMouseDown as EventListener);
  on(document, "keydown", onKeyDown as EventListener);
  on(root, "keydown", onTaKeydown as EventListener);

  const ta0 = root.querySelector<HTMLTextAreaElement>("#orc-msg");
  if (ta0) {
    const onTaInput = () => syncOrcComposerTextareaHeight(root);
    on(ta0, "input", onTaInput as EventListener);
  }

  on(window, "resize", onResize as EventListener, { passive: true });

  const set = $("#orc-settings-preset") as HTMLSelectElement | null;
  if (set && !(set.value || "").trim()) set.value = "preset_default_zh";
  syncPresetChipsFromSelect();

  window.requestAnimationFrame(() => syncOrcComposerTextareaHeight(root));

  return () => {
    for (const d of disposers) d();
  };
}
