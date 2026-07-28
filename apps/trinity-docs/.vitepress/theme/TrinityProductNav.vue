<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter, withBase } from "vitepress";
import VPNavBarSearch from "vitepress/dist/client/theme-default/components/VPNavBarSearch.vue";
import { TrinityLocaleSwitcher } from "@trinity/ui";
import { useDocsLocaleToggle } from "./docsLocale";
import { PRODUCT_HOME, PRODUCT_NAV, type ProductNavItem } from "./productNav";
import wordmarkUrl from "./assets/brand/trinity-wordmark.png";

const router = useRouter();
const { isEn, lang, setLang } = useDocsLocaleToggle();

const drawerOpen = ref(false);

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
          <a
            :href="PRODUCT_HOME"
            class="brand-row notranslate"
            :aria-label="isEn ? 'Trinity AI home' : 'Trinity AI 首页'"
            translate="no"
          >
            <img
              class="brand-wordmark"
              :src="wordmarkUrl"
              width="140"
              height="28"
              alt="Trinity"
            />
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
            <TrinityLocaleSwitcher :locale="lang" @update:locale="setLang" />

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
