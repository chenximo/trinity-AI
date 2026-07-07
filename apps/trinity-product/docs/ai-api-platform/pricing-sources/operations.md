---
title: 日常操作（refresh / gate）
---

# 日常操作（refresh / gate）

> **关联**：[总览](./) · [价目全流程](./workflow)

## 常用命令

| 命令 | 何时跑 |
|------|--------|
| `npm run pricing:refresh` | **改价、加模型、加渠道后必跑** — official → 各渠道 → upstream → Excel |
| `npm run pricing:gate` | **合并 / 发刊例前** — 全模态 L1↔L2↔L3 门禁（见 [workflow](./workflow) §Gate） |
| `npm run pricing:gen-official:video` | 生视频官方 cascade 草案 |
| `npm run pricing:diff:official-video` | 草案 vs 线上刊例 diff |
| `npm run pricing:publish-official:video` | 生视频草案 → `prices-api-video.json` |
| `npm run pricing:rollout:video` | 生视频 gen + diff +（可选 `--publish`） |
| `npm run pricing:publish-official:image` | 生图草案 → `prices-api-image.json` |
| `npm run pricing:refresh -- --skip-official-fetch` | 离线或只重算下游时 |
| `npm run pricing:clean` | 删 backup / legacy 重复刊例 / publish 日志 |
| `npm run pricing:clean -- --derived` | 额外删 flat/index 衍生 JSON |

**门禁**：本地执行 `pricing:gate`（无 GitHub CI；可选自建 PR 检查，见 `pricing/docs/PRICING-OPTIMIZATION-BACKLOG.md` P3-3）。

## Skill 工作流

| 场景 | 文档 |
|------|------|
| 加原厂模型 | Skill `add-official-model.md` · 生视频 `add-official-model-video.md` |
| 新增模型 / 供应商 | [add-model-sop](./add-model-sop) · [add-supplier-sop](./add-supplier-sop) |
| 生视频刊例发布 | [video-rollout](./video-rollout) |
| 按模态对照 | [modality-index](./modality-index) |
| 加转售 / 云门户类渠道 | Skill `add-supplier-channel.md` |
| 工具清单 | `.cursor/skills/trinity-official-pricing/tools.yaml` |

对 AI 说「加官方价模型」「加采购渠道」「跑价目 gate」时，总机应封发 **`trinity-official-pricing`**。

## 推荐顺序（改价一次）

1. 改种子 / 供应商脚本或数据（见 [采购渠道真源](./suppliers)）  
2. `npm run pricing:refresh`  
3. `npm run pricing:gate`  
4. 将 `pricing/output/trinity-pricing-text.xlsx` 同步商务（若流程需要）  
5. 运营侧刊例 / 上架如有变更，走 [模型上架与供应线路](../operations/models-routes)
