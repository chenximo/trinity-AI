# 优化任务详情（交付工程）

## 1. 一句话

单条优化行动的工作台（样本 **opt-s1s2**）：任务说明、执行清单、验收标准，链诊断 / 验证 / 信源盘。

## 2. 本页规则

- 路由参数 `?id=opt-s1s2`（缺省即 Q00 文档树任务）。
- 侧栏「待办清单」高亮；顶栏 `meta.nav = optimize`。
- 「标记完成」保持 disabled（商用占位）。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-optimize-detail` |
| 路径 | `/console/optimize-detail?id=opt-s1s2` |
| `meta.nav` | `optimize` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/optimize-detail.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `OptimizeDetailPage.vue` | 整页模板 |
| `optimize-detail.css` | 增量 |
| `optimizeDetailInteractions.ts` | `?id` 解析 |
| `mock.ts` | opt-s1s2 真数据 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET /api/console/brands/:id/optimizations/:oid` 替换 `getOptimizeDetail()`。

## 6. 已知缺口

- 非 opt-s1s2 的 id 仅替换标题/状态占位

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/optimize-detail.md`
- 走查：`doc/Q00-WALKTHROUGH.md` §6
