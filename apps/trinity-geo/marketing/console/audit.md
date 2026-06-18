# 用户控制台 · 页面审计 · 产品需求（PRD）

> **配套原型**：[audit.html](./audit.html)  
> **全景**：[原型页面清单](../../../../trinity-product/docs/geo/v1-prototype-pages.md) §2.6 序号 12

| 字段 | 内容 |
|------|------|
| 路由 | `/console/audit` |
| 六环 | ④ 诊断与审计 |
| 优先级 | P1 |
| 顶栏入口 | **诊断 → 页面审计**（侧栏） |

## 1. 定位

| 项 | 说明 |
|----|------|
| **用户问题** | 「我们有官网 / 文档，为什么 AI 还是不引用？」 |
| **不是什么** | SOA 报表；答案内 D1–D5 规则（见 [诊断列表](./diagnosis.md)） |

**输入**：用户 URL 或站点地图爬取。  
**输出**：可引用性评分、因子明细、优先修复建议（可链 [优化待办](./optimize.md)）。

对应缺口 **[S4 有页不可引](../../../../trinity-product/docs/geo/product-design-analysis.md)**。

## 2. 评分维度（V1 原型）

| 因子 | 检查点 | 权重（示意） |
|------|--------|:------------:|
| 证据密度 | 首段定义、量化事实、可独立引用块 | 高 |
| 可抓取性 | 无 JS 可读、meta、robots | 高 |
| Schema.org | JSON-LD 类型与字段 | 中 |
| 结构语义 | 标题层级、表格 / 列表标记 | 中 |
| 时效信号 | 更新日期、版本、changelog | 低 |

技术方案见 [技术架构 §2.2](../../../../trinity-product/docs/geo/tech-architecture.md)。

## 3. 功能

| 模块 | 说明 | 优先级 |
|------|------|:------:|
| 单 URL 审计 | 输入框 + 扫描 | P0 |
| 站点页面列表 | 评分排序、红 / 黄 / 绿 | P0 |
| 因子明细 + 建议 | 右侧详情面板 | P0 |
| 对标 URL | 竞品 docs 样本分 | P1 |
| 批量扫描 | 全站 sitemap | P2 |
| 历史报告 | 见 `audit-reports`（下一页） | P1 |

## 4. 样本数据

- **doc.trinitydesk.ai/docs/introduction**：38 分 · 红灯 · 链 Q00 / opt-s1s2  
- 站点均分 **62**，红灯 **2** — 与 [总览](./dashboard.html) 闭环卡一致  
- 对标：OpenRouter docs 86、TokenHub 81

## 5. 关联

- 诊断侧栏：[diagnosis.html](./diagnosis.html)  
- 优化：[optimize-detail.html](./optimize-detail.html)  
- 下一页：**审计报告** `/console/audit/reports`（批 7）
