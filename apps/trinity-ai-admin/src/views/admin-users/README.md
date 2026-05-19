# 用户与认证模块

包含用户管理、审核队列、白名单、黑名单、实名/企业认证五个子模块。

## 页面结构

```
admin-users/
├── UsersPage.vue      # 主页面组件（多面板切换）
├── users.css          # 模块样式
├── mock.ts            # Mock 数据
└── usersInteractions.ts  # localStorage 持久化交互
```

## 子模块说明

| 模块 | 面板 ID | 功能 |
|------|---------|------|
| 用户列表 | `list` | 用户检索、状态筛选、新增/编辑/冻结/删除 |
| 审核队列 | `audit-queue` | 待审核用户通过/拒绝 |
| 白名单 | `whitelist` | 邮箱域名/手机号段放行规则 |
| 黑名单 | `blacklist` | 邮箱/手机/用户ID封禁 |
| 实名认证 | `kyc` | 实名/企业认证审核记录 |

## 规范要点

| 项目 | 说明 |
|------|------|
| **工具栏布局** | 使用 `AdminListQuery` 组件，左侧搜索/筛选/重置，右侧操作按钮 |
| **表格列宽** | 使用 `ADMIN_TABLE_COL` 常量，仅 `min-width`，全部左对齐 |
| **操作按钮** | `el-button link type="primary"` + icon + 文本，危险操作用 `type="danger"` |
| **危险操作** | 删除/冻结/解冻经弹窗二次确认（`usrDangerOpen` 统一处理） |
| **状态标签** | 正常→绿色、通过→绿色、待审→黄色、拒绝→红色、已冻结→灰色 |

## 状态机

```
注册 → 验证 → 待审核 → 通过（正常）/ 拒绝（已拒绝）
                    ↘ 冻结（已冻结）
```

## 数据持久化

Mock 数据存储于 `localStorage`：
- 用户列表：`trinity-ai-admin:terminal-users-rows`
- 用户筛选：`trinity-ai-admin:terminal-users-filter`
- 白名单：`trinity-ai-admin:users-whitelist-rows`
- 黑名单：`trinity-ai-admin:users-blacklist-rows`
- 认证记录：`trinity-ai-admin:users-kyc-rows`

## 组件依赖

- `AdminSectionHead` - 页眉工具栏
- `AdminListQuery` - 查询工具栏（搜索 + 筛选 + 操作按钮）
- `AdminTablePagination` - 分页组件
- `AdminDialog` - 弹窗组件
- `adminTableColumns` - 列宽常量
