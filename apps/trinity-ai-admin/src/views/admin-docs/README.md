# admin-docs · 文档中心（P8）

| 文件 | 说明 |
|------|------|
| `DocsPage.vue` | 三子页：**文档**（列表 + 编辑合一）/ 发布与回滚 / 可见范围 |
| `mock.ts` | 默认行与 `DOC_PANEL_ORDER`（与 `moduleSecondaryPages` 中 `tai-admin-docs` 一致） |
| `docsInteractions.ts` | `localStorage` 读写 |
| `docs.css` | `doc-page__*` 样式 |

## 文档（原列表 + 编辑与版本）

- 侧栏仅 **「文档」** 一项；`/docs/list`（`tai-admin-docs-list`）。
- 无 `?id=`：全宽文档表；点击行或「编辑」→ `?id=doc-xxx`。
- 有 `?id=`：左侧文档目录 + 右侧 Markdown / 预览 / 版本树。
- 旧路由 `/docs/editor`、`tai-admin-docs-editor` **重定向** 到列表并保留 `id` 查询参数。

设计依据：**§4.9**；路由前缀 `docs/`、`tai-admin-docs-*`。
