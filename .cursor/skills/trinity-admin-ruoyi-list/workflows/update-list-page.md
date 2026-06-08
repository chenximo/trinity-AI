# 修改已有列表页

## READ

本 Skill + 目标页面 views 文件 + `admin-ruoyi.css` / `admin-page.css`

## 步骤

1. 确认修改范围（工具栏 / 表格列 / 操作列 / 样式）
2. 工具栏：左右布局 `gap: 0.5rem`，`@reset` 清空本表筛选
3. 表格列：保持 `ADMIN_TABLE_COL` 约束，无列级 `align`
4. 操作列：`admin-ep-row-actions` + 自定义单元格 `v-if="scope?.row"`
5. 样式：优先改 CSS 变量，不改页面结构

## 注意事项

- 不改骨架结构（`el-card` → `AdminSectionHead` → `el-table` → `AdminTablePagination`）
- 操作列禁止居中，禁止 `align="center"`
- 跨模块样式优先改 `admin-ruoyi.css`
