# 新增若依式列表页

## READ

本 Skill + `docs/02-后台运营管理系统设计/运营后台-若依式列表规范.md`

## 步骤

1. 确认模块名和 views 目录（参考 `docs/02-后台运营管理系统设计/后台原型总览.md`）
2. 创建页面骨架：`el-card.admin-ep-card` → `AdminSectionHead[toolbar-only]` → `el-table.admin-ep-table-wrap` → `AdminTablePagination`
3. 配置 `AdminListQuery` 工具栏（搜索 → 筛选 → 重置 / `#actions` 主按钮）
4. 设置列宽：数据列 `:min-width="ADMIN_TABLE_COL.*"`，操作列 `:width="ADMIN_TABLE_COL_OPS.*"` + `fixed="right"`
5. 全部左对齐，不写列级 `align`
6. 操作列用 `div.admin-ep-row-actions` + `flex-wrap`

## 检查

- [ ] `toolbar-only` + `admin-ep-table-wrap`
- [ ] 无列级 `align`
- [ ] `ADMIN_TABLE_COL` + `admin-ep-row-actions`
- [ ] 参考 `KeysPage.vue` 实现
