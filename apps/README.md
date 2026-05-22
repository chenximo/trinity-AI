# apps · 产品线 Vite 应用

与 [`docs/04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md`](../docs/04-工程与迁移/Trinity前端Vue与Monorepo工程方案.md) 一致；与仓库根目录静态站 **并行**，渐进迁移。  
**单端口开发枢纽**：[`docs/00-协作与工作流/Trinity开发枢纽与AI协作流程.md`](../docs/00-协作与工作流/Trinity开发枢纽与AI协作流程.md)。

---

## 文档放哪（与本目录相关）

| 类型 | 位置 |
|------|------|
| **仓库级规范**（五件套、版式、运营后台若依列表等） | [`docs/`](../docs/README.md) → `01` `02` … |
| **本 app 的具体业务**（详设对照、后端清单、原型总览、列表模板） | **`apps/<本app>/doc/`** |
| **单模块交付**（路由、mock、接 API） | **`apps/<本app>/src/views/<模块>/README.md`** |
| **一次性 AI 生成稿** | [`docs/06-归档与提示词/`](../docs/06-归档与提示词/) |
| **方案对比、方法论、汇报** | [`docs/08-方法论与汇报/`](../docs/08-方法论与汇报/) |

示例：`trinity-ai-admin/doc/`（创建后端需实现、Admin 列表模板）；运营后台 **UI 规范** 在 `docs/02-后台运营管理系统设计/`。

---

## 已建应用

| 目录 | 包名 | 开发端口 | 说明 |
|------|------|-----------|------|
| **`trinity-portal`** | `@trinity/app-portal` | **5173** | **开发枢纽**：根目录 `npm run dev` 默认启动 |
| `trinity-ai` | `@trinity/app-trinity-ai` | 5201 | Trinity AI 用户站 |
| `ai-cloud` | `@trinity/app-ai-cloud` | 5202 | AI 云 |
| `trinity-geo` | `@trinity/app-trinity-geo` | 5203 | Trinity GEO |
| `trinity-ai-admin` | `@trinity/app-trinity-ai-admin` | 5204 | 运营后台原型 |
| `trinity-docs` | `@trinity/app-trinity-docs` | **5205** | **API 文档站**（VitePress）；开发枢纽 FAB 外链 |
| `trinity-design` | `@trinity/app-trinity-design` | 5210 | 设计枢纽：色板、UI 规范、运营/用户后台规范展示 |

根目录：`npm install` 后 **`npm run dev`**（5173）；单 app 见根 `package.json` 的 `dev:*` scripts。

## 尚未创建（按需再加）

- `ai-cloud-admin`
- `trinity-geo-admin`
