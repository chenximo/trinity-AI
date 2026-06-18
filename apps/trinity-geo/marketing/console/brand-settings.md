# 用户控制台 · 品牌设置 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/settings/brand`）功能的产品需求真源，可直接用于评审、研发拆任务、测试写用例。  
> **配套原型**：[brand-settings.html](./brand-settings.html)（HTML v0.1）  
> **全景文档**（非本 PRD 范围）：[GEO 业务全景](../../../../trinity-product/docs/geo/business-landscape.md) · [产品设计分析](../../../../trinity-product/docs/geo/product-design-analysis.md) · [原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md)  
> **工程细则**：[技术架构 · 别名同步与重算](../../../../trinity-product/docs/geo/tech-architecture.md#alias-sync-recalc) · [测量 SOA](../../../../trinity-product/docs/geo/tech-architecture.md#measurement-soa)  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/brand-settings.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.2 |
| 状态 | 草稿（随 HTML 原型迭代） |
| 路由 | `/console/settings/brand` |
| 六环 | ① 策略规划 |
| 优先级 | P0（SOA 测量前置） |
| 目标用户 | 已注册品牌方（营销 / SEO / 增长负责人） |

### 本文档能当「完整 PRD」吗？

| 范围 | 是否由本文覆盖 |
|------|:--------------:|
| **本页**：品牌信息、别名库、保存、测量同步状态、重算入口 | ✅ **是**——单页 PRD 以本文为准 |
| 全站 GEO（六环、定价、竞品模块、诊断…） | ❌ 见全景文档与页面清单 |
| 规则引擎 / SOA 公式细节 | ❌ 见技术架构 §2.1.3–2.1.4 |
| 当前 HTML 逐块验收 | ✅ §4 + [brand-settings.html](./brand-settings.html) |

**分工**：每个控制台页面一份 `marketing/console/{page}.md` 作 **单页 PRD**；`v1-prototype-pages.md` 作 **全站页面树**；`product-design-analysis.md` 作 **战略与模块框架**。

---

## 1. 背景与问题

### 1.1 用户原声（归纳）

> 「AI 里有人写 Trinity Desk、有人写 trinitydesk.ai，你们算不算我？」  
> 「我加了别名，为什么上周的 SOA 没变？」

### 1.2 要解决的问题

| 问题 | 本页职责 |
|------|----------|
| 品牌写法不统一，测量漏识别 | 维护 **别名库**，供规则引擎匹配 |
| 配置与引擎脱节 | **保存 → 写入 DB → 展示同步状态** |
| 改别名后历史指标不准 | **触发历史重算**（重标注 + 重聚合，不重采集） |

### 1.3 页面定位

| 项 | 说明 |
|----|------|
| **用户问题** | 「AI 里各种写法，哪些算我的品牌？」 |
| **产品角色** | 维护 **品牌实体（canonical）** + **别名库** → 同步到 `entity_aliases` |
| **不是什么** | SOA 报表、采集任务、竞品对比、账户计费 |
| **顶栏入口** | **设置 → 品牌设置** |

与 **问题集管理**（SOA **分母**）、**竞品管理**（对比侧实体）并列，同属 ① 策略，**分页设计**。

---

## 2. 用户故事

```
作为 出海品牌的营销负责人，
我想要 配置品牌主名称和常见别名写法，
以便 测量引擎能正确识别 AI 回答里是否提到我的品牌，并算出准确的 SOA。
```

```
作为 已在使用 GEO 的客户，
我想要 在修改别名后看到同步状态和是否需要重算历史数据，
以便 我知道总览上的 SOA 何时会更新，而不会误判产品故障。
```

---

## 3. 与测量主链的关系

```text
① 品牌设置（本页 · 控制台表单）
    │  PATCH 保存
    ▼
brands + entity_aliases（关系型 DB · 配置真源）
    │
② 采集 → raw_answers（不读别名；只存原文）
    │
    ▼
规则引擎：别名匹配 → brand_mentioned / in_answer_body / position
    │  写入 annotations
    ▼
聚合 → metric_snapshots（时序）→ 总览 / 下钻页
    ▲
    └── 别名变更时：annotation_recalc_jobs 重跑上链路（不重采集）
```

| 组件 | 本页提供什么 |
|------|-------------|
| **别名库** | 品牌侧 alias；`entity_type = brand` |
| **规则引擎** | 不配置；只消费 DB 中的别名 |
| **时序库** | 不直接编辑；通过 **重算任务** 间接更新 |

---

## 4. 功能需求

### 4.1 品牌基础信息

| 字段 | 必填 | 用途 | 参与测量？ | DB 字段（规划） |
|------|:----:|------|:----------:|-----------------|
| 品牌主名称 | ✅ | canonical_name、报告标题 | ✅ 默认主别名 | `brands.primary_name` |
| Logo | — | 报告、总览 | ❌ | `brands.logo_url` |
| 官网 URL | — | 审计、CCR | 间接 | `brands.product_url` |
| 文档 / 产品页 | — | 审计、材料 | 间接 | `brands.doc_url` |
| 行业 | — | benchmark、推荐问题 | ❌ | `brands.industry` |
| 一句话描述 | — | Onboarding、对外 | ❌ | `brands.tagline` |

MVP 样本对齐 `apps/trinity-geo/mvp/config/brand.json`（Trinity AI）。

### 4.2 别名库（核心）

| 能力 | 说明 | 优先级 |
|------|------|:------:|
| 列表展示 | 主名称行 + 用户添加的别名 | P0 |
| 增删 | 主名称不可删；其余可删 | P0 |
| 启用 / 停用 | `enabled=false` 不参与匹配，记录保留 | P0 |
| 类型标签 | 品牌 / 域名 / 产品名（UI 分类；引擎可统一处理） | P1 |
| 推荐别名 | 根据主名称、域名启发一键添加 | P1 |
| 去重 | 同品牌内 alias 唯一（大小写不敏感） | P0 |
| 保存 | 差量写入 `entity_aliases`；更新 `aliases_synced_at` | P0 |
| 历史重算 | 别名集变更后创建任务或用户手动触发 | P0 |

**测量语义**（与规则引擎一致）：

- 别名命中 → `brand_mentioned = Y`
- 且出现在答案正文主体 → `in_answer_body = Y` → **SOA 分子**
- 仅出现在引用/脚注 → 可能计 **CCR**，不一定计 SOA

### 4.3 测量同步状态（侧栏）

向用户说明：**表单里的配置 ≠ 总览上的 SOA**；中间有 DB 同步与可选重算。

| UI 字段 | 含义 | 数据是否在 DB |
|---------|------|:-------------:|
| **实体 ID** | 品牌唯一键 | ✅ `brands.id` / slug |
| **已启用别名** | 当前参与匹配的条数 | ✅ 聚合 `entity_aliases` |
| **上次同步** | 配置最后一次成功写入别名库的时间 | ✅ `brands.aliases_synced_at` |
| **待重算** | 是否有排队/进行中的历史重算 | ✅ `annotation_recalc_jobs` |

| 操作 | 说明 |
|------|------|
| **保存更改** | 写 DB + 若有别名变更则创建重算任务（可配置为自动排队） |
| **触发历史重算** | 对近 N 天（默认 30）`raw_answers` 重标注并重聚合；**不重新调用 AI 采集** |

> HTML 原型为 Mock（Toast + 文案），商用须对接真实 API 与任务状态轮询。

### 4.4 关联配置（侧栏）

| 链接 | 目标页 | 说明 |
|------|--------|------|
| 监测问题集 | 问题集管理 | SOA **分母** |
| 竞品库 | 竞品管理 | 对比侧 `entity_aliases`（`entity_type=competitor`） |

### 4.5 设置子导航

| 项 | 路由 | 本期 |
|----|------|:----:|
| 品牌设置 | `/console/settings/brand` | ✅ |
| 账户与套餐 | `/console/settings/account` | [settings-account.html](./settings-account.html) |
| 通知与告警 | `/console/settings/notifications` | [settings-notifications.html](./settings-notifications.html) |

---

## 5. 数据持久化（数据库）

> 工程表结构细则见 [技术架构 · 别名同步与重算](../../../../trinity-product/docs/geo/tech-architecture.md#alias-sync-recalc)。

### 5.1 本页写入的表

**`brands`（品牌主档）**

| 列 | 说明 |
|----|------|
| `id` | 主键；对外展示为实体 ID（如 `trinity`） |
| `tenant_id` / `user_id` | 租户隔离 |
| `primary_name` | 主名称 |
| `product_url`, `doc_url`, `tagline`, `industry`, `logo_url` | 基础信息 |
| `aliases_synced_at` | 别名库最后成功同步时间 |

**`entity_aliases`（别名库 · 测量引擎读）**

| 列 | 说明 |
|----|------|
| `id` | 主键 |
| `brand_id` | 所属品牌 |
| `entity_id` | 归一实体（品牌自身可与 `brand_id` 同） |
| `entity_type` | `brand` \| `competitor` |
| `alias` | 匹配串 |
| `alias_normalized` | 小写归一，唯一索引辅助 |
| `enabled` | 是否参与匹配 |
| `alias_kind` | 可选：brand / domain / product（UI 类型） |
| `created_at`, `updated_at` | 审计 |

竞品别名由 **竞品管理** 写入同一表，`entity_type=competitor`。

### 5.2 本页不写入、但相关的表

| 表 | 关系 |
|----|------|
| `raw_answers` | 采集库；重算时 **只读** |
| `annotations` | 规则引擎输出；重算时 **覆盖/UPSERT** |
| `metric_snapshots` | SOA 时序；重算后 **重聚合** |
| `annotation_recalc_jobs` | 重算任务；保存别名变更时 **创建** |

**`annotation_recalc_jobs`（规划）**

| 列 | 说明 |
|----|------|
| `id` | 任务 ID |
| `brand_id` | 品牌 |
| `window_days` | 重算时间窗（默认 30） |
| `trigger` | `alias_change` \| `manual` |
| `status` | `pending` \| `running` \| `done` \| `failed` |
| `progress_pct` | 可选进度 |
| `error_message` | 失败原因 |
| `created_at`, `started_at`, `finished_at` | 时间戳 |

### 5.3 MVP / 原型与 DB 的关系

| 环境 | 配置存储 | 同步状态 |
|------|----------|----------|
| **HTML 原型** | 页面内 Mock | 假文案 + Toast |
| **MVP 样本** | `mvp/config/brand.json` | 无任务表；脚本手动重算 |
| **商用** | PostgreSQL / MySQL + 上表 | API 读真实任务态 |

---

## 6. 接口与业务流程

### 6.1 读取

```
GET /api/console/brands/:brand_id/settings
→ { brand, aliases[], sync: { aliases_synced_at, enabled_count, recalc_job } }
```

### 6.2 保存

```
PATCH /api/console/brands/:brand_id/settings
Body: { primary_name, product_url, …, aliases: [{ alias, enabled, alias_kind }] }

成功：
  1. 事务更新 brands + entity_aliases
  2. aliases_synced_at = now()
  3. 若别名 diff 非空 → INSERT annotation_recalc_jobs (pending)
  4. 返回 200 + 最新 sync 状态
```

### 6.3 手动重算

```
POST /api/console/brands/:brand_id/recalc
Body: { window_days: 30 }

约束：同一 brand 同时仅 1 个 running 任务；否则 409
```

### 6.4 前端状态机（侧栏）

```text
无未保存修改 + 无 pending/running job  → 待重算：无
有未保存修改                            → 保存后排队（按钮文案提示）
保存成功 + job pending/running         → 待重算：队列中 / 重算中…
job done                                 → 待重算：无；上次同步更新
job failed                               → 展示失败 + 重试
```

---

## 7. 验收标准（Given–When–Then）

```
Given 用户已登录且拥有品牌
When  修改主名称并添加别名 "Trinity Desk" 后点击保存
Then  entity_aliases 新增一条 enabled 记录
And   aliases_synced_at 更新
And   若启用自动重算，annotation_recalc_jobs 出现 pending 任务
And   Toast 提示保存成功
```

```
Given 别名库已同步且存在近 30 天采集数据
When  用户点击「触发历史重算」
Then  任务 status 经 running 变为 done
And   总览 SOA 反映新别名下的聚合结果（允许数分钟延迟）
And   raw_answers 不被修改
```

```
Given 用户输入与现有别名仅大小写不同的字符串
When  点击添加
Then  提示「该别名已存在」，不重复写入
```

```
Given 新注册用户仅主名称一行
When  进入品牌设置
Then  展示引导添加英文/域名写法
And   侧栏提示别名过少可能导致 D2 未识别风险
```

---

## 8. 与其他页面的边界

| 页面 | 分工 |
|------|------|
| **可见性总览** | 只读 SOA；策略条链到本页 |
| **问题集管理** | SOA 分母 | [keywords PRD](../../../trinity-geo/marketing/console/keywords.md) |
| **竞品管理** | 竞品 `entity_aliases` |
| **回答详情** | 展示命中 alias（只读） |
| **运营后台 · 品牌管理** | 平台审核，非客户自助 |

---

## 9. 权限、套餐与非功能

| 项 | 规则 |
|----|------|
| 权限 | 品牌管理员可编辑；只读成员仅查看 |
| 别名数量 | 试用 / 专业版上限可配置（套餐表，本期原型不限制） |
| 保存延迟 | P95 < 2s（不含重算完成） |
| 重算 | 异步；完成前总览可展示「指标更新中」 |
| 审计 | 别名增删记操作日志（运营合规） |

---

## 10. Onboarding

首次引导 **第 1 步**（品牌 + 别名）可用简化表单；完成后跳问题集。日常维护回本页。

```text
注册 → 【本页】→ 问题集 → 竞品 → 总览（采集中）
```

---

## 11. 区块与 HTML 对照

| 概念 | `brand-settings.html` |
|------|------------------------|
| 设置子导航 | `geo-settings-sidebar` |
| 策略说明条 | `geo-settings-callout` |
| 基础信息表单 | `geo-settings-card` + `geo-form-grid` |
| 别名库 | `geo-alias-table` + `geo-alias-add` |
| 推荐别名 | `geo-alias-suggest` |
| 测量同步状态 | `geo-settings-aside` · `geo-sync-dl` · `#recalc-btn` |
| 关联链接 | `geo-related-links` |
| 保存 / Toast | `#brand-save-btn` · `#geo-toast` |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿：产品解读 + HTML v0.1 |
| 2026-06-12 | **升格为单页 PRD**：数据落库、同步/重算、接口、验收标准；对齐技术架构 §2.1.3a |
