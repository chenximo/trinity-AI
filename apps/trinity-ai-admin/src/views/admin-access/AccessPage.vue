<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { useRoute } from "vue-router";
import { Delete, Edit } from "@element-plus/icons-vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import { filterByQuery } from "../../utils/adminListFilter";
import {
  ADMIN_PERMISSION_CATALOG,
  permissionKeysToLines,
  READONLY_ROLE_TEMPLATES,
} from "../../utils/adminPermissions";
import "./access.css";
import { flattenNavLeaves, type NavLeaf } from "../admin-shell/adminNavTree";
import {
  ACCESS_PANEL_ORDER,
  DATA_SCOPE_BLOCKS,
  DATA_SCOPE_COMBINE_RULE,
  DATA_SCOPE_EXTENDED_SLICES,
  DATA_SCOPE_ROLE_BINDING_NOTE,
  DEFAULT_PLATFORM_ADMINS,
  DEFAULT_PLATFORM_ROLES,
  mergedPermissionLinesForAdmin,
  rolePermissionLines,
  type AccessPanelId,
  type PlatformAdminRow,
  type PlatformRoleRow,
} from "./mock";
import {
  readAdminListFilter,
  readPlatformAdminsJson,
  readPlatformRolesJson,
  readRoleListFilter,
  writeAdminListFilter,
  writePlatformAdminsJson,
  writePlatformRolesJson,
  writeRoleListFilter,
} from "./accessInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<AccessPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && ACCESS_PANEL_ORDER.includes(id as AccessPanelId)) return id as AccessPanelId;
  return "admins";
});

const adminListFilter = ref("");
const adminStatusFilter = ref("");
const roleListFilter = ref("");
const menuSearchQ = ref("");
const adminRows = ref<PlatformAdminRow[]>([]);
const roleRows = ref<PlatformRoleRow[]>([]);

const adminModalOpen = ref(false);
const adminModalMode = ref<"add" | "edit">("add");
const adminEditingId = ref<string | null>(null);
const adminFormError = ref("");
const draftAdminName = ref("");
const draftAdminLogin = ref("");
const draftAdminRoleIds = ref("");
const draftAdminStatus = ref<"启用" | "禁用">("启用");

const roleModalOpen = ref(false);
const roleModalMode = ref<"add" | "edit">("add");
const roleEditingId = ref<string | null>(null);
const roleFormError = ref("");
const draftRoleId = ref("");
const draftRoleName = ref("");
const draftRoleDesc = ref("");
const draftRolePermissions = ref("");
const draftRolePermKeys = ref<string[]>([]);
const selectedRoleTemplate = ref("");
const resetPwdOpen = ref(false);
const resetPwdTarget = ref<PlatformAdminRow | null>(null);
const draftNewPassword = ref("");
const resetPwdError = ref("");

const infoModalOpen = ref(false);
const infoModalTitle = ref("提示");
const infoModalMessage = ref("");

const accessDangerOpen = ref(false);
const accessDangerKind = ref<"none" | "delete-admin" | "delete-role">("none");
const accessDangerTargetId = ref<string | null>(null);
const accessDangerTargetLabel = ref("");

const scopeDocModalOpen = ref(false);

function openScopeDocModal(): void {
  scopeDocModalOpen.value = true;
}

function closeScopeDocModal(): void {
  scopeDocModalOpen.value = false;
}

const accessDangerTitle = computed(() => {
  if (accessDangerKind.value === "delete-admin") return "确认删除管理员";
  if (accessDangerKind.value === "delete-role") return "确认删除角色";
  return "确认操作";
});

const accessDangerMessage = computed(() => {
  const label = accessDangerTargetLabel.value;
  if (accessDangerKind.value === "delete-admin") {
    return `确定删除员工「${label}」？原型将同步更新 localStorage。`;
  }
  if (accessDangerKind.value === "delete-role") {
    return `确定删除角色「${label}」？未绑定管理员方可删除。`;
  }
  return "";
});

function loadRoles(): void {
  const raw = readPlatformRolesJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        roleRows.value = parsed as PlatformRoleRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  roleRows.value = JSON.parse(JSON.stringify(DEFAULT_PLATFORM_ROLES)) as PlatformRoleRow[];
}

function persistRoles(): void {
  writePlatformRolesJson(JSON.stringify(roleRows.value));
}

function loadAdmins(): void {
  const raw = readPlatformAdminsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        adminRows.value = parsed as PlatformAdminRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  adminRows.value = JSON.parse(JSON.stringify(DEFAULT_PLATFORM_ADMINS)) as PlatformAdminRow[];
}

function persistAdmins(): void {
  writePlatformAdminsJson(JSON.stringify(adminRows.value));
}

const validRoleIdSet = computed(() => new Set(roleRows.value.map((r) => r.id)));

function parseRoleIdsCsv(csv: string): string[] {
  const parts = csv
    .split(/[,，\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (validRoleIdSet.value.has(p)) out.push(p);
  }
  return [...new Set(out)];
}

function roleNamesForAdmin(row: PlatformAdminRow): string {
  const names: string[] = [];
  for (const id of row.roleIds) {
    const r = roleRows.value.find((x) => x.id === id);
    names.push(r ? r.name : id);
  }
  return names.join("、") || "—";
}

function adminPermissionsFor(row: PlatformAdminRow): string[] {
  return mergedPermissionLinesForAdmin(row.roleIds, roleRows.value);
}

const adminModalTitle = computed(() =>
  adminModalMode.value === "edit" ? "编辑管理员" : "新增管理员"
);

const roleModalTitle = computed(() => (roleModalMode.value === "edit" ? "编辑角色" : "新增角色"));

const filteredAdmins = computed(() => {
  let rows = adminRows.value;
  if (adminStatusFilter.value) rows = rows.filter((r) => r.status === adminStatusFilter.value);
  return filterByQuery(rows, adminListFilter.value, (r) =>
    [r.displayName, r.loginId, r.id, roleNamesForAdmin(r), adminPermissionsFor(r).join(" ")].join(" "),
  );
});

const filteredRoles = computed(() =>
  filterByQuery(roleRows.value, roleListFilter.value, (r) =>
    [r.name, r.id, r.description, rolePermissionLines(r).join(" ")].join(" "),
  ),
);

function resetAdminQuery(): void {
  adminStatusFilter.value = "";
}

function roleMemberCount(roleId: string): number {
  return adminRows.value.filter((a) => a.roleIds.includes(roleId)).length;
}

function menuMatrixCellOps(l: NavLeaf): string {
  if (/tai-admin-billing|tai-admin-reports/.test(l.routeName)) return "可改";
  if (/tai-admin-docs|tai-admin-keys|tai-admin-customers|tai-admin-users/.test(l.routeName)) return "可改";
  if (/tai-admin-suppliers|tai-admin-models|tai-admin-ops|tai-admin-access|tai-admin-system/.test(l.routeName))
    return "可改";
  return "可改";
}

function menuMatrixCellFin(l: NavLeaf): string {
  return /tai-admin-billing|tai-admin-reports/.test(l.routeName) ? "只读" : "—";
}

function menuMatrixCellRo(): string {
  return "只读";
}

const menuPreviewRows = computed(() =>
  flattenNavLeaves().map((l) => ({
    routeName: l.routeName,
    label: l.label,
    ops: menuMatrixCellOps(l),
    fin: menuMatrixCellFin(l),
    ro: menuMatrixCellRo(),
  })),
);

const filteredMenuPreview = computed(() =>
  filterByQuery(menuPreviewRows.value, menuSearchQ.value, (r) =>
    [r.label, r.routeName, r.ops, r.fin, r.ro].join(" "),
  ),
);

function adminStatusClass(s: string): string {
  return s === "启用" ? "acc-page__badge acc-page__badge--ok" : "acc-page__badge acc-page__badge--muted";
}

function onAddAdminClick(): void {
  adminModalMode.value = "add";
  adminEditingId.value = null;
  adminFormError.value = "";
  draftAdminName.value = "";
  draftAdminLogin.value = "";
  draftAdminRoleIds.value = "role-ops";
  draftAdminStatus.value = "启用";
  adminModalOpen.value = true;
}

function onEditAdminClick(row: PlatformAdminRow): void {
  adminModalMode.value = "edit";
  adminEditingId.value = row.id;
  adminFormError.value = "";
  draftAdminName.value = row.displayName;
  draftAdminLogin.value = row.loginId;
  draftAdminRoleIds.value = row.roleIds.join(", ");
  draftAdminStatus.value = row.status;
  adminModalOpen.value = true;
}

function closeAdminModal(): void {
  adminModalOpen.value = false;
  adminFormError.value = "";
  adminEditingId.value = null;
}

function saveAdminModal(): void {
  adminFormError.value = "";
  const displayName = draftAdminName.value.trim();
  const loginId = draftAdminLogin.value.trim().toLowerCase().replace(/\s+/g, "");
  const roleIds = parseRoleIdsCsv(draftAdminRoleIds.value);
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");

  if (!displayName) {
    adminFormError.value = "姓名为必填。";
    return;
  }
  if (!loginId) {
    adminFormError.value = "登录名为必填。";
    return;
  }
  if (roleIds.length === 0) {
    adminFormError.value = "请至少绑定一个有效角色 ID（逗号分隔，须与角色表 id 一致）。";
    return;
  }
  if (draftAdminStatus.value !== "启用" && draftAdminStatus.value !== "禁用") {
    adminFormError.value = "状态须为「启用」或「禁用」。";
    return;
  }

  if (adminModalMode.value === "add") {
    if (adminRows.value.some((a) => a.loginId === loginId)) {
      adminFormError.value = "登录名已存在。";
      return;
    }
    adminRows.value.push({
      id: `adm-${Date.now()}`,
      displayName,
      loginId,
      roleIds,
      status: draftAdminStatus.value,
      updatedAt: now,
    });
  } else if (adminEditingId.value) {
    const idx = adminRows.value.findIndex((x) => x.id === adminEditingId.value);
    if (idx < 0) {
      adminFormError.value = "未找到该管理员。";
      return;
    }
    const prev = adminRows.value[idx];
    if (!prev) return;
    if (adminRows.value.some((a) => a.loginId === loginId && a.id !== prev.id)) {
      adminFormError.value = "登录名与其他账号冲突。";
      return;
    }
    adminRows.value[idx] = {
      ...prev,
      displayName,
      loginId,
      roleIds,
      status: draftAdminStatus.value,
      updatedAt: now,
    };
  }
  persistAdmins();
  closeAdminModal();
}

function toggleAdminStatus(row: PlatformAdminRow): void {
  const idx = adminRows.value.findIndex((x) => x.id === row.id);
  if (idx < 0) return;
  const prev = adminRows.value[idx];
  if (!prev) return;
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  adminRows.value[idx] = {
    ...prev,
    status: prev.status === "启用" ? "禁用" : "启用",
    updatedAt: now,
  };
  persistAdmins();
}

function requestDeleteAdmin(row: PlatformAdminRow): void {
  accessDangerKind.value = "delete-admin";
  accessDangerTargetId.value = row.id;
  accessDangerTargetLabel.value = row.displayName;
  accessDangerOpen.value = true;
}

function requestDeleteRole(row: PlatformRoleRow): void {
  const n = roleMemberCount(row.id);
  if (n > 0) {
    infoModalTitle.value = "无法删除";
    infoModalMessage.value = `仍有 ${n} 个管理员绑定角色「${row.name}」，请先在管理员页解绑或改绑后再删除。`;
    infoModalOpen.value = true;
    return;
  }
  accessDangerKind.value = "delete-role";
  accessDangerTargetId.value = row.id;
  accessDangerTargetLabel.value = row.name;
  accessDangerOpen.value = true;
}

function closeAccessDanger(): void {
  accessDangerOpen.value = false;
  accessDangerKind.value = "none";
  accessDangerTargetId.value = null;
  accessDangerTargetLabel.value = "";
}

function executeAccessDanger(): void {
  const id = accessDangerTargetId.value;
  if (!id) {
    closeAccessDanger();
    return;
  }
  if (accessDangerKind.value === "delete-admin") {
    adminRows.value = adminRows.value.filter((x) => x.id !== id);
    persistAdmins();
  } else if (accessDangerKind.value === "delete-role") {
    roleRows.value = roleRows.value.filter((x) => x.id !== id);
    persistRoles();
  }
  closeAccessDanger();
}

function closeInfoModal(): void {
  infoModalOpen.value = false;
  infoModalMessage.value = "";
}

function applyRoleTemplate(tplId: string): void {
  const tpl = READONLY_ROLE_TEMPLATES.find((t) => t.id === tplId);
  if (!tpl) return;
  draftRoleName.value = tpl.name;
  draftRoleDesc.value = tpl.description;
  draftRolePermKeys.value = [...tpl.permissionKeys];
  draftRolePermissions.value = [
    `菜单：${permissionKeysToLines(tpl.permissionKeys).join("、")}`,
    "数据范围：按模板只读（见「数据范围」子页）",
  ].join("\n");
}

function onResetPasswordClick(row: PlatformAdminRow): void {
  resetPwdTarget.value = row;
  draftNewPassword.value = "";
  resetPwdError.value = "";
  resetPwdOpen.value = true;
}

function confirmResetPassword(): void {
  if (draftNewPassword.value.trim().length < 8) {
    resetPwdError.value = "初始密码至少 8 位（原型校验）";
    return;
  }
  infoModalTitle.value = "已重置密码";
  infoModalMessage.value = `已为「${resetPwdTarget.value?.displayName}」生成新密码（原型不落库）；正式环境立即失效旧 JWT。`;
  infoModalOpen.value = true;
  resetPwdOpen.value = false;
}

function onAddRoleClick(): void {
  roleModalMode.value = "add";
  roleEditingId.value = null;
  roleFormError.value = "";
  selectedRoleTemplate.value = "";
  draftRoleId.value = "";
  draftRoleName.value = "";
  draftRoleDesc.value = "";
  draftRolePermKeys.value = [];
  draftRolePermissions.value = "菜单：\n数据范围：";
  roleModalOpen.value = true;
}

function onEditRoleClick(row: PlatformRoleRow): void {
  roleModalMode.value = "edit";
  roleEditingId.value = row.id;
  roleFormError.value = "";
  draftRoleId.value = row.id;
  draftRoleName.value = row.name;
  draftRoleDesc.value = row.description;
  draftRolePermissions.value = rolePermissionLines(row).join("\n");
  roleModalOpen.value = true;
}

function closeRoleModal(): void {
  roleModalOpen.value = false;
  roleFormError.value = "";
  roleEditingId.value = null;
  draftRolePermissions.value = "";
}

function saveRoleModal(): void {
  roleFormError.value = "";
  const name = draftRoleName.value.trim();
  const description = draftRoleDesc.value.trim() || "—";
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const permLines = draftRolePermissions.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const permissionLines = permLines.length > 0 ? permLines : [description];

  if (!name) {
    roleFormError.value = "角色名为必填。";
    return;
  }

  if (roleModalMode.value === "add") {
    let id = draftRoleId.value.trim();
    if (!id) id = `role-${Date.now()}`;
    if (!/^role-[a-zA-Z0-9_-]+$/.test(id)) {
      roleFormError.value = "角色 ID 须形如 role-xxx（字母、数字、下划线、连字符）。";
      return;
    }
    if (roleRows.value.some((r) => r.id === id)) {
      roleFormError.value = "角色 ID 已存在。";
      return;
    }
    roleRows.value.push({
      id,
      name,
      description,
      updatedAt: now,
      permissionLines,
      permissionKeys: [...draftRolePermKeys.value],
    });
  } else if (roleEditingId.value) {
    const idx = roleRows.value.findIndex((x) => x.id === roleEditingId.value);
    if (idx < 0) {
      roleFormError.value = "未找到该角色。";
      return;
    }
    const prev = roleRows.value[idx];
    if (!prev) return;
    roleRows.value[idx] = {
      ...prev,
      name,
      description,
      updatedAt: now,
      permissionLines,
      permissionKeys: [...draftRolePermKeys.value],
    };
  }
  persistRoles();
  closeRoleModal();
}

function onDocKeydown(e: KeyboardEvent): void {
  if (e.key !== "Escape") return;
  if (accessDangerOpen.value) {
    closeAccessDanger();
    e.preventDefault();
    return;
  }
  if (infoModalOpen.value) {
    closeInfoModal();
    e.preventDefault();
    return;
  }
  if (scopeDocModalOpen.value) {
    closeScopeDocModal();
    e.preventDefault();
    return;
  }
  if (adminModalOpen.value) {
    closeAdminModal();
    e.preventDefault();
    return;
  }
  if (roleModalOpen.value) {
    closeRoleModal();
    e.preventDefault();
  }
}

onMounted(() => {
  adminListFilter.value = readAdminListFilter();
  roleListFilter.value = readRoleListFilter();
  loadRoles();
  loadAdmins();
  document.addEventListener("keydown", onDocKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onDocKeydown);
});

watch(adminListFilter, (v) => {
  writeAdminListFilter(v);
});

watch(roleListFilter, (v) => {
  writeRoleListFilter(v);
});

const adminsPg = useAdminTablePagination(filteredAdmins);
const rolesPg = useAdminTablePagination(filteredRoles);
const menuPg = useAdminTablePagination(filteredMenuPreview);
</script>

<template>
  <div class="acc-page">
    <!-- 管理员 -->
    <el-card v-show="panel === 'admins'" shadow="never" class="admin-ep-card acc-page__panel" aria-label="管理员">
      <AdminSectionHead toolbar-only title="管理员">
        <template #annot>
          <AdminInternalTip heading="管理员 · 原型" explain="管理员账号对内说明（原型）">
            <p>启用/MFA 为占位；与员工主数据、SSO 对齐在工程期接入。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="adminListFilter"
            :input-id="`${idPrefix}-acc-adm-search`"
            search-placeholder="姓名、登录名、角色、权限…"
            search-aria-label="搜索管理员"
            @reset="resetAdminQuery"
          >
            <template #filters>
              <el-select v-model="adminStatusFilter" clearable placeholder="状态" style="width: 7rem">
                <el-option label="启用" value="启用" />
                <el-option label="禁用" value="禁用" />
              </el-select>
            </template>
            <template #actions>
              <el-button type="primary" @click="onAddAdminClick">新增管理员</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <el-table :data="adminsPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="loginId" label="登录名" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="acc-page__mono">{{ scope.row.loginId }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="displayName" label="姓名" min-width="96" sortable/>
        <el-table-column label="角色" min-width="128">
          <template #default="scope">
              <template v-if="scope?.row">{{ roleNamesForAdmin(scope.row) }}
              </template>
            </template>
        </el-table-column>
        <el-table-column label="权限（菜单+数据范围·聚合）" min-width="192" class-name="acc-page__th-perm">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="acc-page__perm-cell">
              <ul class="acc-page__perm-list">
                <li v-for="(line, i) in adminPermissionsFor(scope.row)" :key="i">{{ line }}</li>
              </ul>
            </div>
            </template>
            </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <template v-if="scope?.row">
            <span :class="adminStatusClass(scope.row.status)">{{ scope.row.status }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最近登录" width="136" sortable>
          <template #default="scope">
            <template v-if="scope?.row">{{ scope.row.lastLoginAt || "—" }}</template>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新" width="136" sortable/>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions">
              <el-button link type="primary" @click="toggleAdminStatus(scope.row)">
                {{ scope.row.status === "启用" ? "禁用" : "启用" }}
              </el-button>
              <el-button link type="primary" @click="onResetPasswordClick(scope.row)">重置密码</el-button>
              <el-button link type="primary" @click="onEditAdminClick(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="requestDeleteAdmin(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="adminsPg.currentPage"
        v-model:page-size="adminsPg.pageSize"
        :total="adminsPg.total"
      />
      <p class="acc-page__hint">
        数据写入 <code class="acc-page__mono">localStorage</code>（<code class="acc-page__mono">trinity-ai-admin:platform-admins-rows</code>）；「绑定角色」填角色
        <strong>id</strong>，逗号分隔，须与「角色」子页一致。「权限」列为各角色<strong>菜单 + 数据范围</strong>要点合并去重（不含页内按钮）；改要点请在<strong>角色</strong>子页编辑。<strong>删除</strong>经
        弹窗二次确认。
      </p>
    </el-card>

    <!-- 角色 -->
    <el-card v-show="panel === 'roles'" shadow="never" class="admin-ep-card acc-page__panel" aria-label="角色">
      <AdminSectionHead toolbar-only title="角色">
        <template #annot>
          <AdminInternalTip heading="角色 · 原型" explain="角色权限对内说明（原型）">
            <p>预置/自定义角色为 mock；本期菜单粒度授权，按钮级二期（详设 §4.12）。</p>
          </AdminInternalTip>
        </template>
          <template #tools>
          <AdminListQuery
            v-model:search="roleListFilter"
            :input-id="`${idPrefix}-acc-role-search`"
            search-placeholder="角色名、ID、说明、权限…"
            search-aria-label="搜索角色"
          >
            <template #actions>
              <el-button type="primary" @click="onAddRoleClick">新增角色</el-button>
            </template>
          </AdminListQuery>
        </template>
      </AdminSectionHead>
      <p class="acc-page__callout acc-page__callout--roles-help">
        「<strong>说明</strong>」为职责摘要。「<strong>权限要点</strong>」里写<strong>菜单</strong>、<strong>数据范围</strong>等，在表格中点<strong>编辑</strong>打开弹窗修改，保存后写入浏览器
        <code class="acc-page__mono">localStorage</code>（键 <code class="acc-page__mono">trinity-ai-admin:platform-roles-rows</code>），并影响「管理员」页的权限聚合列。<br />
        <el-button link type="primary" class="acc-int__textlink--scope-doc" @click="openScopeDocModal">查看数据范围语义详情</el-button>
        <span class="acc-page__roles-help-note">（只读词典，与菜单路由正交；不在此弹窗里编辑角色数据）</span>
      </p>
      <el-table :data="rolesPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="id" label="角色 ID" min-width="112" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="acc-page__mono">{{ scope.row.id }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="96" sortable/>
        <el-table-column label="绑定人数" width="88">
          <template #default="scope">
              <template v-if="scope?.row">{{ roleMemberCount(scope.row.id) }}
              </template>
            </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="112" sortable/>
        <el-table-column label="权限要点" min-width="192" class-name="acc-page__th-perm">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="acc-page__perm-cell">
              <ul class="acc-page__perm-list">
                <li v-for="(line, i) in rolePermissionLines(scope.row)" :key="i">{{ line }}</li>
              </ul>
            </div>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新" width="136" sortable/>
        <el-table-column label="操作" width="112" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
            <div class="admin-ep-row-actions">
              <el-button link type="primary" @click="onEditRoleClick(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="danger" @click="requestDeleteRole(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
            </template>
            </template>
        </el-table-column>
      </el-table>
      <AdminTablePagination
        v-model:current-page="rolesPg.currentPage"
        v-model:page-size="rolesPg.pageSize"
        :total="rolesPg.total"
      />
      <p class="acc-page__hint">有绑定管理员时不可删角色；<strong>删除</strong>经弹窗二次确认。数据范围释义见上方「查看详情」。</p>
    </el-card>

    <el-card v-show="panel === 'data-scope'" shadow="never" class="admin-ep-card acc-page__panel" aria-label="数据范围">
      <AdminSectionHead title="数据范围">
        <template #desc>workspace / 模块 / 敏感字段查询范围（§4.5.4）</template>
      </AdminSectionHead>
      <div class="acc-scope-doc">
        <div class="acc-page__scope-stack">
          <article v-for="b in DATA_SCOPE_BLOCKS" :key="b.key" class="acc-page__scope-card">
            <h4 class="acc-page__scope-h">{{ b.title }}</h4>
            <p class="acc-page__scope-intro">{{ b.intro }}</p>
          </article>
        </div>
        <p class="acc-page__scope-para">{{ DATA_SCOPE_COMBINE_RULE }}</p>
        <p class="acc-page__scope-para">{{ DATA_SCOPE_ROLE_BINDING_NOTE }}</p>
      </div>
    </el-card>

    <!-- 菜单（路由） -->
    <el-card v-show="panel === 'menus'" shadow="never" class="admin-ep-card acc-page__panel" aria-label="菜单（路由）">
      <AdminSectionHead toolbar-only title="菜单（路由）">
        <template #annot>
          <AdminInternalTip heading="菜单（路由） · 原型" explain="菜单授权对内说明（原型）">
            <p>与侧栏子路由名对齐；勾选状态本地 mock，真实环境从权限服务下发。</p>
          </AdminInternalTip>
        </template>
        <template #tools>
          <AdminListQuery
            v-model:search="menuSearchQ"
            :input-id="`${idPrefix}-acc-menu-q`"
            search-placeholder="侧栏标签、路由 name…"
            search-aria-label="检索菜单路由"
          />
        </template>
      </AdminSectionHead>
      <el-table :data="menuPg.paginatedRows" class="admin-ep-table-wrap">
        <el-table-column prop="label" label="侧栏标签" min-width="128" sortable/>
        <el-table-column prop="routeName" label="路由 name" min-width="176" sortable>
          <template #default="scope">
            <template v-if="scope?.row">
            <span class="acc-page__mono">{{ scope.row.routeName }}</span>
            </template>
            </template>
        </el-table-column>
        <el-table-column prop="ops" label="运营（路由·示意）" width="128" sortable/>
        <el-table-column prop="fin" label="财务只读（路由·示意）" width="144" sortable/>
        <el-table-column prop="ro" label="全局只读（路由）" width="128" sortable/>
      </el-table>
      <AdminTablePagination
        v-model:current-page="menuPg.currentPage"
        v-model:page-size="menuPg.pageSize"
        :total="menuPg.total"
      />
      <p class="acc-page__hint">与「角色」里的菜单要点对照使用；页内按钮级授权二期单独做。</p>
    </el-card>

    <AdminDialog
      v-model="adminModalOpen"
      :title="adminModalTitle"
      head-note="绑定角色请填写角色 id，多个用英文逗号分隔。"
    >
      <el-form label-position="top" class="admin-ep-form acc-int-modal-grid">
        <el-form-item label="姓名">
          <el-input :id="`${idPrefix}-acc-adm-nm`" v-model="draftAdminName" placeholder="员工显示名" />
        </el-form-item>
        <el-form-item label="登录名">
          <el-input
            :id="`${idPrefix}-acc-adm-lg`"
            v-model="draftAdminLogin"
            placeholder="sso 用户名或邮箱前缀"
            :disabled="adminModalMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="绑定角色 id">
          <el-input :id="`${idPrefix}-acc-adm-rl`" v-model="draftAdminRoleIds" placeholder="如 role-ops, role-readonly" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input :id="`${idPrefix}-acc-adm-st`" v-model="draftAdminStatus" placeholder="启用 或 禁用" />
        </el-form-item>
      </el-form>
      <p v-if="adminFormError" class="acc-int-modal-err">{{ adminFormError }}</p>
      <template #footer>
        <el-button @click="closeAdminModal">取消</el-button>
        <el-button type="primary" @click="saveAdminModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="roleModalOpen"
      :title="roleModalTitle"
      width="560px"
      head-note="本期仅维护菜单（路由）与数据范围要点；页内按钮级二期再做。"
    >
      <el-form label-position="top" class="admin-ep-form acc-int-modal-grid">
        <el-form-item label="角色 ID">
          <el-input
            :id="`${idPrefix}-acc-role-id`"
            v-model="draftRoleId"
            placeholder="新增时必填，如 role-audit"
            :disabled="roleModalMode === 'edit'"
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input :id="`${idPrefix}-acc-role-nm`" v-model="draftRoleName" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input :id="`${idPrefix}-acc-role-dc`" v-model="draftRoleDesc" placeholder="职责与数据范围摘要" />
        </el-form-item>
        <el-form-item label="套用只读模板">
          <el-select
            v-model="selectedRoleTemplate"
            clearable
            placeholder="选择模板"
            @change="(v: string) => v && applyRoleTemplate(v)"
          >
            <el-option
              v-for="t in READONLY_ROLE_TEMPLATES"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限点（§6）">
          <el-checkbox-group v-model="draftRolePermKeys">
            <el-checkbox
              v-for="p in ADMIN_PERMISSION_CATALOG"
              :key="p.key"
              :label="p.key"
              style="display: block; margin: 0.15rem 0"
            >
              {{ p.label }} <span class="acc-page__muted">({{ p.group }})</span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="权限要点（每行一条，建议：菜单 / 数据范围）">
          <el-input
            :id="`${idPrefix}-acc-role-perm`"
            v-model="draftRolePermissions"
            type="textarea"
            :rows="4"
            placeholder="第一行写菜单范围，第二行写数据范围；不含页内按钮"
          />
        </el-form-item>
      </el-form>
      <p v-if="roleFormError" class="acc-int-modal-err">{{ roleFormError }}</p>
      <template #footer>
        <el-button @click="closeRoleModal">取消</el-button>
        <el-button type="primary" @click="saveRoleModal">保存</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="accessDangerOpen"
      :title="accessDangerTitle"
      head-note="原型将直接更新 localStorage。"
    >
      <p class="or-keys-editor-banner" role="status">{{ accessDangerMessage }}</p>
      <template #footer>
        <el-button @click="closeAccessDanger">取消</el-button>
        <el-button type="danger" @click="executeAccessDanger">确认删除</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="infoModalOpen" :title="infoModalTitle">
      <p class="or-keys-editor-banner" role="status">{{ infoModalMessage }}</p>
      <template #footer>
        <el-button type="primary" @click="closeInfoModal">知道了</el-button>
      </template>
    </AdminDialog>

    <AdminDialog v-model="resetPwdOpen" title="重置密码" width="400px">
      <p>为「{{ resetPwdTarget?.displayName }}」设置新初始密码（§4.5.1）。</p>
      <el-input v-model="draftNewPassword" type="password" show-password placeholder="至少 8 位" />
      <p v-if="resetPwdError" class="acc-int-modal-err">{{ resetPwdError }}</p>
      <template #footer>
        <el-button @click="resetPwdOpen = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">确认重置</el-button>
      </template>
    </AdminDialog>

    <AdminDialog
      v-model="scopeDocModalOpen"
      title="数据范围语义说明"
      width="720px"
      head-note="只读词典。各角色的实际范围请在「权限要点」中编辑，保存到 trinity-ai-admin:platform-roles-rows。"
    >
      <div class="acc-scope-doc">
        <p class="acc-page__callout" style="margin-top: 0">
          与<strong>菜单（路由）</strong>正交：能进某页不代表能看到全站数据；下列为 §4.12 / §3 语义定义，供「数据范围：」一行对照。
        </p>

        <h3 class="acc-page__subcap">核心枚举（列表与检索默认语义）</h3>
        <div class="acc-page__scope-stack">
          <article v-for="b in DATA_SCOPE_BLOCKS" :key="b.key" class="acc-page__scope-card">
            <h4 class="acc-page__scope-h">{{ b.title }}</h4>
            <p class="acc-page__scope-intro">{{ b.intro }}</p>
            <ul class="acc-page__scope-ul">
              <li v-for="(line, i) in b.bullets" :key="i">{{ line }}</li>
            </ul>
            <p class="acc-page__scope-meta"><span class="acc-page__scope-k">列表行为</span>{{ b.listBehavior }}</p>
            <p class="acc-page__scope-meta"><span class="acc-page__scope-k">典型角色</span>{{ b.typicalRoles }}</p>
          </article>
        </div>

        <h3 class="acc-page__subcap">其它常见切片（延伸说明）</h3>
        <p class="acc-page__hint" style="margin-top: 0; margin-bottom: 0.5rem">
          下列来自 §3 角色表常见组合；可在角色「权限要点」中写清；二期可做下拉枚举并与组织/标签服务绑定。
        </p>
        <dl class="acc-page__dl acc-page__dl--scope-ext">
          <template v-for="row in DATA_SCOPE_EXTENDED_SLICES" :key="row.key">
            <dt class="acc-page__dt">{{ row.title }}</dt>
            <dd class="acc-page__dd">{{ row.body }}</dd>
          </template>
        </dl>

        <h3 class="acc-page__subcap">多角色时的合并（示意）</h3>
        <p class="acc-page__scope-para">{{ DATA_SCOPE_COMBINE_RULE }}</p>

        <h3 class="acc-page__subcap">与「角色」配置的关系</h3>
        <p class="acc-page__scope-para">{{ DATA_SCOPE_ROLE_BINDING_NOTE }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="closeScopeDocModal">关闭</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
