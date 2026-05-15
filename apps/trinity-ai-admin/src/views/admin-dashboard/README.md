# admin-dashboard · 工作台（P0）

## 1. 一句话

工作台 **概览 KPI** + **只读 Widget**（mock），深链到各子域占位路由；对齐 **`docs/AI-API聚合平台-后台管理系统-详细设计-v1.md` §4.1**。

## 2. 路由

| path | name | 入口 |
|------|------|------|
| `/dashboard` | `tai-admin-dashboard` | `DashboardPage.vue` |

## 3. 五件套

| 文件 | 职责 |
|------|------|
| `DashboardPage.vue` | 整页模板 + 注释分区 |
| `dashboard.css` | 工作台局部样式 |
| `dashboardInteractions.ts` | 预留（无 DOM 副作用） |
| `mock.ts` | `DASHBOARD_KPIS`、`DASHBOARD_WIDGETS` |
| `README.md` | 本说明 |

## 4. 接 API 后

用接口数据替换 `mock.ts`；KPI 时间范围、刷新写入 `dashboardInteractions.ts`。
