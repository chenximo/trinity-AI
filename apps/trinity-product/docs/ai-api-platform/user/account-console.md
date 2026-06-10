---
title: 用户控制台
---

# 用户控制台

> **说明**：企业租户自助单页多面板（`#keys` · `#preset` · `#credits` · `#activity` · `#logs`）。子能力清单按 **壳层 / 密钥 / 角色 / 额度** 四块维护；**活动**、**用量** 等细项需要时再在 `account-console.roadmap.yml` 拆行。5.30 重点：创建 Key 并调通 API。UI 规范样例：`/user-console-spec`。

> **工程**：`apps/trinity-ai/src/views/account/`（五件套：`ConsolePage.vue` · `account.css` · `accountInteractions.ts` · `mock.ts` · `README.md`）· 路由 `/account/console`

> **体验 / 在线**：见 [AI API 聚合产品 · 总览](../)（用户面 `/account/console`）

## 子能力清单

<ProductRoadmap rel="ai-api-platform/user/account-console.roadmap.yml" />

## 附录

### 验收（5.30 / 6.30）

走查、体验测试与 Bug 真源：[**5.30 产品测试体验 / Bug 表**](https://qcn81yhei1l2.feishu.cn/sheets/PjnVs7bmphodaKtOkkycpvxmnne)（在飞书按 **时间**、**产品/模块** 筛选；本页对应 **用户控制台** / 用户面）。子能力进度与节点列以 **`account-console.roadmap.yml`** 为准，手册不抄验收 checklist。

### 关联
<img src="https://trinity-ai-resources-1430233363.cos.ap-singapore.myqcloud.com/trinity-product-ling/images/8caa01c7-95d6-4232-ac6e-292858976e64.png" alt="image" width="619" />



| 模块 | 关系 |
|------|------|
| [开发者文档](./developer-docs) | Quickstart 用 Key 调 API |
| [Chat 在线体验](./chat-experience) | Preset「在对话中测试」 |
| 平台侧 · 生文 API | 调用产生用量与日志 |
| 运营后台 · 模型上架 | 日志中的 `model` id 与上架一致 |

### 修订

| 日期 | 说明 |
|------|------|
| 2026-06-02 | 对齐标准叶子五件套 |
| 2026-06-03 | 子能力收敛为壳层/密钥/角色/额度四行（单页维度） |
| 2026-06-02 | 子能力迁入 `account-console.roadmap.yml` |
| 2026-05-26 | 按 `ConsolePage.vue` 五面板补全子能力清单 |
