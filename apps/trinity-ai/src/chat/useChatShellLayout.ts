import { computed, onMounted, onUnmounted, ref } from "vue";

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
