---
title: 官网首页 · 原型规格
---

# 官网首页 · V1 原型规格

> **页面**：官网 P0 · 首页（`/）  
> **上级清单**：[V1 原型页面清单 · 官网](../v1-prototype-pages#一官网约-8-页)  
> **战略对齐**：[产品设计分析 §0](../product-design-analysis#product-scope)  
> **用途**：Figma / **HTML 静态稿** 的逐块规格。  
> **视觉原则**：**独立 GEO 视觉**——青蓝 Cyan 主色（比旧 Teal 更协调）、左文案右 Dashboard、Hero/区块背景网格线、SOA 营销叙事；**禁止**复用 `trinity-ai/home.css` 居中 Hero / fcard 布局。  
> **HTML 实现**：`apps/trinity-geo/index.html`  
> **工程 / 在线**：`apps/trinity-geo` · 体验待定 · 在线待定

| 项 | 值 |
|----|-----|
| 路由 | `/` |
| 优先级 | P0 |
| 目标用户 | 出海品牌的内容 / SEO / 营销负责人 |
| 核心转化 | **开始 14 天免费试用** → `/signup` |
| 次要转化 | 查看定价 `/pricing` · 了解功能 `/features` |
| 产品名 | **Trinity GEO**（Trinity 套件：AI 云 · Trinity AI · GEO） |
| 设计系统 | 独立 `geo-*` class；Token 来自 `packages/tokens`；**不用** trinity-ai 营销组件 |

### 文案边界（官网 vs 对内）

**官网 HTML 禁止出现**（属 PRD / 原型 / 手册用语，仅对内）：

- 版本号：`V1`、`V1.5`、`MVP` 等
- 内部表述：`三角能力`、`能验收、能定价`、`不做未验证的重功能`、`Tier 1`（调研分级）
- 路线图细节：`CCR`、`信源页面分析在 x.x 规划` 等未商用能力的时间表

**官网应使用**：客户价值语言——监测什么、得到什么指标、与竞品/场景的对比、定价与试用。能力边界用「当前聚焦…」「更多能力敬请期待/联系销售」即可。

---

## 一、页面目标与信息层次

### 1.1 用户进入时的心理问题

| 顺序 | 用户问题 | 首页须回答的位置 |
|:----:|----------|------------------|
| 1 | 这是什么？和我有什么关系？ | Hero 标题 + 副标题 |
| 2 | 和 Profound / 国内工具有何不同？ | Hero 视觉 + 平台墙 + 对比条 |
| 3 | 具体能做什么？ | 三能力卡片 |
| 4 | 覆盖哪些 AI？ | 双市场平台墙（10 个） |
| 5 | 有人用过吗？ | 客户 Logo + 数据背书 |
| 6 | 多少钱？ | 定价预告条 + 导航「定价」 |
| 7 | 怎么开始？ | 首屏 CTA + 底部 CTA |

### 1.2 页面信息架构（GEO 独立版 · 12 区块）

```
A. geo-header · 套件星标 Logo + 顶栏小字套件链（AI 云 / Trinity AI）
B. geo-hero · 左文案（标题 `--grad` 高亮）+ 右 Dashboard Mock
C. geo-shift · 深色带：SEO→GEO 范式转移（3 卡）
D. geo-soa · SOA 公式 + 三层可视化列表
E. geo-platforms · 10 平台状态矩阵（非 provider-pill）
F. geo-bento · 非对称 bento 能力卡（监测/SOA/竞品/告警）
G. geo-gap · 「竞品在、我不在」双 panel 演示
H. geo-workflow · 4 步圆形时间线
I. geo-pricing · 单卡片定价（非三列 OAuth 步骤）
J. geo-faq · 含「与 Trinity AI 区别」
K. geo-cta · 套件蓝紫 `--grad` 渐变底
L. geo-footer · 深色底；套件链接页脚 + 顶栏（小字，非主导）
```

---

## 二、全局 chrome

### 2.1 顶栏 `geo-header`（非 `or-inject`）

| 元素 | 规格 |
|------|------|
| Logo | **Trinity 套件星标** + Trinity GEO + 「可见性」tag |
| 主色 | 套件 `--blue` / `--grad`；语义 `--geo-overseas-*` / `--geo-domestic-*` |
| 导航 | SOA 是什么 · 平台覆盖 · 产品能力 · 定价 |
| 套件 | 顶栏小字链：AI 云 · Trinity AI（≥900px）；页脚重复 |

### 2.2 页脚 `footer`

与 Trinity AI 首页同结构：`footer-top` 五列 + `footer-bottom`。

| 列 | 链接 |
|----|------|
| 品牌 | Trinity GEO + 一句话副标题 |
| 产品 | 功能、平台、定价、竞品对比、企业版 |
| 公司 | 关于、为什么选择、联系、隐私、条款 |
| **Trinity 套件** | Trinity AI 模型聚合 · AI 云算力 · GEO 产品手册 |
| 资源 | FAQ、帮助、博客 |

---

## 三、区块规格

### B. Hero `section-hero`

**布局**：桌面左右 50/50；左文案右预览。移动文案在上、预览在下。

**左栏文案**

| 字段 | 文案（V1 定稿） |
|------|----------------|
| Eyebrow | 面向出海品牌的 GEO 平台 |
| **H1** | 主流 AI 答案，一站监测 |
| **H1 渐变行** | ChatGPT 与豆包 · 同屏 SOA（`.line2` + `--grad`） |
| **Pill** | 面向出海品牌的 GEO 平台（`.hero-pill`） |
| 副标题 | 监测海外 5 + 国内 5 共 10 个 AI 平台，用 SOA 答案份额与竞品对比，回答「用户提问时，你的品牌有没有进答案」。 |
| 主 CTA | **免费试用 14 天** → `/signup` |
| 次 CTA | 查看定价 → `/pricing` |
| CTA 附注 | 全功能专业版 · 无需信用卡（若商用确认需要卡则改文案） |

**右栏视觉 `hero-visual`**

- 产品 UI  mock：Dashboard 简化版，**左右分屏**示意「海外 ChatGPT 回答片段 | 国内豆包回答片段」，品牌名高亮。
- 可选：轻动效——两侧 SOA 数字缓慢上升（HTML 可用 CSS animation）。
- 占位图尺寸：桌面 560×420；`alt="双市场 AI 可见性监测预览"`。

**Wireframe**

```
┌──────────────────────────────────────────────────┐
│ [Eyebrow]                                        │
│ H1 两行主标题                                     │
│ 副标题 2-3 行                                     │
│ [免费试用 14 天]  [查看定价]                       │
│ 小字：全功能专业版…                                │
│                    ┌─────────────────┐           │
│                    │ 海外 │ 国内     │  ← Tab    │
│                    │ SOA 42% │ 28%   │           │
│                    │ [回答预览…]      │           │
│                    └─────────────────┘           │
└──────────────────────────────────────────────────┘
```

---

### C. 信任条 `section-trust-bar`

横向 3–4 项，图标 + 短文案，浅底条全宽。

| # | 文案 |
|---|------|
| 1 | 覆盖 **10** 个 AI 平台 |
| 2 | **海外 + 国内** 双市场监测 |
| 3 | **14 天** 免费试用 |
| 4 | **$79/月** 起 · 全功能专业版 |

---

### D. 三能力卡片 `section-features`

**Section 标题**：GEO 增长，从看清答案开始  
**Section 副标题（对外）**：从采集真实回答、量化 SOA，到对标竞品——帮营销团队先看清双市场可见性。（勿写 V1 / 三角 / 验收等对内表述）

| 卡片 | 图标建议 | 标题 | 描述 | 链接 |
|------|----------|------|------|------|
| 1 | Radar | **多平台 AI 监测** | 每日自动采集 10 个平台的关键问题回答，掌握品牌提及与出现位置。 | `/features#monitoring` |
| 2 | PieChart | **SOA 答案份额** | 关键问题集里，品牌进入 AI 答案正文的占比——管理层最关心的单一指标。 | `/features#soa` |
| 3 | Users | **竞品对比** | 同一问题集下，看竞品是否出现、SOA 是否领先，快速发现「竞品在、我不在」。 | `/features#competitors` |

卡片交互：Hover 轻微上浮 + 阴影；整卡可点。

---

### E. 双市场平台墙 `section-platforms`

**Section 标题**：海外与国内，同一套面板  
**Section 副标题**：出海品牌不必在两个工具之间切换。

两列布局（移动单列，先海外后国内）：

**海外 5**

ChatGPT · Gemini · Claude · Perplexity · Microsoft Copilot

**国内 5**

豆包 · DeepSeek · 通义千问 · 文心一言 · Kimi

每项：Logo（32×32）+ 名称；灰度 Logo，Hover 彩色。  
V1 HTML 可用文字 + 占位 SVG，Logo 路径 `{assets/platforms/*.svg}`。

---

### F. 产品预览 `section-product-preview`

**Section 标题**：双市场 SOA，一屏对照  
**Tab**：`全部` | `海外市场` | `国内市场`（切换时图表数据过滤，静态 HTML 可用 JS 切换 class）

**内容**：宽屏 Dashboard 截图占位（1200×675），标注：

- SOA 趋势折线
- 平台分布（海外/国内分组色）
- 竞品对比摘要条

下方链接：`查看全部功能 →` `/features`

---

### G. 差异化对比 `section-comparison`

**Section 标题**：为何选我们  
**形式**：简表 4 行 × 3 列（移动横向滚动）

| 能力 | 典型海外 GEO 工具 | **{产品名}** |
|------|-------------------|--------------|
| 国内 AI 平台（豆包/DeepSeek 等） | ❌ | ✅ 5 个 |
| 海外 AI 平台 | ✅ 部分 | ✅ 5 个 |
| 全功能专业版起价 | $399+/月 常见 | **$79/月** |
| 14 天免费试用 | 部分 / 需销售 | ✅ 自助开通 |

脚注：竞品定价见 [Tier 1 调研](../competitor-research/tier1-deep-dive)；对外口径以商用为准。

---

### H. 社会证明 `section-social-proof`

**客户 Logo 墙**：5–8 个占位 Logo（出海消费 / SaaS / 跨境类目）；灰度，Hover 彩色。  
V1 无真实客户时标注「种子用户合作中」，Logo 用 `{品牌 A}` 占位。

**数据背书**（一行三数字）：

| 数字 | 标签 |
|------|------|
| 10 | 监测 AI 平台 |
| 2 | 市场（海外 + 国内） |
| 14 天 | 免费试用 |

可选引语（占位）：  
> 「终于不用分别问海外代理和国内团队要 AI 可见性报告了。」  
> — 某出海品牌市场负责人

---

### I. 底部 CTA `section-cta`

全宽渐变或品牌色底，居中：

| 字段 | 文案 |
|------|------|
| H2 | 看看你的品牌在 ChatGPT 和豆包里是否被提及 |
| 副文 | 14 天全功能试用，10 分钟完成配置即可看到首批数据。 |
| 主 CTA | **免费试用** → `/signup` |
| 次 CTA | 联系销售（企业版）→ `mailto:sales@example.com` 或 `#` |

---

## 四、文案与 SEO

### 4.1 `<title>` / Meta

```
<title>{产品名} — 出海品牌双市场 GEO 监测 | ChatGPT 与豆包 SOA</title>
<meta name="description" content="同时监测海外与国内 10 个 AI 平台，SOA 答案份额与竞品对比。14 天免费试用，$79/月起。" />
```

### 4.2 Open Graph（HTML 生成时一并输出）

- `og:title`：同 title  
- `og:description`：同 meta description  
- `og:image`：`/og/home.png`（1200×630，Hero 预览合成图）

---

## 五、响应式断点

| 断点 | 宽度 | 布局要点 |
|------|------|----------|
| sm | ≥640px | 信任条 2×2 |
| md | ≥768px | Hero 左右分栏；顶栏完整导航 |
| lg | ≥1024px | 三卡片横排；平台墙两列 |
| xl | ≥1280px | 内容区 max-width 1200px 居中 |

---

## 六、设计 Token

| 用途 | GEO 专属 |
|------|----------|
| 主色 | `--geo-grad`（= `--grad`）· `--geo-accent` = `--indigo-500` · 真源 `packages/tokens/src/core.css` |
| 国内强调 | `--geo-warm` 琥珀色（与国内 SOA 卡片） |
| 深色区块 | `--geo-ink` #0f172a（范式转移带、页脚） |
| 字体 | Inter + Noto Sans SC（与套件一致） |

**禁止**使用 Trinity AI 首页的 `--grad` 蓝紫渐变、`hero-pill`、`provider-pill`、`fcard`、`why-trinity-grid`。

---

## 七、HTML 生成规格 {#html-spec}

### 7.1 文件与资源

```
apps/trinity-geo/
├── index.html              ← 首页静态稿（已实现）
├── css/home.css            ← @import trinity-ai/home.css + GEO 块
├── js/home.js
└── README.md
```

共用：`../../assets/trinity-base.css` · `../../trinity-ai/src/views/home/home.css`

### 7.2 语义结构

```html
<body>
  <header class="site-header">…</header>
  <main>
    <section id="hero" class="section-hero">…</section>
    <section id="trust" class="section-trust-bar">…</section>
    <section id="features" class="section-features">…</section>
    <section id="platforms" class="section-platforms">…</section>
    <section id="preview" class="section-product-preview">…</section>
    <section id="comparison" class="section-comparison">…</section>
    <section id="social-proof" class="section-social-proof">…</section>
    <section id="cta" class="section-cta">…</section>
  </main>
  <footer class="site-footer">…</footer>
</body>
```

### 7.3 Class 命名约定

- BEM 风格：`section-hero__title`、`section-hero__cta`、`platform-grid__item`
- 状态：`is-active`（Tab）、`is-scrolled`（顶栏）、`is-open`（移动菜单）
- 工具类：`.container`（max-width + horizontal padding）、`.sr-only`（无障碍）

### 7.4 无障碍

- 所有 CTA 使用 `<a href>` 或 `<button type="button">`，不只 div 点击  
- 对比度：正文 ≥ 4.5:1  
- 移动菜单：`aria-expanded`、`aria-controls`  
- 装饰性 Logo：`alt=""`；有意义的图须 `alt` 描述

### 7.5 生成 HTML 时的占位符

| 占位符 | 说明 |
|--------|------|
| `{PRODUCT_NAME}` | 产品正式名称 |
| `{SIGNUP_URL}` | `/signup` |
| `{PRICING_URL}` | `/pricing` |
| `{YEAR}` | 2026 |

---

## 八、交互状态清单

| 元素 | 状态 |
|------|------|
| 主 CTA | default / hover / focus-visible / active |
| 顶栏 | 顶部透明或浅底 / 滚动后 `is-scrolled` |
| 能力卡片 | default / hover |
| 平台 Logo | grayscale / hover color |
| 预览 Tab | `全部` `海外` `国内` 切换（预览区切换说明文字即可，V1 可无真实数据） |
| 移动菜单 | 关闭 / `is-open` 全屏或抽屉 |

---

## 九、验收标准（原型 / HTML）

- [ ] 5 秒内能读懂「双市场 + SOA + 10 平台」  
- [ ] 首屏可见主 CTA「免费试用 14 天」  
- [ ] Hero 视觉体现 ChatGPT + 豆包同屏（非 generic AI 图）  
- [ ] 三能力与 [V1 能力三角](../v1-prototype-pages#align-product-scope) 一致，无审计/优化承诺  
- [ ] 定价口径：$79/月 + 14 天试用，与定价页一致  
- [ ] 移动端无横向溢出；顶栏 CTA 可达  
- [ ] Lighthouse 可访问性 ≥ 90（HTML 阶段）

---

## 十、修订

| 日期 | 说明 |
|------|------|
| 2026-06-15 | **重做**：独立 GEO 视觉（Teal、split hero、bento、SOA 叙事）；脱离 trinity-ai 首页克隆 |
| 2026-06-15 | **色板 v3**：GEO 主色改继承 `--grad` / `--purple-soft` / 场景卡合成底；弃用青绿 Teal |

---

*HTML 静态稿：`apps/trinity-geo/index.html` · 本地 `npx serve apps/trinity-geo -p 5210`*
