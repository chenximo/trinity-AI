<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { getSecondaryPagesForParent, getParentRouteNameFromStubChildRoute, type SecondaryPageDef } from "./moduleSecondaryPages";

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

function stubRowClassName({ row }: { row: SecondaryPageDef }): string {
  return row.id === currentSecondaryId.value ? "admin-stub-row--current" : "";
}

const stubPg = useAdminTablePagination(secondaryPages);
</script>

<template>
  <div class="admin-stub">
    <el-card shadow="never" class="admin-ep-card">
      <AdminSectionHead toolbar-only :title="pageTitle">
        <template #annot>
          <AdminInternalTip :heading="`${pageTitle} · 占位`" explain="占位子页对内说明（原型）">
            <p>本路由仍为占位；子页清单与详设/批次引用见下表，替换实页后移除本标注。</p>
          </AdminInternalTip>
        </template>
      </AdminSectionHead>
      <p class="admin-stub__meta">
        详细设计 <strong>{{ designRef }}</strong>
        · 交付批次 <strong>{{ planBatch }}</strong>
      </p>
      <template v-if="secondaryPages.length">
        <el-table
          :data="stubPg.paginatedRows"
          class="admin-ep-table-wrap"
          :row-class-name="stubRowClassName"
        >
          <el-table-column label="子页面" min-width="144">
            <template #default="scope">
              <template v-if="scope?.row">
              <RouterLink
                v-if="parentRouteName"
                class="admin-stub__td-link"
                :to="{ name: `${parentRouteName}-${scope.row.id}` }"
              >
                {{ scope.row.title }}
              </RouterLink>
              <template v-else>{{ scope.row.title }}
              </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="summary" label="页内功能与说明" min-width="256" sortable/>
        </el-table>
        <AdminTablePagination
          v-model:current-page="stubPg.currentPage"
          v-model:page-size="stubPg.pageSize"
          :total="stubPg.total"
        />
      </template>
      <p v-else class="admin-stub__desc">暂无二级页面清单映射（请补 <code>moduleSecondaryPages.ts</code>）。</p>
      <p class="admin-stub__desc">原型占位：假数据与完整交互见对应批次。</p>
      <p class="admin-stub__back">
        <RouterLink :to="{ name: 'tai-admin-dashboard' }">返回工作台</RouterLink>
      </p>
    </el-card>
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
:deep(.admin-stub-row--current > td) {
  background: var(--blue-soft) !important;
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
