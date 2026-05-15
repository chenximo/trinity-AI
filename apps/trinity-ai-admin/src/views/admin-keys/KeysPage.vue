<script setup lang="ts">
import { computed, onMounted, ref, useId, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import {
  FilterForm2PillListbox,
  type FilterForm2ListboxItem,
  ModalPanel,
  TButton,
  TSearchForm1Fixed,
  TTextField1Labeled,
} from "@trinity/ui";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import "./keys.css";
import {
  DEFAULT_KEY_AUDIT_ROWS,
  DEFAULT_PLATFORM_KEYS,
  KEY_PANEL_ORDER,
  type KeyAuditRow,
  type KeyPanelId,
  type PlatformKeyRow,
} from "./mock";
import {
  readKeyAuditJson,
  readKeysFilterOrg,
  readKeysRowsJson,
  readKeysSearchQ,
  setKeysModalBodyLock,
  writeKeyAuditJson,
  writeKeysFilterOrg,
  writeKeysRowsJson,
  writeKeysSearchQ,
} from "./keysInteractions";

const route = useRoute();
const idPrefix = useId().replace(/:/g, "");

const panel = computed<KeyPanelId>(() => {
  const id = route.meta.stubSecondaryId as string | undefined;
  if (id && KEY_PANEL_ORDER.includes(id as KeyPanelId)) return id as KeyPanelId;
  return "list";
});

const keyRows = ref<PlatformKeyRow[]>([]);
const auditRows = ref<KeyAuditRow[]>([]);
const searchQ = ref("");
const filterOrg = ref("");
const orgFilterOpen = ref(false);
const detailCardOpen = ref(false);
const detailCardKeyId = ref("");

const dangerOpen = ref(false);
const dangerKind = ref<"none" | "freeze" | "unfreeze" | "revoke">("none");
const dangerTargetId = ref<string | null>(null);
const dangerTargetLabel = ref("");
const draftDangerNote = ref("");

const dangerTitle = computed(() => {
  if (dangerKind.value === "freeze") return "确认冻结密钥";
  if (dangerKind.value === "unfreeze") return "确认解冻密钥";
  if (dangerKind.value === "revoke") return "确认吊销密钥";
  return "确认操作";
});

const dangerMessage = computed(() => {
  const label = dangerTargetLabel.value;
  const note = draftDangerNote.value.trim();
  const tail = note ? ` 备注：${note}` : "";
  if (dangerKind.value === "freeze") {
    return `冻结后网关将拒绝该密钥调用；同步延迟约数十秒（产品提示）。密钥：${label}。${tail}`;
  }
  if (dangerKind.value === "unfreeze") {
    return `恢复为「正常」状态。密钥：${label}。${tail}`;
  }
  if (dangerKind.value === "revoke") {
    return `吊销不可恢复（原型状态机示意）。密钥：${label}。${tail}`;
  }
  return "";
});

const uniqueOrgs = computed(() => {
  const m = new Map<string, string>();
  for (const r of keyRows.value) m.set(r.orgId, r.orgName);
  return [...m.entries()].map(([id, name]) => ({ id, name }));
});

const orgListboxItems = computed<FilterForm2ListboxItem[]>(() => {
  const v = filterOrg.value;
  return [
    { label: "全部组织", checked: v === "" },
    ...uniqueOrgs.value.map((o) => ({
      label: o.name,
      checked: v === o.id,
    })),
  ];
});

const orgPillLabel = computed(() => {
  if (!filterOrg.value) return "客户组织";
  return uniqueOrgs.value.find((o) => o.id === filterOrg.value)?.name ?? "客户组织";
});

function onOrgListboxSelect(i: number): void {
  if (i === 0) {
    filterOrg.value = "";
    return;
  }
  const org = uniqueOrgs.value[i - 1];
  filterOrg.value = org?.id ?? "";
}

const detailRow = computed(
  () => keyRows.value.find((r) => r.id === detailCardKeyId.value) ?? null
);

const filteredKeys = computed(() => {
  const q = searchQ.value.trim().toLowerCase();
  const org = filterOrg.value.trim();
  let rows = keyRows.value;
  if (org) rows = rows.filter((r) => r.orgId === org);
  if (!q) return rows;
  return rows.filter((r) => {
    const tagStr = r.tags.join(" ").toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.displayName.toLowerCase().includes(q) ||
      r.fingerprintPrefix.toLowerCase().includes(q) ||
      r.orgName.toLowerCase().includes(q) ||
      r.projectName.toLowerCase().includes(q) ||
      r.creatorLogin.toLowerCase().includes(q) ||
      tagStr.includes(q)
    );
  });
});

function statusBadgeClass(s: PlatformKeyRow["status"]): string {
  if (s === "正常") return "key-page__badge key-page__badge--ok";
  if (s === "已冻结") return "key-page__badge key-page__badge--warn";
  if (s === "已吊销") return "key-page__badge key-page__badge--danger";
  return "key-page__badge key-page__badge--muted";
}

function loadKeys(): void {
  const raw = readKeysRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        keyRows.value = parsed as PlatformKeyRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  keyRows.value = JSON.parse(JSON.stringify(DEFAULT_PLATFORM_KEYS)) as PlatformKeyRow[];
}

function persistKeys(): void {
  writeKeysRowsJson(JSON.stringify(keyRows.value));
}

function loadAudit(): void {
  const raw = readKeyAuditJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        auditRows.value = parsed as KeyAuditRow[];
        return;
      }
    } catch {
      /* default */
    }
  }
  auditRows.value = JSON.parse(JSON.stringify(DEFAULT_KEY_AUDIT_ROWS)) as KeyAuditRow[];
}

function persistAudit(): void {
  writeKeyAuditJson(JSON.stringify(auditRows.value));
}

function appendAudit(entry: Omit<KeyAuditRow, "id"> & { id?: string }): void {
  const id = entry.id ?? `ka-${Date.now()}`;
  auditRows.value = [{ ...entry, id }, ...auditRows.value];
  persistAudit();
}

function loadFilters(): void {
  searchQ.value = readKeysSearchQ();
  filterOrg.value = readKeysFilterOrg();
}

onMounted(() => {
  loadKeys();
  loadAudit();
  loadFilters();
});

watch(searchQ, (v) => writeKeysSearchQ(v));
watch(filterOrg, (v) => writeKeysFilterOrg(v));

function openDetailCard(row: PlatformKeyRow): void {
  detailCardKeyId.value = row.id;
  detailCardOpen.value = true;
}

function closeDetailCard(): void {
  detailCardOpen.value = false;
}

function openDanger(kind: "freeze" | "unfreeze" | "revoke", row: PlatformKeyRow): void {
  dangerKind.value = kind;
  dangerTargetId.value = row.id;
  dangerTargetLabel.value = `${row.displayName}（${row.id}）`;
  draftDangerNote.value = "";
  dangerOpen.value = true;
}

function closeDanger(): void {
  dangerOpen.value = false;
  dangerKind.value = "none";
  dangerTargetId.value = null;
  dangerTargetLabel.value = "";
  draftDangerNote.value = "";
}

function executeDanger(): void {
  const id = dangerTargetId.value;
  const kind = dangerKind.value;
  if (!id || kind === "none") {
    closeDanger();
    return;
  }
  const row = keyRows.value.find((r) => r.id === id);
  if (!row) {
    closeDanger();
    return;
  }
  const note = draftDangerNote.value.trim();
  const detailSuffix = note ? `；${note}` : "";
  if (kind === "freeze") {
    row.status = "已冻结";
    appendAudit({
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "ops-demo",
      keyId: row.id,
      keyLabel: row.displayName,
      action: "冻结",
      detail: `原因码（示意）RISK_OPS${detailSuffix}`,
    });
  } else if (kind === "unfreeze") {
    row.status = "正常";
    appendAudit({
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "ops-demo",
      keyId: row.id,
      keyLabel: row.displayName,
      action: "解冻",
      detail: `人工解冻${detailSuffix}`,
    });
  } else if (kind === "revoke") {
    row.status = "已吊销";
    appendAudit({
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
      actor: "ops-demo",
      keyId: row.id,
      keyLabel: row.displayName,
      action: "吊销",
      detail: `吊销后不可再用${detailSuffix}`,
    });
  }
  persistKeys();
  closeDanger();
}

function onExportAuditClick(): void {
  appendAudit({
    at: new Date().toISOString().slice(0, 16).replace("T", " "),
    actor: "ops-demo",
    keyId: "—",
    keyLabel: "—",
    action: "导出审计",
    detail: "导出 CSV（示意）；正式版走审批与双人复核（§4.13）",
  });
}

function onViewDetailAudit(): void {
  const row = detailRow.value;
  if (!row) return;
  appendAudit({
    at: new Date().toISOString().slice(0, 16).replace("T", " "),
    actor: "ops-demo",
    keyId: row.id,
    keyLabel: row.displayName,
    action: "检索查看",
    detail: "列表页查看绑定客户与最近调用摘要（脱敏）",
  });
}

watchEffect(() => {
  setKeysModalBodyLock(dangerOpen.value || detailCardOpen.value);
});
</script>

<template>
  <div class="key-page">
    <!-- API 列表 -->
    <section v-show="panel === 'list'" class="key-page__panel" aria-label="API 列表">
      <AdminSectionHead title="API 列表">
        <template #annot>
          <AdminInternalTip heading="API 列表 · 原型" explain="API 列表页对内说明（原型）">
            <p>
              列表为<strong>平台运营视角</strong>：指纹、最近调用等为脱敏/mock；行内冻结/吊销会写入本地 mock 与「审计轨迹」。与门户侧用户自助密钥形态可能不一致。
            </p>
          </AdminInternalTip>
        </template>
        <template #desc>集中检索、按组织筛选；详情/冻结/吊销（<strong>§4.8</strong>，mock）。</template>
        <template #tools>
          <TSearchForm1Fixed
            v-model="searchQ"
            :input-id="`${idPrefix}-key-search`"
            placeholder="指纹前缀、名称、客户、项目、创建人、标签…"
            width="18rem"
            aria-label="检索 API 密钥"
          />
          <FilterForm2PillListbox
            v-model:open="orgFilterOpen"
            managed-panel
            :wrap-id="`${idPrefix}-key-org-wrap`"
            :btn-id="`${idPrefix}-key-org-btn`"
            :panel-id="`${idPrefix}-key-org-panel`"
            :label-span-id="`${idPrefix}-key-org-lbl`"
            listbox-aria-label="按客户组织筛选"
            panel-align="end"
            :items="orgListboxItems"
            @select="onOrgListboxSelect"
          >
            {{ orgPillLabel }}
          </FilterForm2PillListbox>
        </template>
      </AdminSectionHead>
      <div class="key-page__table-wrap">
        <table class="key-page__table">
          <thead>
            <tr>
              <th>密钥名</th>
              <th>指纹（脱敏）</th>
              <th>客户 / 项目</th>
              <th>创建人</th>
              <th>状态</th>
              <th>最近调用</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredKeys" :key="r.id">
              <td>{{ r.displayName }}</td>
              <td class="key-page__mono">{{ r.fingerprintPrefix }}</td>
              <td>
                {{ r.orgName }}
                <br />
                <span class="key-page__mono key-page__muted">{{ r.projectName }}</span>
              </td>
              <td class="key-page__mono">{{ r.creatorLogin }}</td>
              <td><span :class="statusBadgeClass(r.status)">{{ r.status }}</span></td>
              <td>
                {{ r.lastCallAt }}
                <br />
                <span class="key-page__muted" style="font-size: 0.6875rem">{{ r.lastCallModel }} · {{ r.lastRegion }}</span>
              </td>
              <td>
                <div class="key-page__ops" @click.stop>
                  <button type="button" class="key-int__textlink" @click="openDetailCard(r)">查看详情</button>
                  <button
                    v-if="r.status === '正常'"
                    type="button"
                    class="key-int__textlink"
                    @click="openDanger('freeze', r)"
                  >
                    冻结
                  </button>
                  <button
                    v-if="r.status === '已冻结'"
                    type="button"
                    class="key-int__textlink"
                    @click="openDanger('unfreeze', r)"
                  >
                    解冻
                  </button>
                  <button
                    v-if="r.status !== '已吊销'"
                    type="button"
                    class="key-int__textlink key-int__textlink--danger"
                    @click="openDanger('revoke', r)"
                  >
                    吊销
                  </button>
                  <span v-if="r.status === '已吊销'" class="key-page__muted" style="font-size: 0.6875rem; color: var(--muted-2)">已终态</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="key-page__hint">
        操作列「查看详情」以卡片弹层展示（脱敏）。状态：<strong>正常</strong> ⇄ <strong>已冻结</strong>；<strong>吊销</strong>为终态。
      </p>
    </section>

    <!-- 审计轨迹 -->
    <section v-show="panel === 'audit'" class="key-page__panel" aria-label="审计轨迹">
      <AdminSectionHead title="审计轨迹">
        <template #annot>
          <AdminInternalTip heading="审计轨迹 · 原型" explain="密钥审计页对内说明（原型）">
            <p>
              导出为示意 CSV；保留周期与合规要求见 <strong>§4.13</strong>。本表由前端追加行，非真实审计仓。
            </p>
          </AdminInternalTip>
        </template>
        <template #desc>密钥相关操作留痕与导出（mock）。</template>
        <template #tools>
          <TButton variant="outline" type="button" @click="onExportAuditClick">导出审计 CSV（示意）</TButton>
        </template>
      </AdminSectionHead>
      <div class="key-page__table-wrap">
        <table class="key-page__table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作人</th>
              <th>动作</th>
              <th>密钥</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in auditRows" :key="a.id">
              <td class="key-page__mono">{{ a.at }}</td>
              <td class="key-page__mono">{{ a.actor }}</td>
              <td>{{ a.action }}</td>
              <td>{{ a.keyLabel }}<br /><span class="key-page__mono key-page__muted">{{ a.keyId }}</span></td>
              <td>{{ a.detail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="key-page__hint">合规导出与保留周期见 <strong>§4.13</strong>；本表为前端追加示意。</p>
    </section>

    <Teleport to="body">
      <div
        v-show="detailCardOpen"
        class="or-modal-root key-int-modal-host"
        role="presentation"
        :aria-hidden="!detailCardOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeDetailCard" />
        <ModalPanel
          v-if="detailRow"
          :title="detailRow.displayName"
          :title-id="`${idPrefix}-key-detail-title`"
          head-note="完整密钥串不可常驻展示；明文仅在强审批下短时开放（若政策允许）。"
          close-label="关闭"
          @close="closeDetailCard"
        >
          <template #headTrail>
            <AdminInternalTip heading="详情弹层 · 对内" explain="密钥详情 Modal 顶栏对内说明（原型）">
              <p>
                顶栏<strong>下</strong>灰字为对用户可见提示；本 ⓘ 为<strong>对内标注</strong>（对齐 <code>#ds-internal-tip</code>）。字段为原型占位，工程期与网关/计费对账。
              </p>
            </AdminInternalTip>
          </template>
          <div class="key-page__detail-grid">
            <div>
              <div class="key-page__detail-k">密钥 ID</div>
              <p class="key-page__detail-v key-page__mono">{{ detailRow.id }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">显示名</div>
              <p class="key-page__detail-v">{{ detailRow.displayName }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">指纹（脱敏）</div>
              <p class="key-page__detail-v key-page__mono">{{ detailRow.fingerprintPrefix }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">状态</div>
              <p class="key-page__detail-v">
                <span :class="statusBadgeClass(detailRow.status)">{{ detailRow.status }}</span>
              </p>
            </div>
            <div>
              <div class="key-page__detail-k">客户组织</div>
              <p class="key-page__detail-v">{{ detailRow.orgName }}（{{ detailRow.orgId }}）</p>
            </div>
            <div>
              <div class="key-page__detail-k">项目</div>
              <p class="key-page__detail-v">{{ detailRow.projectName }}（{{ detailRow.projectId }}）</p>
            </div>
            <div>
              <div class="key-page__detail-k">创建人</div>
              <p class="key-page__detail-v key-page__mono">{{ detailRow.creatorLogin }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">创建时间</div>
              <p class="key-page__detail-v">{{ detailRow.createdAt }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">最近调用</div>
              <p class="key-page__detail-v">{{ detailRow.lastCallAt }} · {{ detailRow.lastCallModel }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">最近地域</div>
              <p class="key-page__detail-v">{{ detailRow.lastRegion }}</p>
            </div>
            <div>
              <div class="key-page__detail-k">标签</div>
              <p class="key-page__detail-v">{{ detailRow.tags.join("、") || "—" }}</p>
            </div>
          </div>
          <template #actions>
            <TButton type="button" @click="closeDetailCard">关闭</TButton>
            <TButton variant="outline" type="button" @click="onViewDetailAudit">记录查看审计（示意）</TButton>
            <TButton variant="gradient" type="button" disabled>申请明文查看（占位）</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-show="dangerOpen"
        class="or-modal-root key-int-modal-host"
        role="presentation"
        :aria-hidden="!dangerOpen"
      >
        <div class="or-modal-backdrop" tabindex="-1" aria-hidden="true" @click="closeDanger" />
        <ModalPanel
          :title="dangerTitle"
          :title-id="`${idPrefix}-key-danger-title`"
          head-note="危险操作二次确认；原型直接写 localStorage 并追加审计。"
          close-label="关闭"
          @close="closeDanger"
        >
          <template #headTrail>
            <AdminInternalTip heading="危险操作 · 对内" explain="冻结吊销确认 Modal 对内说明（原型）">
              <p>
                与 <code>head-note</code> 分工：<strong>head-note</strong> 给用户短提示；本 ⓘ 说明原型写库与审计追加逻辑，上线前可随 <code>data-trinity-internal-annotation</code> 剥离。
              </p>
            </AdminInternalTip>
          </template>
          <p class="or-keys-editor-banner" role="status">{{ dangerMessage }}</p>
          <TTextField1Labeled
            v-model="draftDangerNote"
            label="原因 / 备注（可选）"
            :input-id="`${idPrefix}-key-danger-note`"
            placeholder="如：客户工单号、风控单号"
          />
          <template #actions>
            <TButton type="button" @click="closeDanger">取消</TButton>
            <button
              v-if="dangerKind === 'revoke' || dangerKind === 'freeze'"
              type="button"
              class="key-page__btn-danger"
              @click="executeDanger"
            >
              {{ dangerKind === "revoke" ? "确认吊销" : "确认冻结" }}
            </button>
            <TButton v-else variant="gradient" type="button" @click="executeDanger">确认解冻</TButton>
          </template>
        </ModalPanel>
      </div>
    </Teleport>
  </div>
</template>
