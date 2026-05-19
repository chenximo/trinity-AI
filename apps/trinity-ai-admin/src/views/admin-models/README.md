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
| `/models/bindings` | `tai-admin-models-bindings` | 路由绑定 |
| `/models/pricing` | `tai-admin-models-pricing` | 刊例与成本 |
| `/models` | `tai-admin-models` | redirect → `tai-admin-models-list` |

## 3. 文件

| 文件 | 职责 |
|------|------|
| `ModelsPage.vue` | 子页切换、列表工具栏与弹窗、各子区块模板 |
| `mock.ts` | 假数据与类型；**无 DOM** |
| `models.css` | 模块布局与表（`mdl-*` 前缀，与供应商页样式结构对齐） |
| `modelsInteractions.ts` | 列表筛选与列表行 JSON 的 `localStorage`；弹窗 `body.or-modal-open` |

## 4. `models/list` · 模型列表（2026-05-19）

| 能力 | 原型 |
|------|------|
| 搜索 / 上下架筛选 | ✅ |
| **供应商筛选** | ✅ 按 `MODEL_SUPPLY_LINE_ROWS` 聚合 |
| **重置** | ✅ 清空搜索 + 供应商 + 上下架 |
| **线路数 → 供应线路** | ✅ `tai-admin-models-lines?modelId=` |
| 增删改 / 上下架 | ✅ `trinity-ai-admin:models-list-rows` |

待办见同目录 **[`TODO.md`](./TODO.md)**（主要为 `bindings`）。

## 5. 数据层级：逻辑模型 → 供应线路 → 刊例行

运营侧对比「同一模型、多家供应商」时，三层关系如下（**刊例不重复存供应商名**，通过 `supplyLineId` 关联线路表）：

```text
逻辑模型（如 DeepSeek V3 · lm-deepseek-v3）
    └── 供应线路（sr-201 官方 / sr-202 火山 …）
            │   ← 供应商 supplier、通道 channel、上游 upstreamModelId、成本引用 costRef
            └── 刊例行（SKU-DS-IN、SKU-DS-OUT、SKU-DS-IN-VOLC …）
                    ← 对外刊例价 listPrice、采购成本 internalCost；线路侧见 costRef（供应商刊例）
```

| 层级 | 子页 / 类型 | 主键 | 典型字段 | 说明 |
|------|-------------|------|----------|------|
| **逻辑模型** | `list` / `master` · `ModelListRow` | `lm-*` | 展示名、上下架、通道类型 | 租户可见的「卖什么模型」 |
| **供应线路** | `lines` · `ModelSupplyLineRow` | `sr-*` | `supplier`、`upstreamModelId`、`costRef`、优先级 | **哪家上游、走哪条 Profile**；一家供应商一条或多条线路 |
| **刊例行** | `pricing` · `ModelPricingRow` | `pr-*` | `sku`、`listPrice`、`internalCost`、`supplyLineId` | **对客户卖价 + 采购成本**；同一模型可有多行（入/出、不同供应商线路） |

**示例（DeepSeek V3）**

| SKU | 绑定线路 | 线路上的供应商（查 `lines`） | 用途 |
|-----|----------|------------------------------|------|
| `SKU-DS-IN` / `SKU-DS-OUT` | `sr-201` | DeepSeek 官方 | 同一路径，入向/出向两个计费 SKU |
| `SKU-DS-IN-VOLC` | `sr-202` | 火山引擎 | 备路/第二家，与 `sr-201` 刊例对比 |

筛选 **刊例与成本** 页的逻辑模型后，列表即该模型下所有线路的刊例横向对比；点 **线路** 或线路 ID 进入 **供应线路** 看完整上游信息。

## 6. `models/lines` · 供应线路（2026-05-19）

| 能力 | 原型 |
|------|------|
| 若依 `AdminListQuery` | 左：搜索 + 逻辑模型 + 供应商 + 重置；右：线路探测（主按钮） |
| 按模型筛选 | 共用 `masterSelectedId` / `?modelId=` |
| 线路探测 | 对当前筛选结果 mock 更新探测列 |
| 列宽 | `ADMIN_TABLE_COL` 档位 |
| 持久化 | `trinity-ai-admin:models-supply-lines` |

## 7. `models/master` · 主数据（2026-05-19）

| 能力 | 原型 |
|------|------|
| 按模型切换 | 下拉 + `?modelId=` + `models-master-selected-id` |
| 摘要条 | 通道、上下架、线路数（可跳供应线路）、审计 |
| 双卡片 | 基础与标识 · 能力与文档 |
| 编辑 | `AdminDialog` → `trinity-ai-admin:models-master-records`（展示名同步列表） |
| 列表入口 | 行内 **主数据** |

## 8. `models/pricing` · 刊例与成本（2026-05-19）

| 能力 | 原型 |
|------|------|
| 若依 `AdminListQuery` | 搜索 + **逻辑模型**筛选（共用 `masterSelectedId` / `?modelId=`）+ 重置 |
| 列表列 | 供应商、计费 SKU、**对外刊例价**、**采购成本**、毛利率（示意）、生效自、**供应商刊例（线路）**、备注 |
| 多供应商对比 | 同一 `modelId` 下多行，每行 `supplyLineId` 不同即可对比（见 §5） |
| CRUD | 新增/编辑/删除 → `trinity-ai-admin:models-pricing-rows` |
| 跳转 | SKU → `tai-admin-billing-sku`；线路 ID → `tai-admin-models-lines?modelId=` |
| 导出 | `AdminExportCsvButton` 占位 |

**字段含义（列表）**

| 列 / 字段 | 含义 |
|-----------|------|
| **供应商** | 来自供应线路 `supplier`（如腾讯云、火山引擎）+ 可点 `sr-*` 进供应线路 |
| **计费 SKU** | 对客计费/套餐商品编码（如 `SKU-DS-IN` / `SKU-DS-OUT`） |
| **对外刊例价** | **我们对客户**的标准价目（`listPrice`，mock 文案） |
| **采购成本** | **我们对齐供应商刊例后**的内部成本参考（`internalCost`）；与线路 `costRef` 不一致时提示 |
| **供应商刊例（线路）** | **供应商给我们的**线路标价（只读，来自线路 `costRef`） |
| **毛利率（示意）** | 由对外刊例价与采购成本中的 ¥ 数字粗算，非财务结账口径 |

**两套「刊例」**：对外刊例价 = 出货侧价目；供应商刊例（线路）= 进货侧价目（线路表维护，刊例行不重复录入）。

新增/编辑刊例时必选 **逻辑模型 + 供应线路**（线路须属于该模型）；数据模型见 `mock.ts` · `ModelPricingRow`。

## 9. 接 API 后

替换 `mock` 与 `localStorage` 为接口层；列表分页、线路编辑、刊例与线路 `costRef` 同步。（v1 不含 **§4.6 API 与路由策略** 独立模块。）

