# 02 · 后台运营管理系统设计

> **定位**：平台内部员工使用的 **运营后台**（`trinity-ai-admin` 及后续同类 app）共用工程与列表 UI 约定。  
> **用户侧控制台**（租户 Account 等）见 [`03-用户后台管理系统/`](../03-用户后台管理系统/)。  
> **全站版式**（颜色、字号）见 [`01/Trinity版式与视觉规范.md`](../01-原型与交付规范/Trinity版式与视觉规范.md)。  
> **产品 IA / 字段 / 批次**见 [`05/产品与PRD/`](../05-产品与PRD/)。

| 文档 | 说明 |
|------|------|
| [运营后台-若依式列表规范.md](./运营后台-若依式列表规范.md) | Element Plus 列表页 **唯一 UI 真源**（参考 `trinity-ai-admin` · `KeysPage.vue`） |
| [后台原型总览.md](./后台原型总览.md) | 模块 ↔ `views` 对照（**参考** `trinity-ai-admin`；单 app 业务细节以 `apps/trinity-ai-admin/doc/` 为准） |
| [运营后台开发规范.md](./运营后台开发规范.md) | flex 布局、操作列宽度、排查顺序 |
| [设计待办.md](./设计待办.md) | 设计相关待办 |

**应用内仍保留**（仅 `trinity-ai-admin`）：[`apps/trinity-ai-admin/doc/`](../../apps/trinity-ai-admin/doc/)（后端对照、列表页代码模板）。

**可运行样板**：开发枢纽 **`http://localhost:5173/admin-ops-spec`**（`apps/trinity-design/src/views/ops-admin-system/`）。

**设计枢纽**：[`01/Trinity设计枢纽（色板+规范）落地计划.md`](../01-原型与交付规范/Trinity设计枢纽（色板+规范）落地计划.md)
