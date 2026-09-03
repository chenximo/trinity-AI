# 诊断列表（交付工程）

## 1. 一句话

规则引擎诊断页（④ 读口）：D1–D5 开放诊断列表、P0 样本 Q00 聚光灯、类型/优先级筛选与规则速查。

## 2. 本页规则

- 侧栏为诊断子导航（列表 / 审计 / 报告）；顶栏 `meta.nav = diagnosis`。
- Hash `#diag-q00` / `#diag-row-q00` 滚动并高亮（来自 dashboard / answer-detail）。
- 筛选逻辑与原型 `diagnosis.js` 一致：类型 × 优先级 × 搜索。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-diagnosis` |
| 路径 | `/console/diagnosis` |
| `meta.nav` | `diagnosis` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/diagnosis.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `DiagnosisPage.vue` | 整页模板（原型 class） |
| `diagnosis.css` | 增量 |
| `diagnosisInteractions.ts` | 筛选、hash 高亮 |
| `mock.ts` | KPI、5 条诊断、规则表 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET /api/console/brands/:id/diagnosis` 替换 `DIAGNOSIS_ROWS`；Q00 真源 `mvp/data/r1/diagnosis.json`。

## 6. 已知缺口

- 原型「?」帮助弹层（`proto-annotations.js`）未移植
- `audit` / `audit-reports` 仍为占位路由

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/diagnosis.md`
- 交互：`trinity-geo-prototype/marketing/js/diagnosis.js`
