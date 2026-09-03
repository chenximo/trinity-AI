# 页面审计（交付工程）

## 1. 一句话

单 URL 可引用性评分：列表筛选 + 明细面板，对应诊断缺口 S4；对照 HTML 原型完整交互。

## 2. 本页规则

- 侧栏为诊断子导航（列表 / 审计 / 报告）；顶栏 `meta.nav = diagnosis`。
- 信号灯筛选：红灯 / 黄灯 / 绿灯 映射 `bad` / `mid` / `ok`。
- 点击行切换右侧因子明细；扫描 URL 表单 Toast Mock。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-audit` |
| 路径 | `/console/audit` |
| `meta.nav` | `diagnosis` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/audit.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `AuditPage.vue` | 整页模板（原型 class） |
| `audit.css` | 增量 |
| `auditInteractions.ts` | 行选、灯筛、搜索、扫描 Toast |
| `mock.ts` | `AUDIT_PAGES`、8 行列表、KPI |
| `README.md` | 本文 |

## 5. 接 API 时

`GET /api/console/brands/:id/audit/pages` 替换 `AUDIT_ROWS` + `AUDIT_PAGES`；扫描走 `POST …/audit/scan`。

## 6. 已知缺口

- 原型「?」帮助弹层未移植
- `geoRoutes.ts` 仍为占位，需工程师切换 component

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/audit.md`
- 交互：`trinity-geo-prototype/marketing/js/audit.js`
