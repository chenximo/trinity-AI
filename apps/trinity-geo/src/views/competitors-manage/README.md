# 竞品管理（交付工程）

## 1. 一句话

维护对比侧实体与竞品别名：展开行编辑、筛选、手动/AI 添加、保存 Toast、配额条；对照 HTML 原型。

## 2. 本页规则

- 侧栏为竞品子导航（概览 / 管理）；顶栏 `meta.nav = competitors`。
- 初始 6 家竞品来自 `mvp/config/brand.json` 样本。
- 暂停后不参与同题 SOA；别名变更标记重算队列。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-competitors-manage` |
| 路径 | `/console/competitors-manage` |
| `meta.nav` | `competitors` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/competitors-manage.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `CompetitorsManagePage.vue` | 整页模板 |
| `competitors-manage.css` | 增量 |
| `competitorsManageInteractions.ts` | 展开、筛选、CRUD、AI、Toast |
| `mock.ts` | 6 竞品、AI 建议、纯函数 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET/PATCH /api/console/brands/:id/competitors` 替换 `INITIAL_COMPETITORS`。

## 6. 已知缺口

- `geo-competitor-detail` 仍为占位
- `geoRoutes.ts` 仍为占位

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/competitors-manage.md`
- 交互：`trinity-geo-prototype/marketing/js/competitors-manage.js`
