---
name: trinity-official-pricing
description: >-
  Trinity 模型原厂官方价目：补充/更新生文、生图、生视频模型的官网权威价（catalog、seeds、
  docUrl）、拉取 official 价目、对比官方价 vs TokenHub/百炼/AIGC vs 线上刊例。
  在改 pricing/suppliers/official/**、vendor-pricing、trinity-map、原厂价、
  vendor pricing 时使用。触发词：官方价、原厂价、补充官方价格、vendor pricing、
  生文官方价、生图官方价、生视频官方价、三方价对比、official vs upstream。
disable-model-invocation: true
---

# Trinity 模型原厂官方价 · Agent Skill

## 读取顺序

```text
SKILL.md → workflows/<task>.md → tools.yaml（执行 CLI / 编辑真源前）
         → references/source-paths.md → repo 真源
DOMAIN.md、confirmation.md：边界争议或 confirm:required 时再 READ
```

边界：[`./DOMAIN.md`](./DOMAIN.md) · 能力清单：[`./tools.yaml`](./tools.yaml) · 确认：[`./confirmation.md`](./confirmation.md)

---

## 真源（MUST READ）

| 任务 | 必读 |
|------|------|
| 目录树、命令 | `pricing/STRUCTURE.md` |
| **治理工作流 L0–L4** | `pricing/docs/PRICING-GOVERNANCE-WORKFLOW.md` |
| Skill 架构（L2 manifest） | `.cursor/skills/docs/SKILL-ARCHITECTURE-DESIGN.md` |
| 设计稿（历史） | `pricing/docs/OFFICIAL-PRICING-SKILL-DESIGN.md` |
| official 维护 | `pricing/suppliers/official/README.md` |
| 上游真源索引 | `pricing/suppliers/SOURCES.md` |
| 六步价目流程 | `pricing/README.md` |

路径全表：[`./references/source-paths.md`](./references/source-paths.md)

---

## 触发词

`官方价` · `原厂价` · `补充官方价格` · `vendor pricing` · `生文/生图/生视频官方价` · `三方对比` · `official vs upstream` · `vendor-pricing`

---

## 分流

| 用户意图 | Workflow |
|----------|----------|
| 新增或更新某模型官方价 | [`./workflows/add-official-model.md`](./workflows/add-official-model.md) |
| 对比官方 / 上游 / 线上 | [`./workflows/compare-pricing.md`](./workflows/compare-pricing.md) |
| 价目门禁 L1→L3→告警 | [`./workflows/pricing-gate.md`](./workflows/pricing-gate.md) |
| 刷新某模态全量官方价 | [`./workflows/refresh-official.md`](./workflows/refresh-official.md) |

CLI 命令与 `confirm` / `network` / `git` 字段见 [`./tools.yaml`](./tools.yaml)，勿在 workflow 重复维护命令表。

---

## 硬规则

1. **三层价不混用**：官方价（`official/`）≠ 转售上游（TokenHub/百炼/AIGC）≠ 线上刊例（`prices-api.json`）。
2. **按模态分文件**：`text` / `image` / `video` 各自 catalog、seed、output；禁止把生视频价写入生文 seed。
3. **官网链接必填**：每条 catalog 须有可公开引用的 `docUrl`；Gemini 等补 `pricingUrl`（见 `data/pricing-urls.mjs`）。
4. **Trinity 已上架必写 map**：`trinity-map.json` 含 `modality` + `vendor` + `vendorModelId`。
5. **改完必验证**：`pricing.supplier.official.{modality}`；全模态门禁 `pricing.gate`（含 text + image L1/L3）。
6. **对比自动拉线上价**：`pricing.upstream` / `pricing.upstream.image` / **`pricing.upstream.video`**；`pricing:refresh` 含生文+生图；`PRICING_SKIP_ONLINE_FETCH=1` 可跳过。
7. **刊例对比 ⊇ 线上（P6）**：`刊例对比校验` 不得少于同模态 `prices-api` 模型数；生视频在 `upstream:video` 硬校验。
8. **编辑真源须确认**：`pricing.seed.edit` 等见 `confirmation.md`。

---

## 常用能力（摘要）

| tool id | 用途 |
|---------|------|
| `pricing.gate` | L1→L3 门禁（text + image） |
| `pricing.upstream` | 生文刊例对比 + Excel |
| `pricing.upstream.image` | 生图刊例对比 + Excel |
| `pricing.validate.official-aigc.image` | 生图 L1↔L2 交叉 |
| `pricing.supplier.official.text` / `.image` | 拉取官方价 |
| `pricing.scaffold.model` | 新增模型脚手架 |

完整列表：[`./tools.yaml`](./tools.yaml)

---

## 模态流程（同一拓扑）

```text
L1 seeds → L2 validate-official-aigc[*] → gate → L3 validate-official-suppliers[*] → L4 upstream[*] → Excel
```

| 模态 | L2 | L3 | L4 + Excel |
|------|----|----|------------|
| 生文 | `validate.official-aigc` | `validate.official-suppliers` | `pricing.upstream` / `refresh` |
| 生图 | `validate.official-aigc.image` | `validate.official-suppliers.image` | **`pricing.upstream.image`** |
| 生视频 | `validate.official-aigc.video` | `validate.official-suppliers.video` | **`pricing.upstream.video`** |

生视频 **刊例对比** 行主键 = `prices-api` 全量线上 slug ∪ 官方 catalog 补行；映射真源 `pricing/config/video-model-registry.mjs`（**不得**假设 official ⊇ 线上，与生图不同）。

---

## 检查清单

- [ ] 模态判定正确（text / image / video）
- [ ] `catalog` + `seeds` + `trinity-map` 三处一致
- [ ] `output/{modality}/vendor-pricing.json` 已更新
- [ ] L2：`pricing.validate.official-aigc`（生文）或 `.image`（生图）已跑
- [ ] 生图 Excel：`pricing.upstream.image` 或全量 `pricing.refresh`
- [ ] 全模态：`pricing.gate` 或分项 validate 已跑
- [ ] 已向用户展示 `vendor-pricing-table.md` 或对比表摘要
- [ ] 未误改 TokenHub/百炼/AIGC 真源（除非用户明确要求刷新上游）
