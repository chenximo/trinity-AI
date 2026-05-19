# admin-models · 原型待办

> 模型列表首批增强（供应商筛、跳转、重置）已完成（2026-05-19）。以下按建议顺序排期。

| ID | 状态 | 子页 | 任务 | 说明 |
|----|------|------|------|------|
| **MDL-01** | ✅ 完成 | `list` | 供应商筛选 + 线路数跳转 + 重置清搜索 | 供应商来自 `MODEL_SUPPLY_LINE_ROWS`；跳转 `lines?modelId=`；`models-list-supplier-filter` |
| **MDL-02** | ✅ 完成 | `lines` | **按模型/供应商筛选** + **线路探测** + 若依列表布局 | `models-supply-lines`；`ADMIN_TABLE_COL`；调整优先级二期 |
| **MDL-03** | ✅ 完成 | `master` | **主数据按模型** | 模型下拉 + 摘要条 + 双卡片；编辑弹窗 → `models-master-records`；列表「主数据」与 `?modelId=` |
| **MDL-07** | ✅ 完成 | `pricing` | **刊例与成本** | 模型筛选、CRUD、`models-pricing-rows`、毛利率/生效自/线路成本引用、SKU→套餐、导出占位 |
| MDL-04 | 待做 | `bindings` | 绑定/解绑、启停、变更预览 | 对齐后端 §4.2.4 |
| MDL-05 | 待做 | `list` | `ADMIN_TABLE_COL` 列宽档位 | 对齐 [`运营后台-若依式列表规范.md`](../../../doc/运营后台-若依式列表规范.md) |
| MDL-06 | 待做 | — | 独立「上下架 / 灰度」子页或灰度表单 | 详设 §4.5 二级页；当前灰度仅在列表筛选 |

**工程期**：列表/线路/绑定接 `GET/POST /v1/admin/models` 等；§4.6 路由策略模块仍不在 v1 导航。

---

*维护：完成 MDL-xx 后改上表状态，并在 `README.md` §二次开发 登记。*
