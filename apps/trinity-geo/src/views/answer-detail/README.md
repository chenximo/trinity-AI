# 回答详情（交付工程）

## 1. 一句话

单条 AI 回答的测量证据页（样本 **Q00 · 豆包 R1**）：正文、参考来源分组、侧栏标注与诊断跳转。

## 2. 本页规则

- 路由参数 `?id=Q00-doubao` 区分采集记录；缺省为 Q00 豆包样本。
- Hash `#cite-heading` 滚动至参考来源区（来自 keyword-detail / dashboard 下钻）。
- 读口 ③ 原始证据，非优化工作台。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-answer-detail` |
| 路径 | `/console/answer-detail?id=Q00-doubao` |
| `meta.nav` | `monitoring` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/answer-detail.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `AnswerDetailPage.vue` | 整页模板（原型 class） |
| `answer-detail.css` | 增量 |
| `answerDetailInteractions.ts` | `?id` 解析、hash 滚动 |
| `mock.ts` | Q00 豆包真数据 |
| `README.md` | 本文 |

**样式**：全局 `shell.css` + `dashboard.css` 中 `geo-answer-*` / `geo-cite-*` 已 vendored。

## 5. 接 API 时

`GET /api/console/brands/:id/answers/:aid` 替换 `getAnswerDetail()`。

## 6. 已知缺口

- 非 Q00-doubao 的 id 仅替换元信息，正文仍用 Q00 Mock
- `answer-detail-brand`（Q01 正样本）为下一页或并行占位

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/answer-detail.md`
- 样本：`mvp/data/r1/cited_sources.json`
