# Q00 主链走查清单

对照原型：`npm run dev:trinity-geo-prototype` → `/__geo_marketing/console/*.html`  
交付工程：`cd apps/trinity-geo && bun run dev` → `/` 首页点「进入工作台」，或直达 `/console`（门户 `/trinity-geo/console`）

每页勾选：**布局 / 样式 class / 链接可达 / hash 深链 / 筛选交互**。

---

## 1. dashboard（① 可见性总览）

| 检查项 | 路径 / 操作 | 预期 |
|--------|-------------|------|
| 读口 Hub | 点击「问题集」卡 | → `keywords` |
| 读口 Hub | 点击「引用」「情感」「优化」卡 | citations / sentiment / optimize |
| Q00 下钻 | 问题表 Q00 链接 | → `keyword-detail?q=Q00` |
| 诊断条 | D1 链 `#diag-q00` | → `diagnosis#diag-q00` 聚光灯高亮 |
| 优化条 | `#opt-s1s2` | → `optimize#opt-s1s2` |
| 验证条 | Q00 详情 | → `verify#verify-q00` |
| 最新回答 | 豆包行 | → `answer-detail?id=Q00-doubao` |
| 顶栏 nav | 9 项高亮 | 当前页「总览」active |

---

## 2. keywords（问题集）

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 筛选 | 类型 / 状态 Tab | 列表计数变化 |
| 搜索 | 输入 Q00 | 仅显示匹配行 |
| 行内链接 | 问题文案 | → `keyword-detail?q=…` |
| 侧栏 | 监测概览 | → monitoring |
| 添加 | 手动添加 / AI 面板 | Toast、配额条更新 |

---

## 3. keyword-detail（Q00）

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 侧栏 | Q01–Q04 切换 | `?q=` 变化，SOA KPI 变 |
| 周期 Tab | 日/周/月 | `.on` 切换 |
| 信源 KPI | 链接 | → `answer-detail#cite-heading` |
| 诊断 callout | D1 链 | → `diagnosis#diag-q00` |
| 优化 callout | 链接 | → `optimize#opt-s1s2` |
| 分平台表「查看」 | 豆包 | → `answer-detail` |
| 最新回答 | 详情 | → `answer-detail` |
| 验证 hint | 链接 | → `verify#verify-q00` |

---

## 4. answer-detail（Q00 豆包）

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 面包屑 | Q00 | → `keyword-detail?q=Q00` |
| 参考来源 | `#cite-heading` 深链 | 滚动至 cite 区 |
| 外链 | openrouter 等 | 新标签打开 |
| 侧栏 | 诊断 → 优化 | diagnosis / optimize |
| 侧栏 | D1 信源缺口 | → `diagnosis#diag-q00` |

---

## 5. diagnosis（④）

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 筛选 | D1 / P0 | 仅 Q00 行 + 聚光灯 |
| 搜索 | `q00` | 匹配 Q00 行 |
| 聚光灯 | 信源盘 / 优化 | answer-detail#cite / optimize#opt-s1s2 |
| Q00 行 | 回答 / 优化 | answer-detail / optimize#opt-s1s2 |
| 规则折叠 | details 展开 | D1–D5 + S1–S4 表 |

---

## 6. optimize（⑤）

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 聚光灯 | 任务详情 | → `optimize-detail?id=opt-s1s2` |
| 状态筛选 | 进行中 | 2 行 + 聚光灯 |
| Q00 行 | 详情 / 验证 | optimize-detail / verify#verify-q00 |
| 映射表 | details 展开 | D*+S* 对照 |

---

## 7. verify（⑥）

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 筛选 | 信源先行 | Q00 索引 + 明细卡 |
| 聚光灯 | 明细 ↓ | `#verify-q00-detail` 滚动 |
| Q00 明细 | R1→R2 表 | 0/16→1/17、SOA 0% |
| 外链 | doc.trinitydesk.ai | 新标签 |
| Q01 行 | 切换 SOA 同步 | Q01 明细显示 |

---

## 8. 跨页故事（端到端）

1. dashboard → keyword-detail Q00 → answer-detail 信源 0/16  
2. → diagnosis D1 聚光灯 → optimize opt-s1s2 → optimize-detail 清单  
3. → verify Q00「部分改善」→ 信源 1/17、SOA 仍 0%

---

## 9. 已知占位（走查时标 ⚠️）

| 路由 | 从哪链入 |
|------|----------|
| `geo-citations` | dashboard、answer-detail、verify Q01 |
| `geo-sentiment` | dashboard、keyword-detail |
| `geo-competitors` / `geo-competitor-detail` | dashboard、keyword-detail |
| `geo-audit` | diagnosis、optimize、verify Q01 |
| `geo-answer-detail-brand` | diagnosis Q01、verify Q01 |
| `geo-settings-brand` | diagnosis D2、optimize D2 |
| `geo-monitoring` | keywords 侧栏 |

---

## 10. 记录模板

```
日期：
环境：5203 / 5173 portal
页面：
问题：（截图路径）
严重度：P0 阻断 / P1 样式 / P2 文案
```
