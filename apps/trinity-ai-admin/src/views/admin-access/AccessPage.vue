<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ModalPanel, TButton, TSearchForm1Fixed, TTextField1Labeled } from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
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
  setAccessModalBodyLock,
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
const roleListFilter = ref("");
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
  const q = adminListFilter.value.trim().toLowerCase();
  let rows = adminRows.value;
  if (!q) return rows;
  return rows.filter((r) => {
    const permQ = adminPermissionsFor(r).join(" ").toLowerCase();
    return (
      r.displayName.toLowerCase().includes(q) ||
      r.loginId.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      roleNamesForAdmin(r).toLowerCase().includes(q) ||
      permQ.includes(q)
    );
  });
});

const filteredRoles = computed(() => {
  const q = roleListFilter.value.trim().toLowerCase();
  let rows = roleRows.value;
  if (!q) return rows;
  return rows.filter((r) => {
    const permBlob = rolePermissionLines(r).join(" ").toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      permBlob.includes(q)
    );
  });
});

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
  }))
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

function onAddRoleClick(): void {
  roleModalMode.value = "add";
  roleEditingId.value = null;
  roleFormError.value = "";
  draftRoleId.value = "";
  draftRoleName.value = "";
  draftRoleDesc.value = "";
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
    roleRows.value.push({ id, name, description, updatedAt: now, permissionLines });
  } else if (roleEditingId.value) {
    const idx = roleRows.value.findIndex((x) => x.id === roleEditingId.value);
    if (idx < 0) {
      roleFormError.value = "未找到该角色。";
      return;
    }
    const prev = roleRows.value[idx];
    if (!prev) return;
    roleRows.value[idx] = { ...prev, name, description, updatedAt: now, permissionLines };
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
  setAccessModalBodyLock(false);
});

watch(adminListFilter, (v) => {
  writeAdminListFilter(v);
});

watch(roleListFilter, (v) => {
  writeRoleListFilter(v);
});

watchEffect(() => {
  setAccessModalBodyLock(
    adminModalOpen.value ||
      roleModalOpen.value ||
      accessDangerOpen.value ||
      infoModalOpen.value ||
      scopeDocModalOpen.value
  );
});
</script>

<template>
  <div class="acc-page">
    <!-- 管理员 -->
    <section v-show="panel === 'admins'" class="acc-page__panel" aria-label="管理员">
      <AdminSectionHead title="管理员">
        <template #annot>
          <AdminInternalTip heading="管理员 · 原型" explain="管理员账号对内说明（原型）">
            <p>启用/MFA 为占位；与员工主数据、SSO 对齐在工程期接入。</p>
          </AdminInternalTip>
        </template>
        <template #desc>平台员工账号、绑定角色与权限聚合（<strong>§4.12</strong>，mock）。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="adminListFilter"
            :input-id="`${idPrefix}-acc-adm-search`"
            placeholder="按姓名、登录名、角色、权限要点…"
            width="17.5rem"
            aria-label="搜索管理员"
          />
          <TButton variant="gradient" type="button" @click="onAddAdminClick">新增管理员</TButton>
        </template>
      </AdminSectionHead>
      <div class="acc-page__table-wrap">
        <table class="acc-page__table">
          <thead>
            <tr>
              <th>登录名</th>
              <th>姓名</th>
              <th>角色</th>
              <th class="acc-page__th-perm">权限（菜单+数据范围·聚合）</th>
              <th>状态</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredAdmins" :key="r.id">
              <td class="acc-page__mono">{{ r.loginId }}</td>
              <td>{{ r.displayName }}</td>
              <td>{{ roleNamesForAdmin(r) }}</td>
              <td class="acc-page__perm-cell">
                <ul class="acc-page__perm-list">
                  <li v-for="(line, i) in adminPermissionsFor(r)" :key="i">{{ line }}</li>
                </ul>
              </td>
              <td><span :class="adminStatusClass(r.status)">{{ r.status }}</span></td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="acc-int__textlink" @click="toggleAdminStatus(r)">
                  {{ r.status === "启用" ? "禁用" : "启用" }}
                </button>
                <button type="button" class="acc-int__textlink" @click="onEditAdminClick(r)">编辑</button>
                <button type="button" class="acc-int__textlink acc-int__textlink--danger" @click="requestDeleteAdmin(r)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="acc-page__hint">
        数据写入 <code class="acc-page__mono">localStorage</code>（<code class="acc-page__mono">trinity-ai-admin:platform-admins-rows</code>）；「绑定角色」填角色
        <strong>id</strong>，逗号分隔，须与「角色」子页一致。「权限」列为各角色<strong>菜单 + 数据范围</strong>要点合并去重（不含页内按钮）；改要点请在<strong>角色</strong>子页编辑。<strong>删除</strong>经
        <strong>ModalPanel</strong> 二次确认。
      </p>
    </section>

    <!-- 角色 -->
    <section v-show="panel === 'roles'" class="acc-page__panel" aria-label="角色">
      <AdminSectionHead title="角色">
        <template #annot>
          <AdminInternalTip heading="角色 · 原型" explain="角色权限对内说明（原型）">
            <p>预置/自定义角色为 mock；本期菜单粒度授权，按钮级二期（详设 §4.12）。</p>
          </AdminInternalTip>
        </template>
        <template #desc>角色职责与权限要点；表格内编辑写 <code class="acc-page__mono">localStorage</code>。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="roleListFilter"
            :input-id="`${idPrefix}-acc-role-search`"
            placeholder="按角色名、ID、说明、权限要点…"
            width="17.5rem"
            aria-label="搜索角色"
          />
          <TButton variant="gradient" type="button" @click="onAddRoleClick">新增角色</TButton>
        </template>
      </AdminSectionHead>
      <p class="acc-page__callout acc-page__callout--roles-help">
        「<strong>说明</strong>」为职责摘要。「<strong>权限要点</strong>」里写<strong>菜单</strong>、<strong>数据范围</strong>等，在表格中点<strong>编辑</strong>打开弹窗修改，保存后写入浏览器
        <code class="acc-page__mono">localStorage</code>（键 <code class="acc-page__mono">trinity-ai-admin:platform-roles-rows</code>），并影响「管理员」页的权限聚合列。<br />
        <button type="button" class="acc-int__textlink acc-int__textlink--scope-doc" @click="openScopeDocModal">
          查看数据范围语义详情
        </button>
        <span class="acc-page__roles-help-note">（只读词典，与菜单路由正交；不在此弹窗里编辑角色数据）</span>
      </p>
      <div class="acc-page__table-wrap">
        <table class="acc-page__table">
          <thead>
            <tr>
              <th>角色 ID</th>
              <th>名称</th>
              <th>绑定人数</th>
              <th>说明</th>
              <th class="acc-page__th-perm">权限要点</th>
              <th>更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredRoles" :key="r.id">
              <td class="acc-page__mono">{{ r.id }}</td>
              <td>{{ r.name }}</td>
              <td>{{ roleMemberCount(r.id) }}</td>
              <td>{{ r.description }}</td>
              <td class="acc-page__perm-cell">
                <ul class="acc-page__perm-list">
                  <li v-for="(line, i) in rolePermissionLines(r)" :key="i">{{ line }}</li>
                </ul>
              </td>
              <td>{{ r.updatedAt }}</td>
              <td>
                <button type="button" class="acc-int__textlink" @click="onEditRoleClick(r)">编辑</button>
                <button type="button" class="acc-int__textlink acc-int__textlink--danger" @click="requestDeleteRole(r)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="acc-page__hint">
        有绑定管理员时不可删角色；<strong>删除</strong>经 <strong>ModalPanel</strong> 二次确认。数据范围释义见上方「查看详情」。
      </p>
    </section>

    <!-- 菜单（路由） -->
    <section v-show="panel === 'menus'" class="acc-page__panel" aria-label="菜单（路由）">
      <AdminSectionHead title="菜单（路由）">
        <template #annot>
          <AdminInternalTip heading="菜单（路由） · 原型" explain="菜单授权对内说明（原型）">
            <p>与侧栏子路由名对齐；勾选状态本地 mock，真实环境从权限服务下发。</p>
          </AdminInternalTip>
        </template>
        <template #desc>
          只读预览：由 <code class="acc-page__mono">ADMIN_NAV_TREE</code> 扁平化；各角色路由级可见/可改示意，不含页内按钮（mock）。
        </template>
      </AdminSectionHead>
      <div class="acc-page__table-wrap">
        <table class="acc-page__table">
          <thead>
            <tr>
              <th>侧栏标签</th>
              <th>路由 name</th>
              <th>运营（路由·示意）</th>
              <th>财务只读（路由·示意）</th>
              <th>全局只读（路由）</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in menuPreviewRows" :key="row.routeName">
              <td>{{ row.label }}</td>
              <td class="acc-page__mono">{{ row.routeName }}</td>
              <td>{{ row.ops }}</td>
              <td>{{ row.fin }}</td>
              <td>{{ row.ro }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="acc-page__hint">与「角色」里的菜单要点对照使用；页内按钮级授权二期单独做。</p>
    </section>

    <Teleport to="body">
      <div
        v-show="adminModalOpen"
        class="or-modal-root acc-int-modal-host"
        role="presentation"
        :aria-hidden="!adminModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeAdminModal" />
        <ModalPanel
          :title="adminModalTitle"
          :title-id="`${idPrefix}-acc-adm-title`"
          head-note="绑定角色请填写角色 id，多个用英文逗号分隔。"
          close-label="关闭"
          @close="closeAdminModal"
        >
          <div class="acc-int-modal-grid">
            <TTextField1Labeled
              v-model="draftAdminName"
              label="姓名"
              :input-id="`${idPrefix}-acc-adm-nm`"
              placeholder="员工显示名"
            />
            <TTextField1Labeled
              v-model="draftAdminLogin"
              label="登录名"
              :input-id="`${idPrefix}-acc-adm-lg`"
              :disabled="adminModalMode === 'edit'"
              placeholder="sso 用户名或邮箱前缀"
            />
            <TTextField1Labeled
              v-model="draftAdminRoleIds"
              label="绑定角色 id"
              :input-id="`${idPrefix}-acc-adm-rl`"
              placeholder="如 role-ops, role-readonly"
            />
            <TTextField1Labeled
              v-model="draftAdminStatus"
              label="状态"
              :input-id="`${idPrefix}-acc-adm-st`"
              placeholder="启用 或 禁用"
            />
          </div>
          <p v-if="adminFormError" class="acc-int-modal-err">{{ adminFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeAdminModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveAdminModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="roleModalOpen"
        class="or-modal-root acc-int-modal-host"
        role="presentation"
        :aria-hidden="!roleModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeRoleModal" />
        <ModalPanel
          :title="roleModalTitle"
          :title-id="`${idPrefix}-acc-role-title`"
          head-note="本期仅维护菜单（路由）与数据范围要点；页内按钮级二期再做。"
          close-label="关闭"
          @close="closeRoleModal"
        >
          <div class="acc-int-modal-grid">
            <TTextField1Labeled
              v-model="draftRoleId"
              label="角色 ID"
              :input-id="`${idPrefix}-acc-role-id`"
              :disabled="roleModalMode === 'edit'"
              placeholder="新增时必填，如 role-audit"
            />
            <TTextField1Labeled v-model="draftRoleName" label="名称" :input-id="`${idPrefix}-acc-role-nm`" />
            <TTextField1Labeled
              v-model="draftRoleDesc"
              label="说明"
              :input-id="`${idPrefix}-acc-role-dc`"
              placeholder="职责与数据范围摘要"
            />
            <div class="form-group">
              <label :for="`${idPrefix}-acc-role-perm`">权限要点（每行一条，建议：菜单 / 数据范围）</label>
              <textarea
                :id="`${idPrefix}-acc-role-perm`"
                v-model="draftRolePermissions"
                rows="6"
                placeholder="第一行写菜单范围，第二行写数据范围；不含页内按钮"
              />
            </div>
          </div>
          <p v-if="roleFormError" class="acc-int-modal-err">{{ roleFormError }}</p>
          <template #actions>
            <TButton type="button" @click="closeRoleModal">取消</TButton>
            <TButton variant="gradient" type="button" @click="saveRoleModal">保存</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="accessDangerOpen"
        class="or-modal-root acc-int-modal-host"
        role="presentation"
        :aria-hidden="!accessDangerOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeAccessDanger" />
        <ModalPanel
          :title="accessDangerTitle"
          :title-id="`${idPrefix}-acc-dg-title`"
          head-note="原型将直接更新 localStorage。"
          close-label="关闭"
          @close="closeAccessDanger"
        >
          <p class="or-keys-editor-banner" role="status">{{ accessDangerMessage }}</p>
          <template #actions>
            <TButton type="button" @click="closeAccessDanger">取消</TButton>
            <TButton variant="gradient" type="button" @click="executeAccessDanger">确认删除</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="infoModalOpen"
        class="or-modal-root acc-int-modal-host"
        role="presentation"
        :aria-hidden="!infoModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeInfoModal" />
        <ModalPanel
          :title="infoModalTitle"
          :title-id="`${idPrefix}-acc-info-title`"
          close-label="关闭"
          @close="closeInfoModal"
        >
          <p class="or-keys-editor-banner" role="status">{{ infoModalMessage }}</p>
          <template #actions>
            <TButton variant="gradient" type="button" @click="closeInfoModal">知道了</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="scopeDocModalOpen"
        class="or-modal-root acc-int-modal-host acc-scope-doc-host"
        role="presentation"
        :aria-hidden="!scopeDocModalOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeScopeDocModal" />
        <ModalPanel
          title="数据范围语义说明"
          :title-id="`${idPrefix}-acc-scope-doc-title`"
          head-note="只读词典。各角色的实际范围请在「权限要点」中编辑，保存到 trinity-ai-admin:platform-roles-rows。"
          close-label="关闭"
          @close="closeScopeDocModal"
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
          <template #actions>
            <TButton variant="gradient" type="button" @click="closeScopeDocModal">关闭</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
