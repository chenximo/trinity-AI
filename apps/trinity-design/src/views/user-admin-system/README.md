# user-admin-system · 用户管理系统（规范展示）

> **目录**：`apps/trinity-design/src/views/user-admin-system/`  
> **文档真源**：[`docs/03-用户后台管理系统/用户后台管理风格统一规范.md`](../../../../docs/03-用户后台管理系统/用户后台管理风格统一规范.md)  
> **工程真源**：[`apps/trinity-ai/src/views/account/`](../../../trinity-ai/src/views/account/README.md)

## 路由

| path | 页面 |
|------|------|
| `/user-console-spec` | [`UserConsoleSpecHub.vue`](./UserConsoleSpecHub.vue) · 打样 |

## 目录

| 文件 | 说明 |
|------|------|
| `UserConsoleSpecHub.vue` | 规范站顶栏 + 打样页 |
| `console-sample/ConsoleSamplePage.vue` | 参考 `account` 的左栏/主列打样（`account.css`） |
| `user-console-spec-preview.css` | 枢纽内全高预览 |

## 与完整原型的关系

| 用途 | 地址 |
|------|------|
| **打样**（布局 + token，无 legacy 脚本） | `/user-console-spec` |
| **完整产品原型** | [`/trinity-ai/account/console`](/trinity-ai/account/console) · `ConsolePage.vue` |

勿在规范站嵌入整页 `ConsolePage`（体量大、依赖 legacy 脚本）；需要真交互请走产品链接。
