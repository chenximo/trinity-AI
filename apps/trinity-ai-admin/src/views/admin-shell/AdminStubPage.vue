<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import { getSecondaryPagesForParent, getParentRouteNameFromStubChildRoute } from "./moduleSecondaryPages";

const route = useRoute();

const groupTitle = computed(() => (route.meta.groupTitle as string) ?? "");
const pageTitle = computed(() => (route.meta.title as string) ?? "模块");
const designRef = computed(() => (route.meta.designRef as string) ?? "");
const planBatch = computed(() => (route.meta.planBatch as string) ?? "");

const parentRouteName = computed(() => {
  const explicit = route.meta.parentRouteName as string | undefined;
  if (explicit) return explicit;
  if (typeof route.name === "string") return getParentRouteNameFromStubChildRoute(route.name);
  return "";
});

const secondaryPages = computed(() =>
  parentRouteName.value ? getSecondaryPagesForParent(parentRouteName.value) : []
);

const currentSecondaryId = computed(() => (route.meta.stubSecondaryId as string) ?? "");
</script>

<template>
  <div class="admin-stub">
    <AdminSectionHead :title="pageTitle">
      <template #annot>
        <AdminInternalTip :heading="`${pageTitle} · 占位`" explain="占位子页对内说明（原型）">
          <p>本路由仍为占位；子页清单与详设/批次引用见下表，替换实页后移除本标注。</p>
        </AdminInternalTip>
      </template>
      <template #desc>
        <template v-if="groupTitle">一级模块 <strong>{{ groupTitle }}</strong> — </template>
        占位子路由清单与设计/批次引用（原型）。
      </template>
    </AdminSectionHead>
    <p class="admin-stub__meta">
      详细设计 <strong>{{ designRef }}</strong>
      · 交付批次 <strong>{{ planBatch }}</strong>
    </p>
    <div v-if="secondaryPages.length" class="admin-stub__table-wrap">
      <table class="admin-stub__table">
        <thead>
          <tr>
            <th scope="col">子页面</th>
            <th scope="col">页内功能与说明</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in secondaryPages"
            :key="row.id"
            :class="{ 'is-current': row.id === currentSecondaryId }"
          >
            <td class="admin-stub__td-title">
              <RouterLink
                v-if="parentRouteName"
                class="admin-stub__td-link"
                :to="{ name: `${parentRouteName}-${row.id}` }"
              >
                {{ row.title }}
              </RouterLink>
              <template v-else>{{ row.title }}</template>
            </td>
            <td>{{ row.summary }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="admin-stub__desc">暂无二级页面清单映射（请补 <code>moduleSecondaryPages.ts</code>）。</p>
    <p class="admin-stub__desc">原型占位：假数据与完整交互见对应批次。</p>
    <p class="admin-stub__back">
      <RouterLink :to="{ name: 'tai-admin-dashboard' }">返回工作台</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.admin-stub {
  max-width: 48rem;
}
.admin-stub__meta {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  color: var(--muted);
}
.admin-stub__table-wrap {
  overflow: auto;
  margin: 0 0 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
}
.admin-stub__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.admin-stub__table th,
.admin-stub__table td {
  padding: 0.5rem 0.65rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border);
}
.admin-stub__table th {
  font-weight: 600;
  color: var(--text);
  background: var(--surface);
  font-size: 0.75rem;
}
.admin-stub__table tr:last-child td {
  border-bottom: none;
}
.admin-stub__table tr.is-current {
  background: var(--blue-soft);
}
.admin-stub__td-title {
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
.admin-stub__td-link {
  color: var(--blue);
  text-decoration: none;
}
.admin-stub__td-link:hover {
  text-decoration: underline;
}
.admin-stub__desc {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--muted);
}
.admin-stub__back {
  margin: 0;
  font-size: 0.8125rem;
}
.admin-stub a {
  color: var(--blue);
  text-decoration: none;
}
.admin-stub a:hover {
  text-decoration: underline;
}
.admin-stub code {
  font-size: 0.8em;
  padding: 0.1em 0.3em;
  border-radius: 0.25rem;
  background: var(--surface-2);
}
</style>
