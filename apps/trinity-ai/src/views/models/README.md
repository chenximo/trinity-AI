# 模型目录模块（原型）

> 目录与交付约定见仓库根文档：`docs/Trinity原型模块目录与交付规范.md`。

## 1. 一句话

模型目录页原型：筛选、排序与列表在 `ModelsPage.vue` 单文件模板中；示例数据与纯函数在 `mock.ts`；样式为全局 `models.css`（非 CSS Modules，避免 `orc-*` 等类名被哈希）；`body` 类名等 DOM 副作用在 `modelsInteractions.ts`。

## 2. 五件套（本目录仅五个文件）

| 文件 | 职责 |
|------|------|
| `ModelsPage.vue` | 路由入口：侧栏筛选、主列目录、页脚 |
| `models.css` | 模块样式（自 `TrinityAI/app/models.html` 迁入；与 `main#main:has(.models-root)` 等壳层配合） |
| `modelsInteractions.ts` | 窄屏筛选抽屉与 `document.body` 类名同步 |
| `mock.ts` | `CATALOG_MODELS`、`PROVIDER_PILLS`、`MODALITY_ORDER`、`contextLabel`、`priceInSortKey` 等 |
| `README.md` | 本说明 |

## 3. 路由

| 路径（独立 `trinity-ai`） | 路由 name | 说明 |
|---------------------------|-----------|------|
| `/models` | `tai-models` | 懒加载，见 `src/trinityAiRoutes.ts` |

嵌套在 `apps/trinity-portal` 的 `/trinity-ai` 下时为 `/trinity-ai/models`，共用同一路由表。

## 4. 依赖样式

- 本目录：`models.css`（入口 Vue 中 `import`）。
- 全局：`packages/ui` / `trinity-base` 设计 token（变量名与营销壳一致）。

## 5. 接 API / 正式开发时建议优先动哪些文件

1. `mock.ts` → 换为请求层 + 类型（或薄封装）。
2. `modelsInteractions.ts` → 若抽屉改为组件内实现，可删除 `body` 同步或迁入布局组件。
3. `ModelsPage.vue`：保留编排或按产品拆分（若规范允许子组件）。

## 6. 已知缺口与风险

- 侧栏大量 `details` 勾选为静态占位，未参与过滤逻辑。
- 无障碍与错误态为占位级别。

## 7. 参考

- 静态原型：`TrinityAI/app/models.html`
- 域说明写作模板：`docs/Trinity域模块说明-写作模板.md`
