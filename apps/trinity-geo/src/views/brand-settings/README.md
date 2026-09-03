# 品牌设置（交付工程）

## 1. 一句话

配置品牌实体与别名库（测量引擎输入）：添加/删除/启停别名、推荐 chip、保存 Toast、重算状态。

## 2. 本页规则

- 侧栏为设置子导航；顶栏 `meta.nav = settings`。
- 主名称「Trinity AI」锁定不可删/不可关。
- 别名变更标记「保存后排队」；保存后 Toast + 重算状态更新。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-settings-brand` |
| 路径 | `/console/brand-settings` |
| `meta.nav` | `settings` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/brand-settings.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `BrandSettingsPage.vue` | 整页模板 |
| `brand-settings.css` | 增量 |
| `brandSettingsInteractions.ts` | 别名 CRUD、搜索、保存/重算 |
| `mock.ts` | 8 个别名、推荐 chip、表单默认值 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET/PATCH /api/console/brands/:id` + `entity_aliases` 子资源替换 mock。

## 6. 已知缺口

- Logo 上传、行业/URL 表单保存为静态展示
- `geoRoutes.ts` 仍为占位

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/brand-settings.md`
- 交互：`trinity-geo-prototype/marketing/js/brand-settings.js`
