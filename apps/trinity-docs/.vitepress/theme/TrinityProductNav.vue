<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter, withBase } from "vitepress";
import VPNavBarSearch from "vitepress/dist/client/theme-default/components/VPNavBarSearch.vue";
import { useDocsLocaleToggle } from "./docsLocale";
import { PRODUCT_HOME, PRODUCT_NAV, type ProductNavItem } from "./productNav";

const router = useRouter();
const locale = useDocsLocaleToggle();

const drawerOpen = ref(false);

const isEn = computed(() => locale.isEn.value);

function navLabel(item: ProductNavItem) {
  return isEn.value ? item.labelEn : item.labelZh;
}

function isDocsActive(item: ProductNavItem) {
  return Boolean(item.docsInternal);
}

function productNavHref(item: ProductNavItem) {
  if (item.docsInternal) return withBase(isEn.value ? "/en/quickstart" : "/quickstart");
  return item.href ?? PRODUCT_HOME;
}

function onNavClick(e: MouseEvent, item: ProductNavItem) {
  if (!item.docsInternal) return;
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  void router.go(productNavHref(item));
  closeDrawer();
}

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

function closeDrawer() {
  drawerOpen.value = false;
}

function onResizeDrawer() {
  try {
    if (window.matchMedia("(min-width: 900px)").matches) closeDrawer();
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  window.addEventListener("resize", onResizeDrawer);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResizeDrawer);
});
</script>

<template>
  <div class="tdocs-product-nav">
    <header class="or-inject" data-or-page="docs">
      <div class="header-row">
        <div class="header-brand-cluster">
          <a :href="PRODUCT_HOME" class="brand-row" :aria-label="isEn ? 'Trinity AI home' : 'Trinity AI 首页'">
            <span class="brand-mark" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2l1.2 4.5L18 8l-4.8 1.5L12 14l-1.2-4.5L6 8l4.8-1.5L12 2zM19 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L19 14zM5 14l.9 2.5 2.6.8-2.1 1.6.1 2.7-2.5-1-2.5 1 .1-2.7-2.1-1.6 2.6-.8L5 14z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Trinity AI
          </a>
        </div>

        <div class="tdocs-nav-search" :class="{ 'is-en': isEn }">
          <VPNavBarSearch />
        </div>

        <div class="header-end">
          <nav class="primary or-ornav" :aria-label="isEn ? 'Main navigation' : '主导航'">
            <a
              v-for="item in PRODUCT_NAV"
              :key="item.id"
              :href="productNavHref(item)"
              :class="{ 'is-active': isDocsActive(item) }"
              @click="onNavClick($event, item)"
            >
              {{ navLabel(item) }}
            </a>
          </nav>

          <div class="or-header-actions">
            <button
              type="button"
              class="or-lang-btn"
              :title="locale.titleText.value"
              :aria-label="locale.ariaLabel.value"
              @click="locale.toggle"
            >
              <svg
                class="or-lang-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m5 8l6 6m-7 0l6-6l2-3M2 5h12M7 2h1m14 20l-5-10l-5 10m2-4h6"
                />
              </svg>
              <span class="or-lang-label">{{ locale.labelText.value }}</span>
            </button>

            <button
              type="button"
              class="menu-toggle"
              :aria-expanded="drawerOpen ? 'true' : 'false'"
              aria-controls="tdocs-drawer"
              :aria-label="isEn ? 'Open menu' : '打开菜单'"
              @click="toggleDrawer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div id="tdocs-drawer" class="mobile-drawer" :class="{ open: drawerOpen }">
        <a
          v-for="item in PRODUCT_NAV"
          :key="`drawer-${item.id}`"
          :href="productNavHref(item)"
          :class="{ 'is-active': isDocsActive(item) }"
          @click="onNavClick($event, item)"
        >
          {{ navLabel(item) }}
        </a>
      </div>
    </header>
  </div>
</template>
