# Admin 列表页模板

> **用途**：新建或重构运营后台列表页时，复制本模板作为起点。
> 
> **参考实现**：`src/views/admin-keys/KeysPage.vue`（平台密钥 Tab）
> 
> **规范文档**：
> - [`docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md`](../../../docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md)
> - [`src/utils/adminTableColumns.ts`](../src/utils/adminTableColumns.ts)

---

## 模板文件结构

```
{module}/
├── {Module}Page.vue      # 主页面（复制本模板）
├── {module}.css           # 模块样式（复制 keys.css 改前缀）
├── {module}Interactions.ts  # 交互逻辑
├── mock.ts               # Mock 数据
└── README.md             # 模块说明
```

---

## {Module}Page.vue 模板

```vue
<script setup lang="ts">
/**
 * {模块中文名}列表页
 * 
 * 规范要点：
 * 1. 搜索筛选在表头左侧，操作按钮在右侧，间距统一 0.5rem
 * 2. 表格列使用 min-width，不固定宽度，由表格自适应
 * 3. 操作按钮格式：icon + 文本
 */
import {
  // Element Plus Icons - 根据需要引入
  Delete,
  Download,
  Edit,
  Plus,
  Refresh,
  Search,
  View,
} from "@element-plus/icons-vue";
import { computed, ref } from "vue";
import AdminDateRangePicker from "../../components/AdminDateRangePicker.vue";
import AdminDialog from "../../components/AdminDialog.vue";
import AdminExportCsvButton from "../../components/AdminExportCsvButton.vue";
import AdminInternalTip from "../../components/AdminInternalTip.vue";
import AdminListQuery from "../../components/AdminListQuery.vue";
import AdminSectionHead from "../../components/AdminSectionHead.vue";
import AdminTablePagination from "../../components/AdminTablePagination.vue";
import { type AdminDateRange, isWithinAdminDateRange } from "../../utils/adminDateRange";
import { filterByQuery } from "../../utils/adminListFilter";
import {
  ADMIN_TABLE_COL,
  ADMIN_TABLE_COL_MIN,
  ADMIN_TABLE_COL_OPS,
} from "../../utils/adminTableColumns";
import { useAdminTablePagination } from "../../utils/adminTablePagination";
import "./{module}.css";
import {
  DEFAULT_ROWS,
  type RowType,
} from "./mock";
import { readRowsJson, writeRowsJson } from "./{module}Interactions";

// ===================== 状态定义 =====================

const searchQ = ref("");
const filterStatus = ref<"");
const filterType = ref("");
const dateRange = ref<AdminDateRange | null>(null);

const rows = ref<RowType[]>([]);
const total = ref(0);

// ===================== 计算属性 =====================

const filteredRows = computed(() => {
  let result = rows.value;
  
  // 按状态筛选
  if (filterStatus.value) {
    result = result.filter((r) => r.status === filterStatus.value);
  }
  
  // 按类型筛选
  if (filterType.value) {
    result = result.filter((r) => r.type === filterType.value);
  }
  
  // 按日期范围筛选
  if (dateRange.value) {
    result = result.filter((r) => isWithinAdminDateRange(r.createdAt, dateRange.value));
  }
  
  // 按关键词检索
  return filterByQuery(result, searchQ.value, (r) =>
    [r.name, r.id, r.remark].join(" "),
  );
});

const pg = useAdminTablePagination(filteredRows);

// ===================== 数据加载 =====================

function loadData(): void {
  const raw = readRowsJson();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rows.value = parsed;
        return;
      }
    } catch {
      /* fall through to default */
    }
  }
  rows.value = JSON.parse(JSON.stringify(DEFAULT_ROWS));
}

function persistData(): void {
  writeRowsJson(JSON.stringify(rows.value));
}

function resetQuery(): void {
  searchQ.value = "";
  filterStatus.value = "";
  filterType.value = "";
  dateRange.value = null;
}

// ===================== 状态徽章 =====================

function statusBadgeClass(status: string): string {
  if (status === "正常") return "{module}-page__badge {module}-page__badge--ok";
  if (status === "禁用") return "{module}-page__badge {module}-page__badge--warn";
  if (status === "已删除") return "{module}-page__badge {module}-page__badge--danger";
  return "{module}-page__badge {module}-page__badge--muted";
}

// ===================== 操作处理 =====================

function openDetail(row: RowType): void {
  // TODO: 打开详情弹窗
}

function openForm(mode: "add" | "edit", row?: RowType): void {
  // TODO: 打开表单弹窗
}

function handleDelete(row: RowType): void {
  // TODO: 删除确认弹窗
}

// ===================== 初始化 =====================

loadData();
</script>

<template>
  <div class="{module}-page">
    <section class="{module}-page__panel">
      <el-card shadow="never" class="admin-ep-card {module}-page__panel">
        <!--
          表头工具栏（toolbar-only 模式）
          左侧：搜索 + 筛选 + 日期范围 + 重置
          右侧：新建/导入/导出等主操作
          间距统一为 0.5rem（由 CSS 控制）
        -->
        <AdminSectionHead toolbar-only>
          <template #annot>
            <AdminInternalTip heading="{模块名} · 原型" explain="功能说明">
              <p>这里是模块的简要说明，描述本页的功能和用途。</p>
            </AdminInternalTip>
          </template>
          <template #tools>
            <AdminListQuery
              v-model:search="searchQ"
              input-id="{module}-search"
              search-placeholder="名称、ID、备注…"
              search-aria-label="检索{模块名}"
              @reset="resetQuery"
            >
              <!-- 左侧筛选区域 -->
              <template #filters>
                <!-- 状态下拉 -->
                <el-select
                  v-model="filterStatus"
                  clearable
                  placeholder="状态"
                  style="width: 7rem"
                >
                  <el-option label="正常" value="正常" />
                  <el-option label="禁用" value="禁用" />
                </el-select>

                <!-- 类型下拉 -->
                <el-select
                  v-model="filterType"
                  clearable
                  placeholder="类型"
                  style="width: 8rem"
                >
                  <el-option label="类型A" value="A" />
                  <el-option label="类型B" value="B" />
                </el-select>
              </template>

              <!-- 日期范围（如需要） -->
              <AdminDateRangePicker v-model="dateRange" />

              <!-- 右侧操作按钮区域 -->
              <template #actions>
                <!-- 新建按钮（icon + 文本） -->
                <el-button type="primary" :icon="Plus" @click="openForm('add')">
                  新建
                </el-button>

                <!-- 导出按钮（使用共享组件） -->
                <AdminExportCsvButton hint="导出当前筛选结果" />
              </template>
            </AdminListQuery>
          </template>
        </AdminSectionHead>

        <!--
          数据表格
          - 使用 admin-ep-table-wrap 类
          - 使用 min-width 而非固定 width
          - 数据列全部左对齐（不写 align 属性）
        -->
        <el-table
          :data="pg.paginatedRows"
          row-key="id"
          class="admin-ep-table-wrap"
          style="width: 100%"
          :default-sort="{ prop: 'createdAt', order: 'descending' }"
        >
          <!-- 主列（名称等）- 使用 primary 档位 -->
          <el-table-column
            prop="name"
            label="名称"
            :min-width="ADMIN_TABLE_COL.primary"
            sortable
            show-overflow-tooltip
          />

          <!-- ID 列 - 使用 lg 档位 -->
          <el-table-column
            prop="id"
            label="ID"
            :min-width="ADMIN_TABLE_COL.lg"
            sortable
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <span class="{module}-page__mono">{{ scope.row.id }}</span>
              </template>
            </template>
          </el-table-column>

          <!-- 状态列 - 使用 xs 档位 -->
          <el-table-column
            prop="status"
            label="状态"
            :min-width="ADMIN_TABLE_COL.xs"
            sortable
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <span :class="statusBadgeClass(scope.row.status)">
                  {{ scope.row.status }}
                </span>
              </template>
            </template>
          </el-table-column>

          <!-- 类型列 - 使用 sm 档位 -->
          <el-table-column
            prop="type"
            label="类型"
            :min-width="ADMIN_TABLE_COL.sm"
            sortable
          />

          <!-- 时间列 - 使用 lg 档位 -->
          <el-table-column
            prop="createdAt"
            label="创建时间"
            :min-width="ADMIN_TABLE_COL.lg"
            sortable
          />

          <!-- 长文本列 - 使用 detail 档位 -->
          <el-table-column
            prop="remark"
            label="备注"
            :min-width="ADMIN_TABLE_COL_MIN.detail"
            show-overflow-tooltip
          />

          <!--
            操作列（唯一可固定 width 的列）
            - 使用 fixed="right" 固定在右侧
            - 按钮使用 link 类型
            - 格式：icon + 文本
            - 多个按钮使用 admin-ep-row-actions 包裹，间距 0.5rem
          -->
          <el-table-column
            label="操作"
            :width="ADMIN_TABLE_COL_OPS.lg"
            fixed="right"
          >
            <template #default="scope">
              <template v-if="scope?.row">
                <div class="admin-ep-row-actions" @click.stop>
                  <!-- 详情按钮 -->
                  <el-button link type="primary" :icon="View" @click="openDetail(scope.row)">
                    详情
                  </el-button>

                  <!-- 编辑按钮 -->
                  <el-button link type="primary" :icon="Edit" @click="openForm('edit', scope.row)">
                    编辑
                  </el-button>

                  <!-- 删除按钮（危险操作） -->
                  <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </div>
              </template>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <AdminTablePagination
          v-model:current-page="pg.currentPage"
          v-model:page-size="pg.pageSize"
          :total="pg.total"
        />
      </el-card>
    </section>

    <!-- 详情/编辑弹窗（如需要） -->
    <AdminDialog v-model="formOpen" title="编辑" width="480px">
      <!-- 表单内容 -->
      <el-form label-position="top" class="admin-ep-form">
        <el-form-item label="名称" required>
          <el-input v-model="draftName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="draftRemark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formOpen = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </AdminDialog>
  </div>
</template>
```

---

## {module}.css 模板

```css
/**
 * {模块中文名}页面样式
 * 规范：前缀统一为 {module}-page__
 */

.{module}-page {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 等宽字体（用于 ID、时间戳等） */
.{module}-page__mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
}

/* 状态徽章 */
.{module}-page__badge {
  display: inline-block;
  padding: 0.12rem 0.45rem;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
}

.{module}-page__badge--ok {
  background: var(--success-soft);
  color: var(--success-800);
}

.{module}-page__badge--warn {
  background: var(--warning-soft);
  color: var(--warning-ink);
}

.{module}-page__badge--danger {
  background: var(--danger-soft);
  color: var(--danger-ink);
}

.{module}-page__badge--muted {
  background: var(--surface-2);
  color: var(--muted);
}

/* 弱化文本 */
.{module}-page__muted {
  color: var(--muted);
}

/* 表格外层（可选） */
.{module}-page__table-wrap {
  overflow: auto;
}

/* 提示文字 */
.{module}-page__hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: var(--muted);
}

/* 表单错误提示 */
.{module}-page__form-err {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: var(--danger-ink);
}
```

---

## 关键规范速查

### 1. 工具栏布局

```
┌─────────────────────────────────────────────────────────────────────┐
│ [🔍 搜索框] [状态下拉] [类型下拉] [📅 日期] [🔄 重置]    [+ 新建] [📥 导出] │
│ ──────────────────────────────────────────────────────────────────│
│ ←────────── admin-list-query__main ──────────→ ←── actions ──→ │
│                     gap: 0.5rem                           gap: 0.5rem
└─────────────────────────────────────────────────────────────────────┘
```

### 2. 列宽档位（min-width）

| 档位 | 宽度 | 适用场景 |
|------|------|----------|
| `xs` | 80px | 状态、动作、绑定数 |
| `sm` | 96px | 日期、短数字、类型 |
| `md` | 112px | 短文案、策略版本 |
| `lg` | 128px | 时间、指纹、ID |
| `xl` | 144px | 双行主从（客户/项目） |
| `primary` | 120px | 主标题列（名称） |
| `detail` | 200px | 长文本、说明、备注 |

### 3. 操作列

```vue
<!-- 正确格式：icon + 文本 -->
<el-button link type="primary" :icon="View">详情</el-button>
<el-button link type="primary" :icon="Edit">编辑</el-button>
<el-button link type="danger" :icon="Delete">删除</el-button>

<!-- 操作列容器：间距 0.5rem -->
<div class="admin-ep-row-actions" @click.stop>
  <!-- 按钮 -->
</div>
```

### 4. 表格属性

```vue
<el-table
  :data="pg.paginatedRows"
  row-key="id"
  class="admin-ep-table-wrap"
  style="width: 100%"
  :default-sort="{ prop: 'createdAt', order: 'descending' }"
>
  <!-- 数据列：只写 min-width，不写 align -->
  <el-table-column
    prop="name"
    label="名称"
    :min-width="ADMIN_TABLE_COL.primary"
    sortable
    show-overflow-tooltip
  />
</el-table>
```

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-05-19 | 初版：基于 KeysPage.vue 平台密钥 Tab 提取模板 |
