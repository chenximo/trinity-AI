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
SKILL.md → workflows/<task>.md → references/source-paths.md → repo 真源
DOMAIN.md：边界不清时 READ。
```

边界：[`./DOMAIN.md`](./DOMAIN.md)

---

## 真源（MUST READ）

| 任务 | 必读 |
|------|------|
| 目录树、命令 | `pricing/STRUCTURE.md` |
| 设计稿 | `pricing/docs/OFFICIAL-PRICING-SKILL-DESIGN.md` |
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
| 刷新某模态全量官方价 | [`./workflows/refresh-official.md`](./workflows/refresh-official.md) |

---

## 硬规则

1. **三层价不混用**：官方价（`official/`）≠ 转售上游（TokenHub/百炼/AIGC）≠ 线上刊例（`prices-api.json`）。
2. **按模态分文件**：`text` / `image` / `video` 各自 catalog、seed、output；禁止把生视频价写入生文 seed。
3. **官网链接必填**：每条 catalog 须有可公开引用的 `docUrl`；Gemini 等补 `pricingUrl`（见 `data/pricing-urls.mjs`）。
4. **Trinity 已上架必写 map**：`trinity-map.json` 含 `modality` + `vendor` + `vendorModelId`。
5. **改完必验证**：`npm run pricing:supplier:official:{modality} -- <id>`，检查 `fetchStatus`。
6. **对比前刷新真源**：official fetch + `pricing:fetch`（按需 tokenhub console）。

---

## 常用命令

```bash
cd trinity-AI

# 补充/刷新官方价（按模态）
npm run pricing:supplier:official:text -- gpt-5.5
npm run pricing:supplier:official:image
npm run pricing:supplier:official:video -- kl-video-v3
npm run pricing:supplier:official:all

# 脚手架（输出 catalog/seed/map 片段）
node pricing/suppliers/official/scaffold-official-model.mjs \
  --modality=text --vendor=openai --vendor-label=GPT \
  --vendor-model-id=gpt-5.6 --trinity-id=gpt-5.6 \
  --doc-url=https://developers.openai.com/api/docs/models/gpt-5.6

# 三方对比
npm run pricing:compare:official -- gpt-5.5
npm run pricing:compare:official -- --modality=video
npm run pricing:compare:official -- --modality=all
```

---

## 检查清单

- [ ] 模态判定正确（text / image / video）
- [ ] `catalog/{modality}.mjs` + `seeds/{modality}.mjs` + `trinity-map.json` 三处一致
- [ ] `output/{modality}/vendor-pricing.json` 已更新
- [ ] 已向用户展示 `vendor-pricing-table.md` 或对比表摘要
- [ ] 未误改 TokenHub/百炼/AIGC 真源（除非用户明确要求刷新上游）
