# admin-models · 模型管理（P4）

## 1. 一句话

**§4.5 / §4.5.1**：单路由 **`ModelsPage.vue`** 承载侧栏 **4 个子页**（`list` / `master` / `lines` / `pricing`）；**模型列表**含固定宽搜索、**`FilterForm2PillListbox`** 上下架筛选、操作列 **上架 / 下架**、导入/导出占位、**增删改**（新增与编辑均为 **`ModalPanel` + `TTextField1Labeled`**；列表行 `localStorage` 持久化）。其余子页为 **mock 表 / 主数据**；双通道契约见详细设计 **§4.5.1**（无独立子页）。

## 2. 路由表

与 `trinityAdminRoutes.ts` 及 `admin-shell/adminNavTree.ts` 一致；子路由 `name` 形如 `tai-admin-models-{子页 id}`。

| path | name | 说明 |
|------|------|------|
| `/models/list` | `tai-admin-models-list` | 模型列表（可编辑 mock） |
| `/models/master` | `tai-admin-models-master` | 主数据示意 |
| `/models/lines` | `tai-admin-models-lines` | 供应线路表 |
| `/models/pricing` | `tai-admin-models-pricing` | 刊例与成本 |
| `/models` | `tai-admin-models` | redirect → `tai-admin-models-list` |

## 3. 文件

| 文件 | 职责 |
|------|------|
| `ModelsPage.vue` | 子页切换、列表工具栏与弹窗、各子区块模板 |
| `mock.ts` | 假数据与类型；**无 DOM** |
| `models.css` | 模块布局与表（`mdl-*` 前缀，与供应商页样式结构对齐） |
| `modelsInteractions.ts` | 列表筛选与列表行 JSON 的 `localStorage`；弹窗 `body.or-modal-open` |

## 4. 接 API 后

替换 `mock` 与 `localStorage` 为接口层；列表分页、线路编辑。（v1 不含 **§4.6 API 与路由策略** 独立模块。）
