# ExamplePage 列表页模板示例

参考 API 密钥页面（`admin-keys/KeysPage.vue`）实现的完整列表页规范演示。

## 规范要点

| 项目 | 说明 |
|------|------|
| **工具栏布局** | 使用 `AdminListQuery` 组件，左侧搜索/筛选/重置，右侧操作按钮 |
| **间距** | 统一 `gap: 0.5rem` |
| **表格列宽** | 使用 `ADMIN_TABLE_COL` 常量，仅 `min-width`，全部左对齐 |
| **操作按钮** | `el-button link type="primary"` + icon + 文本，危险操作用 `type="danger"` |
| **操作列** | `admin-ep-row-actions` 容器，按钮数量多时自动换行 |

## 文件结构

```
views/admin-example/
├── ExamplePage.vue    # 页面组件
├── mock.ts            # Mock 数据
└── example.css        # 模块样式
```

## 使用方式

1. 复制 `ExamplePage.vue`、`mock.ts`、`example.css`
2. 替换 `admin-example` 为实际模块名
3. 调整：
   - Mock 数据结构和字段
   - 表格列（使用 `ADMIN_TABLE_COL` 常量）
   - 操作按钮逻辑
   - 弹窗表单字段

## 组件依赖

- `AdminSectionHead` - 页眉工具栏
- `AdminListQuery` - 查询工具栏（搜索 + 筛选 + 操作按钮）
- `AdminTablePagination` - 分页组件
- `AdminDialog` - 弹窗组件
- `adminTableColumns` - 列宽常量
