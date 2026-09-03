# 问题集管理（交付工程）

## 1. 一句话

配置 SOA 分母：监测问法列表、类型分布、启停与手动/AI 添加；对照 HTML 原型完整交互。

## 2. 本页规则

- **SOA 分母** = 启用中的监测问题 × 10 平台 × 采集轮次。
- 暂停题不计入分母；删除仅对已暂停题开放。
- 问法为**用户口语**，非 SEO 词；类型：品类 / 品牌 / 对比 / 场景。
- 口径链见 `apps/trinity-product/docs/geo/product-design-analysis.md` §0.6。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-keywords` |
| 独立 app 路径 | `/console/keywords` |
| 门户路径 | `/trinity-geo/console/keywords` |
| `meta.nav` | `monitoring` |
| 入口 | `KeywordsPage.vue` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/keywords.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `KeywordsPage.vue` | 整页模板（类名与 HTML 原型一致） |
| `keywords.css` | 增量 |
| `keywordsInteractions.ts` | 筛选、添加、暂停、AI 建议、toast |
| `mock.ts` | 初始 11 题、模板、AI 建议、纯函数 |
| `README.md` | 本文 |

**样式**：沿用原型 `dash-*` / `geo-kw-*` 类名；全局 CSS 见 `main.ts` → `shell.css` + `vue-bridge.css`。

## 5. 接 API 时

1. `mock.ts` → `GET/POST/PATCH /api/console/brands/:id/questions`
2. `keywordsInteractions.ts` 内 toast/confirm 改为 API 错误态
3. 详情链 `row.detail` 由 API 返回 slug 或 id

## 6. 已知缺口

- `keyword-detail` / `answer-detail-brand` 目标页仍为占位
- PRD 链到 `__geo_marketing/console/keywords.md`（未接文档站）

## 7. 参考

- 原型 PRD：`trinity-geo-prototype/marketing/console/keywords.md`
- 样本真源：`trinity-geo-prototype/mvp/config/questions.json`
