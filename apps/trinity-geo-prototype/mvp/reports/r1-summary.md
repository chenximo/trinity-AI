# GEO R1 测量报告 · Trinity AI × 豆包

> 生成时间：2026-06-16T08:46:25.776Z
> 轮次：R1 | 样本数：1

## SOA 总览

| 指标 | 值 |
|------|-----|
| **SOA（进答案正文占比）** | **0.0%**（0/1） |
| 品牌提及率 | 0.0% |

### 分问题类型

| 类型 | 采样 | 进答案 | SOA |
|------|:----:|:------:|:---:|
| 品类词 | 1 | 0 | 0.0% |

## 逐题结果

| ID | 类型 | 进答案 | 位置 | 竞品 | 渠道 |
|----|------|:------:|------|------|------|
| Q00 | 品类词 | N | — | openrouter+tokenhub+litellm+oneapi+siliconflow+portkey | doubao-app-manual |

## 诊断（Top）

- **P0 · Q00** [D1] 未提及 Trinity；回答主推 OpenRouter 等

## 建议动作

### A-D1 品类失声：补充选型/对比证据页

在 doc.trinitydesk.ai 增加「API 聚合平台选型」FAQ：首段定义 + 3 条可验证事实 + 与 OpenRouter / 企业级方案对比表，明确 Trinity 适用场景。

关联问题：Q00


## 下一步（R2 验证）

1. 完成 actions 中 P0 项（文档 FAQ + 对比表 + 官网 SEO）
2. 等待 24–72h
3. `node scripts/collect.mjs --round R2` 或重新在豆包 App 提问 Q00
4. `node scripts/analyze.mjs --round R2` 对比 SOA 变化
