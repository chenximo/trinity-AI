---
title: 日常操作（refresh / gate）
---

# 日常操作（refresh / gate）

> **关联**：[总览](./) · [价目全流程](./workflow)

## 常用命令

| 命令 | 何时跑 |
|------|--------|
| `npm run pricing:refresh` | **改价、加模型、加渠道后必跑** — official → 各渠道 → upstream → Excel |
| `npm run pricing:gate` | **合并 / 发布前** — L1/L3 等校验门禁 |
| `npm run pricing:refresh -- --skip-official-fetch` | 离线或只重算下游时 |
| `PRICING_SKIP_ONLINE_FETCH=1 npm run pricing:refresh` | 跳过线上抓取，用本地 JSON |

CI：`.github/workflows/pricing-gate.yml`（`pricing/**` 变更时自动 `pricing:gate`）。

## Skill 工作流

| 场景 | 文档 |
|------|------|
| 加原厂模型 | `.cursor/skills/trinity-official-pricing/workflows/add-official-model.md`（末步强制 refresh） |
| 加转售 / 云门户类渠道 | `.cursor/skills/trinity-official-pricing/workflows/add-supplier-channel.md` |
| 工具清单 | `.cursor/skills/trinity-official-pricing/tools.yaml` |

对 AI 说「加官方价模型」「加采购渠道」「跑价目 gate」时，总机应封发 **`trinity-official-pricing`**。

## 推荐顺序（改价一次）

1. 改种子 / 供应商脚本或数据（见 [采购渠道真源](./suppliers)）  
2. `npm run pricing:refresh`  
3. `npm run pricing:gate`  
4. 将 `pricing/output/trinity-pricing-text.xlsx` 同步商务（若流程需要）  
5. 运营侧刊例 / 上架如有变更，走 [模型上架与供应线路](../operations/models-routes)
