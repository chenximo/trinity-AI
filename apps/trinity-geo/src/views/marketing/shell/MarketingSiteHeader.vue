<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  GEO_LOGO_TAG,
  MARKETING_NAV_ITEMS,
  MARKETING_SUITE_LINKS,
} from "./marketingHeaderMock";
import { useMarketingSiteHeader } from "./marketingSiteInteractions";
import "./marketing-site-shell.css";

const { headerRef, activeNavId, setActiveNav } = useMarketingSiteHeader();
</script>

<template>
  <header ref="headerRef" class="geo-header">
    <div class="geo-container geo-header-inner">
      <div class="geo-logo-group">
        <RouterLink :to="{ name: 'trinity-geo' }" class="geo-logo">
          <span class="geo-logo-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </span>
          Trinity GEO
          <span class="geo-logo-tag">{{ GEO_LOGO_TAG }}</span>
        </RouterLink>
        <div class="geo-suite-links" aria-label="Trinity 套件">
          <a
            v-for="link in MARKETING_SUITE_LINKS"
            :key="link.href"
            :href="link.href"
            class="geo-suite-link"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
      <nav class="geo-nav" aria-label="主导航">
        <a
          v-for="item in MARKETING_NAV_ITEMS"
          :key="item.id"
          :href="item.hash"
          :class="{ 'is-active': activeNavId === item.id }"
          @click="setActiveNav(item.id)"
        >
          {{ item.label }}
        </a>
      </nav>
      <div class="geo-header-actions">
        <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn geo-btn-ghost">登录</RouterLink>
        <RouterLink :to="{ name: 'geo-dashboard' }" class="geo-btn geo-btn-primary">开始试用</RouterLink>
      </div>
    </div>
  </header>
</template>
