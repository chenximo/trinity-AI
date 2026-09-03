# 效果验证（交付工程）

## 1. 一句话

R1 → R2 验收页（⑥ 读口）：Q00 先进盘样本 + Q01 CCR/SOA 对照，含索引表与明细卡片。

## 2. 本页规则

- 侧栏与 optimize 共用；顶栏 `meta.nav = optimize`（与原型一致，优化 Tab 高亮）。
- Hash `#verify-q00` 解析至明细卡；`#verify-q01` → `verify-q01-detail`。
- 筛选：全部 / 信源先行 / SOA 同步（同步过滤聚光灯、索引行、明细卡）。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-verify` |
| 路径 | `/console/verify` |
| `meta.nav` | `optimize` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/verify.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `VerifyPage.vue` | 整页模板 |
| `verify.css` | 增量 |
| `verifyInteractions.ts` | 筛选、hash、单列布局 |
| `mock.ts` | KPI、Q00/Q01 样本 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET /api/console/brands/:id/verifications` 替换 `VERIFY_CASES`；Q00 真源 `mvp/data/r2/verify.json`。

## 6. 已知缺口

- 「触发 R2 采集」保持 disabled
- 原型帮助弹层未移植

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/verify.md`
- 交互：`trinity-geo-prototype/marketing/js/verify.js`
