# 价目体系优化清单

> 状态：进行中 · 2026-07-07  
> 关联：[PRICING-GOVERNANCE-WORKFLOW.md](./PRICING-GOVERNANCE-WORKFLOW.md) · 产品手册 [价目全流程](../../apps/trinity-product/docs/ai-api-platform/pricing-sources/workflow.md)

---

## 优先级说明

| 级别 | 含义 |
|------|------|
| **P0** | 文档/Skill 漂移，易误操作 |
| **P1** | 工程缺口，影响日常运维 |
| **P2** | 产品 SOP 补全 |
| **P3** | 中期演进 |

---

## P0 · 文档与 Skill 对齐

| # | 项 | 状态 | 说明 |
|---|-----|------|------|
| P0-1 | `pricing-sources/workflow.md` Gate 节 | ✅ | 与 `validate-pricing-gate.mjs` 对齐（含 image/video L2/L3） |
| P0-2 | `pricing-sources/operations.md` 去掉过时 CI | ✅ | 改为本地 `pricing:gate` |
| P0-3 | `add-official-model.md` Step 7 | ✅ | 补 `upstream:video` · `gen-official:video` |
| P0-4 | `tools.yaml` 补新命令 | ✅ | gen/diff/publish-official · aigc:video |
| P0-5 | `pricing.gate` summary | ✅ | 写明全模态 L2/L3 |
| P0-6 | `pricing/README.md` 模态索引 | ✅ | 官方 cascade vs gen-65 双路径 |
| P0-7 | `output/README.md` draft 产物 | ✅ | official-prices-api-video.* |
| P0-8 | `OFFICIAL-PRICING-SKILL-DESIGN.md` 路径 | ✅ | `output/online/prices-api.json` |

---

## P1 · 工程落地

| # | 项 | 状态 | 说明 |
|---|-----|------|------|
| P1-1 | `prices-api` 模态隔离 | ✅ | `prices-api-{text,image,video}.json` |
| P1-2 | `publish-official:image` | ✅ | 与 video 对称 |
| P1-3 | FX 统一 7.25 | ✅ | `config/fx.mjs` · 生图/生视频 validate |
| P1-4 | `pricing:rollout:video` | ✅ | gen → diff → publish 编排 |
| P1-5 | Gate 与 L4 rollout 分离 | ✅ | gate=L1–L3；rollout 含 diff 确认 |
| P2-6 | `add-official-model-video.md` | ✅ | registry · listingAttribute |

---

## P2 · 产品 SOP

| # | 项 | 状态 | 说明 |
|---|-----|------|------|
| P2-1 | `modality-index.md` | ✅ | 三模态差异 · 命令 · Excel |
| P2-2 | `video-rollout.md` | ✅ | 加模型 / 改价 / publish SOP |
| P2-3 | `listing-deploy.md` | ✅ | draft JSON → 生产 API |
| P2-4 | VitePress 侧栏 | ✅ | 链到新 SOP |
| P2-5 | Skill `rollout-listing-price.md` | ✅ | gen → diff → publish workflow |
| P2-6 | Skill `add-official-model-video.md` | ✅ | registry · listingAttribute |

---

## P3 · 中期演进

| # | 项 | 状态 | 说明 |
|---|-----|------|------|
| P3-1 | Annotation 登记中心 | ⬜ | 口径不同 / 渠道少档统一登记 |
| P3-2 | Modality plugin 抽象 | ⬜ | compare-hub / build-official adapter |
| P3-3 | 轻量 CI | ⬜ | PR 改 pricing 跑 gate --skip-official-fetch |
| P3-4 | `trinity-product-handbook` 联动规则 | ⬜ | pricing 命令变更 → 同步 pricing-sources |
| P3-5 | JSON 产物瘦身 | ✅ | `pricing:clean` · gitignore 衍生文件 · 默认不写 publish log |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-07-07 | 初版；W1 文档对齐启动 |
