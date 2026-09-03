# 关键词详情（交付工程）

## 1. 一句话

单题可见性下钻（样本 **Q00**）：左侧问题集导航 + KPI、趋势、竞品排名、叙事标签、分平台表与最新回答。

## 2. 本页规则

- 路由参数 `?q=Q00` 切换题目；未配置详情时复用 Q00 布局并替换标题/SOA。
- 读口 ① 下钻单元，非 SKU 目录；口径见 `product-design-analysis.md` §0.6。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-keyword-detail` |
| 路径 | `/console/keyword-detail?q=Q00` |
| `meta.nav` | `monitoring` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/keyword-detail.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `KeywordDetailPage.vue` | 整页模板（原型 class） |
| `keyword-detail.css` | 增量 |
| `keywordDetailInteractions.ts` | 周期 Tab、`?q` 解析 |
| `mock.ts` | Q00 真数据 + 侧栏导航 |
| `README.md` | 本文 |

**样式**：`main.ts` 全局 `shell.css` + `vue-bridge.css`；类名与 HTML 一致。

## 5. 接 API 时

`GET /api/console/brands/:id/questions/:qid/summary` 替换 `getKeywordDetail()`。

## 6. 已知缺口

- Q01–Q04 仅侧栏与标题占位，内容仍用 Q00 结构 Mock
- `answer-detail` 目标页为占位

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/keyword-detail.md`
- 样本：`mvp/data/r1/annotations.json`（Q00）
