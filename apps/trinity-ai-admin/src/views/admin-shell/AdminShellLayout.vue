<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import "../../styles/admin-theme.css";
import "./admin-shell.css";
import "../../styles/admin-page.css";
import "../../styles/admin-buttons.css";
import AdminNavIcon from "./AdminNavIcon.vue";
import { ADMIN_NAV_TREE, type NavSubmenu } from "./adminNavTree";
import {
  adminUserInitials,
  type AdminSessionUser,
} from "./sessionMock";
import {
  readAdminSession,
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from "./shellInteractions";

const route = useRoute();
const router = useRouter();
const collapsed = ref(false);
const isFullscreen = ref(false);
const userMenuOpen = ref(false);
const userWrapRef = ref<HTMLElement | null>(null);
const sessionUser = ref<AdminSessionUser | null>(null);

const userInitials = computed(() =>
  sessionUser.value ? adminUserInitials(sessionUser.value) : "?",
);
/** 用户手动折叠的一级模块 id；未设置时由当前路由决定是否展开 */
const submenuOpen = ref<Record<string, boolean>>({});

const shellClass = computed(() =>
  collapsed.value ? "admin-shell is-collapsed" : "admin-shell"
);

function toggleSidebar(): void {
  collapsed.value = !collapsed.value;
  writeSidebarCollapsed(collapsed.value);
}

const leafTitle = computed(() => (route.meta.title as string) ?? "运营后台");

/** 面包屑：查找当前路由在导航树中的父级模块 */
const breadcrumbParent = computed(() => {
  for (const e of ADMIN_NAV_TREE) {
    if (e.kind === "single") continue;
    if (e.children.some((c) => c.routeName === route.name)) {
      return e.label;
    }
  }
  return null;
});

function isSubmenuExpanded(entry: NavSubmenu): boolean {
  const v = submenuOpen.value[entry.id];
  if (v !== undefined) return v;
  return entry.children.some((c) => c.routeName === route.name);
}

function toggleSubmenu(entry: NavSubmenu): void {
  submenuOpen.value[entry.id] = !isSubmenuExpanded(entry);
}

watch(
  () => route.name,
  () => {
    for (const e of ADMIN_NAV_TREE) {
      if (e.kind !== "submenu") continue;
      if (e.children.some((c) => c.routeName === route.name)) {
        submenuOpen.value[e.id] = true;
      }
    }
  },
  { immediate: true },
);

async function toggleFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      isFullscreen.value = true;
    } else {
      await document.exitFullscreen();
      isFullscreen.value = false;
    }
  } catch {
    isFullscreen.value = Boolean(document.fullscreenElement);
  }
}

function onFullscreenChange(): void {
  isFullscreen.value = Boolean(document.fullscreenElement);
}

function refreshSessionUser(): void {
  sessionUser.value = readAdminSession();
}

function toggleUserMenu(): void {
  userMenuOpen.value = !userMenuOpen.value;
}

function closeUserMenu(): void {
  userMenuOpen.value = false;
}

function onDocumentPointerDown(e: PointerEvent): void {
  const wrap = userWrapRef.value;
  if (wrap && !wrap.contains(e.target as Node)) closeUserMenu();
}

function onSignOut(): void {
  closeUserMenu();
  void router.push({ name: "tai-admin-logout" });
}

onMounted(() => {
  collapsed.value = readSidebarCollapsed();
  refreshSessionUser();
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
});
</script>

<template>
  <div :class="shellClass">
    <aside class="admin-shell__sidebar" aria-label="主导航">
      <div class="admin-shell__logo">
        <span class="admin-shell__logo-mark" aria-hidden="true">T</span>
        <div class="admin-shell__logo-text">
          Trinity 运营后台
          <span class="admin-shell__logo-sub">聚合平台 · 管理端</span>
        </div>
      </div>
      <nav class="admin-shell__nav" aria-label="模块与子页">
        <template v-for="entry in ADMIN_NAV_TREE" :key="entry.kind === 'single' ? entry.routeName : entry.id">
          <!-- 单入口：工作台 -->
          <RouterLink
            v-if="entry.kind === 'single'"
            :to="{ name: entry.routeName }"
            :title="`${entry.label} (${entry.designRef})`"
            class="admin-shell__nav-link"
          >
            <AdminNavIcon :icon-key="entry.iconKey" />
            <span class="admin-shell__nav-label">{{ collapsed ? entry.label.slice(0, 2) : entry.label }}</span>
          </RouterLink>

          <!-- 一级模块 + 二级子菜单（路由） -->
          <div v-else class="admin-shell__nav-group">
            <template v-if="collapsed">
              <RouterLink
                v-if="entry.children[0]?.routeName"
                class="admin-shell__nav-link"
                :to="{ name: entry.children[0].routeName }"
                :title="`${entry.label}（${entry.children.length} 个子页，展开侧栏查看）`"
              >
                <AdminNavIcon :icon-key="entry.iconKey" />
                <span class="admin-shell__nav-label">{{ entry.label.slice(0, 2) }}</span>
              </RouterLink>
            </template>
            <template v-else>
              <button
                type="button"
                class="admin-shell__nav-group-head"
                :class="{
                  'is-child-active': entry.children.some((c) => c.routeName === route.name),
                }"
                :aria-expanded="isSubmenuExpanded(entry)"
                @click="toggleSubmenu(entry)"
              >
                <AdminNavIcon :icon-key="entry.iconKey" />
                <span class="admin-shell__nav-group-title">{{ entry.label }}</span>
                <svg
                  class="admin-shell__nav-chevron"
                  :class="{ 'is-open': isSubmenuExpanded(entry) }"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
              <div v-show="isSubmenuExpanded(entry)" class="admin-shell__nav-children">
                <RouterLink
                  v-for="c in entry.children"
                  :key="c.routeName"
                  v-show="c.routeName"
                  :to="{ name: c.routeName }"
                  :title="`${c.label} (${c.designRef})`"
                  class="admin-shell__nav-sublink"
                >
                  <AdminNavIcon :icon-key="c.iconKey" variant="sub" />
                  <span class="admin-shell__nav-sublabel">{{ c.label }}</span>
                </RouterLink>
              </div>
            </template>
          </div>
        </template>
      </nav>
    </aside>

    <header class="admin-shell__header">
      <div class="admin-shell__header-left">
        <button
          type="button"
          class="admin-shell__hamburger"
          :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
          :title="collapsed ? '展开侧栏' : '收起侧栏'"
          @click="toggleSidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h7" stroke-linecap="round" />
          </svg>
        </button>
        <nav class="admin-shell__breadcrumb" aria-label="面包屑">
          <template v-if="breadcrumbParent">
            <span class="admin-shell__breadcrumb-parent">{{ breadcrumbParent }}</span>
            <span class="admin-shell__breadcrumb-sep">/</span>
          </template>
          <span class="admin-shell__breadcrumb-current">{{ leafTitle }}</span>
        </nav>
      </div>
      <div class="admin-shell__header-right">
        <button type="button" class="admin-shell__icon-btn" aria-label="搜索" title="搜索（原型占位）">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.5" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" class="admin-shell__icon-btn" aria-label="全屏" title="全屏" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 3H4v5M15 3h5v5M15 21h5v-5M9 21H4v-5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 9H4V4M20 4v5h-5M20 20h-5v-5M4 20v-5h5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button type="button" class="admin-shell__icon-btn" aria-label="通知" title="通知（原型占位）">
          <span class="admin-shell__icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
                stroke="currentColor"
                stroke-width="1.25"
                stroke-linejoin="round"
              />
            </svg>
            <span class="admin-shell__badge-dot" aria-hidden="true" />
          </span>
        </button>
        <span class="admin-shell__env-tag">Mock</span>
        <div ref="userWrapRef" class="admin-shell__user-wrap">
          <button
            type="button"
            class="admin-shell__user-trigger"
            :aria-expanded="userMenuOpen ? 'true' : 'false'"
            aria-haspopup="true"
            aria-controls="admin-shell-user-menu"
            :aria-label="sessionUser ? `${sessionUser.displayName} 账户菜单` : '账户菜单'"
            @click.stop="toggleUserMenu"
          >
            <span class="admin-shell__avatar-circle" aria-hidden="true">{{ userInitials }}</span>
            <span class="admin-shell__avatar-name">{{ sessionUser?.displayName ?? "未登录" }}</span>
            <svg class="admin-shell__avatar-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <div
            id="admin-shell-user-menu"
            class="admin-shell__user-menu"
            role="menu"
            :hidden="!userMenuOpen"
          >
            <div class="admin-shell__user-menu-head">
              <span class="admin-shell__avatar-circle sm" aria-hidden="true">{{ userInitials }}</span>
              <div class="admin-shell__user-meta">
                <span class="admin-shell__user-menu-name">{{ sessionUser?.displayName }}</span>
                <span class="admin-shell__user-menu-login">{{ sessionUser?.loginId }}</span>
              </div>
            </div>
            <div v-if="sessionUser" class="admin-shell__user-menu-info">
              <div class="admin-shell__user-info-row">
                <span class="admin-shell__user-info-k">邮箱</span>
                <span class="admin-shell__user-info-v">{{ sessionUser.email }}</span>
              </div>
              <div class="admin-shell__user-info-row">
                <span class="admin-shell__user-info-k">角色</span>
                <span class="admin-shell__user-info-v">
                  <span class="admin-shell__role-pill">{{ sessionUser.roleLabel }}</span>
                </span>
              </div>
              <div class="admin-shell__user-info-row">
                <span class="admin-shell__user-info-k">上次登录</span>
                <span class="admin-shell__user-info-v">{{ sessionUser.lastLoginAt }}</span>
              </div>
            </div>
            <div class="admin-shell__user-menu-divider" role="separator" />
            <RouterLink
              class="admin-shell__user-menu-item"
              role="menuitem"
              :to="{ name: 'tai-admin-access-admins' }"
              @click="closeUserMenu"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <span>管理员与角色</span>
            </RouterLink>
            <button
              type="button"
              class="admin-shell__user-menu-item admin-shell__user-menu-item--danger"
              role="menuitem"
              @click="onSignOut"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="admin-shell__main">
      <RouterView />
    </main>
  </div>
</template>
