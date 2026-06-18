---
title: GEO 原型页面清单
---

# GEO · 原型页面清单（完整产品）

> **说明**：**页面树真源**——官网、用户控制台、运营后台的 **完整** 页面与模块划分（全貌设计，实现节奏用 P0/P1/P2）。战略与六环见 [业务全景](./business-landscape)；产品设计见 [产品设计分析](./product-design-analysis)；技术见 [技术架构](./tech-architecture)。  
> **HTML 原型工程**：`apps/trinity-geo/marketing/` · 控制台已起步见 [`marketing/console/`](../../../trinity-geo/marketing/console/)  
> **注**：文件名仍为 `v1-prototype-pages.md` 以兼容历史链接；内容覆盖 **完整 GEO 闭环**，非按版本裁切。

<div class="geo-prototype-page-list">

---

## 零、视角全景图

```
                    ┌──────────┐
                    │   官网    │  获客与转化
                    └────┬─────┘
                         │ 注册/登录
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌──────────┐  ┌──────────────┐  ┌──────────┐
   │ 用户控制台 │  │  开发者门户   │  │ 微信小程序 │
   │  (核心)   │  │  (API/集成)  │  │ (轻量查看)│
   └────┬─────┘  └──────────────┘  └──────────┘
        │
   ┌────▼─────┐
   │ 运营后台  │  内部管理与运营
   └──────────┘
```

| 视角 | 用户 | 核心目标 |
|------|------|---------|
| **官网** | 潜在客户 | 品牌建设、获客转化 |
| **用户控制台** | 试用/付费品牌方 | 完成 GEO 六环经营闭环 |
| **运营后台** | 内部运营/客服 | 用户、采集、系统管理 |
| **开发者门户** | 技术集成方 | API、SDK、Webhook（扩展视角） |
| **微信小程序** | 管理层移动场景 | 核心指标、告警推送（扩展视角） |

### 产品定位摘要 {#product-scope}

| 项 | 共识 |
|----|------|
| **ICP** | **全球化产品**的内容 / SEO / 营销负责人（典型样本：**Trinity AI** API 聚合；**出海品牌**为重要子集） |
| **一句话** | 帮助全球化产品在 **海外 + 国内 AI 平台**同屏监测，用 SOA、CCR、竞品对比讲清「进没进答案、有没有被当信源」 |
| **定价（草案）** | **$79/月** 专业版 + **14 天试用**（企业版定制 · 待商用拍板） |
| **监测平台** | **海外 5 + 国内 5 = 10 个**（每日采集；名单可由采集层轮换） |
| **行业引导包** | [垂直行业 Playbook 最佳实践](./vertical-industry-playbooks) — 问题集 / 信源预期 / 动作库 / 演示样本（平台不拆版） |

| 海外市场（5） | 国内市场（5） |
|---------------|---------------|
| ChatGPT | 豆包 |
| Gemini | DeepSeek |
| Claude | 通义千问 |
| Perplexity | 文心一言 |
| Microsoft Copilot | Kimi |

### 页面 ↔ 六环 ↔ 六大模块

| 六环 | 用户控制台主要落点 | 产品模块 |
|:----:|-------------------|----------|
| ① 策略规划 | 品牌设置、关键词/问题集、竞品管理；总览策略条 | 策略与规划 |
| ② 监测采集 | 监测概览、采集日志 | 监测与测量 |
| ③ 测量 | **可见性总览**、关键词详情、回答详情、竞品对比 | 监测与测量 |
| ④ 诊断 | 诊断列表、页面审计、审计报告 | 诊断与审计 |
| ⑤ 优化 | 优化建议、优化详情 | 内容优化与生成 |
| ⑥ 验证 | 效果验证、报告、通知告警 | 自动化运营、治理与合规 |

> **③ 测量** 的后台主实现：规则引擎 + 别名库 + 时序库（见 [技术架构 · 测量 SOA](./tech-architecture#measurement-soa)）。**一般不单独设「SOA 测量页」**，测量结果呈现在总览与各下钻页。

### 双市场 UI（全站复用）

| 场景 | 要求 |
|------|------|
| 可见性总览 | 全部 / 海外 / 国内 Tab；分市场 SOA |
| 监测概览 | 10 平台 + 新鲜度（绿/黄/红） |
| 关键词/竞品详情 | 可按市场筛选 |
| 官网 Hero | ChatGPT + 豆包同屏叙事 |

### HTML 原型进度图例

| 符号 | 含义 |
|:----:|------|
| ✅ | 已有 HTML + 解读 md（或官网静态稿） |
| 🟡 | 规格/讨论中，HTML 未齐 |
| ⬜ | 清单已列，待原型 |

---

## 一、官网（营销 · **首页 1 + 可选卫星 2**）

> **设计目标**：3 分钟内理解 GEO、双市场、SOA，并进入试用。  
> **形态**：**首页**为单页 Landing（锚点导航），**可独立上线**；需要深讲或投放落地时再挂 **`product.html`**、**`pricing.html`** 两个卫星页（顶栏：首页 | 产品 | 定价）。不是 8 个独立营销 HTML。

### 1.1 GEO 自建页面

| 路由（规划） | 文件 | 状态 | 说明 |
|--------------|------|:----:|------|
| `/` 或 `/geo` | `apps/trinity-geo/index.html`（同源 `marketing/index.html`） | ✅ | 营销首页真源，**保持不变** |
| `/product` | `marketing/product.html` | ✅ | 六环 / 产品深讲（可选） |
| `/pricing` | `marketing/pricing.html` | ✅ | 套餐表 + 定价 FAQ（可选） |

**上线策略**：只做首页也完全成立；卫星页链入首页顶栏/Footer 为可选项，不阻塞 MVP 获客。

### 1.2 首页内区块（非独立 URL）

顶栏锚点与 `index.html` section 一一对应，**不算「缺页」**：

| 锚点 | Section | 原「8 页清单」对应 |
|------|---------|-------------------|
| `#hero` | Hero + 控制台预览 | — |
| — | 信任条、SEO→GEO 范式 | — |
| `#soa` | SOA 指标说明 | 帮助中心（入门部分） |
| `#platforms` | 10 平台矩阵 | 功能页（平台部分） |
| `#compare` | 为何选我们 | 功能页（差异化） |
| `#features` | Bento 能力 | **≈ 原「产品功能页」** |
| `#gap` | 竞品在、我不在 | 场景演示 |
| — | 4 步上手 | 注册引导叙事 |
| `#proof` | Logo + 证言 | **≈ 原「客户案例」** |
| `#pricing` | 专业版单卡 | **≈ 原「定价页」** |
| `#faq` | 常见问题 | **≈ 原「帮助中心」** |
| `#trial` | 底部 CTA | 试用转化 |
| Footer | 产品锚点、联系、套件链 | **≈ 原「关于我们」**（联系 + 套件） |

规格真源：[官网首页 · 原型规格](./prototypes/v1-homepage)。

### 1.3 复用套件能力（**不为 GEO 单独拆页**）

| 能力 | 真源 | 接入方式 |
|------|------|----------|
| **登录 / 注册** | `@trinity/ui` · `TrinityAuthModal`（`packages/ui/src/auth/`） | 顶栏「登录」「开始试用」→ **弹窗**；`ai-cloud` / `trinity-ai` Shell 已集成，GEO 工程化时同样挂载 |
| **隐私政策** | `TrinityPrivacyPolicyPage` · `/legal/privacy` | `getTrinityLegalChildRoutes()` 或静态 href；见 `packages/ui/src/legal/` |
| **服务条款** | `TrinityTermsOfServicePage` · `/legal/terms` | 同上 |
| **模型使用条款** | `TrinityModelTermsPage` · `/legal/model-terms` | 注册勾选已链（`TrinityAuthTermsAgree`） |

Footer 当前 `href="#"` 的隐私/条款，商用时应改为 **`/legal/privacy`**、**`/legal/terms`**（或门户前缀如 `/trinity-geo/legal/privacy`），**无需新建 GEO 法务 HTML**。

### 1.4 可选扩展（有需求再拆 URL）

| 页面 | 何时需要 | 优先级 |
|------|----------|:------:|
| `product.html` / `pricing.html` | 销售深讲、SEM 定价落地 | ✅ 已有 HTML；链入首页为可选 |
| `/blog` + 文章详情 | 内容运营、SEO 长尾 | P2 |
| `/customers` 案例专页 | 案例 >3 且需投放落地 | P2 |

### 1.5 官网 vs 用户控制台

| 视角 | URL 空间 | 页面数（规划） |
|------|----------|----------------|
| **官网（未登录）** | `/` · 可选 `product` / `pricing` · 套件 `/legal/*` | **自建 1（必）+ 2（可选）** |
| **用户控制台（已登录）** | `/console/*` | 见 [§二](#二用户控制台完整--约-22-页) |

登录成功后进入 **控制台**（`marketing/console/dashboard.html` 等），不属于官网扩页。

---

## 二、用户控制台（完整 · 约 22 页）

> **设计目标**：登录后完成 **策略配置 → 采集 → 测量下钻 → 诊断 → 优化 → 验证** 全链路；总览为读口，子页为操作台。

### 全局导航（与 `dashboard.html` 对齐）

```
[Logo→总览]  监测  竞品  诊断  优化  报告  设置
```

| 顶栏模块 | 六环 | 说明 |
|----------|:----:|------|
| **总览** | ③④⑤⑥ 聚合 | 经营驾驶舱，非运维监控报表 |
| **监测** | ②③ | 采集状态 + 问题集 + 回答下钻 |
| **竞品** | ③ | 同题 SOA 对比 |
| **诊断** | ④ | D1–D4 + 页面审计 |
| **优化** | ⑤ | 行动待办与详情 |
| **报告** | ⑥ | 周报/月报与验证 |
| **设置** | ①⑥ | 品牌/别名、账户、通知 |

> **① 策略** 不单独占顶栏：落在 **设置（品牌）** + **监测（问题集）** + **竞品（竞品库）**；总览上的「问题集摘要」链到这些页。

---

### 2.1 可见性总览（1 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | HTML |
|:---:|------|--------------|---------|:----:|
| 1 | **可见性总览** | `/console/dashboard` | SOA/CCR KPI、趋势、平台分布、竞品摘要、诊断/优化/验证摘要、回答流、告警与治理条 | ✅ [dashboard.html](../../../trinity-geo/marketing/console/dashboard.html) · [解读](../../../trinity-geo/marketing/console/dashboard.md) |

---

### 2.2 ① 策略与配置（3 页 · 测量前置）

> SOA 的 **分母（问题集）** 与 **识别（别名库）** 在此配置。

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 2 | **品牌设置** | `/console/settings/brand` | 品牌名、Logo、官网、行业、**别名库**（测量引擎输入） | ① | ✅ [HTML](../../../trinity-geo/marketing/console/brand-settings.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/brand-settings.md) |
| 3 | **关键词 / 问题集管理** | `/console/monitoring/keywords` | 监测问题列表；标签：品类/品牌/对比/场景；增删暂停 | ① | ✅ [HTML](../../../trinity-geo/marketing/console/keywords.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/keywords.md) |
| 4 | **竞品管理** | `/console/competitors/manage` | 竞品名单、别名、同步状态 | ① | ✅ [HTML](../../../trinity-geo/marketing/console/competitors-manage.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/competitors-manage.md) |

可选流程页（非独立顶栏）：**首次监测配置向导**（串起 2–4 + Onboarding）。

---

### 2.3 ② 监测与采集（1 页 + Tab）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 5 | **监测采集** | `/console/monitoring` | Tab **概览**：KPI、10 平台状态、失败/入库；Tab **采集日志**：任务表、筛选、重试 | ② | ✅ [HTML](../../../trinity-geo/marketing/console/monitoring.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/monitoring.md) |
| — | *采集日志（Tab）* | `/console/monitoring/logs` | 深链 `?tab=logs`；非侧栏独立 IA | ② | [Tab PRD](../../../trinity-geo/marketing/console/monitoring-logs.md) · 旧 HTML 重定向 |

---

### 2.4 ③ 测量下钻（3 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 7 | **关键词详情** | `/console/monitoring/keywords/:id` | 关键词级 SOA 趋势；分平台摘要；↗↘ | ③ | ✅ [HTML](../../../trinity-geo/marketing/console/keyword-detail.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/keyword-detail.md)（样本 Q00） |
| 8 | **AI 回答详情** | `/console/monitoring/answers/:id` | 全文、品牌高亮、进答案/CCR、位置、截图 | ③ | ✅ [HTML](../../../trinity-geo/marketing/console/answer-detail.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/answer-detail.md)（样本 Q00·豆包） |
| 9 | **竞品概览** | `/console/competitors` | 同题 SOA/提及对比；雷达/柱状/趋势；分市场 | ③ | ✅ [HTML](../../../trinity-geo/marketing/console/competitors.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/competitors.md) |

---

### 2.5 竞品下钻（1 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 10 | **竞品详情** | `/console/competitors/:id` | 超越/落后问题列表；分平台对比；信源/CCR 下钻 | ③④ | ✅ [HTML](../../../trinity-geo/marketing/console/competitor-detail.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/competitor-detail.md)（样本 openrouter） |

---

### 2.6 ④ 诊断与审计（3 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 11 | **诊断列表** | `/console/diagnosis` | D1–D4 失声类型、优先级、链到问题/回答 | ④ | ✅ [HTML](../../../trinity-geo/marketing/console/diagnosis.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/diagnosis.md) |
| 12 | **页面审计** | `/console/audit` | URL 可引用性、证据密度、Schema、问题与建议 | ④ | ✅ [HTML](../../../trinity-geo/marketing/console/audit.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/audit.md) |
| 13 | **审计报告** | `/console/audit/reports` | 历史审计、导出 | ④ | ⬜ |

扩展：**批量审计**（多 URL 扫描）— 运营向能力，可并入页 12 或独立子页。

---

### 2.7 ⑤ 优化与生成（2 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 14 | **优化建议列表** | `/console/optimize` | 任务卡片：类型、页面、预期 SOA 提升、状态 | ⑤ | ✅ [HTML](../../../trinity-geo/marketing/console/optimize.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/optimize.md) |
| 15 | **优化详情** | `/console/optimize/:id` | 问题说明、内容对比、操作步骤 | ⑤ | ✅ [HTML](../../../trinity-geo/marketing/console/optimize-detail.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/optimize-detail.md)（样本 opt-s1s2） |

---

### 2.8 ⑥ 验证与报告（3 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 16 | **效果验证** | `/console/verify` | R1 vs R2 SOA；优化前后对比时间线 | ⑥ | ✅ [HTML](../../../trinity-geo/marketing/console/verify.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/verify.md) |
| 17 | **报告列表** | `/console/reports` | 周报/月报、新建、定时配置 | ⑥ | ✅ [HTML](../../../trinity-geo/marketing/console/reports.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/reports.md) |
| 18 | **报告预览/下载** | `/console/reports/:id` | 在线预览、PDF/PNG、发邮件 | ⑥ | ✅ [HTML](../../../trinity-geo/marketing/console/report-preview.html)（预览样本） |

---

### 2.9 设置与账户（3 页）

| 序号 | 页面 | 路由（规划） | 核心内容 | 六环 | HTML |
|:---:|------|--------------|---------|:----:|:----:|
| 19 | **账户设置** | `/console/settings/account` | 个人信息、套餐、用量看板、升级 | — | ✅ [HTML](../../../trinity-geo/marketing/console/settings-account.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/settings-account.md) |
| 20 | **通知设置** | `/console/settings/notifications` | 告警阈值、邮件/企微/微信 | ⑥ | ✅ [HTML](../../../trinity-geo/marketing/console/settings-notifications.html) · [**单页 PRD**](../../../trinity-geo/marketing/console/settings-notifications.md) |
| — | *品牌设置* | 见 §2.2 序号 2 | — | ① | ✅ 见 brand-settings |

---

### 用户控制台页面统计

| 模块 | 页数 | HTML 已有 |
|------|:----:|:---------:|
| 可见性总览 | 1 | 1 |
| 策略与配置 | 3 | 3 |
| 监测与采集 | 2 | 2 |
| 测量下钻 + 竞品概览 | 4 | 4 |
| 诊断与审计 | 3 | 2 |
| 优化 | 2 | 2 |
| 验证与报告 | 3 | 3 |
| 设置与账户 | 2 | 2 |
| **合计** | **20**（+ 流程页） | **19** |

---

## 三、运营后台（约 7 页）

> **设计目标**：运营/客服独立处理用户与采集问题。

| 序号 | 页面 | 核心内容 | HTML |
|:---:|------|---------|:----:|
| 1 | **运营总览** | 注册/活跃/付费；采集量、成功率、告警 | ⬜ |
| 2 | **用户管理** | 列表、详情、套餐、禁用 | ⬜ |
| 3 | **品牌管理** | 品牌与别名审核 | ⬜ |
| 4 | **数据监控** | 10 平台采集、失败详情、识别抽检 | ⬜ |
| 5 | **内容管理** | 官网、案例、帮助、博客 | ⬜ |
| 6 | **系统配置** | 套餐参数、限流、邮件模板 | ⬜ |
| 7 | **操作日志** | 管理员审计 | ⬜ |

---

## 四、全平台页面总览

| 视角 | 页面数（规划） | HTML / 接入 |
|------|:-------------:|-------------|
| 官网营销 | **1 必 + 2 可选** | ✅ `index.html` · `product.html` · `pricing.html` |
| 套件公共 | 3（法务，复用） | `@trinity/ui` `/legal/*` |
| 用户控制台 | 20 | 19 HTML |
| 运营后台 | 7 | 0 |
| **合计（GEO 产品）** | **28** + 套件法务 | **22**（含控制台 19 + 官网 3） |

### 流程页（非独立 URL，须画交互）

| 类型 | 说明 |
|------|------|
| Onboarding | 品牌 → 别名 → 关键词 → 竞品 → 总览采集中 |
| 忘记密码 | 从登录进入 |
| 套餐升级 | 从账户设置进入 |
| 邮件模板 | 验证、SOA 告警、试用到期 |

---

## 五、交互设计要点

### 5.1 用户首次使用引导流

```
注册成功（试用生效）
  → 创建品牌 + 别名
  → 添加监测问题集（品类/品牌/对比/场景）
  → 添加竞品
  → 跳转可见性总览（采集中…）
  → 数据就绪 → 看 SOA / 诊断 / 竞品差距
```

### 5.2 页面跳转矩阵

```
总览 ──→ 关键词详情 / 回答详情 / 竞品概览 / 诊断 / 优化

监测概览 ──→ 关键词管理 / 采集日志

关键词管理 ──→ 关键词详情 ──→ 回答详情

竞品概览 ──→ 竞品管理 / 竞品详情 ──→ 回答详情

诊断列表 ──→ 优化待办 ──→ 效果验证 / 报告
```

### 5.3 空状态设计

| 页面 | 场景 | 设计 |
|------|------|------|
| 总览 | 采集中 | 进度 + 10 平台状态 |
| 关键词管理 | 无词 | CTA + 推荐词 |
| 竞品管理 | 无竞品 | CTA + 竞争提示 |
| 回答详情 | 未进答案 | 别名提示 + 链诊断 |
| 报告列表 | 无报告 | 引导配置周报 |

### 5.4 SOA 三层可视化 ↔ 页面对照

| SOA 层级 | 主要页面 |
|----------|----------|
| **时间趋势** | 总览 SOA 图 |
| **平台级** | 总览平台条、关键词详情分平台 |
| **关键词级** | 关键词管理/详情、回答流摘要 |

### 5.5 提及 vs 引用（CCR）

| 层级 | 主要页面 |
|------|----------|
| **SOA（进正文）** | 总览 KPI、关键词详情、回答详情「进答案」 |
| **CCR（被引为信源）** | 总览 CCR KPI、回答详情、竞品详情信源分析 |

---

## 六、认证与套餐（草案） {#auth-plans}

> 行业计费维度与 Trinity 套餐建议见 **[GEO 业界计费与监测周期](./geo-billing-industry)**。

```
注册：邮箱 / 手机 / 微信 · 登录：密码 / 验证码 / SSO 预留
试用：14 天专业版 · 套餐：$79/月 → 企业定制
```

| 维度 | 试用（示例） | 专业版（示例） |
|------|-------------|----------------|
| 品牌数 | 1 | 3 |
| 监测关键词 | 20 | 100 |
| AI 平台 | 10 | 10 |
| 竞品数 | 3 | 10 |

---

## 七、HTML 原型交付顺序（建议）

与 [MVP 实践手册](./mvp-practice) 六环一致，**一个个模块**推进：

```
批 0  ✅ 官网首页 + 可见性总览（完整闭环骨架）
批 1  ✅ 品牌设置 + 问题集管理 + 竞品管理（① 策略，SOA 前置）
批 2  ✅ 监测概览 + 关键词详情 + 回答详情（②③ 采集与测量下钻）
批 3  ✅ 竞品概览 + 竞品详情
批 4  ✅ 诊断列表 + 优化待办（+ CCR 样本 answer-detail-brand）
批 5  ✅ 效果验证 verify.html + .md（Q00 R1→R2 信源样本）
批 6  ✅ 报告列表 + 预览 + 账户 + 通知 + 优化详情 + 采集日志
批 7  → 页面审计 / 审计报告 + 运营后台
```

每页约定：`marketing/console/{page}.html` + 同目录 **`{page}.md` 单页 PRD**（品牌设置见 [brand-settings.md](./../../../trinity-geo/marketing/console/brand-settings.md)）。

### 原型文件组织（Figma / HTML）

```
apps/trinity-geo/marketing/
├── index.html                 # 官网（单页，可独立上线）
├── product.html               # 卫星 · 产品深讲（可选）
├── pricing.html               # 卫星 · 定价（可选）
├── console/
│   ├── dashboard.html + dashboard.md   ✅
│   ├── brand-settings.html + .md       ✅
│   ├── keywords.html + .md             ✅
│   ├── competitors-manage.html + .md   ✅
│   ├── monitoring.html + .md           ✅
│   ├── keyword-detail.html + .md       ✅
│   ├── answer-detail.html + .md        ✅
│   ├── competitors.html + .md          ✅
│   ├── competitor-detail.html + .md    ✅
│   ├── diagnosis.html + .md            ✅
│   ├── optimize.html + .md             ✅
│   ├── verify.html + .md               ✅ 批 5 · R1→R2
│   ├── reports.html + .md              ✅ 批 6
│   ├── report-preview.html             ✅ 批 6 · 预览
│   ├── settings-account.html + .md     ✅ 批 6
│   ├── settings-notifications.html + .md ✅ 批 6
│   ├── optimize-detail.html + .md      ✅ 批 6 · opt-s1s2
│   ├── monitoring-logs.html + .md      ✅ 批 6
│   ├── answer-detail-brand.html        ✅ CCR 样本
├── css/
└── js/
```

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-15 | 初版：V1 视角页面清单 |
| 2026-06-15 | 对齐产品设计 §0：ICP、10 平台、定价 |
| 2026-06-12 | **重写**：完整 GEO 六环页面树；顶栏与 dashboard v0.2 对齐 |
| 2026-06-12 | **品牌设置**：`brand-settings.html` + 单页 PRD |
| 2026-06-12 | **问题集管理**：`keywords.html` + 单页 PRD |
| 2026-06-12 | **竞品管理**：`competitors-manage.html` + 单页 PRD；**批 1 完成** |
| 2026-06-12 | **批 2**：`monitoring` + `keyword-detail` + `answer-detail`（HTML + 单页 PRD）；样本 Q00 / 豆包 |
| 2026-06-12 | 定位摘要：ICP 对齐 **全球化产品**（Trinity AI 典型样本） |
| 2026-06-12 | **GEO 业界计费**：`geo-billing-industry.md`；§六 套餐链至专文 |
| 2026-06-12 | **批 3**：`competitors` + `competitor-detail`（HTML + 单页 PRD）；样本 OpenRouter |
| 2026-06-12 | **批 4**：`diagnosis` + `optimize`（HTML + PRD）；`answer-detail-brand` CCR 样本 |
| 2026-06-12 | **批 5**：`verify`（HTML + PRD）；Q00 R1→R2 信源盘样本；`keyword-detail` / 总览 ⑥ 补信源 Δ |
| 2026-06-12 | **官网重写**：单页 Landing + 套件 Auth/Legal 复用；去掉「8 页」误读 |
| 2026-06-12 | **官网卫星页**：`product.html` + `pricing.html`；首页 `index.html` 不变，可只做首页上线 |
| 2026-06-12 | **批 6**：`reports` + `report-preview` + `settings-account` + `settings-notifications` + `optimize-detail` + `monitoring-logs`（HTML + PRD）；控制台 18/20 |
| 2026-06-12 | **页面审计**：`audit.html` + PRD；诊断侧栏 + 总览闭环卡接通；控制台 19/20 |
| 2026-06-12 | 定位摘要增 **行业引导包** 链 [垂直行业 Playbook 最佳实践](./vertical-industry-playbooks) |

---

</div>

*完整产品以本文 + [业务全景](./business-landscape) + 各页 `marketing/console/*.md` 为准；实现先后见 [产品设计分析 · P0/P1/P2](./product-design-analysis#mvp-priority)。*
