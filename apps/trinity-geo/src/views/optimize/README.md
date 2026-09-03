# 优化待办（交付工程）

## 1. 一句话

诊断 → 行动工作台（⑤ 读口）：5 条优化项、P0 样本 opt-s1s2 聚光灯、状态筛选与 D*/S* 映射表。

## 2. 本页规则

- 侧栏：优化待办 / 效果验证；顶栏 `meta.nav = optimize`。
- Hash `#opt-s1s2` 命中聚光灯；`#opt-d4` 等解析为 `#opt-row-d4`（与原型 `optimize.js` 一致）。
- 「从 P0 生成」按钮保持 disabled（商用占位）。

## 3. 工程对齐

| 项 | 值 |
|----|-----|
| 路由 name | `geo-optimize` |
| 路径 | `/console/optimize` |
| `meta.nav` | `optimize` |
| HTML 对照 | `trinity-geo-prototype/marketing/console/optimize.html` |

## 4. 五件套

| 文件 | 职责 |
|------|------|
| `OptimizePage.vue` | 整页模板 |
| `optimize.css` | 增量 |
| `optimizeInteractions.ts` | 状态筛选、搜索、hash 高亮 |
| `mock.ts` | KPI、5 行行动、映射表 |
| `README.md` | 本文 |

## 5. 接 API 时

`GET /api/console/brands/:id/optimizations` 替换 `OPTIMIZE_ROWS`。

## 6. 已知缺口

- `optimize-detail` 仍为占位
- 原型帮助弹层未移植

## 7. 参考

- PRD：`trinity-geo-prototype/marketing/console/optimize.md`
- 交互：`trinity-geo-prototype/marketing/js/optimize.js`
