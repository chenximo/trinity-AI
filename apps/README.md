# apps · 产品线 Vite 应用

与 `docs/Trinity前端Vue与Monorepo工程方案.md` 一致；与仓库根目录静态站 **并行**，渐进迁移。  
**单端口开发枢纽**（聚合路由与各 app 视图）：见 `docs/Trinity开发枢纽与AI协作流程.md`。

## 已建应用

| 目录 | 包名 | 开发端口 | 说明 |
|------|------|-----------|------|
| **`trinity-portal`** | `@trinity/app-portal` | **5173** | **开发枢纽**：根目录 `npm run dev` 默认启动；路由聚合设计站与各产品骨架（详见 `docs/Trinity开发枢纽与AI协作流程.md`） |
| `trinity-ai` | `@trinity/app-trinity-ai` | 5201 | Trinity AI 用户站 |
| `ai-cloud` | `@trinity/app-ai-cloud` | 5202 | AI 云 |
| `trinity-geo` | `@trinity/app-trinity-geo` | 5203 | Trinity GEO |
| `trinity-ai-admin` | `@trinity/app-trinity-ai-admin` | 5204 | Trinity AI 管理端 |
| `trinity-design` | `@trinity/app-trinity-design` | 5210 | 设计枢纽（色板 + 规范，见 `docs/Trinity设计规范与设计色板Vue迁移计划.md`） |

根目录执行：`npm install` 后优先 **`npm run dev`**（门户 5173）；单独调试某 app 时用 `npm run dev:trinity-ai`、`npm run dev:trinity-design` 等（见根 `package.json` scripts）。  
（若本机已装 **pnpm**，可改回 `pnpm-workspace.yaml` + `workspace:*` 协议；当前骨架以 **npm workspaces** 验证通过。）

## 尚未创建（按需再加）

- `ai-cloud-admin`
- `trinity-geo-admin`
