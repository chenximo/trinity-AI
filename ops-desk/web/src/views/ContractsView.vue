<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Delete,
  Document,
  Download,
  Plus,
  Refresh,
  UploadFilled,
} from "@element-plus/icons-vue";
import {
  api,
  type Contract,
  type ContractFeedItem,
  type ContractIn,
  type ContractTemplate,
  type Customer,
} from "../api/client";

/** 默认先看更新动态（模块总览） */
const tab = ref("feed");
const loading = ref(false);
const customers = ref<Customer[]>([]);
const contracts = ref<Contract[]>([]);
const templates = ref<ContractTemplate[]>([]);
const feed = ref<ContractFeedItem[]>([]);
const feedNote = ref("");
const feedSaving = ref(false);
const uploading = ref(false);
const customerUploading = ref(false);
const companyFiles = ref<
  { key: string; name: string; size: number; url: string; last_modified: string }[]
>([]);

async function loadCompanyFiles() {
  try {
    companyFiles.value = await api.contractCompanyFiles();
  } catch {
    companyFiles.value = [];
  }
}

async function onCosUpload(options: { file: File }) {
  const file = options.file;
  uploading.value = true;
  try {
    const res = await api.uploadContractCos(file, { scope: "company" });
    ElMessage.success(`已上传 COS：${res.filename}（${(res.size / 1024 / 1024).toFixed(1)} MB）`);
    tab.value = "company";
    await Promise.all([loadFeed(), loadCompanyFiles()]);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    uploading.value = false;
  }
}

const filterCustomer = ref<string | undefined>(undefined);
const filterStatus = ref<string | undefined>(undefined);
/** 拖传客户合同时的归属客户（默认跟筛选一致） */
const uploadCustomerId = ref<string>("");

watch(filterCustomer, (v) => {
  if (v) uploadCustomerId.value = v;
});

watch(customers, (list) => {
  if (!uploadCustomerId.value && list.length) {
    uploadCustomerId.value = filterCustomer.value || list[0].id;
  }
});

async function onCustomerContractUpload(options: { file: File }) {
  const cid = uploadCustomerId.value || filterCustomer.value;
  if (!cid) {
    ElMessage.warning("请先选择客户，再拖入合同文件");
    return;
  }
  const file = options.file;
  customerUploading.value = true;
  try {
    const res = await api.uploadContractCos(file, {
      scope: "customer",
      customer_id: cid,
      create_record: true,
    });
    ElMessage.success(
      `已建档并上传：${res.filename}（${(res.size / 1024 / 1024).toFixed(1)} MB）`,
    );
    filterCustomer.value = cid;
    await Promise.all([loadContracts(), loadFeed()]);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    customerUploading.value = false;
  }
}

const dialog = ref(false);
const editingId = ref<number | null>(null);
const form = ref<ContractIn>({
  customer_id: "shanhe",
  title: "Trinity-AI 生成服务平台采购与技术服务框架协议",
  contract_no: "",
  party_a: "",
  party_b: "陕西星瀚算力信息科技有限公司",
  template_key: "",
  status: "draft",
  signed_date: "",
  effective_start: "",
  effective_end: "",
  invoice_title: "",
  note: "",
  copy_template: true,
});

const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "review", label: "评审中" },
  { value: "signed", label: "已签约" },
  { value: "expired", label: "已到期" },
  { value: "void", label: "作废" },
];

const statusTag: Record<string, string> = {
  draft: "info",
  review: "warning",
  signed: "success",
  expired: "",
  void: "danger",
};

const customerName = computed(() => {
  const c = customers.value.find((x) => x.id === form.value.customer_id);
  return c?.name || "";
});

async function loadMeta() {
  customers.value = await api.paymentCustomers();
  templates.value = await api.contractTemplates();
  if (!form.value.template_key && templates.value[0]) {
    form.value.template_key = templates.value[0].key;
  }
}

async function loadFeed() {
  try {
    feed.value = await api.contractFeed(80);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function loadContracts() {
  loading.value = true;
  try {
    contracts.value = await api.contractList({
      customer_id: filterCustomer.value,
      status: filterStatus.value,
    });
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  await Promise.all([loadMeta(), loadContracts(), loadFeed(), loadCompanyFiles()]);
}

async function postFeedNote() {
  const title = feedNote.value.trim();
  if (!title) {
    ElMessage.warning("请填写动态内容");
    return;
  }
  feedSaving.value = true;
  try {
    await api.createContractFeed({ title, kind: "note" });
    feedNote.value = "";
    ElMessage.success("已写入更新动态");
    await loadFeed();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  } finally {
    feedSaving.value = false;
  }
}

async function removeFeed(item: ContractFeedItem) {
  try {
    await ElMessageBox.confirm(
      `删除这条动态？\n「${item.title}」\n（仅清动态，不影响合同文件）`,
      "删除动态",
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" },
    );
  } catch {
    return;
  }
  try {
    await api.deleteContractFeed(item.id);
    ElMessage.success("已删除");
    await loadFeed();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

function fmtTime(s: string | null) {
  if (!s) return "—";
  // 带 Z / 偏移：按本地时区显示；无时区：按东八区墙钟直接展示（API 已存 CST）
  const hasTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s.trim());
  if (hasTz) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  return s.replace("T", " ").replace(/\.\d+Z?$/, "").slice(0, 16);
}

function fileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toUpperCase() : "FILE";
}

/** 标题里已含文件名时，正文只留体积等短信息，避免重复刷屏 */
function feedTitle(item: ContractFeedItem) {
  return item.title;
}

function feedBody(item: ContractFeedItem) {
  const body = (item.body || "").trim();
  if (!body) return "";
  // 旧数据：company · 12.85 MB · path… → 只留体积
  if (/^company\s*·/i.test(body) || body.includes("/contracts/company/")) {
    const m = body.match(/(\d+(?:\.\d+)?\s*MB)/i);
    return m ? m[1] : "";
  }
  // 标题已带文件名，正文再写一遍文件名则隐藏
  const nameInTitle = item.title.includes("·") ? item.title.split("·").slice(1).join("·").trim() : "";
  if (nameInTitle && body.includes(nameInTitle)) return "";
  return body;
}

function openCreate(presetKey?: string) {
  editingId.value = null;
  // @click 会传入 MouseEvent，忽略非字符串
  const keyHint = typeof presetKey === "string" ? presetKey : "";
  const firstTpl = keyHint || templates.value[0]?.key || "";
  const tpl = templates.value.find((t) => t.key === firstTpl);
  const defaultTitle =
    tpl && !tpl.name.includes("渠道")
      ? "Trinity-AI 生成服务平台采购与技术服务框架协议"
      : tpl?.name?.split("/").pop() || "Trinity-AI 生成服务平台采购与技术服务框架协议";
  form.value = {
    customer_id: filterCustomer.value || "shanhe",
    title: defaultTitle,
    contract_no: "",
    party_a: "",
    party_b: "陕西星瀚算力信息科技有限公司",
    template_key: firstTpl,
    status: "draft",
    signed_date: "",
    effective_start: "",
    effective_end: "",
    invoice_title: "",
    note: "",
    copy_template: !!firstTpl,
  };
  syncPartyA();
  dialog.value = true;
}

function useTemplate(row: ContractTemplate) {
  openCreate(row.key);
}

function openEdit(row: Contract) {
  editingId.value = row.id;
  form.value = {
    customer_id: row.customer_id,
    title: row.title,
    contract_no: row.contract_no,
    party_a: row.party_a,
    party_b: row.party_b,
    template_key: row.template_key,
    status: row.status,
    signed_date: row.signed_date || "",
    effective_start: row.effective_start || "",
    effective_end: row.effective_end || "",
    invoice_title: row.invoice_title,
    note: row.note,
    copy_template: false,
  };
  dialog.value = true;
}

function syncPartyA() {
  if (!form.value.party_a) {
    form.value.party_a = customerName.value;
  }
}

watch(
  () => form.value.customer_id,
  () => {
    if (!editingId.value) {
      form.value.party_a = customerName.value;
    }
  },
);

async function save() {
  try {
    if (editingId.value) {
      const { copy_template: _, customer_id: __, ...patch } = form.value;
      await api.updateContract(editingId.value, patch);
      ElMessage.success("已更新");
    } else {
      await api.createContract(form.value);
      ElMessage.success(form.value.copy_template ? "已创建并复制样板到留档" : "已创建");
    }
    dialog.value = false;
    await Promise.all([loadContracts(), loadFeed()]);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function setStatus(row: Contract, status: string) {
  try {
    await api.patchContractStatus(row.id, status);
    ElMessage.success(`已标记为 ${statusOptions.find((s) => s.value === status)?.label || status}`);
    await Promise.all([loadContracts(), loadFeed()]);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function syncCos(row: Contract) {
  try {
    await api.syncContractCos(row.id);
    ElMessage.success("已上传到 COS trinity-Ops-Desk/");
    await loadContracts();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function copyTpl(row: Contract) {
  try {
    await api.copyContractTemplate(row.id);
    ElMessage.success("已复制样板到客户合同目录");
    await loadContracts();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

async function remove(row: Contract) {
  try {
    await ElMessageBox.confirm(`删除合同「${row.title}」？仅删库记录，不删磁盘文件。`, "确认");
    await api.deleteContract(row.id);
    ElMessage.success("已删除");
    await Promise.all([loadContracts(), loadFeed()]);
  } catch (e) {
    if (e !== "cancel") ElMessage.error(e instanceof Error ? e.message : String(e));
  }
}

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

onMounted(refresh);
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h2>合同管理</h2>
        <p class="sub">样板库 · 公司归档 · 客户签约 · 留档 <code>AI云业务/合同/</code></p>
      </div>
      <el-button :icon="Refresh" text bg @click="refresh">刷新</el-button>
    </div>

    <div class="panel contracts-panel">
      <el-tabs v-model="tab" class="contracts-tabs">
        <el-tab-pane label="更新动态" name="feed">
          <div class="feed-composer">
            <el-input
              v-model="feedNote"
              placeholder="写一条备注…"
              clearable
              @keyup.enter="postFeedNote"
            />
            <el-button type="primary" :loading="feedSaving" @click="postFeedNote">发布</el-button>
          </div>
          <div v-if="feed.length" class="feed-list">
            <div v-for="item in feed" :key="item.id" class="feed-card">
              <div class="feed-card-top">
                <span class="feed-kind" :data-kind="item.kind">{{
                  item.kind_label || item.kind
                }}</span>
                <div class="feed-card-actions">
                  <time class="feed-time">{{ fmtTime(item.created_at) }}</time>
                  <el-button
                    link
                    type="danger"
                    :icon="Delete"
                    title="删除这条动态"
                    @click="removeFeed(item)"
                  />
                </div>
              </div>
              <div class="feed-title">{{ feedTitle(item) }}</div>
              <div v-if="feedBody(item)" class="feed-body">{{ feedBody(item) }}</div>
            </div>
          </div>
          <div v-else class="empty-state">暂无动态</div>
        </el-tab-pane>

        <el-tab-pane name="templates">
          <template #label>
            样板库
            <span v-if="templates.length" class="count-pill">{{ templates.length }}</span>
          </template>
          <p class="pane-hint">
            官方样板：下游框架协议（中/英）· 居间服务协议 v1.0。法务确认前勿当用章版。
          </p>
          <el-table :data="templates" stripe class="soft-table" empty-text="样板未就绪">
            <el-table-column prop="name" label="样板名称" min-width="260" show-overflow-tooltip />
            <el-table-column label="类型" width="90">
              <template #default="{ row }">
                <el-tag v-if="row.kind === 'downstream'" size="small" effect="plain">下游</el-tag>
                <el-tag
                  v-else-if="row.kind === 'channel'"
                  size="small"
                  type="warning"
                  effect="plain"
                >
                  渠道
                </el-tag>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="90">
              <template #default="{ row }">{{ row.size ? fmtSize(row.size) : "—" }}</template>
            </el-table-column>
            <el-table-column label="说明" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag
                  v-if="row.pending_latest"
                  size="small"
                  type="danger"
                  effect="plain"
                  style="margin-right: 6px"
                >
                  待最新版
                </el-tag>
                {{ row.note }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-link
                  v-if="row.download_url"
                  :href="row.download_url"
                  target="_blank"
                  type="primary"
                  :underline="false"
                >
                  <el-icon><Download /></el-icon>
                  下载
                </el-link>
                <span v-else class="muted">文件未到</span>
                <el-button
                  v-if="row.size > 0"
                  link
                  type="primary"
                  style="margin-left: 8px"
                  @click="useTemplate(row)"
                >
                  用此新建
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane name="company">
          <template #label>
            公司归档
            <span v-if="companyFiles.length" class="count-pill">{{ companyFiles.length }}</span>
          </template>
          <div class="company-head">
            <p class="pane-hint">
              公司侧原件 · COS
              <code>trinity-Ops-Desk/contracts/company/</code>
              · 客户签约见「客户合同」
            </p>
            <el-upload
              :show-file-list="false"
              :http-request="onCosUpload"
              accept=".doc,.docx,.pdf,.zip"
              :disabled="uploading"
            >
              <el-button type="primary" :icon="UploadFilled" :loading="uploading">
                {{ uploading ? "上传中…" : "上传文件" }}
              </el-button>
            </el-upload>
          </div>

          <div v-if="companyFiles.length" class="file-list">
            <a
              v-for="row in companyFiles"
              :key="row.key"
              class="file-row"
              :href="row.url"
              target="_blank"
              rel="noopener"
            >
              <span class="file-ext" :data-ext="fileExt(row.name)">{{ fileExt(row.name) }}</span>
              <span class="file-meta">
                <span class="file-name">{{ row.name }}</span>
                <span class="file-sub">{{ fmtSize(row.size) }} · {{ fmtTime(row.last_modified) }}</span>
              </span>
              <span class="file-action">打开</span>
            </a>
          </div>
          <div v-else class="empty-state empty-upload">
            <el-icon :size="28"><Document /></el-icon>
            <p>还没有公司归档文件</p>
            <el-upload
              :show-file-list="false"
              :http-request="onCosUpload"
              accept=".doc,.docx,.pdf,.zip"
              drag
              class="company-upload"
            >
              <div class="upload-hint">
                拖到此处，或 <em>点击选择</em>
                <span class="muted"> · 单文件 ≤50MB</span>
              </div>
            </el-upload>
          </div>
        </el-tab-pane>

        <el-tab-pane label="客户合同" name="contracts">
          <div class="contracts-head">
            <p class="pane-hint">客户签约记录；拖文件进来会按所选客户建草稿并上 COS</p>
            <div class="toolbar">
              <el-select
                v-model="filterCustomer"
                clearable
                placeholder="全部客户"
                style="width: 200px"
                @change="loadContracts"
              >
                <el-option
                  v-for="c in customers"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
              <el-select
                v-model="filterStatus"
                clearable
                placeholder="全部状态"
                style="width: 130px"
                @change="loadContracts"
              >
                <el-option
                  v-for="s in statusOptions"
                  :key="s.value"
                  :label="s.label"
                  :value="s.value"
                />
              </el-select>
              <el-button type="primary" :icon="Plus" @click="openCreate">新建合同</el-button>
              <el-button text type="primary" @click="tab = 'templates'">样板库</el-button>
            </div>
          </div>

          <div class="customer-drop">
            <div class="customer-drop-meta">
              <span class="muted">上传归属</span>
              <el-select
                v-model="uploadCustomerId"
                placeholder="选择客户"
                style="width: 220px"
                size="small"
              >
                <el-option
                  v-for="c in customers"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
              <span v-if="customerUploading" class="muted">上传中…</span>
            </div>
            <el-upload
              :show-file-list="false"
              :http-request="onCustomerContractUpload"
              accept=".doc,.docx,.pdf,.zip"
              :disabled="customerUploading || !uploadCustomerId"
              drag
              class="customer-upload"
            >
              <div class="upload-hint">
                <el-icon :size="20"><UploadFilled /></el-icon>
                <p>
                  拖入已签/待签合同，或 <em>点击选择</em>
                  <span class="muted"> · 自动建草稿 · ≤50MB</span>
                </p>
              </div>
            </el-upload>
          </div>

          <el-table
            v-loading="loading"
            :data="contracts"
            stripe
            class="soft-table"
            style="width: 100%"
            empty-text="暂无客户签约记录，可上方拖入文件建档"
          >
            <el-table-column prop="customer_name" label="客户" min-width="140" />
            <el-table-column prop="title" label="合同名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="contract_no" label="编号" width="110" />
            <el-table-column
              prop="invoice_title"
              label="开票抬头"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="(statusTag[row.status] as any) || 'info'" size="small" effect="plain">
                  {{ row.status_label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="signed_date" label="签署日" width="110" />
            <el-table-column label="附件" width="120">
              <template #default="{ row }">
                <el-link
                  v-if="row.file_exists && row.download_url"
                  :href="row.download_url"
                  target="_blank"
                  type="primary"
                  :underline="false"
                >
                  下载
                </el-link>
                <el-link
                  v-if="row.cos_url"
                  :href="row.cos_url"
                  target="_blank"
                  type="success"
                  :underline="false"
                  style="margin-left: 6px"
                >
                  COS
                </el-link>
                <span v-if="!row.file_exists && !row.cos_url" class="muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
                <el-dropdown trigger="click" @command="(cmd: string) => setStatus(row, cmd)">
                  <el-button link type="primary">改状态</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="s in statusOptions"
                        :key="s.value"
                        :command="s.value"
                        :disabled="s.value === row.status"
                      >
                        {{ s.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button
                  v-if="row.template_key && !row.file_exists"
                  link
                  type="primary"
                  @click="copyTpl(row)"
                >
                  复制样板
                </el-button>
                <el-button
                  v-if="row.file_exists && !row.cos_key"
                  link
                  type="primary"
                  @click="syncCos(row)"
                >
                  上传 COS
                </el-button>
                <el-button link type="danger" :icon="Delete" @click="remove(row)" />
              </template>
            </el-table-column>
          </el-table>
          <p v-if="!loading && !contracts.length" class="empty-foot">
            公司原件请到
            <el-button type="primary" link @click="tab = 'company'">公司归档</el-button>
            ；客户签约可上方拖入建档，或从样板库新建。
          </p>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="dialog"
      :title="editingId ? '编辑合同' : '新建合同'"
      width="640px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="客户" required>
          <el-select v-model="form.customer_id" style="width: 100%" :disabled="!!editingId">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同名称" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="form.contract_no" placeholder="签约后填写" />
        </el-form-item>
        <el-form-item label="甲方（客户）">
          <el-input v-model="form.party_a" :placeholder="customerName" />
        </el-form-item>
        <el-form-item label="乙方（我方）">
          <el-input v-model="form.party_b" />
        </el-form-item>
        <el-form-item label="开票抬头">
          <el-input v-model="form.invoice_title" placeholder="默认取客户开票信息库抬头" />
        </el-form-item>
        <el-form-item label="关联样板">
          <el-select v-model="form.template_key" clearable style="width: 100%" placeholder="可选">
            <el-option
              v-for="t in templates"
              :key="t.key"
              :label="t.name"
              :value="t.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!editingId" label="复制留档">
          <el-switch v-model="form.copy_template" />
          <span class="hint">开启后复制样板到 AI云业务/合同/{客户}/</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 160px">
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签署日">
          <el-date-picker
            v-model="form.signed_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="生效起止">
          <div class="range">
            <el-date-picker
              v-model="form.effective_start"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="起"
            />
            <span>—</span>
            <el-date-picker
              v-model="form.effective_end"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="止"
            />
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.sub {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.45;
}
.sub code,
.pane-hint code {
  font-size: 12px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #f0f2f5;
  color: #606266;
}
.contracts-panel {
  padding: 4px 18px 20px;
}
.contracts-tabs :deep(.el-tabs__header) {
  margin-bottom: 14px;
}
.contracts-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: #ebeef5;
}
.contracts-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  height: 42px;
  line-height: 42px;
}
.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  vertical-align: middle;
}
.pane-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  align-items: center;
}
.feed-composer {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fafbfc;
  border: 1px solid #eef0f3;
}
.feed-composer :deep(.el-input) {
  flex: 1;
}
.feed-composer :deep(.el-input__wrapper) {
  box-shadow: none !important;
  background: transparent;
  padding-left: 4px;
}
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 760px;
}
.feed-card {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #eef0f3;
  background: #fff;
}
.feed-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.feed-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.feed-card-actions .el-button {
  opacity: 0.35;
}
.feed-card:hover .feed-card-actions .el-button {
  opacity: 1;
}
.feed-kind {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: #f4f4f5;
  color: #606266;
}
.feed-kind[data-kind="company"] {
  background: #f0f9eb;
  color: #67c23a;
}
.feed-kind[data-kind="template"] {
  background: #ecf5ff;
  color: #409eff;
}
.feed-kind[data-kind="contract"] {
  background: #fdf6ec;
  color: #e6a23c;
}
.feed-kind[data-kind="note"] {
  background: #f4f4f5;
  color: #909399;
}
.feed-kind[data-kind="module"] {
  background: #f4f4f5;
  color: #909399;
}
.feed-time {
  font-size: 12px;
  color: #a8abb2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.feed-title {
  font-size: 14px;
  font-weight: 550;
  color: #303133;
  line-height: 1.45;
  word-break: break-all;
}
.feed-body {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
  line-height: 1.45;
}
.soft-table {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #fafbfc;
}
.soft-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}
.soft-table :deep(th.el-table__cell) {
  font-weight: 600;
  color: #909399;
  font-size: 12px;
}
.company-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.company-head .pane-hint {
  margin: 0;
  flex: 1;
}
.contracts-head .pane-hint {
  margin-bottom: 10px;
}
.customer-drop {
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #eef0f3;
  background: #fafbfc;
}
.customer-drop-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.customer-upload {
  width: 100%;
}
.customer-upload :deep(.el-upload) {
  width: 100%;
}
.customer-upload :deep(.el-upload-dragger) {
  padding: 16px 12px;
  border-radius: 8px;
  background: #fff;
  border-color: #dcdfe6;
}
.customer-upload :deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
}
.customer-upload .upload-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-regular);
}
.customer-upload .upload-hint p {
  margin: 0;
  font-size: 13px;
}
.customer-upload .upload-hint .el-icon {
  color: var(--el-color-primary);
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fafbfc;
  border: 1px solid #eef0f3;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}
.file-row:hover {
  border-color: #c6e2ff;
  background: #f5f9ff;
}
.file-ext {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: #e8f3ff;
  color: #337ecc;
}
.file-ext[data-ext="PDF"] {
  background: #fef0f0;
  color: #c45656;
}
.file-ext[data-ext="DOC"],
.file-ext[data-ext="DOCX"] {
  background: #ecf5ff;
  color: #409eff;
}
.file-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-sub {
  font-size: 12px;
  color: #909399;
}
.file-action {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-color-primary);
  font-weight: 500;
}
.company-upload {
  width: 100%;
  max-width: 420px;
  margin-top: 8px;
}
.company-upload :deep(.el-upload) {
  width: 100%;
}
.company-upload :deep(.el-upload-dragger) {
  padding: 20px 16px;
  border-radius: 10px;
  background: #fafbfc;
}
.upload-hint {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.upload-hint em {
  color: var(--el-color-primary);
  font-style: normal;
}
.muted {
  color: var(--el-text-color-secondary);
}
.empty-state {
  padding: 36px 16px;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.empty-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px 32px;
  border: 1px dashed #dcdfe6;
  border-radius: 12px;
  background: #fafbfc;
}
.empty-upload p {
  margin: 0 0 4px;
}
.empty-foot {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.hint {
  margin-left: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>
