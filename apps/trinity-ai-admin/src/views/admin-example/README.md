# ExamplePage 示例页面

基于统一规范编写的列表页示例，参考 `doc/Admin列表页模板.md`。

## 规范要点

| 项目 | 说明 |
|------|------|
| **工具栏布局** | 左侧：查询条件；右侧：操作按钮 |
| **间距** | 查询条件、操作按钮之间的 gap 统一 0.5rem |
| **表格列宽** | 仅 `min-width`，全部左对齐 |
| **操作按钮** | `el-button link type="primary"` + icon + 文本 |

## 使用方式

1. 复制 `ExamplePage.vue` 作为新模块起点
2. 替换 `admin-example` 为实际模块名
3. 按业务需求调整：
   - `queryForm` 查询字段
   - `tableData` 表格列
   - API 调用

## 组件依赖

- `AdminSectionHead` - 页眉工具栏
- `AdminTablePagination` - 分页组件
- `AdminDialog` - 弹窗组件
