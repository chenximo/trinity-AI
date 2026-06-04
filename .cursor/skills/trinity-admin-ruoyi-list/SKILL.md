---
name: trinity-admin-ruoyi-list
description: >-
  Trinity 运营后台（trinity-ai-admin）若依式列表页：AdminListQuery 工具栏、
  el-table.admin-ep-table-wrap、ADMIN_TABLE_COL 列宽、操作列 admin-ep-row-actions、
  表头与单元格左对齐。在改 apps/trinity-ai-admin 列表/表格/筛选/分页，或用户提到
  若依、运营后台列表、表格对齐、AdminSectionHead、admin-ep-table 时使用。
---

# Trinity 运营后台 · 若依式列表

## 权威文档（先读）

| 文档 | 路径 |
|------|------|
| 若依式列表规范（真源） | `docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md` |
| 列表排错、flex、列宽 | `docs/02-后台运营管理系统设计/运营后台开发规范.md` |
| 模块 ↔ views 对照 | `docs/02-后台运营管理系统设计/后台原型总览.md` |
| 列宽常量 | `apps/trinity-ai-admin/src/utils/adminTableColumns.ts` |
| 表格样式 | `apps/trinity-ai-admin/src/styles/admin-ruoyi.css` |
| 工具栏样式 | `apps/trinity-ai-admin/src/styles/admin-page.css` |
| 参考实现 | `apps/trinity-ai-admin/src/views/admin-keys/KeysPage.vue` |

Monorepo 总则见 `trinity-vue-prototype-monorepo`；色板/token 见 `trinity-design-tokens`。详设与交付计划见 `docs/05-产品与PRD/` 运营后台相关 md。

---

## 页面骨架（固定）

```
{module}-page
└─ el-card.admin-ep-card
   ├─ AdminSectionHead [toolbar-only]
   ├─ el-table.admin-ep-table-wrap [style="width: 100%"]
   ├─ AdminTablePagination
   └─ p.{module}-page__hint（可选）
```

---

## 单元格对齐（全部左对齐）

**表头、数据列、操作列** 均 **左对齐**。`el-table-column` **不写** `align`。

| 禁止 | 原因 |
|------|------|
| `align="center"` / `align="right"` | 破坏列表一致性 |
| 操作列单独居中（`admin-ep-col-ops` 等） | 多按钮换行时第二行易错位 |

操作列使用 `div.admin-ep-row-actions` + `flex-wrap`；按钮从左侧起排。

---

## 列宽（`ADMIN_TABLE_COL`）

- 数据列：`:min-width="ADMIN_TABLE_COL.*"`
- 操作列：`:width="ADMIN_TABLE_COL_OPS.*"` + `fixed="right"`
- 自定义单元格：**必须** `v-if="scope?.row"`

---

## 工具栏（AdminListQuery）

- 左：搜索 → 筛选 → 重置（`@reset` 清空本表全部筛选）
- 右：`#actions` 主按钮
- 间距：`gap: 0.5rem`

---

## 操作列

```vue
<el-table-column label="操作" :width="ADMIN_TABLE_COL_OPS.lg" fixed="right">
  <template #default="scope">
    <template v-if="scope?.row">
      <div class="admin-ep-row-actions" @click.stop>
        <el-button link type="primary" :icon="Edit" @click="…">编辑</el-button>
      </div>
    </template>
  </template>
</el-table-column>
```

---

## Agent 检查清单

- [ ] `toolbar-only` + `admin-ep-table-wrap`
- [ ] 无列级 `align`
- [ ] `ADMIN_TABLE_COL` + `admin-ep-row-actions`
- [ ] 未对操作列单独居中

---

## 非列表页

见规范文档 §8。
