# ops-admin-system · 运营后台管理系统（规范展示）

> **目录**：`apps/trinity-design/src/views/ops-admin-system/`  
> **文档真源**：[`docs/02-后台运营管理系统设计/`](../../../../docs/02-后台运营管理系统设计/)  
> **代码模板**：[`apps/trinity-ai-admin/doc/Admin列表页模板.md`](../../../trinity-ai-admin/doc/Admin列表页模板.md)

## 路由

| path | 页面 |
|------|------|
| `/admin-ops-spec` | [`OpsAdminSpecHub.vue`](./OpsAdminSpecHub.vue) |

## 目录

| 文件 | 说明 |
|------|------|
| `OpsAdminSpecHub.vue` | 规范站顶栏 + `admin-shell` 预览壳 |
| `ops-admin-spec-preview.css` | 预览壳样式（无侧栏，保留若依列表样式作用域） |
| `list-example/ListExamplePage.vue` | 复用 `@trinity-ai-admin` 的 `KeysPage`（平台密钥面板） |

## 与业务页对齐

列表样板**不单独维护**表格/筛选实现，直接渲染 [`KeysPage.vue`](../../../trinity-ai-admin/src/views/admin-keys/KeysPage.vue) 的 **platform-keys** 面板，与 `/trinity-ai-admin/keys/platform-keys` 一致。新建列表页请复制 `KeysPage` 结构或参阅 Admin 列表页模板文档。
