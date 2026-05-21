# user-admin-system · 用户后台（规范展示）

> **目录**：`apps/trinity-design/src/views/user-admin-system/`  
> **文档真源**：[`docs/03-用户后台管理系统/用户后台管理风格统一规范.md`](../../../../docs/03-用户后台管理系统/用户后台管理风格统一规范.md)  
> **Agent 操作手册**：[`trinity-user-console`](../../../../.cursor/skills/trinity-user-console/SKILL.md)（生成 Vue 前先读；本页为视觉样例）  
> **工程真源**：[`apps/trinity-ai/src/views/account/`](../../../trinity-ai/src/views/account/README.md)

## 路由

| path | 页面 |
|------|------|
| `/user-console-spec` | [`UserConsoleSpecHub.vue`](./UserConsoleSpecHub.vue) · **用户后台·规范**（条文 + 内联样例） |
| `/user-console-preview` | 重定向至 `/user-console-spec#spec-2-main`（已合并，勿再维护独立打样页） |

## 锚点

| 锚点 | 内容 |
|------|------|
| `#spec-1-layout` | §1 整体布局 |
| `#spec-2-main` | §2 主列五步（条文） |
| **`#spec-sample-main`** | **唯一整页样例**（表头/对齐 + 主列五步） |
| `#spec-3-table` | §3 表格规则矩阵 + 操作列两分叉 |
| `#spec-sample-table-actions-buttons` | UC-TBL-OPS-01 · &lt;4 线框横排 |
| `#spec-sample-table-actions-menu` | UC-TBL-OPS-02 · ≥4 ⋮ |
| `#uc-spec-note-col-layout` 等 | 页内**蓝条**重要条文（见规范页「重要规范索引」） |

## 迭代规范（每次只改本目录）

改 ⓘ、搜索、表头、操作列等：**只动** `UserConsoleSpecHub.vue`、`console-sample/*`、`user-console-spec-guide.css` + Skill + `docs/03`。**勿**顺带改 `ConsolePage.vue`、`console.html`、`trinity-base.css`（除非你明确说「落地工程」）。

## 与完整原型的关系

| 用途 | 地址 |
|------|------|
| **规范 + 样例**（改页时首选） | `/user-console-spec` |
| **完整产品原型**（真交互） | [`/trinity-ai/account/console`](/trinity-ai/account/console) · `ConsolePage.vue` |

勿在规范站嵌入整页 `ConsolePage`（体量大、依赖 legacy 脚本）；需要真交互请走产品链接。

## 实施顺序

1. **先定规范**：`/user-console-spec` + `docs/03` §4.1（样例 = 目标态）。  
2. **再改工程**：按 Skill 规则 ID 对齐 `trinity-base.css` 与业务页。
