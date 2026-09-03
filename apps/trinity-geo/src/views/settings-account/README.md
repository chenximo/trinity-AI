# 账户与套餐（交付工程）

## 1. 一句话

GEO 订阅用量与账户信息展示：套餐 KPI、配额表、静态表单；对照 HTML 原型。

## 2. 本页规则

- 侧栏为设置子导航；顶栏 `meta.nav = settings`。
- 配额表链到各管理页（RouterLink）；表单只读/商用占位。
- 无复杂交互层（静态展示为主）。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-settings-account` |
| 路径 | `/console/settings-account` |
| `meta.nav` | `settings` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/settings-account.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `SettingsAccountPage.vue` | 整页模板 |
| `settings-account.css` | 增量 |
| `mock.ts` | KPI、配额行、账户字段 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET /api/console/account` + 订阅/配额 endpoint 替换 mock。

## 6. 已知缺口

- 账单历史、保存账户为 disabled 商用占位
- `geoRoutes.ts` 仍为占位

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/settings-account.md`
