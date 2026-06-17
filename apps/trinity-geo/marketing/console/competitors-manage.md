# 用户控制台 · 竞品管理 · 产品需求（PRD）

> **文档类型**：**单页 PRD**——本页（`/console/competitors/manage`）功能的产品需求真源。  
> **配套原型**：[competitors-manage.html](./competitors-manage.html)（HTML v0.1）  
> **工程对齐**：[技术架构 · 别名库](../../../../trinity-product/docs/geo/tech-architecture.md#measurement-soa) · [品牌设置 PRD](./brand-settings.md)  
> **预览**：`cd apps/trinity-geo && bun run dev` → `/__geo_marketing/console/competitors-manage.html`

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 状态 | 草稿 |
| 路由 | `/console/competitors/manage` |
| 六环 | ① 策略规划 |
| 优先级 | P0（同题 SOA 对比前置） |
| 顶栏入口 | **竞品 → 竞品管理** |

---

## 1. 背景与问题

| 用户问题 | 本页职责 |
|----------|----------|
| 「AI 里提到了 OpenRouter，你们算竞品吗？」 | 维护竞品 **entity_id + 别名** |
| 「竞品在、我不在」发生在谁身上？ | 启用监测的竞品参与 **同问题集** 标注与对比 |
| 别名和品牌会不会冲突？ | 同库 `entity_aliases`，`entity_type` 区分；保存时冲突校验 |

**与品牌设置分工**：品牌设置管 **本品牌** 别名；本页管 **竞品** 别名。测量引擎扫描回答时 **品牌 + 竞品一并匹配**。

---

## 2. 用户故事

```
作为 品牌营销负责人，
我想要 配置要对标的竞品及其常见写法，
以便 在 SOA 和竞品概览里看到「谁抢占了同一道题的答案」。
```

---

## 3. 与测量主链的关系

```text
① 竞品管理（本页）
    │  competitors + entity_aliases (entity_type=competitor)
    ▼
② 采集（问题集驱动，与品牌相同）
    ▼
规则引擎：单条回答可标注 brand_mentioned + competitor_mentioned[]
    ▼
③ 同题 SOA：品牌 vs 各竞品（竞品概览 · 批 3）
```

---

## 4. 功能需求

### 4.1 录入方式

| 方式 | UI | 说明 |
|------|-----|------|
| **手动添加** | 常显表单：主名称 + 市场 + 首别名 | P0 主路径 |
| **卡片内编辑别名** | 展开竞品卡片 | P0 |
| **AI 推荐竞品** | 顶栏展开勾选 | P1 辅助，须确认 |

### 4.2 竞品卡片

| 字段 / 能力 | 说明 |
|-------------|------|
| entity_id | 如 `openrouter`；系统生成 slug |
| 主名称 | 展示名 |
| 市场 | 海外 / 国内 / 双市场（影响概览筛选） |
| 别名列表 | ≥1；主名称不可删 |
| 状态 | 监测中 / 已暂停（暂停不参与对比统计） |
| 操作 | 展开、暂停、删除 |

样本数据：`mvp/config/brand.json` → `competitors[]`（6 家）。

### 4.3 套餐

| 套餐 | 竞品上限（示例） |
|------|-----------------|
| 试用 | 3 |
| 专业版 | 10 |
| 企业版 | 定制 |

### 4.4 别名库同步

与 [品牌设置](./brand-settings.md) 共用同步机制：保存 → 写 `entity_aliases` → 可选 **标注重算**（竞品提及字段）。

| UI | DB |
|----|-----|
| 竞品实体数 | `COUNT(competitors WHERE enabled)` |
| 别名总数 | `COUNT(entity_aliases WHERE entity_type=competitor)` |
| 待重算 | `annotation_recalc_jobs` |

### 4.5 竞品子导航

| 项 | 路由 | 本期 |
|----|------|:----:|
| 竞品概览 | `/console/competitors` | ✅ [competitors.md](./competitors.md) |
| **竞品管理** | `/console/competitors/manage` | ✅ |

---

## 5. 数据持久化

**`competitors`（逻辑表）**

| 列 | 说明 |
|----|------|
| `id` | slug |
| `brand_id` | 所属客户品牌 |
| `primary_name` | 主名称 |
| `market` | overseas / domestic / both |
| `status` | active / paused |
| `synced_at` | 别名同步时间 |

**`entity_aliases`**：`entity_type=competitor`，`entity_id` = 竞品 id。

---

## 6. 接口（规划）

```
GET    /api/console/brands/:id/competitors
POST   /api/console/brands/:id/competitors
PATCH  /api/console/brands/:id/competitors/:cid
DELETE /api/console/brands/:id/competitors/:cid
POST   /api/console/brands/:id/competitors/:cid/aliases
```

---

## 7. 验收标准

```
Given 用户添加竞品 OpenRouter 及别名 openrouter.ai
When  保存
Then  entity_aliases 写入 competitor 类型记录
And   同题回答中命中 openrouter.ai 计入该竞品提及
```

```
Given 用户暂停 TokenHub
When  保存后查看竞品对比
Then  TokenHub 不参与 SOA 对比聚合
```

---

## 8. 页面边界

| 页面 | 分工 |
|------|------|
| 品牌设置 | 本品牌别名 |
| 问题集 | SOA 分母 |
| **竞品概览** | 读结果、图表 |
| 竞品详情 | 单竞品下钻 |

---

## 9. HTML 区块对照

| 概念 | 选择器 |
|------|--------|
| 手动添加 | `#comp-manual-add` |
| 竞品卡片列表 | `#comp-list` · `.geo-comp-card` |
| 别名编辑 | `.geo-comp-card-body` |
| 同步侧栏 | `geo-settings-aside` |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-06-12 | 初稿：HTML v0.1 + 单页 PRD；批 1 策略三页完成 |
