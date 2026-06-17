---
title: 用户控制台 Dashboard · 原型规格
---

# 用户控制台 · Dashboard 首页 · V1 原型规格

> **页面**：用户控制台 P0 · Dashboard（`/console/dashboard`）  
> **上级清单**：[原型页面清单 · 用户控制台](../v1-prototype-pages#21-可见性总览1-页)  
> **战略对齐**：[产品设计分析 · 监测与测量](../product-design-analysis) · [业务全景 · ③ 测量](../business-landscape#measurement-soa-impl)  
> **技术对齐**：[技术架构 · 测量 SOA](../tech-architecture#measurement-soa)  
> **用途**：**当前 HTML 原型切片** 的逐块规格（Figma / 验收）；**不定义**完整 GEO 产品终局。  
> **产品解读**（完整能力、六环映射）：[`marketing/console/dashboard.md`](../../../../trinity-geo/marketing/console/dashboard.md)  
> **全景真源**（不拆版本）：[业务全景](../business-landscape)  
> **HTML 实现**：`apps/trinity-geo/marketing/console/dashboard.html` · `marketing/css/dashboard.css` · `marketing/js/dashboard.js`  
> **预览**：`cd apps/trinity-geo && bun run dev` → [http://127.0.0.1:5203/__geo_marketing/console/dashboard.html](http://127.0.0.1:5203/__geo_marketing/console/dashboard.html)

| 项 | 值 |
|----|-----|
| 路由 | `/console/dashboard`（门户 `/trinity-geo/console/dashboard`） |
| 优先级 | P0 |
| 目标用户 | 已注册试用用户（品牌 / SEO / 增长负责人） |
| 核心任务 | **10 分钟内**看懂「我的品牌在 AI 答案里表现如何」并下钻监测/竞品 |
| 示例品牌 | Trinity AI（与 [MVP 实践手册](../mvp-practice) 样本一致） |
| 设计系统 | `geo-console-*` + `packages/tokens`；海外 `--geo-overseas-*` · 国内 `--geo-domestic-*` |

### 与官网 Hero Mock 的关系

官网 [v1-homepage](./v1-homepage) Hero 右栏 `geo-dashboard` 是 **营销裁剪版**（双 SOA 卡 + 迷你趋势 + 两行回答）。  
本页是 **完整控制台 Dashboard**：同套 metric 卡样式、同套海外/国内 Tab，并扩展趋势图、平台分布、回答流、竞品摘要。

---

## 一、页面目标与信息层次

### 1.1 用户进入时的心理问题

| 顺序 | 用户问题 | Dashboard 须回答的位置 |
|:----:|----------|------------------------|
| 1 | 整体好不好？变好了还是变差？ | SOA 总览卡 + 趋势图 + 周环比 |
| 2 | 海外和国内分别怎样？ | 市场 Tab + 双 SOA 卡 + 平台分布分组 |
| 3 | 哪些平台 / 哪些问题拖后腿？ | 平台分布条 · 回答流「未进答案」标记 |
| 4 | 竞品有没有超过我？ | 竞品对比摘要 |
| 5 | 下一步该点哪里？ | 回答流 / 关键词 / 竞品 链到子页（原型可先 `#`） |
| 6 | SOA 是什么？ | 首次 Tooltip + 链帮助（V1 可仅 Tooltip） |

### 1.2 页面信息架构（控制台 Dashboard · 8 区块）

```
0. geo-console-shell · 顶栏 [Logo→Dashboard] 监测 竞品 [账户]
1. dash-toolbar · 品牌名 + 市场 Tab（全部/海外/国内）+ 周期（日/周/月）+ 上次更新
2. dash-kpi · 4 卡：总 SOA · 海外 SOA · 国内 SOA · 总提及（随 Tab 高亮相关卡）
3. dash-trend · SOA 折线（双线：海外实线 / 国内虚线；Tab=全部时双显）
4. dash-platforms · 10 平台横向条图（海外组 | 国内组）
5. dash-answers · 最新 AI 回答流（平台 · 关键词 · 片段 · 进答案 Y/N · 时间）
6. dash-competitors · 竞品 SOA 摘要表（关键问题集 Top N）
7. dash-sentiment · 基础情感条（正面 / 中性 / 负面 %）— V1 简化一条
8. dash-onboard · 首次 3 步引导浮层（可关闭，localStorage）
```

**Wireframe（桌面 ≥1200px）**

```
┌──────────────────────────────────────────────────────────────┐
│ [★ Trinity GEO]    监测    竞品              Trinity AI ▾ 账户 │
├──────────────────────────────────────────────────────────────┤
│ Trinity AI · Dashboard          [全部][海外][国内]  [日周月] │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ SOA 总览 │ 海外 SOA │ 国内 SOA │ 总提及   │ 情感 ███░░ 72%正 │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│ SOA 趋势（折线）                              [?] SOA 释义   │
├────────────────────────────┬─────────────────────────────────┤
│ 平台 SOA 分布（10）         │ 竞品对比（品类词 Top 3）         │
├────────────────────────────┴─────────────────────────────────┤
│ 最新 AI 回答                                                  │
│ ChatGPT · 品类词 · …OpenRouter…           未进答案 · 2h前    │
│ 豆包   · 品类词 · …TokenHub…              未进答案 · 2h前    │
└──────────────────────────────────────────────────────────────┘
```

---

## 二、全局 chrome · 控制台壳 `geo-console-shell`

| 元素 | 规格 |
|------|------|
| 顶栏高 | 56px；白底 + 底边框 |
| Logo | 套件星标 + Trinity GEO；点击 → Dashboard |
| 主导航 | **监测** · **竞品** · **诊断** · **优化** · **报告** · **设置**（全貌顶栏；未实现页可灰态） |
| 右侧 | 当前品牌名 + 账户入口（原型占位） |
| 内容区 | max-width 1280px；padding 24px；背景 `--surface` 浅灰 |

与官网 `geo-header` **分离**：控制台不用 15% 营销留白，用 **全宽工作台** 布局。

---

## 三、区块规格

### 1. Toolbar `dash-toolbar`

| 字段 | 规格 |
|------|------|
| 标题 | `{品牌名} · 可见性概览` |
| 市场 Tab | `全部` `海外` `国内` — 切换后 KPI / 趋势 / 平台条 **过滤或强调** |
| 周期 | `日` `周` `月` — 切换趋势 X 轴粒度（原型可只换标签，数据 mock 微调） |
| 元信息 | `上次更新：今日 09:12 · 豆包等 10 平台` |

### 2. KPI 卡 `dash-kpi`

| 卡片 | 主指标 | 副指标 | 色 |
|------|--------|--------|-----|
| SOA 总览 | `18%` | ↑2% 较上周 | `--grad` 强调 |
| 海外 SOA | `24%` | ↑6% | `--geo-overseas` |
| 国内 SOA | `12%` | ↓3% | `--geo-domestic` |
| 总提及 | `47` | 本周新增 12 | 中性 |

**SOA Tooltip（首次）**：悬停 `?` 显示——「SOA（Share of Answer）= 在监测问题集中，品牌名出现在 AI 回答中的占比。」关闭后写 `localStorage geo_soa_tip_seen`。

### 3. 趋势 `dash-trend`

- 高度 ~200px；Y 轴 0–100%（SOA）
- **全部**：海外实线 + 国内虚线（与 Hero Mock 一致）
- **海外/国内**：单线
- 空数据：平线 + 文案「采集满 7 天后显示趋势」

### 4. 平台分布 `dash-platforms`

10 平台，分组标题「海外」「国内」：

| 海外 | 国内 |
|------|------|
| ChatGPT, Perplexity, Claude, Gemini, Copilot | 豆包, 通义, 文心, Kimi, 腾讯元宝 |

每行：平台 pill + 横向条（SOA%）+ 数值。新鲜度点：绿=今日已采。

### 5. 回答流 `dash-answers`

| 列 | 说明 |
|----|------|
| 平台 | pill 色区分海外/国内 |
| 关键词 | 链到关键词详情（原型 `#`） |
| 片段 | 80 字截断；品牌高亮 `<mark>` |
| 状态 | `进答案` 绿 / `未进答案` 灰红 |
| 时间 | 相对时间 |

**样本数据**：Q00「推荐两款 API 聚合平台」→ 未提及 Trinity → **未进答案**（与 MVP 基准一致）。

### 6. 竞品摘要 `dash-competitors`

品类词 Top 3 问题；列：问题 · 我方 SOA · 竞品 A · 竞品 B。  
示例竞品：OpenRouter、腾讯云 TokenHub。

### 7. 情感 `dash-sentiment`

V1 **一条堆叠条**：正面 72% · 中性 21% · 负面 7%。无细粒度情绪分析承诺。

### 8. Onboarding `dash-onboard`

首次访问浮层 3 步：

1. ✅ 添加品牌（已完成）
2. ✅ 配置关键词（示例 10 条）
3. 👉 查看 SOA 与竞品差距（当前步）

关闭按钮；`localStorage geo_dash_onboard_done`。

---

## 四、空状态与异常

| 场景 | 设计 |
|------|------|
| 采集中 | 顶部黄色条 + 10 平台进度列表（见 [清单 §5.3](../v1-prototype-pages#53-空状态设计)） |
| 无关键词 | 全页空状态 + CTA「添加关键词」→ 监测模块 |
| 单平台失败 | 平台条标红 + Tooltip 失败原因 |

原型默认展示 **有数据** 态；采集中态用 Story 或注释块说明。

---

## 五、跳转矩阵（原型链接）

| 从 | 到 | V1 路由（规划） |
|----|-----|----------------|
| 回答流行 | AI 回答详情 | `/console/monitoring/answers/:id` |
| 关键词 | 关键词详情 | `/console/monitoring/keywords/:id` |
| 竞品表问题 | 竞品概览 | `/console/competitors` |
| 监测 nav | 监测概览 | `/console/monitoring` |

原型阶段链可用 `#` + `title` 提示目标页。

---

## 六、五件套对照（本模块）

| # | 文档/工程 | 路径 |
|---|-----------|------|
| ① 原型规格 | 本文件 | `prototypes/v1-dashboard.md` |
| ② 页面清单 | 清单 §2.1 | `v1-prototype-pages.md` |
| ③ 业务 | 测量 SOA、三层可视化 | `business-landscape.md` §六 · `v1-prototype-pages.md` §5.4 |
| ④ 技术 | 规则引擎 + 别名库 + 时序 | `tech-architecture.md` §2.1.3 |
| ⑤ 演示 | MVP 脚本 + `/demo` ③ 测量 | `mvp-practice.md` · `apps/trinity-geo/mvp/` |

**工程五件套**（Vue 原型）：

`DashboardPage.vue` · `dashboard.css` · `dashboardInteractions.ts` · `mock.ts` · `README.md`

---

## 七、验收标准

- [ ] 5 秒内读懂当前品牌 SOA 与周环比  
- [ ] 海外/国内 Tab 与官网 Hero Mock 视觉一致  
- [ ] SOA 三层中 **时间趋势 + 平台级** 在本页可验收  
- [ ] 回答流含至少 1 条「未进答案」MVP 样本（Q00）  
- [ ] 顶栏为六环全貌导航；未实现入口可 `#` 或灰态  
- [ ] 移动端：KPI 2 列堆叠；趋势可横向 scroll  
- [ ] 与 `/demo` 测量逻辑口径不矛盾（别名库、进答案判定）

---

## 八、修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿：Dashboard 全页规格；对齐 v1-homepage Hero Mock 与 MVP Q00 基准 |
